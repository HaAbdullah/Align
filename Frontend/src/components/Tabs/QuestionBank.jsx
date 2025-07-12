import React, { useState, useEffect } from "react";
import { sendJobDescriptionForQuestions } from "../../utils/claudeAPI.js"; // Update with correct path
import "../../styles/QuestionBank.css";

const QuestionBank = ({ resume, jobDescription, analysisResults }) => {
  const [questions, setQuestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [expandedQuestions, setExpandedQuestions] = useState(new Set());

  useEffect(() => {
    if (jobDescription && jobDescription.trim()) {
      fetchQuestions();
    }
  }, [jobDescription]);

  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await sendJobDescriptionForQuestions(jobDescription);

      // Parse the Claude response to extract the JSON
      const content = response.content?.[0]?.text || "";
      const parsedQuestions = JSON.parse(content);
      setQuestions(parsedQuestions);

      // Expand all categories by default
      const allCategories = new Set(
        parsedQuestions.categories.map((_, index) => index)
      );
      setExpandedCategories(allCategories);
    } catch (err) {
      console.error("Error fetching questions:", err);
      setError("Failed to generate interview questions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (categoryIndex) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryIndex)) {
      newExpanded.delete(categoryIndex);
    } else {
      newExpanded.add(categoryIndex);
    }
    setExpandedCategories(newExpanded);
  };

  const toggleQuestion = (questionId) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(questionId)) {
      newExpanded.delete(questionId);
    } else {
      newExpanded.add(questionId);
    }
    setExpandedQuestions(newExpanded);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return "#42be94";
      case "medium":
        return "#f39c12";
      case "hard":
        return "#e74c3c";
      default:
        return "#95a5a6";
    }
  };

  if (!jobDescription || !jobDescription.trim()) {
    return (
      <div className="question-bank-container">
        <div className="question-bank-placeholder">
          <div className="placeholder-icon">❓</div>
          <h3>No Job Description Available</h3>
          <p>
            Please provide a job description to generate relevant interview
            questions.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="question-bank-container">
        <div className="question-bank-loading">
          <div className="loading-spinner"></div>
          <h3>Generating Interview Questions...</h3>
          <p>Analyzing the job requirements to create tailored questions.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="question-bank-container">
        <div className="question-bank-error">
          <div className="error-icon">⚠️</div>
          <h3>Error Generating Questions</h3>
          <p>{error}</p>
          <button className="retry-button" onClick={fetchQuestions}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!questions || !questions.categories) {
    return (
      <div className="question-bank-container">
        <div className="question-bank-placeholder">
          <div className="placeholder-icon">🤔</div>
          <h3>No Questions Generated</h3>
          <p>Unable to generate questions for this job description.</p>
          <button className="retry-button" onClick={fetchQuestions}>
            Retry Generation
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="question-bank-container">
      <div className="question-bank-header">
        <h2>Interview Question Bank</h2>
        <p>Tailored questions based on the job requirements</p>
        <div className="question-stats">
          <span className="stat">
            {questions.categories.reduce(
              (total, category) => total + category.questions.length,
              0
            )}{" "}
            Questions
          </span>
          <span className="stat">{questions.categories.length} Categories</span>
        </div>
      </div>

      <div className="categories-container">
        {questions.categories.map((category, categoryIndex) => (
          <div key={categoryIndex} className="category-card">
            <div
              className="category-header"
              onClick={() => toggleCategory(categoryIndex)}
            >
              <h3>{category.name}</h3>
              <div className="category-meta">
                <span className="question-count">
                  {category.questions.length} questions
                </span>
                <span
                  className={`expand-icon ${
                    expandedCategories.has(categoryIndex) ? "expanded" : ""
                  }`}
                >
                  ▼
                </span>
              </div>
            </div>

            {expandedCategories.has(categoryIndex) && (
              <div className="questions-list">
                {category.questions.map((questionItem, questionIndex) => {
                  const questionId = `${categoryIndex}-${questionIndex}`;
                  const isExpanded = expandedQuestions.has(questionId);

                  return (
                    <div key={questionIndex} className="question-item">
                      <div
                        className="question-header"
                        onClick={() => toggleQuestion(questionId)}
                      >
                        <span className="question-text">
                          {questionItem.question}
                        </span>
                        <div className="question-controls">
                          <span
                            className="difficulty-badge"
                            style={{
                              backgroundColor: getDifficultyColor(
                                questionItem.difficulty
                              ),
                            }}
                          >
                            {questionItem.difficulty || "Medium"}
                          </span>
                          <span
                            className={`question-expand-icon ${
                              isExpanded ? "expanded" : ""
                            }`}
                          >
                            ➤
                          </span>
                        </div>
                      </div>

                      {isExpanded && questionItem.hint && (
                        <div className="question-hint">
                          <div className="hint-label">
                            💡 What they're looking for:
                          </div>
                          <p>{questionItem.hint}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="question-bank-footer">
        <button className="regenerate-button" onClick={fetchQuestions}>
          🔄 Regenerate Questions
        </button>
      </div>
    </div>
  );
};

export default QuestionBank;
