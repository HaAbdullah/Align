import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useUsage } from "../context/UsageContext";
import Keywords from "./Tabs/Keywords";
import CompanyInsights from "./Tabs/CompanyInsights";
import QuestionBank from "./Tabs/QuestionBank";
import CompensationBenchmarking from "./Tabs/CompensationBenchmarking";

const TabsContainer = ({
  resume,
  jobDescription,
  analysisResults,
  isResumeSubmitted,
  isJobDescriptionSubmitted,
}) => {
  const { currentUser } = useAuth();
  const { userTier, goToPricing } = useUsage();
  const navigate = useNavigate();

  const tabs = [
    { id: "keywords", label: "Keywords", requiredTier: null },
    { id: "companyInsights", label: "Company Insights", requiredTier: null },
    { id: "questionBank", label: "Question Bank", requiredTier: "BASIC" },
    {
      id: "compensationBenchmarking",
      label: "Compensation Benchmarking",
      requiredTier: "BASIC",
    },
  ];

  const canAccessTab = (tab) => {
    // Unauthenticated users can't access any tabs
    if (!currentUser) return false;

    // If no tier requirement, everyone can access
    if (!tab.requiredTier) return true;

    // Check if user's tier meets requirement
    const tierHierarchy = {
      FREEMIUM: 0,
      BASIC: 1,
      PREMIUM: 2,
      PREMIUM_PLUS: 3,
    };

    return tierHierarchy[userTier] >= tierHierarchy[tab.requiredTier];
  };

  // Function to get the first accessible tab
  const getFirstAccessibleTab = () => {
    const accessibleTab = tabs.find((tab) => canAccessTab(tab));
    return accessibleTab ? accessibleTab.id : tabs[0].id; // Fallback to first tab
  };

  // Initialize activeTab with the first accessible tab
  const [activeTab, setActiveTab] = useState(() => getFirstAccessibleTab());

  // Update active tab when user authentication or tier changes
  useEffect(() => {
    const firstAccessibleTab = getFirstAccessibleTab();
    // If current active tab is not accessible, switch to first accessible tab
    const currentTabAccessible =
      tabs.find((tab) => tab.id === activeTab) &&
      canAccessTab(tabs.find((tab) => tab.id === activeTab));

    if (!currentTabAccessible) {
      setActiveTab(firstAccessibleTab);
    }
  }, [currentUser, userTier]);

  const handleTabClick = (tab) => {
    if (canAccessTab(tab)) {
      setActiveTab(tab.id);
    } else {
      // Show upgrade modal or redirect to pricing
      goToPricing();
    }
  };

  const renderTabContent = () => {
    const currentTab = tabs.find((tab) => tab.id === activeTab);

    // Show overlay if user can't access the current tab
    if (!canAccessTab(currentTab)) {
      return (
        <div className="relative min-h-80 flex items-center justify-center bg-slate-900/30 backdrop-blur-md rounded-xl border border-slate-700/50">
          <div className="text-center p-10 max-w-md">
            <div className="text-6xl mb-6 opacity-70">🔒</div>
            <h3 className="text-2xl font-semibold text-gray-100 mb-3">
              {!currentUser ? "Login Required" : "Upgrade Required"}
            </h3>
            <p className="text-gray-400 mb-8 leading-relaxed">
              {!currentUser
                ? "Please log in to access this feature."
                : "You need to upgrade your plan to access this feature."}
            </p>
            {!currentUser ? (
              <div className="flex gap-3 justify-center flex-wrap">
                <button
                  onClick={() => navigate("/login")}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Log In
                </button>
                <button
                  onClick={() => navigate("/signup")}
                  className="border-2 border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                  Sign Up
                </button>
              </div>
            ) : (
              <button
                onClick={goToPricing}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Upgrade Now
              </button>
            )}
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case "keywords":
        return (
          <Keywords
            resume={resume}
            jobDescription={jobDescription}
            analysisResults={analysisResults}
          />
        );
      case "companyInsights":
        return (
          <CompanyInsights
            resume={resume}
            jobDescription={jobDescription}
            analysisResults={analysisResults}
          />
        );
      case "questionBank":
        return (
          <QuestionBank
            resume={resume}
            jobDescription={jobDescription}
            analysisResults={analysisResults}
          />
        );
      case "compensationBenchmarking":
        return (
          <CompensationBenchmarking
            resume={resume}
            jobDescription={jobDescription}
            analysisResults={analysisResults}
          />
        );
      default:
        return (
          <Keywords
            resume={resume}
            jobDescription={jobDescription}
            analysisResults={analysisResults}
          />
        );
    }
  };

  // Add console logs for debugging
  console.log("TabsContainer Props:", {
    resumeLength: resume?.length,
    jobDescriptionLength: jobDescription?.length,
    isResumeSubmitted,
    isJobDescriptionSubmitted,
    currentUser: !!currentUser,
    userTier,
    activeTab,
  });

  if (!isResumeSubmitted || !isJobDescriptionSubmitted) {
    return null;
  }

  return (
    <div className="w-full max-w-6xl mx-auto mt-8 font-inter">
      {/* Glassy Container with Gradient Border */}
      <div className="relative p-0.5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 rounded-2xl">
        {/* Main Container */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
          {/* Tab Header */}
          <div className="flex flex-wrap gap-3 mb-6">
            {tabs.map((tab) => {
              const hasAccess = canAccessTab(tab);
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  className={`relative px-5 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25"
                      : hasAccess
                      ? "bg-slate-800/50 border border-slate-600/50 text-gray-300 hover:bg-slate-700/70 hover:text-white hover:border-slate-500"
                      : "bg-slate-800/30 border border-slate-700/30 text-gray-500 cursor-not-allowed opacity-60"
                  } ${!hasAccess && !currentUser ? "pointer-events-none" : ""}`}
                  onClick={() => handleTabClick(tab)}
                  disabled={!hasAccess && !currentUser}
                >
                  <span className="flex items-center gap-2">
                    {tab.label}
                    {!hasAccess && (
                      <span className="text-xs opacity-75">🔒</span>
                    )}
                  </span>

                  {/* Active tab glow effect */}
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur-lg opacity-30 -z-10"></div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/30 rounded-xl p-6 min-h-64">
            <div className="animate-fadeIn">{renderTabContent()}</div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default TabsContainer;
