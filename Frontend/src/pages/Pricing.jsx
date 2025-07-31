import { useState } from "react";
import { Check, X, Star, Zap, Crown, Infinity } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { useAuth } from "../context/AuthContext";

const PricingPage = () => {
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [darkMode, setDarkMode] = useState(true);
  const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
  const { currentUser, signInWithGoogle } = useAuth();

  const handleCheckout = async (planName, billingCycle) => {
    try {
      // Check if user is authenticated
      if (!currentUser) {
        // Redirect to login or show login modal
        await signInWithGoogle();
        return;
      }

      // Store the selected plan in sessionStorage for fallback
      sessionStorage.setItem("selectedPlan", planName);
      sessionStorage.setItem("selectedBillingCycle", billingCycle);

      const priceIds = {
        Basic: {
          monthly: "price_1Ra3pUA3sCBSHclD2iDiFeOK",
          yearly: "none",
        },
        Premium: {
          monthly: "price_1Ra3phA3sCBSHclDcgaWJ9cz",
          yearly: "none",
        },
        "Premium+": {
          monthly: "price_1Ra3pxA3sCBSHclD99cjEjee",
          yearly: "none",
        },
      };

      const priceId = priceIds[planName][billingCycle];

      if (!priceId || priceId === "none") {
        console.error("Price ID not found for:", planName, billingCycle);
        alert(
          "This billing option is not available yet. Please try monthly billing."
        );
        return;
      }

      console.log("Creating checkout session for:", {
        priceId,
        planName,
        userId: currentUser.uid,
        userEmail: currentUser.email,
      });

      // Call your backend to create checkout session
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/create-checkout-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            priceId: priceId,
            planName: planName,
            userId: currentUser.uid,
            userEmail: currentUser.email,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      console.log("Backend response:", responseData);

      // FIX: Access the data object properly
      if (responseData.success && responseData.data && responseData.data.url) {
        console.log("Redirecting to Stripe:", responseData.data.url);
        // Redirect to Stripe Checkout
        window.location.href = responseData.data.url;
      } else {
        console.error("Invalid response structure:", responseData);
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert(`Checkout failed: ${error.message}`);
      // Clear stored plan data on error
      sessionStorage.removeItem("selectedPlan");
      sessionStorage.removeItem("selectedBillingCycle");
    }
  };
  const plans = [
    {
      name: "Freemium",
      price: { monthly: 0, yearly: 0 },
      icon: <Star className="w-8 h-8" />,
      badge: "Get Started",
      badgeColor:
        "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200",
      buttonStyle:
        "bg-gray-600 dark:bg-gray-700 hover:bg-gray-700 dark:hover:bg-gray-600 text-white",
      features: [
        {
          text: "Resume & Cover Letter Generation",
          included: true,
          limit: "2 per month",
        },
        {
          text: "Market Analysis",
          included: true,
          limit: "Based on job description",
        },
        {
          text: "Keyword Analysis",
          included: true,
          limit: "Job-resume matching",
        },
        {
          text: "Access to Free Content",
          included: true,
          limit: "Guides & tips",
        },
        { text: "Resume Saving", included: false },
        { text: "Company Insights", included: false },
        { text: "Interview Question Bank", included: false },
      ],
    },
    {
      name: "Basic",
      price: { monthly: 5, yearly: 50 },
      icon: <Zap className="w-8 h-8" />,
      badge: "Most Popular",
      badgeColor:
        "bg-green-100 dark:bg-emerald-900 text-green-800 dark:text-emerald-200",
      buttonStyle:
        "bg-green-700 dark:bg-emerald-600 hover:bg-green-800 dark:hover:bg-emerald-700 text-white",
      popular: true,
      features: [
        { text: "Everything in Freemium", included: true },
        {
          text: "Resume & Cover Letter Generation",
          included: true,
          limit: "5 per month",
        },
        {
          text: "Resume Saving",
          included: true,
          limit: "Save and manage your resumes",
        },
        {
          text: "Company Insights",
          included: true,
          limit: "Detailed company information",
        },
        {
          text: "Interview Question Bank",
          included: true,
          limit: "Role-specific questions",
        },
        {
          text: "Access to Free Content",
          included: true,
          limit: "Guides & tips",
        },
      ],
    },
    {
      name: "Premium",
      price: { monthly: 10, yearly: 100 },
      icon: <Crown className="w-8 h-8" />,
      badge: "Best Value",
      badgeColor:
        "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200",
      buttonStyle:
        "bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-800 text-white",
      features: [
        { text: "Everything in Basic", included: true },
        {
          text: "Resume & Cover Letter Generation",
          included: true,
          limit: "10 per month",
        },
        {
          text: "Resume Saving",
          included: true,
          limit: "Unlimited storage",
        },
        {
          text: "Enhanced Company Insights",
          included: true,
          limit: "Deep company analysis",
        },
        {
          text: "Comprehensive Interview Question Bank",
          included: true,
          limit: "Industry-specific prep",
        },
        {
          text: "Access to Free Content",
          included: true,
          limit: "Guides & tips",
        },
      ],
    },
    {
      name: "Premium+",
      price: { monthly: 15, yearly: 150 },
      icon: <Infinity className="w-8 h-8" />,
      badge: "Unlimited",
      badgeColor:
        "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200",
      buttonStyle:
        "bg-purple-600 dark:bg-purple-700 hover:bg-purple-700 dark:hover:bg-purple-800 text-white",
      features: [
        { text: "Everything in Premium", included: true },
        {
          text: "UNLIMITED Resume & Cover Letters",
          included: true,
          limit: "No monthly limits",
        },
        {
          text: "UNLIMITED Resume Saving",
          included: true,
          limit: "Unlimited storage & organization",
        },
        {
          text: "UNLIMITED Market & Keyword Analysis",
          included: true,
          limit: "All tools unrestricted",
        },
        {
          text: "Priority Company Insights",
          included: true,
          limit: "Real-time data updates",
        },
        {
          text: "Premium Interview Question Bank",
          included: true,
          limit: "AI-powered personalization",
        },
        {
          text: "Priority Support",
          included: true,
          limit: "Fastest response times",
        },
        {
          text: "Beta Feature Access",
          included: true,
          limit: "First to try new features",
        },
        {
          text: "Access to Free Content",
          included: true,
          limit: "Guides & tips + premium content",
        },
      ],
    },
  ];

  const getYearlyDiscount = (plan) => {
    const monthlyYearly = plan.price.monthly * 12;
    const yearlyPrice = plan.price.yearly;
    if (monthlyYearly === 0 || yearlyPrice === 0) return 0;
    return Math.round(((monthlyYearly - yearlyPrice) / monthlyYearly) * 100);
  };
  // You already have this line at the top, so just add the console.logs
  console.log("Current user object:", currentUser);
  console.log("Is user logged in?", !!currentUser);

  if (currentUser) {
    console.log("Firebase UID:", currentUser.uid);
    console.log("Email:", currentUser.email);
    console.log("Display Name:", currentUser.displayName);
  } else {
    console.log("User is not logged in");
  }
  return (
    <div className={`min-h-screen ${darkMode ? "dark" : ""}`}>
      <div className="bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-emerald-900 transition-all duration-300">
        {/* Header */}
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Choose Your{" "}
              <span className="text-green-700 dark:text-emerald-400">
                Align
              </span>{" "}
              Plan
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              From getting started to landing your dream job - we have the
              perfect plan for every stage of your career journey
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center space-x-4 mb-8">
              <span
                className={`text-sm font-medium ${
                  billingCycle === "monthly"
                    ? "text-green-700 dark:text-emerald-400"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                Monthly
              </span>
              <button
                onClick={() =>
                  setBillingCycle(
                    billingCycle === "monthly" ? "yearly" : "monthly"
                  )
                }
                className="relative w-14 h-7 bg-gray-300 dark:bg-gray-600 rounded-full p-1 focus:outline-none transition-colors"
              >
                <span
                  className={`block w-5 h-5 bg-white dark:bg-emerald-400 rounded-full shadow-md transform transition-transform duration-300 ${
                    billingCycle === "yearly"
                      ? "translate-x-7"
                      : "translate-x-0"
                  }`}
                ></span>
              </button>
              <span
                className={`text-sm font-medium ${
                  billingCycle === "yearly"
                    ? "text-green-700 dark:text-emerald-400"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                Yearly
              </span>
              {billingCycle === "yearly" && (
                <span className="text-xs bg-green-100 dark:bg-emerald-900 text-green-800 dark:text-emerald-200 px-2 py-1 rounded-full font-medium">
                  Save up to 17%
                </span>
              )}
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {plans.map((plan, index) => (
              <div
                key={plan.name}
                className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ${
                  plan.popular
                    ? "ring-2 ring-green-500 dark:ring-emerald-400 scale-105"
                    : "hover:scale-102"
                } border border-gray-200 dark:border-gray-700`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-green-500 dark:bg-emerald-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="p-6">
                  {/* Plan Header */}
                  <div className="text-center mb-6">
                    <div className="flex justify-center mb-3">
                      <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full text-green-700 dark:text-emerald-400">
                        {plan.icon}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {plan.name}
                    </h3>
                    <div
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${plan.badgeColor} mb-4`}
                    >
                      {plan.badge}
                    </div>

                    {/* Pricing */}
                    <div className="mb-4">
                      <div className="flex items-center justify-center">
                        <span className="text-3xl font-bold text-gray-900 dark:text-white">
                          ${plan.price[billingCycle]}
                        </span>
                        {plan.price.monthly > 0 && (
                          <span className="text-gray-500 dark:text-gray-400 ml-1">
                            /{billingCycle === "monthly" ? "mo" : "yr"}
                          </span>
                        )}
                      </div>
                      {billingCycle === "yearly" && plan.price.monthly > 0 && (
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          ${(plan.price.yearly / 12).toFixed(1)}/month
                          {getYearlyDiscount(plan) > 0 && (
                            <span className="text-green-600 dark:text-emerald-400 ml-2">
                              ({getYearlyDiscount(plan)}% off)
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Features */}
                  <div className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <div
                        key={featureIndex}
                        className="flex items-start space-x-3"
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          {feature.included ? (
                            <Check className="w-4 h-4 text-green-500 dark:text-emerald-400" />
                          ) : (
                            <X className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <span
                            className={`text-sm ${
                              feature.included
                                ? "text-gray-700 dark:text-gray-300"
                                : "text-gray-400 dark:text-gray-500"
                            }`}
                          >
                            {feature.text}
                          </span>
                          {feature.limit && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {feature.limit}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* CTA Button */}

                  <button
                    onClick={() => {
                      if (plan.name === "Freemium") {
                        // Handle free plan signup - redirect to registration or dashboard
                        if (!currentUser) {
                          signInWithGoogle();
                        } else {
                          // User is already signed in, redirect to dashboard
                          window.location.href = "/dashboard";
                        }
                      } else {
                        // Handle paid plan checkout
                        handleCheckout(plan.name, billingCycle);
                      }
                    }}
                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${plan.buttonStyle} transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-emerald-400`}
                  >
                    {plan.name === "Freemium"
                      ? currentUser
                        ? "Go to Dashboard"
                        : "Get Started Free"
                      : "Start Free Trial"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="mt-20 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
              Frequently Asked Questions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Can I change plans anytime?
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Yes! You can upgrade, downgrade, or cancel your subscription
                  at any time. Changes take effect immediately.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Is there a free trial?
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  All paid plans come with a 7-day free trial. No credit card
                  required to start your Freemium account.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  What payment methods do you accept?
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  We accept all major credit cards, PayPal, and bank transfers
                  for annual subscriptions.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Do you offer refunds?
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Yes, we offer a 30-day money-back guarantee for all paid
                  plans. No questions asked.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="mt-16 text-center">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Need help choosing the right plan?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Our team is here to help you find the perfect solution for your
              career goals.
            </p>
            <button className="bg-green-700 dark:bg-emerald-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-800 dark:hover:bg-emerald-700 transition-colors">
              Contact Sales
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
