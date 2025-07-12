import React, { useState, useEffect } from "react";
import { sendJobDescriptionForCompanyInsights } from "../../utils/claudeAPI.js";
import "../../styles/CompanyInsights.css";

const CompanyInsights = ({ resume, jobDescription, analysisResults }) => {
  const [companyData, setCompanyData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState(
    new Set(["overview"])
  );

  useEffect(() => {
    if (jobDescription && jobDescription.trim()) {
      fetchCompanyData();
    }
  }, [jobDescription]);

  const fetchCompanyData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await sendJobDescriptionForCompanyInsights(
        jobDescription
      );
      let content = response.content?.[0]?.text || "";

      // Strip markdown code block formatting if present
      content = content.replace(/```json\s*([\s\S]*?)\s*```/, "$1").trim();

      const parsedData = JSON.parse(content);
      setCompanyData(parsedData);

      setExpandedSections(new Set(["overview"]));
    } catch (err) {
      console.error("Error fetching company data:", err);
      setError("Failed to generate company insights data. Please try again.");
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

  const getRatingColor = (rating) => {
    if (rating >= 4.0) return "#42be94";
    if (rating >= 3.5) return "#f39c12";
    if (rating >= 3.0) return "#e67e22";
    return "#e74c3c";
  };

  const formatRating = (rating) => {
    return rating ? `${rating}/5.0` : "N/A";
  };

  if (!jobDescription || !jobDescription.trim()) {
    return (
      <div className="company-insights-container">
        <div className="company-placeholder">
          <div className="placeholder-icon">🏢</div>
          <h3>No Job Description Available</h3>
          <p>Please provide a job description to generate company insights.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="company-insights-container">
        <div className="company-loading">
          <div className="loading-spinner"></div>
          <h3>Analyzing Company Information...</h3>
          <p>Gathering insights about this company from multiple sources.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="company-insights-container">
        <div className="company-error">
          <div className="error-icon">⚠️</div>
          <h3>Error Loading Company Data</h3>
          <p>{error}</p>
          <button className="retry-button" onClick={fetchCompanyData}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!companyData) {
    return (
      <div className="company-insights-container">
        <div className="company-placeholder">
          <div className="placeholder-icon">📊</div>
          <h3>No Company Data Available</h3>
          <p>Unable to generate company insights for this position.</p>
          <button className="retry-button" onClick={fetchCompanyData}>
            Retry Analysis
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="company-insights-container">
      <div className="company-header">
        <h2>Company Insights</h2>
        <p>Comprehensive overview and employee feedback</p>
        <div className="company-stats">
          <span className="stat">
            {formatRating(companyData.overview?.overallRating)} Overall Rating
          </span>
          <span className="stat">
            {companyData.ratings?.length || 0} Platforms
          </span>
          <span className="stat">
            {companyData.reviews?.length || 0} Reviews
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
            <h3>🏢 Company Overview</h3>
            <span
              className={`expand-icon ${
                expandedSections.has("overview") ? "expanded" : ""
              }`}
            >
              ▼
            </span>
          </div>

          {expandedSections.has("overview") && companyData.overview && (
            <div className="section-content">
              <div className="overview-grid">
                <div className="overview-item">
                  <div className="overview-label">Company</div>
                  <div className="overview-value">
                    {companyData.overview.companyName}
                  </div>
                </div>
                <div className="overview-item">
                  <div className="overview-label">Industry</div>
                  <div className="overview-value">
                    {companyData.overview.industry}
                  </div>
                </div>
                <div className="overview-item">
                  <div className="overview-label">Size</div>
                  <div className="overview-value">
                    {companyData.overview.companySize}
                  </div>
                </div>
                <div className="overview-item">
                  <div className="overview-label">Founded</div>
                  <div className="overview-value">
                    {companyData.overview.founded || "N/A"}
                  </div>
                </div>
              </div>

              {companyData.overview.description && (
                <div className="company-description">
                  <h4>📄 About the Company</h4>
                  <p>{companyData.overview.description}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Ratings Section */}
        {companyData.ratings && (
          <div className="section-card">
            <div
              className="section-header"
              onClick={() => toggleSection("ratings")}
            >
              <h3>⭐ Platform Ratings</h3>
              <span
                className={`expand-icon ${
                  expandedSections.has("ratings") ? "expanded" : ""
                }`}
              >
                ▼
              </span>
            </div>

            {expandedSections.has("ratings") && (
              <div className="section-content">
                <div className="ratings-grid">
                  {companyData.ratings.map((rating, index) => (
                    <div key={index} className="rating-card">
                      <div className="rating-header">
                        <span className="platform-name">{rating.platform}</span>
                        <span
                          className="rating-score"
                          style={{ color: getRatingColor(rating.rating) }}
                        >
                          {formatRating(rating.rating)}
                        </span>
                      </div>
                      <div className="rating-details">
                        <span>{rating.reviewCount} reviews</span>
                        {rating.recommendationRate && (
                          <>
                            <span>•</span>
                            <span>{rating.recommendationRate}% recommend</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Reviews Section */}
        {companyData.reviews && (
          <div className="section-card">
            <div
              className="section-header"
              onClick={() => toggleSection("reviews")}
            >
              <h3>💬 Employee Reviews</h3>
              <span
                className={`expand-icon ${
                  expandedSections.has("reviews") ? "expanded" : ""
                }`}
              >
                ▼
              </span>
            </div>

            {expandedSections.has("reviews") && (
              <div className="section-content">
                <div className="reviews-list">
                  {companyData.reviews.map((review, index) => (
                    <div key={index} className="review-item">
                      <div className="review-header">
                        <div className="review-meta">
                          <span className="review-title">{review.title}</span>
                          <span className="review-role">{review.role}</span>
                        </div>
                        <span
                          className="review-rating"
                          style={{ color: getRatingColor(review.rating) }}
                        >
                          {formatRating(review.rating)}
                        </span>
                      </div>
                      <div className="review-content">
                        <div className="review-section">
                          <h5>👍 Pros</h5>
                          <p>{review.pros}</p>
                        </div>
                        <div className="review-section">
                          <h5>👎 Cons</h5>
                          <p>{review.cons}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Culture & Benefits Section */}
        {companyData.culture && (
          <div className="section-card">
            <div
              className="section-header"
              onClick={() => toggleSection("culture")}
            >
              <h3>🎯 Culture & Benefits</h3>
              <span
                className={`expand-icon ${
                  expandedSections.has("culture") ? "expanded" : ""
                }`}
              >
                ▼
              </span>
            </div>

            {expandedSections.has("culture") && (
              <div className="section-content">
                {companyData.culture.values && (
                  <div className="culture-section">
                    <h4>💡 Company Values</h4>
                    <div className="values-list">
                      {companyData.culture.values.map((value, index) => (
                        <span key={index} className="value-tag">
                          {value}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {companyData.culture.benefits && (
                  <div className="culture-section">
                    <h4>🎁 Key Benefits</h4>
                    <ul className="benefits-list">
                      {companyData.culture.benefits.map((benefit, index) => (
                        <li key={index}>{benefit}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {companyData.culture.workEnvironment && (
                  <div className="culture-section">
                    <h4>🏢 Work Environment</h4>
                    <p>{companyData.culture.workEnvironment}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Key Insights Section */}
        {companyData.insights && (
          <div className="section-card">
            <div
              className="section-header"
              onClick={() => toggleSection("insights")}
            >
              <h3>🔍 Key Insights</h3>
              <span
                className={`expand-icon ${
                  expandedSections.has("insights") ? "expanded" : ""
                }`}
              >
                ▼
              </span>
            </div>

            {expandedSections.has("insights") && (
              <div className="section-content">
                <div className="insights-grid">
                  {companyData.insights.map((insight, index) => (
                    <div key={index} className="insight-item">
                      <div className="insight-icon">{insight.icon}</div>
                      <div className="insight-content">
                        <div className="insight-title">{insight.title}</div>
                        <div className="insight-description">
                          {insight.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="company-footer">
        <button className="regenerate-button" onClick={fetchCompanyData}>
          🔄 Refresh Data
        </button>
      </div>
    </div>
  );
};

export default CompanyInsights;
