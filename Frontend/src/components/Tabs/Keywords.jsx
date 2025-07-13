import React, { useState, useEffect } from "react";
import { sendJobDescriptionForKeywords } from "../../utils/claudeAPI";

const Keywords = ({ resume, jobDescription, analysisResults }) => {
  const [keywordsData, setKeywordsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateKeywordsAnalysis = async () => {
    if (!jobDescription || !analysisResults) {
      setError("Job description and analysis results are required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await sendJobDescriptionForKeywords(
        jobDescription,
        analysisResults
      );
      setKeywordsData(response.content[0].text);
    } catch (err) {
      console.error("Error generating keywords analysis:", err);
      setError("Failed to generate keywords analysis. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (jobDescription && analysisResults) {
      generateKeywordsAnalysis();
    }
  }, [jobDescription, analysisResults]);

  const parseKeywordsData = (text) => {
    if (!text) return [];

    const keywords = [];

    // Split by lines and process each line
    const lines = text.split("\n").filter((line) => line.trim());

    for (let line of lines) {
      // Look for patterns like "**Keyword**: explanation" or "- Keyword: explanation"
      const keywordMatch = line.match(
        /^[\*\-\•\s]*\*?\*?([^:*]+?)[\*]*\s*:\s*(.+)/
      );

      if (keywordMatch) {
        const keyword = keywordMatch[1].trim().replace(/[\*\-\•]/g, "");
        const analysis = keywordMatch[2].trim().replace(/[\*]/g, "");

        if (keyword && analysis && keyword.length > 1) {
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
        <h2 className="text-2xl font-bold text-gray-100 mb-2">
          Keywords Analysis
        </h2>
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
            Analyzing Keywords
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
