import { useState, useEffect } from "react";
import { BASE_URL } from "../utils/api";
import { CheckCircle, ArrowRight, Download, Star } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useUsage } from "../context/UsageContext";

const Success = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tierUpdated, setTierUpdated] = useState(false);
  const [error, setError] = useState(null);

  const { currentUser } = useAuth();
  const { updateSubscription, refreshUserData } = useUsage(); // ✅ Added refreshUserData

  // Debug logging
  useEffect(() => {
    console.log("Success page loaded");
    console.log("Current user:", currentUser);
    console.log("Tier updated:", tierUpdated);
  }, [currentUser, tierUpdated]);

  useEffect(() => {
    const initializeSuccess = async () => {
      console.log("🚀 Initializing success page...");

      // Get session_id from URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const sessionId = urlParams.get("session_id");
      const planFromUrl = urlParams.get("plan");

      console.log("📊 Session ID from URL:", sessionId);
      console.log("📊 Plan from URL:", planFromUrl);

      if (sessionId) {
        await verifySession(sessionId);
      } else {
        console.log("⚠️ No session ID found, checking for plan info...");

        // Try to get plan info from URL or sessionStorage
        const planFromStorage = sessionStorage.getItem("selectedPlan");
        console.log("📊 Plan from storage:", planFromStorage);

        if (planFromUrl || planFromStorage) {
          console.log("✅ Found plan info, updating tier...");
          await updateUserTier(planFromUrl || planFromStorage);
        } else {
          console.log("❌ No plan information found");
          setError(
            "No payment information found. Please try again or contact support."
          );
        }

        setLoading(false);
      }
    };

    initializeSuccess();
  }, []);

  // Separate effect to handle tier updates when user becomes available
  useEffect(() => {
    if (currentUser && sessionData?.planName && !tierUpdated) {
      console.log("👤 User available, updating tier with session data...");
      updateUserTier(sessionData.planName);
    }
  }, [currentUser, sessionData, tierUpdated]);

  const verifySession = async (sessionId) => {
    console.log("🔍 Verifying Stripe session:", sessionId);

    try {
      const response = await fetch(
        `${BASE_URL}/api/verify-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sessionId }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Session verification successful:", data);
        console.log("📋 Full response data:", JSON.stringify(data, null, 2));

        // ✅ FIX: Extract data from response wrapper if needed
        const sessionInfo = data.data || data;
        setSessionData(sessionInfo);

        // Update the user's tier if we have all the data
        if (sessionInfo.planName && currentUser && !tierUpdated) {
          console.log("🔄 Updating tier immediately with session data...");
          await updateUserTier(
            sessionInfo.planName,
            sessionInfo.customer_id,
            sessionInfo.subscription_id
          );
        }
      } else {
        console.error("❌ Session verification failed:", response.status);
        const errorText = await response.text();
        console.error("Error response:", errorText);
        setError("Payment verification failed. Please contact support.");
        throw new Error("Session verification failed");
      }
    } catch (error) {
      console.error("❌ Error verifying session:", error);
      setError("Unable to verify payment. Please contact support.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED: Updated function using database with better error handling
  const updateUserTier = async (
    planName,
    customerId = null,
    subscriptionId = null
  ) => {
    console.log("🔄 updateUserTier called with:", {
      planName,
      customerId,
      subscriptionId,
    });
    console.log("👤 Current user:", currentUser?.uid);
    console.log("✅ Tier already updated:", tierUpdated);

    if (!currentUser) {
      console.log("⚠️ No current user available, cannot update tier");
      return;
    }

    if (tierUpdated) {
      console.log("✅ Tier already updated, skipping");
      return;
    }

    // Map plan names to tier constants
    const planToTier = {
      Basic: "BASIC",
      Premium: "PREMIUM",
      "Premium+": "PREMIUM_PLUS",
    };

    const tierKey = planToTier[planName];
    console.log("🎯 Mapped tier key:", tierKey);

    if (tierKey) {
      try {
        console.log(
          `🔄 Upgrading user ${currentUser.uid} to ${tierKey} tier via DATABASE`
        );

        // ✅ FIX: Use database API with proper error handling
        const result = await updateSubscription(
          tierKey,
          customerId || sessionData?.customer_id,
          subscriptionId || sessionData?.subscription_id
        );

        console.log("✅ updateSubscription result:", result);

        setTierUpdated(true);

        // Clear any stored plan selection
        sessionStorage.removeItem("selectedPlan");
        sessionStorage.removeItem("selectedBillingCycle");

        console.log("✅ Tier updated successfully in database!");

        // ✅ FIX: Force refresh user data to ensure UI is updated
        setTimeout(async () => {
          console.log("🔄 Refreshing user data after tier update...");
          await refreshUserData();
        }, 1000);
      } catch (error) {
        console.error("❌ Error updating tier:", error);
        setError("Failed to update your subscription. Please contact support.");
      }
    } else {
      console.warn("⚠️ Unknown plan name:", planName);
      console.log("📋 Available plan mappings:", Object.keys(planToTier));
      setError(`Unknown subscription plan: ${planName}`);
    }
  };

  const handleGoToDashboard = () => {
    window.location.href = "/dashboard";
  };

  const handleDownloadReceipt = () => {
    // TODO: Implement receipt download logic
    console.log("📄 Download receipt (not implemented yet)");
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          darkMode ? "dark" : ""
        }`}
      >
        <div className="bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-emerald-900 w-full h-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-700 dark:border-emerald-400"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          darkMode ? "dark" : ""
        }`}
      >
        <div className="bg-gradient-to-br from-red-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-red-900 w-full h-full flex items-center justify-center">
          <div className="max-w-md mx-auto text-center p-8">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Payment Issue
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
            <button
              onClick={() => (window.location.href = "/pricing")}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700"
            >
              Return to Pricing
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? "dark" : ""}`}>
      <div className="bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-emerald-900 transition-all duration-300">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            {/* Success Icon */}
            <div className="flex justify-center mb-8">
              <div className="p-4 bg-green-100 dark:bg-emerald-900 rounded-full">
                <CheckCircle className="w-16 h-16 text-green-600 dark:text-emerald-400" />
              </div>
            </div>

            {/* Success Message */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Payment Successful!
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Welcome to{" "}
              <span className="text-green-700 dark:text-emerald-400 font-semibold">
                Align
              </span>
              ! Your subscription is now active and you're ready to accelerate
              your job search.
            </p>

            {/* Tier Update Confirmation */}
            {tierUpdated && (
              <div className="bg-green-50 dark:bg-emerald-900/20 rounded-lg p-4 mb-6 border border-green-200 dark:border-emerald-800">
                <p className="text-green-700 dark:text-emerald-400 font-medium">
                  ✨ Your account has been upgraded to{" "}
                  {sessionData?.planName || "Premium"} tier!
                </p>
              </div>
            )}

            {/* Plan Details Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-center mb-6">
                <Star className="w-8 h-8 text-yellow-500 mr-2" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {sessionData?.planName || "Premium"} Plan Activated
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                    What's Next?
                  </h3>
                  <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      Access your dashboard
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      Upload your first resume
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      Start generating optimized resumes
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      Explore company insights
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                    Your Benefits
                  </h3>
                  <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      AI-optimized resumes
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      Unlimited generations
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      Company research tools
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      Interview question bank
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <button
                onClick={handleGoToDashboard}
                className="bg-green-700 dark:bg-emerald-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-green-800 dark:hover:bg-emerald-700 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-emerald-400 flex items-center justify-center"
              >
                Go to Dashboard
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>

              <button
                onClick={handleDownloadReceipt}
                className="bg-gray-600 dark:bg-gray-700 text-white px-8 py-4 rounded-lg font-semibold hover:bg-gray-700 dark:hover:bg-gray-600 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 flex items-center justify-center"
              >
                <Download className="w-5 h-5 mr-2" />
                Download Receipt
              </button>
            </div>

            {/* Additional Info */}
            <div className="bg-green-50 dark:bg-emerald-900/20 rounded-lg p-6 border border-green-200 dark:border-emerald-800">
              <h3 className="text-lg font-semibold text-green-800 dark:text-emerald-300 mb-2">
                Need Help Getting Started?
              </h3>
              <p className="text-green-700 dark:text-emerald-400 mb-4">
                Check your email for a welcome guide, or contact our support
                team if you have any questions.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href="mailto:hasanjeenterprise@gmail.com"
                  className="text-green-700 dark:text-emerald-400 hover:text-green-800 dark:hover:text-emerald-300 font-medium underline"
                >
                  Contact Support
                </a>
                <span className="hidden sm:inline text-green-600 dark:text-emerald-500">
                  •
                </span>
                <a
                  href="/help"
                  className="text-green-700 dark:text-emerald-400 hover:text-green-800 dark:hover:text-emerald-300 font-medium underline"
                >
                  View Help Center
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Success;
