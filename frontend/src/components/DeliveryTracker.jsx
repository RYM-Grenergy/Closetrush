import React from "react";
import { motion } from "framer-motion";

const DeliveryTracker = ({ rental }) => {
  if (!rental) return null;

  const deliverySteps = [
    {
      key: "not_assigned",
      label: "Awaiting Pickup",
      icon: "📦",
      description: "Waiting for delivery partner assignment",
    },
    {
      key: "assigned",
      label: "Partner Assigned",
      icon: "🏍️",
      description: "Delivery partner on the way to seller",
    },
    {
      key: "picked_from_seller",
      label: "Picked from Seller",
      icon: "✅",
      description: "Item collected from seller",
    },
    {
      key: "in_transit_to_buyer",
      label: "In Transit",
      icon: "🚚",
      description: "On the way to your location",
    },
    {
      key: "delivered_to_buyer",
      label: "Delivered",
      icon: "🎉",
      description: "Item delivered to you",
    },
    {
      key: "picked_from_buyer",
      label: "Return Pickup",
      icon: "🔄",
      description: "Item picked up for return",
    },
    {
      key: "in_transit_to_seller",
      label: "Returning",
      icon: "🚚",
      description: "On the way back to seller",
    },
    {
      key: "returned_to_seller",
      label: "Returned",
      icon: "✅",
      description: "Item returned to seller",
    },
  ];

  const currentStatus = rental.deliveryStatus || "not_assigned";
  const currentIndex = deliverySteps.findIndex(
    (step) => step.key === currentStatus,
  );

  return (
    <div className="bg-[#0f0f11] border border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-black uppercase">Delivery Tracking</h3>
        {rental.deliveryPartnerId && (
          <span className="text-xs px-3 py-1 bg-green-500/20 text-green-400 rounded-full font-bold">
            Partner Assigned
          </span>
        )}
      </div>

      <div className="space-y-4">
        {deliverySteps.map((step, index) => {
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;
          const isRelevant =
            ((rental.status === "confirmed" ||
              rental.status === "picked_up" ||
              rental.status === "active") &&
              index <= 4) ||
            ((rental.status === "returned" || rental.status === "completed") &&
              index >= 5);

          if (!isRelevant && !isCompleted) return null;

          return (
            <motion.div
              key={step.key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-start gap-4 relative ${isCompleted ? "opacity-100" : "opacity-40"}`}
            >
              {/* Connector Line */}
              {index < deliverySteps.length - 1 && isRelevant && (
                <div className="absolute left-6 top-12 w-0.5 h-12 bg-gradient-to-b from-cyan-500/50 to-transparent" />
              )}

              {/* Icon */}
              <div
                className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center text-2xl border-2 transition-all ${
                  isCurrent
                    ? "border-cyan-400 bg-cyan-500/20 shadow-[0_0_20px_rgba(34,211,238,0.3)] scale-110"
                    : isCompleted
                      ? "border-green-400/50 bg-green-500/10"
                      : "border-white/10 bg-white/5"
                }`}
              >
                {step.icon}
              </div>

              {/* Content */}
              <div className="flex-1 pt-2">
                <div className="flex items-center gap-3">
                  <h4
                    className={`font-bold text-sm uppercase tracking-wider ${
                      isCurrent
                        ? "text-cyan-400"
                        : isCompleted
                          ? "text-white"
                          : "text-gray-500"
                    }`}
                  >
                    {step.label}
                  </h4>
                  {isCurrent && (
                    <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-[10px] font-bold uppercase rounded animate-pulse">
                      Current
                    </span>
                  )}
                </div>
                <p
                  className={`text-xs mt-1 ${isCompleted ? "text-gray-400" : "text-gray-600"}`}
                >
                  {step.description}
                </p>
                {isCurrent && rental.deliveryNotes && (
                  <p className="text-xs mt-2 text-cyan-300 italic">
                    💬 {rental.deliveryNotes}
                  </p>
                )}
              </div>

              {/* Completion Check */}
              {isCompleted && !isCurrent && (
                <div className="text-green-400 text-xl pt-2">✓</div>
              )}
            </motion.div>
          );
        })}
      </div>

      {rental.deliveryNotes && (
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div className="text-xs font-bold text-blue-400 uppercase mb-1">
            Delivery Notes
          </div>
          <div className="text-sm text-gray-300">{rental.deliveryNotes}</div>
        </div>
      )}
    </div>
  );
};

export default DeliveryTracker;
