// components/UsageDisplay.js
import React from "react";
import { useUsage } from "../context/UsageContext";
import { useAuth } from "../context/AuthContext";

import "../styles/UsageDisplay.css";

const UsageDisplay = () => {
  const { currentUser } = useAuth();
  const {
    getCurrentTierInfo,
    getRemainingGenerations,
    usageCount,
    goToPricing, // Use this instead of setShowUpgradeModal
    resetUsage, // For testing purposes
  } = useUsage();

  if (!currentUser) return null;

  const tierInfo = getCurrentTierInfo();
  const remaining = getRemainingGenerations();
  const isUnlimited = tierInfo.limit === -1;

  return (
    <div className="usage-display">
      <div className="usage-info">
        <div className="tier-badge">{tierInfo.name} Plan</div>
        <div className="usage-stats">
          {isUnlimited ? (
            <span>Unlimited Generations</span>
          ) : (
            <>
              <span className="usage-count">
                {usageCount}/{tierInfo.limit}
              </span>
              <span className="remaining">({remaining} remaining)</span>
            </>
          )}
        </div>
      </div>

      <div className="usage-actions">
        {!isUnlimited && (
          <button
            className="upgrade-prompt-btn"
            onClick={goToPricing} // Changed this line to use goToPricing
          >
            Upgrade Plan
          </button>
        )}

        {/* Testing button - remove in production */}
        <button
          className="reset-usage-btn"
          onClick={resetUsage}
          title="Reset usage for testing"
        >
          Reset (Test)
        </button>
      </div>
    </div>
  );
};

export default UsageDisplay;
