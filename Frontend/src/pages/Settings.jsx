import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useUsage } from "../context/UsageContext";
import {
  User,
  Crown,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  X,
  TrendingUp,
  MessageSquare,
  Shield,
  Bell,
} from "lucide-react";

const Settings = () => {
  const { currentUser, logout } = useAuth();
  const {
    userTier,
    getCurrentTierInfo,
    cancelSubscription,
    hasActiveSubscription,
    getSubscriptionData,
    isLoading: contextLoading,
  } = useUsage();
  const navigate = useNavigate();

  const [darkMode, setDarkMode] = useState(true);
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = savedTheme !== "light";
    setDarkMode(prefersDark);
  }, []);

  useEffect(() => {
    if (currentUser) {
      const localSubData = getSubscriptionData();
      if (localSubData?.hasSubscription) {
        setSubscriptionData({
          customer_id: localSubData.customerId,
          subscription_id: localSubData.subscriptionId,
          status: userTier !== "FREEMIUM" ? "active" : "inactive",
        });
      } else {
        setSubscriptionData(null);
      }
      setLoading(false);
    }
  }, [currentUser]);

  const handleCancelSubscription = async () => {
    if (!hasActiveSubscription()) {
      setErrorMessage("No active subscription to cancel.");
      return;
    }
    setCancelling(true);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      await cancelSubscription();
      const localSubData = getSubscriptionData();
      setSubscriptionData(localSubData?.hasSubscription ? subscriptionData : null);
      setShowCancelModal(false);
      setSuccessMessage("Subscription cancelled successfully.");
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (error) {
      setErrorMessage(error.message || "Failed to cancel subscription. Please try again.");
      setTimeout(() => setErrorMessage(""), 5000);
    } finally {
      setCancelling(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    navigate("/");
  };

  const currentTier = getCurrentTierInfo();

  const tierColors = {
    PREMIUM_PLUS: "text-purple-500",
    PREMIUM: "text-yellow-500",
    BASIC: "text-blue-500",
    FREEMIUM: "text-gray-500",
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

          {/* Feedback banners */}
          {successMessage && (
            <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                <span className="text-green-800 dark:text-green-300">{successMessage}</span>
              </div>
            </div>
          )}
          {errorMessage && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
                <span className="text-red-800 dark:text-red-300">{errorMessage}</span>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Settings
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your account, subscription, and preferences
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm">
                <Crown className={`w-5 h-5 ${tierColors[userTier] || "text-gray-500"}`} />
                <span className="font-semibold text-gray-900 dark:text-white">
                  {currentTier.name} Plan
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left column */}
            <div className="lg:col-span-2 space-y-6">

              {/* Profile Info */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center mb-6">
                  <User className="w-6 h-6 mr-2 text-green-600 dark:text-emerald-400" />
                  Profile Information
                </h2>
                <div className="flex items-center space-x-5 mb-6">
                  {currentUser?.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt="Profile"
                      className="h-20 w-20 rounded-full object-cover border-4 border-emerald-500"
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-full bg-emerald-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-emerald-500">
                      {currentUser?.displayName?.charAt(0) || currentUser?.email?.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {currentUser?.displayName || "User"}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {currentUser?.email}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      Member since{" "}
                      {currentUser?.metadata?.creationTime
                        ? new Date(currentUser.metadata.creationTime).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 rounded-lg px-4 py-3">
                  Profile details are managed through your Google account. To update your name or photo, edit your Google profile.
                </p>
              </div>

              {/* Subscription Management */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center mb-6">
                  <CreditCard className="w-6 h-6 mr-2 text-green-600 dark:text-emerald-400" />
                  Subscription
                </h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">Current Plan</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{currentTier.name}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">Monthly Price</span>
                    <span className="font-semibold text-gray-900 dark:text-white">${currentTier.price}/month</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600 dark:text-gray-400">Status</span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        hasActiveSubscription() && userTier !== "FREEMIUM"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                          : subscriptionData?.status === "cancelled"
                          ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {hasActiveSubscription() && userTier !== "FREEMIUM" ? "Active" : "Free"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  {userTier !== "PREMIUM_PLUS" && (
                    <button
                      onClick={() => navigate("/pricing")}
                      className="flex-1 bg-green-600 dark:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 dark:hover:bg-emerald-700 transition-colors flex items-center justify-center"
                    >
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Upgrade Plan
                    </button>
                  )}
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

              {/* Support */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center mb-6">
                  <MessageSquare className="w-6 h-6 mr-2 text-green-600 dark:text-emerald-400" />
                  Support
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  Have a question or need help? Our team is here for you.
                </p>
                <button
                  onClick={() => navigate("/contact")}
                  className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 px-5 py-2 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center"
                >
                  <MessageSquare className="w-4 h-4 mr-2 text-emerald-500" />
                  Contact Us
                </button>
              </div>

              {/* Danger Zone */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-red-200 dark:border-red-900/40">
                <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 flex items-center mb-4">
                  <AlertTriangle className="w-6 h-6 mr-2" />
                  Danger Zone
                </h2>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Sign out of Align</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      You'll need to sign in again to access your account.
                    </p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="shrink-0 bg-red-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-6">
              {/* Legal */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-emerald-400" />
                  Legal
                </h3>
                <ul className="space-y-2">
                  <li>
                    <button
                      onClick={() => navigate("/terms")}
                      className="text-sm text-emerald-500 hover:text-emerald-400 transition-colors"
                    >
                      Terms of Service
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => navigate("/privacy")}
                      className="text-sm text-emerald-500 hover:text-emerald-400 transition-colors"
                    >
                      Privacy Policy
                    </button>
                  </li>
                </ul>
              </div>

              {/* Account Info */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2 text-emerald-400" />
                  Account Details
                </h3>
                <ul className="space-y-3 text-sm">
                  <li>
                    <span className="text-gray-500 dark:text-gray-400">Member since</span>
                    <p className="text-gray-900 dark:text-white font-medium mt-0.5">
                      {currentUser?.metadata?.creationTime
                        ? new Date(currentUser.metadata.creationTime).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </li>
                  <li>
                    <span className="text-gray-500 dark:text-gray-400">Last sign in</span>
                    <p className="text-gray-900 dark:text-white font-medium mt-0.5">
                      {currentUser?.metadata?.lastSignInTime
                        ? new Date(currentUser.metadata.lastSignInTime).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </li>
                </ul>
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
                  You'll lose access to premium features at the end of your current billing period. You can resubscribe at any time.
                </p>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                  <p className="text-yellow-800 dark:text-yellow-300 text-sm">
                    <strong>Note:</strong> You'll retain access until{" "}
                    {subscriptionData?.next_billing_date
                      ? new Date(subscriptionData.next_billing_date * 1000).toLocaleDateString()
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

export default Settings;
