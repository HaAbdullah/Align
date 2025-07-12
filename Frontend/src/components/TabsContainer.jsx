import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useUsage } from "../context/UsageContext";
import Keywords from "./Tabs/Keywords";
import CompanyInsights from "./Tabs/CompanyInsights";
import QuestionBank from "./Tabs/QuestionBank";
import CompensationBenchmarking from "./Tabs/CompensationBenchmarking";
import "../styles/TabsContainer.css";

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
        <div className="tab-access-overlay">
          <div className="overlay-content">
            <div className="lock-icon">🔒</div>
            <h3>{!currentUser ? "Login Required" : "Upgrade Required"}</h3>
            <p>
              {!currentUser
                ? "Please log in to access this feature."
                : "You need to upgrade your plan to access this feature."}
            </p>
            {!currentUser ? (
              <div className="auth-buttons">
                <button
                  onClick={() => navigate("/login")}
                  className="upgrade-button"
                >
                  Log In
                </button>
                <button
                  onClick={() => navigate("/signup")}
                  className="signup-button"
                >
                  Sign Up
                </button>
              </div>
            ) : (
              <button onClick={goToPricing} className="upgrade-button">
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
    <div className="tabs-container">
      <div className="tabs-header">
        {tabs.map((tab) => {
          const hasAccess = canAccessTab(tab);
          return (
            <div key={tab.id} className="tab-wrapper">
              <button
                className={`tab-button ${
                  activeTab === tab.id ? "active" : ""
                } ${!hasAccess ? "locked" : ""}`}
                onClick={() => handleTabClick(tab)}
                disabled={!hasAccess && !currentUser} // Disable completely for unauthenticated users
              >
                {tab.label}
                {!hasAccess && <span className="lock-indicator">🔒</span>}
              </button>
            </div>
          );
        })}
      </div>
      <div className="tab-content-container">
        <div className="tab-content">{renderTabContent()}</div>
      </div>
    </div>
  );
};

export default TabsContainer;
