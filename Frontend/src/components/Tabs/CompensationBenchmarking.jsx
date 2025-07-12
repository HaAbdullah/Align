import React, { useState, useEffect } from "react";
import { sendJobDescriptionForCompensation } from "../../utils/claudeAPI.js";
import "../../styles/CompensationBenchmarking.css";

const CompensationBenchmarking = ({
  resume,
  jobDescription,
  analysisResults,
}) => {
  const [compensationData, setCompensationData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState(
    new Set(["overview"])
  );

  useEffect(() => {
    if (jobDescription && jobDescription.trim()) {
      fetchCompensationData();
    }
  }, [jobDescription]);

  const fetchCompensationData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await sendJobDescriptionForCompensation(jobDescription);
      let content = response.content?.[0]?.text || "";

      // Strip markdown code block formatting if present
      content = content.replace(/```json\s*([\s\S]*?)\s*```/, "$1").trim();

      const parsedData = JSON.parse(content);
      setCompensationData(parsedData);

      setExpandedSections(new Set(["overview"]));
    } catch (err) {
      console.error("Error fetching compensation data:", err);
      setError(
        "Failed to generate compensation benchmarking data. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (sectionId) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const formatSalary = (amount) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getSalaryColor = (level) => {
    switch (level?.toLowerCase()) {
      case "entry":
        return "#42be94";
      case "mid":
        return "#f39c12";
      case "senior":
        return "#e74c3c";
      case "executive":
        return "#9b59b6";
      default:
        return "#95a5a6";
    }
  };

  if (!jobDescription || !jobDescription.trim()) {
    return (
      <div className="compensation-container">
        <div className="compensation-placeholder">
          <div className="placeholder-icon">💰</div>
          <h3>No Job Description Available</h3>
          <p>
            Please provide a job description to generate compensation
            benchmarking data.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="compensation-container">
        <div className="compensation-loading">
          <div className="loading-spinner"></div>
          <h3>Analyzing Compensation Data...</h3>
          <p>Gathering salary ranges and market insights for this role.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="compensation-container">
        <div className="compensation-error">
          <div className="error-icon">⚠️</div>
          <h3>Error Loading Compensation Data</h3>
          <p>{error}</p>
          <button className="retry-button" onClick={fetchCompensationData}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!compensationData) {
    return (
      <div className="compensation-container">
        <div className="compensation-placeholder">
          <div className="placeholder-icon">📊</div>
          <h3>No Compensation Data Available</h3>
          <p>Unable to generate compensation benchmarking for this position.</p>
          <button className="retry-button" onClick={fetchCompensationData}>
            Retry Analysis
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="compensation-container">
      <div className="compensation-header">
        <h2>Compensation Benchmarking</h2>
        <p>Market salary data and insights for this position</p>
        <div className="compensation-stats">
          <span className="stat">
            {formatSalary(compensationData.overview?.averageSalary)} Average
          </span>
          <span className="stat">
            {compensationData.locations?.length || 0} Locations
          </span>
          <span className="stat">
            {compensationData.levels?.length || 0} Experience Levels
          </span>
        </div>
      </div>

      <div className="sections-container">
        {/* Overview Section */}
        <div className="section-card">
          <div
            className="section-header"
            onClick={() => toggleSection("overview")}
          >
            <h3>💼 Market Overview</h3>
            <span
              className={`expand-icon ${
                expandedSections.has("overview") ? "expanded" : ""
              }`}
            >
              ▼
            </span>
          </div>

          {expandedSections.has("overview") && compensationData.overview && (
            <div className="section-content">
              <div className="overview-grid">
                <div className="overview-item">
                  <div className="overview-label">Position</div>
                  <div className="overview-value">
                    {compensationData.overview.position}
                  </div>
                </div>
                <div className="overview-item">
                  <div className="overview-label">Industry</div>
                  <div className="overview-value">
                    {compensationData.overview.industry}
                  </div>
                </div>
                <div className="overview-item">
                  <div className="overview-label">Salary Range</div>
                  <div className="overview-value">
                    {formatSalary(compensationData.overview.minSalary)} -{" "}
                    {formatSalary(compensationData.overview.maxSalary)}
                  </div>
                </div>
                <div className="overview-item">
                  <div className="overview-label">Market Trend</div>
                  <div className="overview-value trend-positive">
                    {compensationData.overview.trend || "Stable"}
                  </div>
                </div>
              </div>

              {compensationData.overview.insights && (
                <div className="insights-section">
                  <h4>📈 Market Insights</h4>
                  <ul>
                    {compensationData.overview.insights.map(
                      (insight, index) => (
                        <li key={index}>{insight}</li>
                      )
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Experience Levels Section */}
        {compensationData.levels && (
          <div className="section-card">
            <div
              className="section-header"
              onClick={() => toggleSection("levels")}
            >
              <h3>📊 By Experience Level</h3>
              <span
                className={`expand-icon ${
                  expandedSections.has("levels") ? "expanded" : ""
                }`}
              >
                ▼
              </span>
            </div>

            {expandedSections.has("levels") && (
              <div className="section-content">
                <div className="levels-grid">
                  {compensationData.levels.map((level, index) => (
                    <div key={index} className="level-card">
                      <div className="level-header">
                        <span
                          className="level-badge"
                          style={{
                            backgroundColor: getSalaryColor(level.level),
                          }}
                        >
                          {level.level}
                        </span>
                        <span className="level-experience">
                          {level.experience}
                        </span>
                      </div>
                      <div className="level-salary">
                        {formatSalary(level.minSalary)} -{" "}
                        {formatSalary(level.maxSalary)}
                      </div>
                      <div className="level-average">
                        Avg: {formatSalary(level.averageSalary)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Geographic Locations Section */}
        {compensationData.locations && (
          <div className="section-card">
            <div
              className="section-header"
              onClick={() => toggleSection("locations")}
            >
              <h3>🌍 By Geographic Location</h3>
              <span
                className={`expand-icon ${
                  expandedSections.has("locations") ? "expanded" : ""
                }`}
              >
                ▼
              </span>
            </div>

            {expandedSections.has("locations") && (
              <div className="section-content">
                <div className="locations-list">
                  {compensationData.locations.map((location, index) => (
                    <div key={index} className="location-item">
                      <div className="location-header">
                        <span className="location-name">
                          {location.city}, {location.state}
                        </span>
                        <span className="location-col">
                          COL: {location.costOfLiving}%
                        </span>
                      </div>
                      <div className="location-salary">
                        {formatSalary(location.minSalary)} -{" "}
                        {formatSalary(location.maxSalary)}
                      </div>
                      <div className="location-details">
                        <span>Avg: {formatSalary(location.averageSalary)}</span>
                        <span>•</span>
                        <span>{location.jobCount} positions</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Benefits & Perks Section */}
        {compensationData.benefits && (
          <div className="section-card">
            <div
              className="section-header"
              onClick={() => toggleSection("benefits")}
            >
              <h3>🎁 Benefits & Perks</h3>
              <span
                className={`expand-icon ${
                  expandedSections.has("benefits") ? "expanded" : ""
                }`}
              >
                ▼
              </span>
            </div>

            {expandedSections.has("benefits") && (
              <div className="section-content">
                <div className="benefits-grid">
                  {compensationData.benefits.map((benefit, index) => (
                    <div key={index} className="benefit-item">
                      <div className="benefit-icon">{benefit.icon}</div>
                      <div className="benefit-content">
                        <div className="benefit-name">{benefit.name}</div>
                        <div className="benefit-value">{benefit.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="compensation-footer">
        <button className="regenerate-button" onClick={fetchCompensationData}>
          🔄 Refresh Data
        </button>
      </div>
    </div>
  );
};

export default CompensationBenchmarking;
