const router = require("express").Router();
const DeliveryPartner = require("../models/DeliveryPartner");
const Rental = require("../models/Rental");
const Product = require("../models/Product");

// Login endpoint for Delivery Partners
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const partner = await DeliveryPartner.findOne({ email });

    if (!partner) {
      return res.status(404).json({ message: "Partner not found" });
    }

    // In a real app, use bcrypt.compare(password, partner.password)
    if (partner.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!partner.isActive) {
      return res.status(403).json({ message: "Account is inactive. Contact admin." });
    }

    // Return partner info (excluding password)
    const { password: _, ...partnerData } = partner._doc;
    res.json(partnerData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all delivery partners (Admin)
router.get("/", async (req, res) => {
  try {
    const partners = await DeliveryPartner.find().select("-password");
    res.json(partners);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get available delivery partners
router.get("/available", async (req, res) => {
  try {
    const { city, area } = req.query;
    const query = {
      isActive: true,
      isAvailable: true,
    };

    if (city || area) {
      query.serviceAreas = { $in: [city, area].filter(Boolean) };
    }

    const partners = await DeliveryPartner.find(query)
      .select("-password")
      .sort({ rating: -1, completedDeliveries: -1 });
    res.json(partners);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create delivery partner (Admin)
router.post("/", async (req, res) => {
  try {
    const partner = new DeliveryPartner(req.body);
    const newPartner = await partner.save();
    const { password, ...partnerData } = newPartner._doc;
    res.status(201).json(partnerData);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update delivery partner
router.put("/:id", async (req, res) => {
  try {
    const updatedPartner = await DeliveryPartner.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    ).select("-password");
    res.json(updatedPartner);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Assign delivery partner to rental (Admin/Auto-assign)
router.post("/assign/:partnerId/:rentalId", async (req, res) => {
  try {
    const partner = await DeliveryPartner.findById(req.params.partnerId);
    const rental = await Rental.findById(req.params.rentalId);

    if (!partner) {
      return res.status(404).json({ message: "Delivery partner not found" });
    }
    if (!rental) {
      return res.status(404).json({ message: "Rental not found" });
    }

    // Assign to partner
    partner.assignRental(rental._id);
    await partner.save();

    // Update rental
    rental.deliveryPartnerId = partner._id;
    rental.deliveryStatus = "assigned";
    await rental.save();

    res.json({
      message: "Delivery partner assigned successfully",
      partner: { name: partner.name, phone: partner.phone },
      rental,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update delivery status for a rental (THE CORE LOGIC FROM RENTAL_FLOWS.md)
router.put("/rental/:rentalId/status", async (req, res) => {
  try {
    const { deliveryStatus, notes } = req.body;
    const rental = await Rental.findById(req.params.rentalId);

    if (!rental) {
      return res.status(404).json({ message: "Rental not found" });
    }

    rental.deliveryStatus = deliveryStatus;
    if (notes) rental.deliveryNotes = notes;

    // --- OUTBOUND FLOW LOGIC ---
    if (deliveryStatus === "picked_from_seller") {
      rental.status = "picked_up";
      rental.pickedUpAt = new Date();
    }

    else if (deliveryStatus === "delivered_to_buyer") {
      rental.status = "active";
      rental.activeAt = new Date();
      // Ensure product is 'on_rent'
      await Product.updateOne({ _id: rental.productId }, {
        status: "on_rent",
        available: false
      });
    }

    // --- INBOUND (RETURN) FLOW LOGIC ---
    else if (deliveryStatus === "picked_from_buyer") {
      // No change to rental status 'active', but useful for tracking
      // Product becomes theoretically available for next booking active logic if we had complex scheduling
    }

    else if (deliveryStatus === "returned_to_seller") {
      rental.status = "returned";
      rental.returnedAt = new Date();
      // Trigger completion logic handled in main rentals.js or here
      // Marking product active
      await Product.updateOne({ _id: rental.productId }, {
        status: "active",
        available: true,
      });
    }

    await rental.save();

    // Check if partner needs to be set to available (if no more active tasks)
    // This logic could be more complex, but for now simple check:
    // ...

    res.json({
      message: "Delivery status updated",
      rental,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get delivery partner's active rentals with FULL DETAILS
router.get("/:partnerId/active-rentals", async (req, res) => {
  try {
    const partner = await DeliveryPartner.findById(req.params.partnerId);

    if (!partner) {
      return res.status(404).json({ message: "Delivery partner not found" });
    }

    // Determine tasks based on rental delivery status
    // assigned -> Pickup Task
    // picked_from_seller / in_transit_to_buyer -> Delivery Task
    // picked_from_buyer / in_transit_to_seller -> Return Task

    const tasks = await Rental.find({
      deliveryPartnerId: req.params.partnerId,
      status: { $in: ["confirmed", "picked_up", "active", "returned"] } // Filter out completed/cancelled
    })
      .populate("productId", "name image price")
      .populate("renterId", "username fullName phone address email") // Details for Buyer
      .populate("ownerUserId", "username fullName phone address email"); // Details for Seller

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Rate delivery partner
router.post("/:partnerId/rate", async (req, res) => {
  try {
    const { rating } = req.body;
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }
    const partner = await DeliveryPartner.findById(req.params.partnerId);
    if (!partner) return res.status(404).json({ message: "Not found" });

    partner.updateRating(rating);
    await partner.save();

    res.json({ message: "Rating submitted", newRating: partner.rating });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete delivery partner
router.delete("/:id", async (req, res) => {
  try {
    const partner = await DeliveryPartner.findById(req.params.id);
    if (!partner) return res.status(404).json({ message: "Not found" });
    if (partner.activeRentals.length > 0) {
      return res.status(400).json({ message: "Cannot delete with active rentals" });
    }
    await DeliveryPartner.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
