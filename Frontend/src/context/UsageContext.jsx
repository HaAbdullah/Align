// context/UsageContext.js
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
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [userTier, setUserTier] = useState("FREEMIUM");
  const [usageCount, setUsageCount] = useState(0);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Fixed: Added missing isLoading state

  // Load user data on auth change
  useEffect(() => {
    if (currentUser) {
      const savedTier =
        localStorage.getItem(`tier_${currentUser.uid}`) || "FREEMIUM";
      const savedUsage =
        parseInt(localStorage.getItem(`usage_${currentUser.uid}`)) || 0;
      setUserTier(savedTier);
      setUsageCount(savedUsage);
    } else {
      setUserTier("FREEMIUM");
      setUsageCount(0);
    }
  }, [currentUser]);

  const saveToStorage = (tier, usage) => {
    if (currentUser) {
      localStorage.setItem(`tier_${currentUser.uid}`, tier);
      localStorage.setItem(`usage_${currentUser.uid}`, usage.toString());
    }
  };

  const canGenerate = () => {
    const tier = TIERS[userTier];
    return tier.limit === -1 || usageCount < tier.limit;
  };

  const incrementUsage = () => {
    if (!currentUser) return false;

    if (canGenerate()) {
      const newUsage = usageCount + 1;
      setUsageCount(newUsage);
      saveToStorage(userTier, newUsage);
      return true;
    } else {
      setShowUpgradeModal(true);
      return false;
    }
  };

  const upgradeTier = (newTier) => {
    setUserTier(newTier);
    saveToStorage(newTier, usageCount);
    setShowUpgradeModal(false);
  };

  const goToPricing = () => {
    navigate("/pricing");
  };

  const handleUpgradeFromModal = () => {
    setShowUpgradeModal(false);
    navigate("/pricing");
  };

  const getRemainingGenerations = () => {
    const tier = TIERS[userTier];
    if (tier.limit === -1) return "Unlimited";
    return Math.max(0, tier.limit - usageCount);
  };

  const getCurrentTierInfo = () => TIERS[userTier];

  const resetUsage = () => {
    setUsageCount(0);
    if (currentUser) {
      localStorage.setItem(`usage_${currentUser.uid}`, "0");
    }
  };

  // Fixed: Improved cancellation function with better error handling
  const cancelSubscription = async () => {
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    setIsLoading(true);

    try {
      // Get stored customer/subscription info
      const customerId = localStorage.getItem(
        `stripe_customer_${currentUser.uid}`
      );
      const subscriptionId = localStorage.getItem(
        `stripe_subscription_${currentUser.uid}`
      );

      if (!customerId && !subscriptionId) {
        throw new Error("No subscription information found");
      }

      console.log("Cancelling subscription:", { customerId, subscriptionId });

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/cancel-subscription`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            customerId,
            subscriptionId,
            userId: currentUser.uid, // Added userId for consistency
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to cancel subscription");
      }

      const result = await response.json();
      console.log("Subscription cancelled:", result);

      // Update user tier to FREEMIUM
      setUserTier("FREEMIUM");
      saveToStorage("FREEMIUM", usageCount);

      // Clear stored Stripe info
      localStorage.removeItem(`stripe_customer_${currentUser.uid}`);
      localStorage.removeItem(`stripe_subscription_${currentUser.uid}`);

      return result;
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user has active subscription
  const hasActiveSubscription = () => {
    if (!currentUser) return false;

    const customerId = localStorage.getItem(
      `stripe_customer_${currentUser.uid}`
    );
    const subscriptionId = localStorage.getItem(
      `stripe_subscription_${currentUser.uid}`
    );

    return !!(customerId || subscriptionId) && userTier !== "FREEMIUM";
  };

  // Fixed: Added function to get subscription data from localStorage
  const getSubscriptionData = () => {
    if (!currentUser) return null;

    const customerId = localStorage.getItem(
      `stripe_customer_${currentUser.uid}`
    );
    const subscriptionId = localStorage.getItem(
      `stripe_subscription_${currentUser.uid}`
    );

    return {
      customerId,
      subscriptionId,
      hasSubscription: !!(customerId || subscriptionId),
    };
  };

  return (
    <UsageContext.Provider
      value={{
        userTier,
        usageCount,
        canGenerate,
        incrementUsage,
        upgradeTier,
        getRemainingGenerations,
        getCurrentTierInfo,
        showUpgradeModal,
        setShowUpgradeModal,
        resetUsage,
        TIERS,
        goToPricing,
        handleUpgradeFromModal,
        cancelSubscription,
        hasActiveSubscription,
        getSubscriptionData, // Added this helper
        isLoading,
      }}
    >
      {children}
    </UsageContext.Provider>
  );
};
