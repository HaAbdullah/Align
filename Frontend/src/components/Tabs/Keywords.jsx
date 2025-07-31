import React, { useState, useEffect } from "react";
import { sendJobDescriptionForKeywords } from "../../utils/claudeAPI";

const Keywords = ({
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
  const [keywordsData, setKeywordsData] = useState(cachedData || null);
  const [loading, setLoading] = useState(parentLoading || false);
  const [error, setError] = useState(parentError || null);

  // Sync with cached data when it changes
  useEffect(() => {
    if (cachedData) {
      setKeywordsData(cachedData);
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
    if (jobDescription && analysisResults && !cachedData && !loading) {
      generateKeywordsAnalysis();
    }
  }, [jobDescription, analysisResults, cachedData, loading]);

  const generateKeywordsAnalysis = async () => {
    if (!jobDescription || !analysisResults) {
      const errorMessage = "Job description and analysis results are required";
      setError(errorMessage);
      updateCache({ error: errorMessage });
      return;
    }

    // Update parent cache state
    updateCache({ loading: true, error: null });
    setLoading(true);
    setError(null);

    try {
      const response = await sendJobDescriptionForKeywords(
        jobDescription,
        analysisResults
      );

      // Handle the response more robustly
      let responseText = "";
      if (response.content && response.content[0] && response.content[0].text) {
        responseText = response.content[0].text;
      } else if (typeof response === "string") {
        responseText = response;
      } else {
        throw new Error("Invalid response format from API");
      }

      setKeywordsData(responseText);

      // Update parent cache with successful data
      updateCache({
        data: responseText,
        loading: false,
        error: null,
      });
    } catch (err) {
      console.error("Error generating keywords analysis:", err);
      const errorMessage =
        "Failed to generate keywords analysis. Please try again.";

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
    setKeywordsData(null);
    generateKeywordsAnalysis();
  };

  const parseKeywordsData = (text) => {
    if (!text) return [];

    const keywords = [];

    // Split by lines and process each line
    const lines = text.split("\n").filter((line) => line.trim());

    for (let line of lines) {
      // More flexible regex patterns to handle different formats from Perplexity
      const patterns = [
        // Pattern 1: **Keyword**: explanation or **Keyword:** explanation
        /^[\*\-\•\s]*\*?\*?([^:*]+?)[\*]*\s*:\s*(.+)/,
        // Pattern 2: - Keyword: explanation
        /^[\-\•]\s*([^:]+):\s*(.+)/,
        // Pattern 3: Keyword - explanation
        /^([^-]+)\s*-\s*(.+)/,
        // Pattern 4: Simple "word: explanation" format
        /^([A-Za-z\s]+):\s*(.+)/,
      ];

      let keywordMatch = null;

      for (const pattern of patterns) {
        keywordMatch = line.match(pattern);
        if (keywordMatch) break;
      }

      if (keywordMatch) {
        let keyword = keywordMatch[1].trim().replace(/[\*\-\•]/g, "");
        let analysis = keywordMatch[2].trim().replace(/[\*]/g, "");

        // Clean up the keyword - remove common prefixes
        keyword = keyword.replace(
          /^(Keyword|Skills?|Term|Tech|Technology):\s*/i,
          ""
        );

        if (keyword && analysis && keyword.length > 1 && analysis.length > 5) {
          keywords.push({ keyword, analysis });
        }
      }
    }
    return keywords;
  };

  const keywordsList = keywordsData ? parseKeywordsData(keywordsData) : [];

  return (
    <div className="font-inter">
      {/* Header */}
      <div className="text-center mb-8 pb-6 border-b border-slate-700/50">
        <div className="flex items-center justify-center gap-3 mb-2">
          <h2 className="text-2xl font-bold text-gray-100">
            Keywords Analysis
          </h2>
        </div>
        <p className="text-gray-400">
          Matched keywords between job description and your resume
        </p>
      </div>

      {/* Loading State */}
      {loading && (
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
            {cachedData ? "Refreshing Keywords..." : "Analyzing Keywords"}
          </h3>
          <p className="text-gray-400">
            Matching job description keywords with your resume...
          </p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-16">
          <div className="text-6xl mb-6">⚠️</div>
          <h3 className="text-xl font-semibold text-red-400 mb-2">Error</h3>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={generateKeywordsAnalysis}
            className="bg-red-600 hover:bg-red-700 text-white font-medium px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Keywords Chart */}
      {keywordsList.length > 0 && !loading && (
        <div className="space-y-6">
          <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/30 rounded-xl overflow-hidden">
            {/* Chart Header */}
            <div className="grid grid-cols-1 lg:grid-cols-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold">
              <div className="px-6 py-4 border-b lg:border-b-0 lg:border-r border-white/20">
                Keyword
              </div>
              <div className="px-6 py-4 lg:col-span-2">Analysis</div>
            </div>

            {/* Chart Rows */}
            {keywordsList.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-1 lg:grid-cols-3 border-b border-slate-700/30 last:border-b-0 hover:bg-slate-700/30 transition-all duration-200"
              >
                <div className="px-6 py-4 font-semibold text-blue-400 border-b lg:border-b-0 lg:border-r border-slate-700/30 flex items-center">
                  <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
                    {item.keyword}
                  </span>
                </div>
                <div className="px-6 py-4 text-gray-300 text-sm leading-relaxed lg:col-span-2 flex items-center">
                  {item.analysis}
                </div>
              </div>
            ))}
          </div>

          {/* Footer with Refresh Button */}
          <div className="text-center pt-6 border-t border-slate-700/50">
            <button
              onClick={handleRefresh}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2 mx-auto"
            >
              🔄 Refresh Analysis
            </button>
          </div>
        </div>
      )}

      {/* No Keywords Found State */}
      {keywordsData && keywordsList.length === 0 && !loading && !error && (
        <div className="text-center py-16">
          <div className="text-6xl mb-6">🔍</div>
          <h3 className="text-xl font-semibold text-gray-200 mb-2">
            No Keywords Parsed
          </h3>
          <p className="text-gray-400 mb-4">
            The analysis completed but no keywords could be extracted from the
            response format.
          </p>
          <button
            onClick={generateKeywordsAnalysis}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Placeholder State */}
      {!keywordsData && !loading && !error && (
        <div className="text-center py-16">
          <div className="text-6xl mb-6">🔍</div>
          <h3 className="text-xl font-semibold text-gray-200 mb-2">
            Keywords Analysis
          </h3>
          <p className="text-gray-400">
            Keywords analysis will appear here once generated.
          </p>
        </div>
      )}
    </div>
  );
};

export default Keywords;
