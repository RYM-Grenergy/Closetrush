import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import config from '../config';

const API_URL = config.API_URL;

// Create the context
const RentalContext = createContext(null);

// Polling intervals (in milliseconds)
const FAST_POLL = 5000; // 5 seconds when there's activity
const SLOW_POLL = 30000; // 30 seconds when idle

export function RentalProvider({ children }) {
  // User state
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  // Rental states
  const [buyerRentals, setBuyerRentals] = useState([]);
  const [sellerRentals, setSellerRentals] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Polling control
  const [pollInterval, setPollInterval] = useState(SLOW_POLL);
  const [isActive, setIsActive] = useState(true);

  // Update user in context and localStorage
  const updateUser = useCallback((userData) => {
    setUser(userData);
    if (userData) {
      localStorage.setItem("user", JSON.stringify(userData));
    } else {
      localStorage.removeItem("user");
    }
  }, []);

  // Refresh user data from server
  const refreshUser = useCallback(async () => {
    if (!user?._id) return null;
    try {
      const res = await fetch(`${API_URL}/users/${user._id}`);
      if (res.ok) {
        const updatedUser = await res.json();
        const newUserData = { ...user, ...updatedUser };
        updateUser(newUserData);
        return newUserData;
      }
    } catch (err) {
      console.error("Error refreshing user:", err);
    }
    return user;
  }, [user, updateUser]);

  // Fetch buyer rentals
  const fetchBuyerRentals = useCallback(async () => {
    if (!user?._id) {
      console.log("No user ID found for fetching buyer rentals");
      return [];
    }
    try {
      console.log("Fetching buyer rentals for user:", user._id);
      const res = await fetch(`${API_URL}/rentals/renter/${user._id}`);
      if (res.ok) {
        const data = await res.json();
        console.log("Buyer rentals fetched:", data);
        setBuyerRentals(data);
        return data;
      } else {
        console.error("Failed to fetch buyer rentals, status:", res.status);
      }
    } catch (err) {
      console.error("Error fetching buyer rentals:", err);
    }
    return [];
  }, [user?._id]);

  // Fetch seller rentals
  const fetchSellerRentals = useCallback(async () => {
    if (!user?.username) return [];
    try {
      const res = await fetch(`${API_URL}/rentals/owner/${user.username}`);
      if (res.ok) {
        const data = await res.json();
        setSellerRentals(data);
        return data;
      }
    } catch (err) {
      console.error("Error fetching seller rentals:", err);
    }
    return [];
  }, [user?.username]);

  // Fetch pending requests for a product
  const fetchProductRequests = useCallback(async (productId) => {
    try {
      const res = await fetch(
        `${API_URL}/rentals/product/${productId}/requests?status=requested`,
      );
      if (res.ok) {
        const data = await res.json();
        return data;
      }
    } catch (err) {
      console.error("Error fetching product requests:", err);
    }
    return [];
  }, []);

  // Fetch all data
  const fetchAll = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      await Promise.all([
        fetchBuyerRentals(),
        user.isSeller ? fetchSellerRentals() : Promise.resolve([]),
      ]);
      setLastUpdate(new Date());
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }, [user, fetchBuyerRentals, fetchSellerRentals]);

  // Trigger a fast refresh (useful after actions)
  const triggerRefresh = useCallback(() => {
    setPollInterval(FAST_POLL); // Speed up polling
    fetchAll();

    // Return to slow polling after 2 minutes of fast polling
    setTimeout(() => setPollInterval(SLOW_POLL), 120000);
  }, [fetchAll]);

  // Action: Extend rental
  const extendRental = useCallback(
    async (rentalId, additionalHours) => {
      try {
        const res = await fetch(`${API_URL}/rentals/${rentalId}/extend`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ additionalHours }),
        });

        const data = await res.json();
        if (res.ok) {
          triggerRefresh();
          return { success: true, data };
        }
        return {
          success: false,
          error: data.message || "Failed to extend rental",
        };
      } catch (err) {
        return { success: false, error: err.message };
      }
    },
    [triggerRefresh],
  );

  // Action: Initiate return
  const initiateReturn = useCallback(
    async (rentalId, pickupAddress, pickupNotes = "") => {
      try {
        const res = await fetch(
          `${API_URL}/rentals/${rentalId}/initiate-return`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ pickupAddress, pickupNotes }),
          },
        );

        const data = await res.json();
        if (res.ok) {
          triggerRefresh();
          return { success: true, data };
        }
        return {
          success: false,
          error: data.message || "Failed to initiate return",
        };
      } catch (err) {
        return { success: false, error: err.message };
      }
    },
    [triggerRefresh],
  );

  // Action: Approve rental request
  const approveRental = useCallback(
    async (rentalId) => {
      try {
        const res = await fetch(
          `${API_URL}/rentals/${rentalId}/approve-with-rejection`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          },
        );

        const data = await res.json();
        if (res.ok) {
          triggerRefresh();
          return { success: true, data };
        }
        return {
          success: false,
          error: data.message || "Failed to approve rental",
        };
      } catch (err) {
        return { success: false, error: err.message };
      }
    },
    [triggerRefresh],
  );

  // Action: Reject rental request
  const rejectRental = useCallback(
    async (rentalId, reason = "") => {
      try {
        const res = await fetch(`${API_URL}/rentals/${rentalId}/status`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "rejected", rejectionReason: reason }),
        });

        const data = await res.json();
        if (res.ok) {
          triggerRefresh();
          return { success: true, data };
        }
        return {
          success: false,
          error: data.message || "Failed to reject rental",
        };
      } catch (err) {
        return { success: false, error: err.message };
      }
    },
    [triggerRefresh],
  );

  // Action: Update rental status (for seller)
  const updateRentalStatus = useCallback(
    async (rentalId, status, extra = {}) => {
      try {
        const res = await fetch(`${API_URL}/rentals/${rentalId}/status`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status, ...extra }),
        });

        const data = await res.json();
        if (res.ok) {
          triggerRefresh();
          return { success: true, data };
        }
        return {
          success: false,
          error: data.message || "Failed to update status",
        };
      } catch (err) {
        return { success: false, error: err.message };
      }
    },
    [triggerRefresh],
  );

  // Initial fetch
  useEffect(() => {
    fetchAll();
  }, [user?._id]);

  // Polling effect
  useEffect(() => {
    if (!user || !isActive) return;

    const interval = setInterval(() => {
      fetchAll();
    }, pollInterval);

    return () => clearInterval(interval);
  }, [user, pollInterval, isActive, fetchAll]);

  // Visibility change detection - pause polling when tab is hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsActive(!document.hidden);
      if (!document.hidden) {
        // Immediately refresh when tab becomes visible
        fetchAll();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [fetchAll]);

  // Context value
  const value = {
    // User
    user,
    updateUser,
    refreshUser,

    // Data
    buyerRentals,
    sellerRentals,
    loading,
    lastUpdate,

    // Fetch functions
    fetchBuyerRentals,
    fetchSellerRentals,
    fetchProductRequests,
    fetchAll,
    triggerRefresh,

    // Actions
    extendRental,
    initiateReturn,
    approveRental,
    rejectRental,
    updateRentalStatus,

    // Helpers
    getActiveRentals: () =>
      buyerRentals.filter((r) =>
        ["requested", "approved", "active"].includes(r.status),
      ),
    getPastRentals: () =>
      buyerRentals.filter((r) =>
        ["returned", "rejected", "cancelled"].includes(r.status),
      ),
    getPendingRequests: () =>
      sellerRentals.filter((r) => r.status === "requested"),
    getActiveSellerRentals: () =>
      sellerRentals.filter((r) => r.status === "active"),
  };

  return (
    <RentalContext.Provider value={value}>{children}</RentalContext.Provider>
  );
}

// Custom hook to use the rental context
export function useRentals() {
  const context = useContext(RentalContext);
  if (!context) {
    throw new Error("useRentals must be used within a RentalProvider");
  }
  return context;
}

// Export context for edge cases
export { RentalContext };
