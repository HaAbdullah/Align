// context/UsageContext.js - Database-driven version
import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";

const UsageContext = createContext();

export const useUsage = () => {
  const context = useContext(UsageContext);
  if (!context) {
    throw new Error("useUsage must be used within a UsageProvider");
  }
  return context;
};

const TIERS = {
  FREEMIUM: { name: "Freemium", limit: 2, price: 0 },
  BASIC: { name: "Basic", limit: 5, price: 5 },
  PREMIUM: { name: "Premium", limit: 10, price: 10 },
  PREMIUM_PLUS: { name: "Premium+", limit: -1, price: 15 }, // -1 = unlimited
};

export const UsageProvider = ({ children }) => {
  const { currentUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // State management
  const [userData, setUserData] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Helper function to make API calls
  const apiCall = async (endpoint, options = {}) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "API request failed");
    }

    return data;
  };

  // Load user data from database when authentication changes
  useEffect(() => {
    const loadUserData = async () => {
      if (!currentUser || authLoading) {
        setUserData(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      // In UsageContext.js, update the loadUserData function:
      try {
        console.log("📊 Loading user data for:", currentUser.uid);

        // Try to get existing user profile
        const user = await apiCall(`/api/users/profile/${currentUser.uid}`);

        console.log("✅ Raw API response:", user); // ← Add this line
        console.log("✅ User data loaded:", {
          tier: user.subscription_tier,
          used: user.monthly_generations_used,
          limit: user.monthly_generations_limit,
        });

        setUserData(user);
      } catch (error) {
        console.error("❌ Error loading user data:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [currentUser, authLoading]);

  // Check if user can generate documents
  const canGenerate = () => {
    return userData?.canGenerate || false;
  };

  // Increment usage count
  const incrementUsage = async () => {
    if (!currentUser || !userData) {
      setError("User not authenticated");
      return false;
    }

    if (!canGenerate()) {
      setShowUpgradeModal(true);
      return false;
    }

    setIsLoading(true);

    try {
      console.log("📈 Incrementing usage for:", currentUser.uid);

      const result = await apiCall(
        `/api/users/${currentUser.uid}/increment-usage`,
        {
          method: "POST",
        }
      );

      console.log("✅ Usage incremented:", result);

      // Update local user data
      setUserData((prev) => ({
        ...prev,
        monthly_generations_used: result.generationsUsed,
        canGenerate:
          result.remainingGenerations !== 0 &&
          result.remainingGenerations !== "0",
        remainingGenerations: result.remainingGenerations,
      }));

      return true;
    } catch (error) {
      console.error("❌ Error incrementing usage:", error);

      if (error.message.includes("Generation limit exceeded")) {
        setShowUpgradeModal(true);
      } else {
        setError(error.message);
      }

      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Update subscription after successful Stripe payment
  const updateSubscription = async (
    tier,
    stripeCustomerId,
    stripeSubscriptionId
  ) => {
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    setIsLoading(true);

    try {
      console.log("🔄 Updating subscription to:", tier);

      const result = await apiCall(
        `/api/users/${currentUser.uid}/update-subscription`,
        {
          method: "POST",
          body: JSON.stringify({
            tier,
            stripeCustomerId,
            stripeSubscriptionId,
          }),
        }
      );

      console.log("✅ Subscription updated:", result);

      // Update local user data
      setUserData(result.user);
      setShowUpgradeModal(false);

      return result;
    } catch (error) {
      console.error("❌ Error updating subscription:", error);
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Cancel subscription
  const cancelSubscription = async () => {
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    setIsLoading(true);

    try {
      console.log("❌ Cancelling subscription for:", currentUser.uid);

      await apiCall(`/api/users/${currentUser.uid}/cancel-subscription`, {
        method: "POST",
      });

      console.log("✅ Subscription cancelled");

      // Update local user data to freemium
      setUserData((prev) => ({
        ...prev,
        subscription_tier: "FREEMIUM",
        monthly_generations_limit: 2,
        stripe_customer_id: null,
        stripe_subscription_id: null,
        subscription_status: "canceled",
        tierInfo: TIERS.FREEMIUM,
      }));

      return { success: true };
    } catch (error) {
      console.error("❌ Error cancelling subscription:", error);
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Navigation helpers
  const goToPricing = () => {
    navigate("/pricing");
  };

  const handleUpgradeFromModal = () => {
    setShowUpgradeModal(false);
    navigate("/pricing");
  };

  // Computed values based on userData
  const userTier = userData?.subscription_tier || "FREEMIUM";
  const usageCount = userData?.monthly_generations_used || 0;
  const remainingGenerations = userData?.remainingGenerations || 0;
  const getCurrentTierInfo = () => TIERS[userTier];

  const hasActiveSubscription = () => {
    return (
      userData?.subscription_status === "active" && userTier !== "FREEMIUM"
    );
  };

  const getSubscriptionData = () => {
    if (!userData) return null;

    return {
      customerId: userData.stripe_customer_id,
      subscriptionId: userData.stripe_subscription_id,
      hasSubscription: hasActiveSubscription(),
      status: userData.subscription_status,
    };
  };

  // Legacy function for compatibility
  const getRemainingGenerations = () => remainingGenerations;

  return (
    <UsageContext.Provider
      value={{
        // User data
        userData,
        userTier,
        usageCount,

        // Generation management
        canGenerate,
        incrementUsage,
        getRemainingGenerations,
        getCurrentTierInfo,

        // Subscription management
        updateSubscription,
        cancelSubscription,
        hasActiveSubscription,
        getSubscriptionData,

        // UI state
        showUpgradeModal,
        setShowUpgradeModal,
        isLoading: isLoading || authLoading,
        error,

        // Navigation
        goToPricing,
        handleUpgradeFromModal,

        // Constants
        TIERS,

        // Legacy functions (kept for compatibility)
        upgradeTier: (tier) =>
          console.warn("upgradeTier is deprecated, use updateSubscription"),
        resetUsage: () =>
          console.warn("resetUsage not implemented for database version"),
      }}
    >
      {children}
    </UsageContext.Provider>
  );
};
