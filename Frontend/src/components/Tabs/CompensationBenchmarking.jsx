import React, { useState, useEffect } from "react";
import { sendJobDescriptionForCompensation } from "../../utils/claudeAPI.js";

const CompensationBenchmarking = ({
  resume,
  jobDescription,
  analysisResults,
  cachedData,
  loading: parentLoading,
  error: parentError,
  isDataFresh,
  updateCache,
  forceRefresh,
}) => {
  // Use cached data if available, otherwise use local state
  const [compensationData, setCompensationData] = useState(cachedData || null);
  const [loading, setLoading] = useState(parentLoading || false);
  const [error, setError] = useState(parentError || null);
  const [expandedSections, setExpandedSections] = useState(
    new Set(["overview"])
  );

  // Sync with cached data when it changes
  useEffect(() => {
    if (cachedData) {
      setCompensationData(cachedData);
      setLoading(false);
      setError(null);
    }
  }, [cachedData]);

  // Sync loading and error states with parent
  useEffect(() => {
    setLoading(parentLoading || false);
    setError(parentError || null);
  }, [parentLoading, parentError]);

  // Fetch data when component mounts if no cache exists
  useEffect(() => {
    if (jobDescription && jobDescription.trim() && !cachedData && !loading) {
      fetchCompensationData();
    }
  }, [jobDescription, cachedData, loading]);

  const fetchCompensationData = async () => {
    // Update parent cache state
    updateCache({ loading: true, error: null });
    setLoading(true);
    setError(null);

    try {
      const response = await sendJobDescriptionForCompensation(jobDescription);
      let content = response.content?.[0]?.text || "";

      // Strip markdown code block formatting if present
      content = content.replace(/```json\s*([\s\S]*?)\s*```/, "$1").trim();

      const parsedData = JSON.parse(content);
      setCompensationData(parsedData);

      // Update parent cache with successful data
      updateCache({
        data: parsedData,
        loading: false,
        error: null,
      });

      setExpandedSections(new Set(["overview"]));
    } catch (err) {
      console.error("Error fetching compensation data:", err);
      const errorMessage =
        "Failed to generate compensation benchmarking data. Please try again.";

      setError(errorMessage);

      // Update parent cache with error
      updateCache({
        loading: false,
        error: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    // Force refresh by clearing cache and fetching new data
    forceRefresh();
    setCompensationData(null);
    fetchCompensationData();
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

  const getSalaryLevelColor = (level) => {
    switch (level?.toLowerCase()) {
      case "entry":
        return "bg-emerald-500";
      case "mid":
        return "bg-yellow-500";
      case "senior":
        return "bg-orange-500";
      case "executive":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  if (!jobDescription || !jobDescription.trim()) {
    return (
      <div className="font-inter">
        <div className="text-center py-16">
          <div className="text-6xl mb-6">💰</div>
          <h3 className="text-xl font-semibold text-gray-200 mb-2">
            No Job Description Available
          </h3>
          <p className="text-gray-400">
            Please provide a job description to generate compensation
            benchmarking data.
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
            {cachedData
              ? "Refreshing Compensation Data..."
              : "Analyzing Compensation Data..."}
          </h3>
          <p className="text-gray-400">
            Gathering salary ranges and market insights for this role.
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
            Error Loading Compensation Data
          </h3>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={fetchCompensationData}
            className="bg-red-600 hover:bg-red-700 text-white font-medium px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!compensationData) {
    return (
      <div className="font-inter">
        <div className="text-center py-16">
          <div className="text-6xl mb-6">📊</div>
          <h3 className="text-xl font-semibold text-gray-200 mb-2">
            No Compensation Data Available
          </h3>
          <p className="text-gray-400 mb-6">
            Unable to generate compensation benchmarking for this position.
          </p>
          <button
            onClick={fetchCompensationData}
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
        <div className="flex items-center justify-center gap-3 mb-2">
          <h2 className="text-2xl font-bold text-gray-100">
            Compensation Benchmarking
          </h2>
        </div>
        <p className="text-gray-400 mb-4">
          Market salary data and insights for this position
        </p>
        <div className="flex justify-center gap-6 flex-wrap">
          <span className="bg-emerald-500/20 text-emerald-300 px-4 py-2 rounded-full text-sm font-medium">
            {formatSalary(compensationData.overview?.averageSalary)} Average
          </span>
          <span className="bg-blue-500/20 text-blue-300 px-4 py-2 rounded-full text-sm font-medium">
            {compensationData.locations?.length || 0} Locations
          </span>
          <span className="bg-purple-500/20 text-purple-300 px-4 py-2 rounded-full text-sm font-medium">
            {compensationData.levels?.length || 0} Experience Levels
          </span>
        </div>
      </div>

      {/* Sections Container */}
      <div className="space-y-4">
        {/* Market Overview Section */}
        <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/30 rounded-xl overflow-hidden hover:border-slate-600/50 transition-all duration-300">
          <div
            className="flex items-center justify-between p-5 cursor-pointer bg-slate-800/20 hover:bg-slate-700/30 transition-all duration-300"
            onClick={() => toggleSection("overview")}
          >
            <h3 className="text-lg font-semibold text-gray-200 flex items-center gap-3">
              💼 Market Overview
            </h3>
            <span
              className={`text-blue-400 transition-transform duration-300 ${
                expandedSections.has("overview") ? "rotate-0" : "-rotate-90"
              }`}
            >
              ▼
            </span>
          </div>

          {expandedSections.has("overview") && compensationData.overview && (
            <div className="p-6 space-y-6 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-700/30 rounded-lg p-4 text-center border border-slate-600/30">
                  <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                    Position
                  </div>
                  <div className="text-white font-semibold">
                    {compensationData.overview.position}
                  </div>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-4 text-center border border-slate-600/30">
                  <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                    Industry
                  </div>
                  <div className="text-white font-semibold">
                    {compensationData.overview.industry}
                  </div>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-4 text-center border border-slate-600/30">
                  <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                    Salary Range
                  </div>
                  <div className="text-white font-semibold">
                    {formatSalary(compensationData.overview.minSalary)} -{" "}
                    {formatSalary(compensationData.overview.maxSalary)}
                  </div>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-4 text-center border border-slate-600/30">
                  <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                    Market Trend
                  </div>
                  <div className="text-emerald-400 font-semibold">
                    {compensationData.overview.trend || "Stable"}
                  </div>
                </div>
              </div>

              {compensationData.overview.insights && (
                <div className="bg-slate-700/30 rounded-xl p-6 border border-slate-600/30">
                  <h4 className="text-base font-semibold text-gray-200 mb-4 pb-2 border-b border-slate-600/30 flex items-center gap-2">
                    📈 Market Insights
                  </h4>
                  <div className="space-y-3">
                    {compensationData.overview.insights.map(
                      (insight, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 text-gray-300"
                        >
                          <span className="text-blue-400 font-bold mt-1">
                            •
                          </span>
                          <span className="leading-relaxed">{insight}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Experience Levels Section */}
        {compensationData.levels && (
          <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/30 rounded-xl overflow-hidden hover:border-slate-600/50 transition-all duration-300">
            <div
              className="flex items-center justify-between p-5 cursor-pointer bg-slate-800/20 hover:bg-slate-700/30 transition-all duration-300"
              onClick={() => toggleSection("levels")}
            >
              <h3 className="text-lg font-semibold text-gray-200 flex items-center gap-3">
                📊 By Experience Level
              </h3>
              <span
                className={`text-blue-400 transition-transform duration-300 ${
                  expandedSections.has("levels") ? "rotate-0" : "-rotate-90"
                }`}
              >
                ▼
              </span>
            </div>

            {expandedSections.has("levels") && (
              <div className="p-6 animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {compensationData.levels.map((level, index) => (
                    <div
                      key={index}
                      className="bg-slate-700/30 rounded-xl p-5 border border-slate-600/30 hover:border-slate-500/50 transition-all duration-300 transform hover:-translate-y-1"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide text-white ${getSalaryLevelColor(
                            level.level
                          )}`}
                        >
                          {level.level}
                        </span>
                        <span className="text-xs text-gray-400 font-medium">
                          {level.experience}
                        </span>
                      </div>
                      <div className="text-lg font-bold text-gray-200 mb-1">
                        {formatSalary(level.minSalary)} -{" "}
                        {formatSalary(level.maxSalary)}
                      </div>
                      <div className="text-sm text-blue-400 font-medium">
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
          <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/30 rounded-xl overflow-hidden hover:border-slate-600/50 transition-all duration-300">
            <div
              className="flex items-center justify-between p-5 cursor-pointer bg-slate-800/20 hover:bg-slate-700/30 transition-all duration-300"
              onClick={() => toggleSection("locations")}
            >
              <h3 className="text-lg font-semibold text-gray-200 flex items-center gap-3">
                🌍 By Geographic Location
              </h3>
              <span
                className={`text-blue-400 transition-transform duration-300 ${
                  expandedSections.has("locations") ? "rotate-0" : "-rotate-90"
                }`}
              >
                ▼
              </span>
            </div>

            {expandedSections.has("locations") && (
              <div className="p-6 space-y-4 animate-fadeIn">
                {compensationData.locations.map((location, index) => (
                  <div
                    key={index}
                    className="bg-slate-700/30 rounded-xl p-5 border border-slate-600/30 hover:border-slate-500/50 transition-all duration-300"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-gray-200">
                        {location.city}, {location.state}
                      </span>
                      <span className="bg-slate-600/50 text-gray-300 px-3 py-1 rounded-full text-xs font-medium">
                        COL: {location.costOfLiving}%
                      </span>
                    </div>
                    <div className="text-base font-bold text-gray-200 mb-1">
                      {formatSalary(location.minSalary)} -{" "}
                      {formatSalary(location.maxSalary)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <span>Avg: {formatSalary(location.averageSalary)}</span>
                      <span>•</span>
                      <span>{location.jobCount} positions</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Benefits & Perks Section */}
        {compensationData.benefits && (
          <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/30 rounded-xl overflow-hidden hover:border-slate-600/50 transition-all duration-300">
            <div
              className="flex items-center justify-between p-5 cursor-pointer bg-slate-800/20 hover:bg-slate-700/30 transition-all duration-300"
              onClick={() => toggleSection("benefits")}
            >
              <h3 className="text-lg font-semibold text-gray-200 flex items-center gap-3">
                🎁 Benefits & Perks
              </h3>
              <span
                className={`text-blue-400 transition-transform duration-300 ${
                  expandedSections.has("benefits") ? "rotate-0" : "-rotate-90"
                }`}
              >
                ▼
              </span>
            </div>

            {expandedSections.has("benefits") && (
              <div className="p-6 animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {compensationData.benefits.map((benefit, index) => (
                    <div
                      key={index}
                      className="bg-slate-700/30 rounded-xl p-5 border border-slate-600/30 hover:border-slate-500/50 transition-all duration-300 transform hover:-translate-y-1 flex items-center gap-4"
                    >
                      <div className="text-2xl flex-shrink-0">
                        {benefit.icon}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-200 mb-1">
                          {benefit.name}
                        </div>
                        <div className="text-sm text-gray-400">
                          {benefit.value}
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
          onClick={handleRefresh}
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

export default CompensationBenchmarking;
