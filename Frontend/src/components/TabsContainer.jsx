import React, { useState, useEffect, useCallback, useMemo } from "react";
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

  // Cache state for each tab's data
  const [tabCache, setTabCache] = useState({
    keywords: {
      data: null,
      loading: false,
      error: null,
      lastFetched: null,
    },
    companyInsights: {
      data: null,
      loading: false,
      error: null,
      lastFetched: null,
    },
    questionBank: {
      data: null,
      loading: false,
      error: null,
      lastFetched: null,
    },
    compensationBenchmarking: {
      data: null,
      loading: false,
      error: null,
      lastFetched: null,
    },
  });

  // Create a cache key based on resume and job description content
  const cacheKey = useMemo(() => {
    if (!resume || !jobDescription) return null;

    // Create a simple hash of the content to detect changes
    const contentHash = btoa((resume + jobDescription).slice(0, 100))
      .replace(/[^a-zA-Z0-9]/g, "")
      .slice(0, 10);

    return contentHash;
  }, [resume, jobDescription]);

  // Clear cache when resume or job description changes
  useEffect(() => {
    if (cacheKey) {
      const lastCacheKey = localStorage.getItem("tabsCacheKey");

      if (lastCacheKey !== cacheKey) {
        // Content has changed, clear cache
        setTabCache({
          keywords: {
            data: null,
            loading: false,
            error: null,
            lastFetched: null,
          },
          companyInsights: {
            data: null,
            loading: false,
            error: null,
            lastFetched: null,
          },
          questionBank: {
            data: null,
            loading: false,
            error: null,
            lastFetched: null,
          },
          compensationBenchmarking: {
            data: null,
            loading: false,
            error: null,
            lastFetched: null,
          },
        });

        localStorage.setItem("tabsCacheKey", cacheKey);
      }
    }
  }, [cacheKey]);

  // Generic cache update function
  const updateTabCache = useCallback((tabId, updates) => {
    setTabCache((prev) => ({
      ...prev,
      [tabId]: {
        ...prev[tabId],
        ...updates,
        lastFetched: updates.data ? Date.now() : prev[tabId].lastFetched,
      },
    }));
  }, []);

  // Check if data is still fresh (within 5 minutes)
  const isDataFresh = useCallback(
    (tabId) => {
      const tabData = tabCache[tabId];
      if (!tabData.data || !tabData.lastFetched) return false;

      const fiveMinutes = 5 * 60 * 1000;
      return Date.now() - tabData.lastFetched < fiveMinutes;
    },
    [tabCache]
  );

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
    if (!currentUser) return false;
    if (!tab.requiredTier) return true;

    const tierHierarchy = {
      FREEMIUM: 0,
      BASIC: 1,
      PREMIUM: 2,
      PREMIUM_PLUS: 3,
    };

    return tierHierarchy[userTier] >= tierHierarchy[tab.requiredTier];
  };

  const getFirstAccessibleTab = () => {
    const accessibleTab = tabs.find((tab) => canAccessTab(tab));
    return accessibleTab ? accessibleTab.id : tabs[0].id;
  };

  const [activeTab, setActiveTab] = useState(() => getFirstAccessibleTab());

  useEffect(() => {
    const firstAccessibleTab = getFirstAccessibleTab();
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
      goToPricing();
    }
  };

  // Force refresh function for manual refresh buttons
  const forceRefreshTab = useCallback(
    (tabId) => {
      updateTabCache(tabId, {
        data: null,
        loading: false,
        error: null,
        lastFetched: null,
      });
    },
    [updateTabCache]
  );

  const renderTabContent = () => {
    const currentTab = tabs.find((tab) => tab.id === activeTab);

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

    // Pass cache data and update functions to each component
    const commonProps = {
      resume,
      jobDescription,
      analysisResults,
      cachedData: tabCache[activeTab]?.data,
      loading: tabCache[activeTab]?.loading,
      error: tabCache[activeTab]?.error,
      isDataFresh: isDataFresh(activeTab),
      updateCache: (updates) => updateTabCache(activeTab, updates),
      forceRefresh: () => forceRefreshTab(activeTab),
    };

    switch (activeTab) {
      case "keywords":
        return <Keywords {...commonProps} />;
      case "companyInsights":
        return <CompanyInsights {...commonProps} />;
      case "questionBank":
        return <QuestionBank {...commonProps} />;
      case "compensationBenchmarking":
        return <CompensationBenchmarking {...commonProps} />;
      default:
        return <Keywords {...commonProps} />;
    }
  };

  console.log("TabsContainer Props:", {
    resumeLength: resume?.length,
    jobDescriptionLength: jobDescription?.length,
    isResumeSubmitted,
    isJobDescriptionSubmitted,
    currentUser: !!currentUser,
    userTier,
    activeTab,
    cacheKey,
    tabCache: Object.keys(tabCache).reduce(
      (acc, key) => ({
        ...acc,
        [key]: {
          hasData: !!tabCache[key].data,
          loading: tabCache[key].loading,
          error: !!tabCache[key].error,
          isFresh: isDataFresh(key),
        },
      }),
      {}
    ),
  });

  if (!isResumeSubmitted || !isJobDescriptionSubmitted) {
    return null;
  }

  return (
    <div className="w-full max-w-6xl mx-auto mt-8 font-inter">
      <div className="relative p-0.5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 rounded-2xl">
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
          {/* Tab Header */}
          <div className="flex flex-wrap gap-3 mb-6">
            {tabs.map((tab) => {
              const hasAccess = canAccessTab(tab);
              const isActive = activeTab === tab.id;
              const hasCache = !!tabCache[tab.id]?.data;

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
