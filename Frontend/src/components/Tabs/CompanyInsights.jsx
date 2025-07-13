import React, { useState, useEffect } from "react";
import { sendJobDescriptionForCompanyInsights } from "../../utils/claudeAPI.js";

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
    if (rating >= 4.0) return "#10b981";
    if (rating >= 3.5) return "#f59e0b";
    if (rating >= 3.0) return "#f97316";
    return "#ef4444";
  };

  const formatRating = (rating) => {
    return rating ? `${rating}/5.0` : "N/A";
  };

  if (!jobDescription || !jobDescription.trim()) {
    return (
      <div className="font-inter">
        <div className="text-center py-16">
          <div className="text-6xl mb-6">🏢</div>
          <h3 className="text-xl font-semibold text-gray-200 mb-2">
            No Job Description Available
          </h3>
          <p className="text-gray-400">
            Please provide a job description to generate company insights.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="font-inter">
        <div className="text-center py-16">
          <div
            className="w-16 h-16 mx-auto mb-6 rounded-full animate-spin"
            style={{
              border: "4px solid rgba(255, 255, 255, 0.1)",
              borderLeftColor: "transparent",
              borderImage:
                "linear-gradient(90deg, #4a6bff, #8a64ff, #e85f88) 1",
            }}
          ></div>
          <h3 className="text-xl font-semibold text-gray-200 mb-2">
            Analyzing Company Information...
          </h3>
          <p className="text-gray-400">
            Gathering insights about this company from multiple sources.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="font-inter">
        <div className="text-center py-16">
          <div className="text-6xl mb-6">⚠️</div>
          <h3 className="text-xl font-semibold text-red-400 mb-2">
            Error Loading Company Data
          </h3>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={fetchCompanyData}
            className="bg-red-600 hover:bg-red-700 text-white font-medium px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!companyData) {
    return (
      <div className="font-inter">
        <div className="text-center py-16">
          <div className="text-6xl mb-6">📊</div>
          <h3 className="text-xl font-semibold text-gray-200 mb-2">
            No Company Data Available
          </h3>
          <p className="text-gray-400 mb-6">
            Unable to generate company insights for this position.
          </p>
          <button
            onClick={fetchCompanyData}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            Retry Analysis
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="font-inter space-y-6">
      {/* Header */}
      <div className="text-center pb-6 border-b border-slate-700/50">
        <h2 className="text-2xl font-bold text-gray-100 mb-2">
          Company Insights
        </h2>
        <p className="text-gray-400 mb-4">
          Comprehensive overview and employee feedback
        </p>
        <div className="flex justify-center gap-6 flex-wrap">
          <span className="bg-blue-500/20 text-blue-300 px-4 py-2 rounded-full text-sm font-medium">
            {formatRating(companyData.overview?.overallRating)} Overall Rating
          </span>
          <span className="bg-purple-500/20 text-purple-300 px-4 py-2 rounded-full text-sm font-medium">
            {companyData.ratings?.length || 0} Platforms
          </span>
          <span className="bg-emerald-500/20 text-emerald-300 px-4 py-2 rounded-full text-sm font-medium">
            {companyData.reviews?.length || 0} Reviews
          </span>
        </div>
      </div>

      {/* Sections Container */}
      <div className="space-y-4">
        {/* Overview Section */}
        <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/30 rounded-xl overflow-hidden hover:border-slate-600/50 transition-all duration-300">
          <div
            className="flex items-center justify-between p-5 cursor-pointer bg-slate-800/20 hover:bg-slate-700/30 transition-all duration-300"
            onClick={() => toggleSection("overview")}
          >
            <h3 className="text-lg font-semibold text-gray-200 flex items-center gap-3">
              🏢 Company Overview
            </h3>
            <span
              className={`text-blue-400 transition-transform duration-300 ${
                expandedSections.has("overview") ? "rotate-0" : "-rotate-90"
              }`}
            >
              ▼
            </span>
          </div>

          {expandedSections.has("overview") && companyData.overview && (
            <div className="p-6 space-y-6 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-700/30 rounded-lg p-4 text-center border border-slate-600/30">
                  <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                    Company
                  </div>
                  <div className="text-white font-semibold">
                    {companyData.overview.companyName}
                  </div>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-4 text-center border border-slate-600/30">
                  <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                    Industry
                  </div>
                  <div className="text-white font-semibold">
                    {companyData.overview.industry}
                  </div>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-4 text-center border border-slate-600/30">
                  <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                    Size
                  </div>
                  <div className="text-white font-semibold">
                    {companyData.overview.companySize}
                  </div>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-4 text-center border border-slate-600/30">
                  <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                    Founded
                  </div>
                  <div className="text-white font-semibold">
                    {companyData.overview.founded || "N/A"}
                  </div>
                </div>
              </div>

              {companyData.overview.description && (
                <div className="bg-slate-700/30 rounded-xl p-6 border border-slate-600/30">
                  <h4 className="text-base font-semibold text-gray-200 mb-3 pb-2 border-b border-slate-600/30 flex items-center gap-2">
                    📄 About the Company
                  </h4>
                  <p className="text-gray-300 leading-relaxed">
                    {companyData.overview.description}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Ratings Section */}
        {companyData.ratings && (
          <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/30 rounded-xl overflow-hidden hover:border-slate-600/50 transition-all duration-300">
            <div
              className="flex items-center justify-between p-5 cursor-pointer bg-slate-800/20 hover:bg-slate-700/30 transition-all duration-300"
              onClick={() => toggleSection("ratings")}
            >
              <h3 className="text-lg font-semibold text-gray-200 flex items-center gap-3">
                ⭐ Platform Ratings
              </h3>
              <span
                className={`text-blue-400 transition-transform duration-300 ${
                  expandedSections.has("ratings") ? "rotate-0" : "-rotate-90"
                }`}
              >
                ▼
              </span>
            </div>

            {expandedSections.has("ratings") && (
              <div className="p-6 animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {companyData.ratings.map((rating, index) => (
                    <div
                      key={index}
                      className="bg-slate-700/30 rounded-xl p-5 border border-slate-600/30 hover:border-slate-500/50 transition-all duration-300"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-gray-200">
                          {rating.platform}
                        </span>
                        <span
                          className="text-lg font-bold"
                          style={{ color: getRatingColor(rating.rating) }}
                        >
                          {formatRating(rating.rating)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
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
          <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/30 rounded-xl overflow-hidden hover:border-slate-600/50 transition-all duration-300">
            <div
              className="flex items-center justify-between p-5 cursor-pointer bg-slate-800/20 hover:bg-slate-700/30 transition-all duration-300"
              onClick={() => toggleSection("reviews")}
            >
              <h3 className="text-lg font-semibold text-gray-200 flex items-center gap-3">
                💬 Employee Reviews
              </h3>
              <span
                className={`text-blue-400 transition-transform duration-300 ${
                  expandedSections.has("reviews") ? "rotate-0" : "-rotate-90"
                }`}
              >
                ▼
              </span>
            </div>

            {expandedSections.has("reviews") && (
              <div className="p-6 space-y-5 animate-fadeIn">
                {companyData.reviews.map((review, index) => (
                  <div
                    key={index}
                    className="bg-slate-700/30 rounded-xl p-5 border border-slate-600/30"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-200 mb-1">
                          {review.title}
                        </div>
                        <div className="text-sm text-gray-400 italic">
                          {review.role}
                        </div>
                      </div>
                      <span
                        className="text-base font-bold ml-4"
                        style={{ color: getRatingColor(review.rating) }}
                      >
                        {formatRating(review.rating)}
                      </span>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <h5 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                          👍 Pros
                        </h5>
                        <p className="text-gray-400 leading-relaxed">
                          {review.pros}
                        </p>
                      </div>
                      <div>
                        <h5 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                          👎 Cons
                        </h5>
                        <p className="text-gray-400 leading-relaxed">
                          {review.cons}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Culture & Benefits Section */}
        {companyData.culture && (
          <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/30 rounded-xl overflow-hidden hover:border-slate-600/50 transition-all duration-300">
            <div
              className="flex items-center justify-between p-5 cursor-pointer bg-slate-800/20 hover:bg-slate-700/30 transition-all duration-300"
              onClick={() => toggleSection("culture")}
            >
              <h3 className="text-lg font-semibold text-gray-200 flex items-center gap-3">
                🎯 Culture & Benefits
              </h3>
              <span
                className={`text-blue-400 transition-transform duration-300 ${
                  expandedSections.has("culture") ? "rotate-0" : "-rotate-90"
                }`}
              >
                ▼
              </span>
            </div>

            {expandedSections.has("culture") && (
              <div className="p-6 space-y-6 animate-fadeIn">
                {companyData.culture.values && (
                  <div>
                    <h4 className="text-base font-semibold text-gray-200 mb-3 pb-2 border-b border-slate-600/30 flex items-center gap-2">
                      💡 Company Values
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {companyData.culture.values.map((value, index) => (
                        <span
                          key={index}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium"
                        >
                          {value}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {companyData.culture.benefits && (
                  <div>
                    <h4 className="text-base font-semibold text-gray-200 mb-3 pb-2 border-b border-slate-600/30 flex items-center gap-2">
                      🎁 Key Benefits
                    </h4>
                    <div className="grid gap-2">
                      {companyData.culture.benefits.map((benefit, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 text-gray-300"
                        >
                          <span className="text-emerald-400 font-bold">✓</span>
                          <span>{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {companyData.culture.workEnvironment && (
                  <div>
                    <h4 className="text-base font-semibold text-gray-200 mb-3 pb-2 border-b border-slate-600/30 flex items-center gap-2">
                      🏢 Work Environment
                    </h4>
                    <p className="text-gray-300 leading-relaxed">
                      {companyData.culture.workEnvironment}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Key Insights Section */}
        {companyData.insights && (
          <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/30 rounded-xl overflow-hidden hover:border-slate-600/50 transition-all duration-300">
            <div
              className="flex items-center justify-between p-5 cursor-pointer bg-slate-800/20 hover:bg-slate-700/30 transition-all duration-300"
              onClick={() => toggleSection("insights")}
            >
              <h3 className="text-lg font-semibold text-gray-200 flex items-center gap-3">
                🔍 Key Insights
              </h3>
              <span
                className={`text-blue-400 transition-transform duration-300 ${
                  expandedSections.has("insights") ? "rotate-0" : "-rotate-90"
                }`}
              >
                ▼
              </span>
            </div>

            {expandedSections.has("insights") && (
              <div className="p-6 animate-fadeIn">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {companyData.insights.map((insight, index) => (
                    <div
                      key={index}
                      className="bg-slate-700/30 rounded-xl p-5 border border-slate-600/30 hover:border-slate-500/50 transition-all duration-300 flex items-start gap-4"
                    >
                      <div className="text-2xl flex-shrink-0 text-blue-400">
                        {insight.icon}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-200 mb-2">
                          {insight.title}
                        </div>
                        <div className="text-gray-400 text-sm leading-relaxed">
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

      {/* Footer */}
      <div className="text-center pt-6 border-t border-slate-700/50">
        <button
          onClick={fetchCompanyData}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2 mx-auto"
        >
          🔄 Refresh Data
        </button>
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

export default CompanyInsights;
