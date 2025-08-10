// components/UpgradeModal.js
import React from "react";
import { useUsage } from "../context/UsageContext";
import "../styles/UpgradeModal.css";

function UpgradeModal() {
  const {
    showUpgradeModal,
    setShowUpgradeModal,
    handleUpgradeFromModal,
    getCurrentTierInfo,
    usageCount,
  } = useUsage();

  if (!showUpgradeModal) return null;

  const currentTier = getCurrentTierInfo();

  return (
    <div className="upgrade-modal-overlay">
      <div className="upgrade-modal">
        <button
          className="modal-close-btn"
          onClick={() => setShowUpgradeModal(false)}
        >
          ✕
        </button>

        <div className="modal-header">
          <h3>🚀 Generation Limit Reached</h3>
          <p>
            You've used all <strong>{currentTier.limit}</strong> generations in
            your {currentTier.name} plan.
          </p>
        </div>

        <div className="modal-content">
          <div className="current-usage">
            <div className="usage-circle">
              <span className="usage-fraction">
                {usageCount}/{currentTier.limit}
              </span>
              <span className="usage-label">Used</span>
            </div>
          </div>

          <div className="upgrade-benefits">
            <h4>Upgrade to unlock:</h4>
            <div className="benefits-list">
              <div className="benefit-item">✅ More monthly generations</div>
              <div className="benefit-item">✅ Advanced ATS analysis</div>
              <div className="benefit-item">✅ Detailed keyword matching</div>
              <div className="benefit-item">✅ Priority support</div>
            </div>
          </div>
        </div>

        <div className="test-card-info">
          <div className="test-card-header">
            <span className="test-badge">Demo Test Card</span>
          </div>
          <div className="test-card-details">
            <p className="test-card-number">4242 4242 4242 4242</p>
            <p className="test-card-note">Use any expiry date and CVC for free upgrade</p>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn-primary" onClick={handleUpgradeFromModal}>
            View Pricing Plans
          </button>
          <button
            className="btn-secondary"
            onClick={() => setShowUpgradeModal(false)}
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}

export default UpgradeModal;
