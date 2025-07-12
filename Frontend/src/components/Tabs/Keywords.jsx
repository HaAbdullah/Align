import React, { useState, useEffect } from "react";
import { sendJobDescriptionForKeywords } from "../../utils/claudeAPI";
import "../../styles/Keywords.css";

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
    <div className="keywords-container">
      <div className="keywords-header">
        <h2>Keywords Analysis</h2>
        <p>Matched keywords between job description and your resume</p>
      </div>

      {loading && (
        <div className="keywords-loading">
          <div className="loading-spinner"></div>
          <h3>Analyzing Keywords</h3>
          <p>Matching job description keywords with your resume...</p>
        </div>
      )}

      {error && (
        <div className="keywords-error">
          <div className="error-icon">⚠️</div>
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={generateKeywordsAnalysis} className="retry-button">
            Try Again
          </button>
        </div>
      )}

      {keywordsList.length > 0 && !loading && (
        <div className="keywords-chart">
          <div className="chart-header">
            <div className="header-keyword">Keyword</div>
            <div className="header-analysis">Analysis</div>
          </div>
          {keywordsList.map((item, index) => (
            <div key={index} className="chart-row">
              <div className="chart-keyword">{item.keyword}</div>
              <div className="chart-analysis">{item.analysis}</div>
            </div>
          ))}
        </div>
      )}

      {!keywordsData && !loading && !error && (
        <div className="keywords-placeholder">
          <div className="placeholder-icon">🔍</div>
          <h3>Keywords Analysis</h3>
          <p>Keywords analysis will appear here once generated.</p>
        </div>
      )}
    </div>
  );
};

export default Keywords;
