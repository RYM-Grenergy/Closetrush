const router = require("express").Router();
const mongoose = require("mongoose");
const Rental = require("../models/Rental");
const Product = require("../models/Product");
const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");

// Create a Rental Request
router.post("/", async (req, res) => {
  try {
    const product = await Product.findById(req.body.productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if product is available for rent
    if (
      product.status === "disabled" ||
      product.status === "draft" ||
      product.status === "pending_admin_approval"
    ) {
      return res
        .status(400)
        .json({ message: "This product is not available for rent" });
    }

    const requestedStart = new Date(req.body.startDate);
    const requestedEnd = new Date(req.body.endDate);

    if (isNaN(requestedStart.getTime()) || isNaN(requestedEnd.getTime())) {
      return res.status(400).json({ message: "Invalid dates provided" });
    }

    if (requestedStart >= requestedEnd) {
      return res
        .status(400)
        .json({ message: "End date must be after start date" });
    }

    // Check for overlapping CONFIRMED/ACTIVE/PICKED_UP rentals
    const overlappingActiveRental = await Rental.findOne({
      productId: req.body.productId,
      status: { $in: ["confirmed", "picked_up", "active"] },
      $or: [
        {
          startDate: { $lte: requestedEnd },
          endDate: { $gte: requestedStart },
        },
      ],
    });

    if (overlappingActiveRental) {
      return res.status(400).json({
        message: "Product is not available for the selected dates",
        conflict: overlappingActiveRental,
      });
    }

    const newRental = new Rental({
      ...req.body,
      ownerUserId: product.userId,
      status: "requested",
    });
    const savedRental = await newRental.save();

    // Create transaction record for buyer's payment
    try {
      // Get or create renter's wallet
      let renterWallet = await Wallet.findOne({ userId: req.body.renterId });
      if (!renterWallet) {
        renterWallet = new Wallet({
          userId: req.body.renterId,
          totalBalance: 0,
          pendingBalance: 0,
        });
        await renterWallet.save();
      }

      // Create transaction for the rental payment
      const paymentTransaction = new Transaction({
        walletId: renterWallet._id,
        userId: req.body.renterId,
        rentalId: savedRental._id,
        productId: req.body.productId,
        amount: -(req.body.totalAmount || 0), // Negative because it's an expense
        type: "rental_earning", // This represents a rental payment by the buyer
        status: "completed",
        description: `Rental payment for ${product.name}`,
        metadata: {
          productName: product.name,
          durationHours: req.body.durationHours,
          startDate: req.body.startDate,
          endDate: req.body.endDate,
          securityDeposit: req.body.securityDeposit || 0,
        },
      });
      await paymentTransaction.save();
    } catch (transactionErr) {
      console.error("Error creating transaction record:", transactionErr);
      // Continue even if transaction creation fails
    }

    // Populate before returning
    const populatedRental = await Rental.findById(savedRental._id)
      .populate("productId")
      .populate("renterId", "username fullName email");

    res.status(201).json(populatedRental);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all rentals (Admin)
router.get("/admin/all", async (req, res) => {
  try {
    const rentals = await Rental.find()
      .populate("productId")
      .populate("renterId", "-password")
      .sort({ createdAt: -1 });
    res.json(rentals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get rentals for a specific Seller (Owner)
router.get("/owner/:username", async (req, res) => {
  try {
    const rentals = await Rental.find({ ownerId: req.params.username })
      .populate("productId")
      .populate("renterId", "-password")
      .sort({ createdAt: -1 });
    res.json(rentals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get rentals by renter (Buyer)
router.get("/renter/:userId", async (req, res) => {
  try {
    const rentals = await Rental.find({ renterId: req.params.userId })
      .populate("productId")
      .sort({ createdAt: -1 });
    res.json(rentals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all requests for a specific product (for multiple request handling)
router.get("/product/:productId/requests", async (req, res) => {
  try {
    const { status } = req.query;
    const query = { productId: req.params.productId };

    if (status) {
      query.status = status;
    } else {
      query.status = "requested"; // Default to pending requests
    }

    const requests = await Rental.find(query)
      .populate("renterId", "username fullName email")
      .populate("productId", "name")
      .sort({ createdAt: 1 });

    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Approve a request and auto-reject overlapping ones (ATOMIC)
router.post("/:id/approve-with-rejection", async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id);
    if (!rental) {
      return res.status(404).json({ message: "Rental not found" });
    }

    if (rental.status !== "requested") {
      return res
        .status(400)
        .json({ message: "Can only approve requested rentals" });
    }

    // Find overlapping requests
    const overlappingRequests = await Rental.find({
      productId: rental.productId,
      _id: { $ne: rental._id },
      status: "requested",
      $or: [
        {
          startDate: { $lte: rental.endDate },
          endDate: { $gte: rental.startDate },
        },
      ],
    });

    // Approve the selected rental (change status to confirmed)
    rental.status = "confirmed";
    rental.confirmedAt = new Date();
    await rental.save();

    // Reserve product status (sets to on_rent once confirmed/active)
    await Product.updateOne({ _id: rental.productId }, {
      status: "on_rent",
      available: false,
    });

    // Reject overlapping requests and create refunds
    const rejectedRentals = [];
    for (const overlapping of overlappingRequests) {
      overlapping.status = "rejected";
      overlapping.rejectionReason =
        "Another request was approved for overlapping dates";
      overlapping.refundAmount = overlapping.totalAmount;
      overlapping.refundedAt = new Date();
      overlapping.refundReason =
        "Automatic refund - overlapping request rejected";
      await overlapping.save();

      // Create refund transaction for buyer
      let renterWallet = await Wallet.findOne({ userId: overlapping.renterId });
      if (!renterWallet) {
        renterWallet = new Wallet({ userId: overlapping.renterId });
        await renterWallet.save();
      }

      const refundTransaction = new Transaction({
        walletId: renterWallet._id,
        userId: overlapping.renterId,
        rentalId: overlapping._id,
        productId: overlapping.productId,
        amount: overlapping.totalAmount,
        type: "refund",
        status: "completed",
        description: "Automatic refund - overlapping rental request rejected",
      });
      await refundTransaction.save();

      rejectedRentals.push({
        rentalId: overlapping._id,
        renterId: overlapping.renterId,
        refundAmount: overlapping.totalAmount,
      });
    }

    // Add pending earning to seller wallet
    let sellerWallet = await Wallet.findOne({
      userId: rental.ownerUserId,
    });
    if (!sellerWallet) {
      sellerWallet = new Wallet({ userId: rental.ownerUserId });
    }

    // Calculate 5% platform commission
    const platformCommission = rental.totalAmount * 0.05;
    const sellerEarning = rental.totalAmount - platformCommission;

    sellerWallet.addPendingEarning(sellerEarning);
    await sellerWallet.save();

    // Create earning transaction for seller
    const earningTransaction = new Transaction({
      walletId: sellerWallet._id,
      userId: rental.ownerUserId,
      rentalId: rental._id,
      productId: rental.productId,
      amount: sellerEarning,
      type: "rental_earning",
      status: "pending",
      description: `Rental earning - pending completion (after 5% commission)`,
      metadata: {
        totalRentalAmount: rental.totalAmount,
        platformCommission: platformCommission,
        sellerEarning: sellerEarning,
      },
    });
    await earningTransaction.save();

    // Create platform fee transaction
    const platformFeeTransaction = new Transaction({
      walletId: sellerWallet._id,
      userId: rental.ownerUserId,
      rentalId: rental._id,
      productId: rental.productId,
      amount: -platformCommission,
      type: "platform_fee",
      status: "completed",
      description: "Platform commission (5%)",
    });
    await platformFeeTransaction.save();

    // Auto-assign delivery partner
    try {
      const DeliveryPartner = require("../models/DeliveryPartner");
      const availablePartner = await DeliveryPartner.findOne({
        isActive: true,
        isAvailable: true,
      }).sort({ rating: -1, activeRentals: 1 });

      if (availablePartner) {
        availablePartner.assignRental(rental._id);
        await availablePartner.save();

        rental.deliveryPartnerId = availablePartner._id;
        rental.deliveryStatus = "assigned";
        await rental.save();
      }
    } catch (deliveryErr) {
      console.error("Error auto-assigning delivery partner:", deliveryErr);
      // Continue even if delivery assignment fails
    }

    const populatedRental = await Rental.findById(rental._id)
      .populate("productId")
      .populate("renterId", "username fullName");

    res.json({
      message: "Rental approved successfully",
      rental: populatedRental,
      rejectedCount: rejectedRentals.length,
      rejectedRentals,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update Rental Status (Simple status change)
router.put("/:id/status", async (req, res) => {
  try {
    const { status, rejectionReason, damageDeduction } = req.body;
    const rental = await Rental.findById(req.params.id);

    if (!rental) {
      return res.status(404).json({ message: "Rental not found" });
    }

    const previousStatus = rental.status;
    rental.status = status;

    // Track timestamp for each status
    const now = new Date();
    if (status === "confirmed") rental.confirmedAt = now;
    if (status === "picked_up") rental.pickedUpAt = now;
    if (status === "active") rental.activeAt = now;
    if (status === "returned") rental.returnedAt = now;
    if (status === "completed") rental.completedAt = now;

    if (status === "rejected" && rejectionReason) {
      rental.rejectionReason = rejectionReason;
    }

    // Handle status transitions
    if (status === "confirmed" && previousStatus === "requested") {
      // Seller confirmed the rental request
      console.log("Rental confirmed by seller");
    }

    if (status === "picked_up" && previousStatus === "confirmed") {
      // Delivery partner picked up item from seller
      console.log("Item picked up for delivery");
    }

    if (status === "active") {
      // Rental started - Item delivered to buyer
      await Product.updateOne({ _id: rental.productId }, {
        status: "on_rent",
        available: false,
      });
    }

    if (status === "returned" && previousStatus === "active") {
      // Buyer returned the item
      console.log("Item returned by buyer");
    }

    if (status === "returned" || status === "completed") {
      // Rental completed - update product and release earnings
      await Product.updateOne({ _id: rental.productId }, {
        status: "active",
        available: true,
      });

      // Handle damage deduction if any
      if (damageDeduction && damageDeduction > 0) {
        rental.damageDeduction = damageDeduction;
      }

      // Calculate final amount after commission (5%)
      const platformCommission = rental.totalAmount * 0.05;
      const sellerGrossEarning = rental.totalAmount - platformCommission;
      const finalSellerEarning = sellerGrossEarning - (damageDeduction || 0);

      // Release pending earnings to withdrawable
      let sellerWallet = await Wallet.findOne({ userId: rental.ownerUserId });
      if (!sellerWallet) {
        sellerWallet = new Wallet({ userId: rental.ownerUserId });
      }
      if (sellerWallet) {
        sellerWallet.releasePending(finalSellerEarning);
        await sellerWallet.save();

        // Update transaction status
        await Transaction.updateOne(
          { rentalId: rental._id, type: "rental_earning", status: "pending" },
          {
            status: "completed",
            amount: finalSellerEarning,
            description: `Rental earning completed (₹${rental.totalAmount} - 5% commission - ₹${damageDeduction || 0} damage)`,
          },
        );

        // Create damage deduction transaction if applicable
        if (damageDeduction > 0) {
          const damageTransaction = new Transaction({
            walletId: sellerWallet._id,
            userId: rental.ownerUserId,
            rentalId: rental._id,
            productId: rental.productId,
            amount: -damageDeduction,
            type: "damage_deduction",
            status: "completed",
            description: `Damage deduction from rental`,
          });
          await damageTransaction.save();
        }
      }

      // Store commission info in rental
      rental.platformCommission = platformCommission;
      rental.finalSellerEarning = finalSellerEarning;
    }

    if (status === "cancelled" || status === "rejected") {
      // Return product to available
      await Product.updateOne({ _id: rental.productId }, {
        status: "active",
        available: true,
      });

      // Remove pending earnings if it exists
      if (previousStatus === "approved" || previousStatus === "confirmed") {
        const sellerWallet = await Wallet.findOne({
          userId: rental.ownerUserId,
        });
        if (sellerWallet) {
          sellerWallet.pendingBalance = Math.max(
            0,
            sellerWallet.pendingBalance - rental.totalAmount,
          );
          sellerWallet.updateBalances();
          await sellerWallet.save();
        }

        // Mark transaction as reversed
        await Transaction.updateOne(
          { rentalId: rental._id, type: "rental_earning", status: "pending" },
          { status: "reversed" },
        );
      }
    }

    await rental.save();

    const populatedRental = await Rental.findById(rental._id)
      .populate("productId")
      .populate("renterId", "username fullName");

    res.json(populatedRental);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get rental by ID
router.get("/:id", async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id)
      .populate("productId")
      .populate("renterId", "username fullName email");

    if (!rental) {
      return res.status(404).json({ message: "Rental not found" });
    }

    res.json(rental);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Extend rental duration (Buyer)
router.post("/:id/extend", async (req, res) => {
  try {
    const { additionalHours, additionalDays } = req.body;
    const rental = await Rental.findById(req.params.id).populate("productId");

    if (!rental) {
      return res.status(404).json({ message: "Rental not found" });
    }

    if (rental.status !== "active") {
      return res
        .status(400)
        .json({ message: "Can only extend active rentals" });
    }

    // Calculate new end date
    const additionalMs =
      (additionalHours || 0) * 60 * 60 * 1000 +
      (additionalDays || 0) * 24 * 60 * 60 * 1000;

    if (additionalMs <= 0) {
      return res.status(400).json({ message: "Invalid extension duration" });
    }

    const newEndDate = new Date(rental.endDate.getTime() + additionalMs);

    // Check for overlapping approved rentals
    const overlapping = await Rental.findOne({
      productId: rental.productId,
      _id: { $ne: rental._id },
      status: { $in: ["approved", "active"] },
      startDate: { $lte: newEndDate },
      endDate: { $gte: rental.endDate },
    });

    if (overlapping) {
      return res.status(400).json({
        message: "Cannot extend - another rental is scheduled for this period",
        maxExtension: overlapping.startDate,
      });
    }

    // Calculate additional cost
    const pricePerHour = rental.productId.price || rental.pricePerDay / 24;
    const additionalCost = Math.ceil(
      pricePerHour * (additionalMs / (60 * 60 * 1000)),
    );

    // Update rental
    rental.endDate = newEndDate;
    rental.durationHours =
      (rental.durationHours || 0) +
      (additionalHours || 0) +
      (additionalDays || 0) * 24;
    rental.rentalDays = Math.ceil(rental.durationHours / 24);
    rental.totalAmount = (rental.totalAmount || 0) + additionalCost;

    await rental.save();

    res.json({
      message: "Rental extended successfully",
      rental,
      additionalCost,
      newEndDate,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Initiate return (Buyer requests pickup) - Works for both active and confirmed/picked_up statuses
router.post("/:id/initiate-return", async (req, res) => {
  try {
    const { pickupAddress, pickupNotes, isEarlyReturn } = req.body;
    const rental = await Rental.findById(req.params.id);

    if (!rental) {
      return res.status(404).json({ message: "Rental not found" });
    }

    // Allow early return for confirmed, picked_up, and active rentals
    if (!["confirmed", "picked_up", "active"].includes(rental.status)) {
      return res.status(400).json({
        message: "Can only initiate return for confirmed/active rentals",
      });
    }

    // Add pickup details to rental metadata
    rental.pickupRequested = true;
    rental.pickupAddress = pickupAddress;
    rental.pickupNotes =
      pickupNotes || (isEarlyReturn ? "Early return requested by buyer" : "");
    rental.pickupRequestedAt = new Date();

    // Keep delivery status as delivered_to_buyer - it's still with the buyer 
    // until a partner is assigned for return pickup.
    rental.deliveryStatus = "delivered_to_buyer";

    await rental.save();

    res.json({
      message: "Return initiated! Delivery partner will arrange pickup.",
      rental,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Assign delivery partner to rental (Admin)
router.post("/:id/assign-delivery", async (req, res) => {
  try {
    const { deliveryPartnerId } = req.body;
    const rental = await Rental.findById(req.params.id);

    if (!rental) {
      return res.status(404).json({ message: "Rental not found" });
    }

    rental.deliveryPartnerId = deliveryPartnerId;
    rental.deliveryStatus = "assigned";

    // If this assignment is for a return pickup (active/returned status), 
    // make product active on website immediately
    if (rental.status === "active" || rental.pickupRequested) {
      await Product.updateOne({ _id: rental.productId }, {
        status: "active",
        available: true
      });
    }

    await rental.save();

    res.json({ message: "Delivery partner assigned", rental });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update delivery status (for seller/delivery partner)
router.put("/:id/delivery-status", async (req, res) => {
  try {
    const { deliveryStatus, notes } = req.body;
    const rental = await Rental.findById(req.params.id);

    if (!rental) {
      return res.status(404).json({ message: "Rental not found" });
    }

    rental.deliveryStatus = deliveryStatus;
    if (notes) rental.deliveryNotes = notes;

    // Auto-update rental status based on delivery status
    if (
      deliveryStatus === "delivered_to_buyer" &&
      rental.status === "confirmed"
    ) {
      rental.status = "active";
      rental.activeAt = new Date();

      // Update product to on_rent
      await Product.updateOne({ _id: rental.productId }, {
        status: "on_rent",
        available: false,
      });
    } else if (deliveryStatus === "returned_to_seller" || deliveryStatus === "picked_from_buyer") {
      // Item is either back with seller or with logistics - make it active for next rental
      await Product.updateOne({ _id: rental.productId }, {
        status: "active",
        available: true,
      });

      if (deliveryStatus === "returned_to_seller") {
        rental.status = "returned";
        rental.returnedAt = new Date();

        // Mark for completion - will trigger payment release
        setTimeout(async () => {
          rental.status = "completed";
          rental.completedAt = new Date();
          await rental.save();

          // Release funds to seller
          const platformCommission = rental.totalAmount * 0.05;
          const sellerGrossEarning = rental.totalAmount - platformCommission;
          const finalSellerEarning =
            sellerGrossEarning - (rental.damageDeduction || 0);

          const sellerWallet = await Wallet.findOne({
            userId: rental.ownerUserId,
          });
          if (sellerWallet) {
            sellerWallet.releasePending(finalSellerEarning);
            await sellerWallet.save();
          }

          // Refund security deposit to buyer if no damage
          if (rental.securityDeposit > 0 && !rental.damageDeduction) {
            // Get or create renter wallet
            let renterWallet = await Wallet.findOne({ userId: rental.renterId });
            if (!renterWallet) {
              renterWallet = new Wallet({ userId: rental.renterId });
              await renterWallet.save();
            }

            const refundTransaction = new Transaction({
              walletId: renterWallet._id,
              userId: rental.renterId,
              rentalId: rental._id,
              productId: rental.productId,
              amount: rental.securityDeposit,
              type: "security_deposit_release",
              status: "completed",
              description: `Security deposit refund for ${rental.productId?.name || "rental"}`,
              metadata: {
                originalDeposit: rental.securityDeposit,
                refundedAmount: rental.securityDeposit,
                rentalCompleted: new Date(),
              },
            });
            await refundTransaction.save();
          }
        }, 1000);
      }
    }

    await rental.save();

    const populatedRental = await Rental.findById(rental._id)
      .populate("productId")
      .populate("renterId", "username fullName");

    res.json({
      message: "Delivery status updated",
      rental: populatedRental,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get rental tracking info
router.get("/:id/tracking", async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id)
      .populate("productId", "name image price")
      .populate("renterId", "username fullName");

    if (!rental) {
      return res.status(404).json({ message: "Rental not found" });
    }

    // Calculate time remaining
    const now = new Date();
    const endDate = new Date(rental.endDate);
    const startDate = new Date(rental.startDate);
    const timeRemainingMs = Math.max(0, endDate - now);
    const totalDurationMs = endDate - startDate;
    const progressPercent = Math.min(
      100,
      ((totalDurationMs - timeRemainingMs) / totalDurationMs) * 100,
    );

    const timeRemaining = {
      hours: Math.floor(timeRemainingMs / (1000 * 60 * 60)),
      minutes: Math.floor((timeRemainingMs % (1000 * 60 * 60)) / (1000 * 60)),
      isOverdue: timeRemainingMs <= 0,
    };

    res.json({
      rental,
      tracking: {
        status: rental.status,
        startDate: rental.startDate,
        endDate: rental.endDate,
        timeRemaining,
        progressPercent: progressPercent.toFixed(1),
        pickupRequested: rental.pickupRequested || false,
        pickupAddress: rental.pickupAddress,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Sync all products based on their current rental status (Super Admin Utility)
router.post("/admin/sync-products", async (req, res) => {
  try {
    const products = await Product.find({
      status: {
        $in: ["active", "on_rent"]
      }
    });

    let fixed = 0;

    for (const product of products) {
      // Find if there is ANY active/confirmed/picked_up rental for this product
      const activeRental = await Rental.findOne({
        productId: product._id,
        status: {
          $in: ["confirmed", "picked_up", "active", "assigned", "picked_from_seller", "delivered_to_buyer", "picked_from_buyer", "in_transit_to_seller"]
        },
      });

      if (activeRental && product.status !== "on_rent") {
        product.status = "on_rent";
        product.available = false;
        await product.save();
        fixed++;
      } else if (!activeRental && product.status !== "active") {
        product.status = "active";
        product.available = true;
        await product.save();
        fixed++;
      }
    }

    res.json({
      message: `Sync complete. Adjusted ${fixed} products.`,
      fixedCount: fixed
    });
  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
});

module.exports = router;

