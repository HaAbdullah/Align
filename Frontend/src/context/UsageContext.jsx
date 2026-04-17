// context/UsageContext.js - SIMPLIFIED & FIXED VERSION
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import { getAuthToken, BASE_URL } from "../utils/api";

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

  // Helper function to make API calls (with Firebase auth token)
  const apiCall = async (endpoint, options = {}) => {
    const url = `${BASE_URL}${endpoint}`;

    try {
      const token = await getAuthToken();
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error?.message || data.message || `HTTP ${response.status}`
        );
      }

      return data;
    } catch (error) {
      throw error;
    }
  };

  // Load user data from PostgreSQL
  const loadUserData = useCallback(async () => {
    if (!currentUser || authLoading) {
      setUserData(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiCall(`/api/users/profile/${currentUser.uid}`);
      const user = response.data;
      setUserData(user);
    } catch (error) {
      if (error.message.includes("User not found")) {
        try {
          const createResponse = await apiCall("/api/users/create", {
            method: "POST",
            body: JSON.stringify({
              firebaseUid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName,
            }),
          });
          setUserData(createResponse.data);
        } catch (createError) {
          setError(createError.message);
        }
      } else {
        setError(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, authLoading]);

  // Load user data when authentication changes
  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  const refreshUserData = useCallback(() => {
    return loadUserData();
  }, [loadUserData]);

  // Check if user can generate documents
  const canGenerate = () => {
    if (!userData) return false;
    return userData.canGenerate || false;
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
      const response = await apiCall(
        `/api/users/${currentUser.uid}/increment-usage`,
        {
          method: "POST",
        }
      );

      const result = response.data;

      setUserData((prev) => ({
        ...prev,
        monthly_generations_used: result.generationsUsed,
        remainingGenerations: result.remainingGenerations,
        canGenerate:
          result.remainingGenerations !== 0 &&
          result.remainingGenerations !== "0",
      }));

      return true;
    } catch (error) {
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
      const response = await apiCall(
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

      const result = response.data;

      if (result.user) {
        setUserData(result.user);
      }

      setShowUpgradeModal(false);

      // Force refresh to ensure consistency
      setTimeout(() => {
        refreshUserData();
      }, 1000);

      return result;
    } catch (error) {
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

  // Computed values with proper fallbacks
  const userTier = userData?.subscription_tier || "FREEMIUM";
  const usageCount = userData?.monthly_generations_used || 0;
  const remainingGenerations =
    userData?.remainingGenerations ??
    (userData?.monthly_generations_limit === -1
      ? "Unlimited"
      : Math.max(
          0,
          (userData?.monthly_generations_limit || 0) -
            (userData?.monthly_generations_used || 0)
        ));

  const getCurrentTierInfo = () => TIERS[userTier] || TIERS.FREEMIUM;

  const hasActiveSubscription = () => {
    return (
      userData?.subscription_status === "active" && userTier !== "FREEMIUM"
    );
  };

  // ✅ FIX: Define getSubscriptionData BEFORE cancelSubscription
  const getSubscriptionData = () => {
    if (!userData) return null;

    return {
      customerId: userData.stripe_customer_id,
      subscriptionId: userData.stripe_subscription_id,
      hasSubscription: hasActiveSubscription(),
      status: userData.subscription_status,
    };
  };

  const cancelSubscription = async () => {
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    setIsLoading(true);
    setError(null);

    try {
      const subscriptionData = getSubscriptionData();

      if (!subscriptionData?.customerId && !subscriptionData?.subscriptionId) {
        throw new Error("No subscription data found to cancel");
      }

      const response = await apiCall("/api/cancel-subscription", {
        method: "POST",
        body: JSON.stringify({
          userId: currentUser.uid,
          customerId: subscriptionData?.customerId,
          subscriptionId: subscriptionData?.subscriptionId,
        }),
      });

      await refreshUserData();

      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getRemainingGenerations = () => {
    if (userData?.monthly_generations_limit === -1) return "Unlimited";
    return remainingGenerations;
  };

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

        // Data refresh
        refreshUserData,

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
      }}
    >
      {children}
    </UsageContext.Provider>
  );
};
