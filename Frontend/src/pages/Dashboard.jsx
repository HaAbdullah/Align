import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useUsage } from "../context/UsageContext";
import {
  User,
  Crown,
  BarChart3,
  Settings,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  X,
  Calendar,
  TrendingUp,
  FileText,
  Briefcase,
  Target,
  Star,
} from "lucide-react";

const Dashboard = () => {
  const { currentUser } = useAuth();
  const {
    userTier,
    usageCount,
    getCurrentTierInfo,
    getRemainingGenerations,
    cancelSubscription,
    hasActiveSubscription,
    getSubscriptionData,
    isLoading: contextLoading,
    TIERS,
  } = useUsage();
  console.log(
    "Stripe customer ID:",
    localStorage.getItem(`stripe_customer_${currentUser?.uid}`)
  );
  console.log(
    "Stripe subscription ID:",
    localStorage.getItem(`stripe_subscription_${currentUser?.uid}`)
  );
  console.log("hasActiveSubscription result:", hasActiveSubscription());
  console.log("userTier:", userTier);
  const [darkMode, setDarkMode] = useState(true);
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [successMessage, setSuccessMessage] = useState(""); // Added for user feedback
  const [errorMessage, setErrorMessage] = useState(""); // Added for error feedback

  useEffect(() => {
    // Initialize theme
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = savedTheme !== "light";
    setDarkMode(prefersDark);
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchSubscriptionData();
    }
  }, [currentUser]);

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true);

      // First, get local subscription data
      const localSubData = getSubscriptionData();

      // If we have local subscription data, try to get detailed info from backend
      if (localSubData?.hasSubscription) {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/subscription-status`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: currentUser.uid,
              customerId: localSubData.customerId,
              subscriptionId: localSubData.subscriptionId,
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          setSubscriptionData(data);
        } else {
          // If backend call fails, use local data
          setSubscriptionData({
            customer_id: localSubData.customerId,
            subscription_id: localSubData.subscriptionId,
            status: userTier !== "FREEMIUM" ? "active" : "inactive",
          });
        }
      } else {
        // No subscription data
        setSubscriptionData(null);
      }
    } catch (error) {
      console.error("Error fetching subscription data:", error);
      // Use local data as fallback
      const localSubData = getSubscriptionData();
      if (localSubData?.hasSubscription) {
        setSubscriptionData({
          customer_id: localSubData.customerId,
          subscription_id: localSubData.subscriptionId,
          status: userTier !== "FREEMIUM" ? "active" : "inactive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Fixed: Use the cancelSubscription from context with proper error handling
  const handleCancelSubscription = async () => {
    if (!hasActiveSubscription()) {
      setErrorMessage("No active subscription to cancel");
      return;
    }

    setCancelling(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await cancelSubscription();

      // Refresh subscription data after successful cancellation
      await fetchSubscriptionData();

      setShowCancelModal(false);
      setSuccessMessage(
        "Subscription cancelled successfully. You'll retain access until the end of your billing period."
      );

      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      setErrorMessage(
        error.message ||
          "Failed to cancel subscription. Please try again or contact support."
      );

      // Clear error message after 5 seconds
      setTimeout(() => setErrorMessage(""), 5000);
    } finally {
      setCancelling(false);
    }
  };

  const currentTier = getCurrentTierInfo();
  const remainingGenerations = getRemainingGenerations();
  const usagePercentage =
    currentTier.limit === -1 ? 0 : (usageCount / currentTier.limit) * 100;

  const tierBenefits = {
    FREEMIUM: [
      "2 ATS Resume Optimizations",
      "Basic Templates",
      "Email Support",
    ],
    BASIC: [
      "5 ATS Resume Optimizations",
      "Premium Templates",
      "Email Support",
      "Basic Analytics",
    ],
    PREMIUM: [
      "10 ATS Resume Optimizations",
      "All Premium Templates",
      "Priority Support",
      "Advanced Analytics",
      "Interview Preparation Tools",
    ],
    PREMIUM_PLUS: [
      "Unlimited ATS Optimizations",
      "All Premium Templates",
      "Priority Support",
      "Advanced Analytics",
      "Interview Preparation Tools",
      "Company Research Tools",
      "Salary Benchmarking",
    ],
  };

  if (loading || contextLoading) {
    return (
      <div className={`min-h-screen ${darkMode ? "dark" : ""}`}>
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-700 dark:border-emerald-400"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? "dark" : ""}`}>
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen pt-20">
        <div className="container mx-auto px-4 py-8">
          {/* Success/Error Messages */}
          {successMessage && (
            <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                <span className="text-green-800 dark:text-green-300">
                  {successMessage}
                </span>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
                <span className="text-red-800 dark:text-red-300">
                  {errorMessage}
                </span>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Welcome back, {currentUser?.displayName || "User"}!
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your JobFitt.Ai subscription and track your usage
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm">
                <Crown
                  className={`w-5 h-5 ${
                    userTier === "PREMIUM_PLUS"
                      ? "text-purple-500"
                      : userTier === "PREMIUM"
                      ? "text-yellow-500"
                      : userTier === "BASIC"
                      ? "text-blue-500"
                      : "text-gray-500"
                  }`}
                />
                <span className="font-semibold text-gray-900 dark:text-white">
                  {currentTier.name} Plan
                </span>
              </div>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Usage & Subscription */}
            <div className="lg:col-span-2 space-y-6">
              {/* Usage Stats */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                    <BarChart3 className="w-6 h-6 mr-2 text-green-600 dark:text-emerald-400" />
                    Usage Statistics
                  </h2>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    This month
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-green-50 dark:bg-emerald-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-700 dark:text-emerald-400">
                      {usageCount}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Resumes Optimized
                    </div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                      {remainingGenerations === "Unlimited"
                        ? "∞"
                        : remainingGenerations}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Remaining
                    </div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-purple-700 dark:text-purple-400">
                      {currentTier.limit === -1 ? "∞" : currentTier.limit}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Monthly Limit
                    </div>
                  </div>
                </div>

                {/* Usage Progress Bar */}
                {currentTier.limit !== -1 && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <span>Usage Progress</span>
                      <span>{Math.round(usagePercentage)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all duration-300 ${
                          usagePercentage > 80
                            ? "bg-red-500"
                            : usagePercentage > 60
                            ? "bg-yellow-500"
                            : "bg-green-500"
                        }`}
                        style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Usage Warning */}
                {usagePercentage > 80 && currentTier.limit !== -1 && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <div className="flex items-center">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" />
                      <span className="text-yellow-800 dark:text-yellow-300">
                        You're running low on generations. Consider upgrading
                        your plan.
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Subscription Details */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                    <CreditCard className="w-6 h-6 mr-2 text-green-600 dark:text-emerald-400" />
                    Subscription Details
                  </h2>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">
                      Current Plan
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {currentTier.name}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">
                      Monthly Price
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      ${currentTier.price}/month
                    </span>
                  </div>

                  {subscriptionData?.next_billing_date && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-400">
                        Next Billing
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {new Date(
                          subscriptionData.next_billing_date * 1000
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600 dark:text-gray-400">
                      Status
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        subscriptionData?.status === "active" ||
                        (hasActiveSubscription() && userTier !== "FREEMIUM")
                          ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                          : subscriptionData?.status === "cancelled"
                          ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {subscriptionData?.status ||
                        (hasActiveSubscription() ? "Active" : "Free")}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  {userTier !== "PREMIUM_PLUS" && (
                    <button
                      onClick={() => (window.location.href = "/pricing")}
                      className="flex-1 bg-green-600 dark:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 dark:hover:bg-emerald-700 transition-colors flex items-center justify-center"
                    >
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Upgrade Plan
                    </button>
                  )}

                  {/* Fixed: Use hasActiveSubscription() to determine if cancel button should show */}
                  {hasActiveSubscription() && userTier !== "FREEMIUM" && (
                    <button
                      onClick={() => setShowCancelModal(true)}
                      className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center"
                    >
                      Cancel Subscription
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Plan Benefits & Quick Actions */}
            <div className="space-y-6">
              {/* Current Plan Benefits */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Star className="w-5 h-5 mr-2 text-yellow-500" />
                  Your Benefits
                </h3>
                <ul className="space-y-3">
                  {tierBenefits[userTier]?.map((benefit, index) => (
                    <li
                      key={index}
                      className="flex items-center text-gray-700 dark:text-gray-300"
                    >
                      <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-sm">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Quick Actions */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center">
                    <FileText className="w-5 h-5 text-blue-500 mr-3" />
                    <span className="text-gray-700 dark:text-gray-300">
                      Optimize Resume
                    </span>
                  </button>
                  <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center">
                    <Briefcase className="w-5 h-5 text-purple-500 mr-3" />
                    <span className="text-gray-700 dark:text-gray-300">
                      Job Search Tools
                    </span>
                  </button>
                  <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center">
                    <Target className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700 dark:text-gray-300">
                      Interview Prep
                    </span>
                  </button>
                  <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center">
                    <Settings className="w-5 h-5 text-gray-500 mr-3" />
                    <span className="text-gray-700 dark:text-gray-300">
                      Account Settings
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Subscription Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Cancel Subscription
                </h3>
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  disabled={cancelling}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <AlertTriangle className="w-8 h-8 text-yellow-500 mr-3" />
                  <span className="text-gray-900 dark:text-white font-medium">
                    Are you sure you want to cancel?
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  You'll lose access to premium features at the end of your
                  current billing period. You can resubscribe at any time.
                </p>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                  <p className="text-yellow-800 dark:text-yellow-300 text-sm">
                    <strong>Note:</strong> You'll retain access until{" "}
                    {subscriptionData?.next_billing_date
                      ? new Date(
                          subscriptionData.next_billing_date * 1000
                        ).toLocaleDateString()
                      : "the end of your billing period"}
                  </p>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  disabled={cancelling}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Keep Subscription
                </button>
                <button
                  onClick={handleCancelSubscription}
                  disabled={cancelling}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cancelling ? "Cancelling..." : "Cancel Subscription"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
