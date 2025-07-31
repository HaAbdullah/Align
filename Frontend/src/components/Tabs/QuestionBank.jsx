import React, { useState, useEffect } from "react";
import { sendJobDescriptionForQuestions } from "../../utils/claudeAPI.js";

const QuestionBank = ({
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
  const [questions, setQuestions] = useState(cachedData || null);
  const [loading, setLoading] = useState(parentLoading || false);
  const [error, setError] = useState(parentError || null);
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [expandedQuestions, setExpandedQuestions] = useState(new Set());

  // Sync with cached data when it changes
  useEffect(() => {
    if (cachedData) {
      setQuestions(cachedData);
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
      fetchQuestions();
    }
  }, [jobDescription, cachedData, loading]);

  const fetchQuestions = async () => {
    // Update parent cache state
    updateCache({ loading: true, error: null });
    setLoading(true);
    setError(null);

    try {
      const response = await sendJobDescriptionForQuestions(jobDescription);

      // Parse the Claude response to extract the JSON
      const content = response.content?.[0]?.text || "";
      const parsedQuestions = JSON.parse(content);

      setQuestions(parsedQuestions);

      // Update parent cache with successful data
      updateCache({
        data: parsedQuestions,
        loading: false,
        error: null,
      });

      // Keep all categories collapsed by default
      setExpandedCategories(new Set());
      setExpandedQuestions(new Set());
    } catch (err) {
      console.error("Error fetching questions:", err);
      const errorMessage =
        "Failed to generate interview questions. Please try again.";

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
    setQuestions(null);
    fetchQuestions();
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
        return "bg-emerald-500";
      case "medium":
        return "bg-yellow-500";
      case "hard":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  if (!jobDescription || !jobDescription.trim()) {
    return (
      <div className="font-inter">
        <div className="text-center py-16">
          <div className="text-6xl mb-6">❓</div>
          <h3 className="text-xl font-semibold text-gray-200 mb-2">
            No Job Description Available
          </h3>
          <p className="text-gray-400">
            Please provide a job description to generate relevant interview
            questions.
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
              ? "Refreshing Questions..."
              : "Generating Interview Questions..."}
          </h3>
          <p className="text-gray-400">
            Analyzing the job requirements to create tailored questions.
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
            Error Generating Questions
          </h3>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={fetchQuestions}
            className="bg-red-600 hover:bg-red-700 text-white font-medium px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!questions || !questions.categories) {
    return (
      <div className="font-inter">
        <div className="text-center py-16">
          <div className="text-6xl mb-6">🤔</div>
          <h3 className="text-xl font-semibold text-gray-200 mb-2">
            No Questions Generated
          </h3>
          <p className="text-gray-400 mb-6">
            Unable to generate questions for this job description.
          </p>
          <button
            onClick={fetchQuestions}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            Retry Generation
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
            Interview Question Bank
          </h2>
        </div>
        <p className="text-gray-400 mb-4">
          Tailored questions based on the job requirements
        </p>
        <div className="flex justify-center gap-6 flex-wrap">
          <span className="bg-blue-500/20 text-blue-300 px-4 py-2 rounded-full text-sm font-medium">
            {questions.categories.reduce(
              (total, category) => total + category.questions.length,
              0
            )}{" "}
            Questions
          </span>
          <span className="bg-purple-500/20 text-purple-300 px-4 py-2 rounded-full text-sm font-medium">
            {questions.categories.length} Categories
          </span>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-4">
        {questions.categories.map((category, categoryIndex) => (
          <div
            key={categoryIndex}
            className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/30 rounded-xl overflow-hidden hover:border-slate-600/50 transition-all duration-300"
          >
            {/* Category Header */}
            <div
              className="flex items-center justify-between p-5 cursor-pointer bg-slate-800/20 hover:bg-slate-700/30 transition-all duration-300"
              onClick={() => toggleCategory(categoryIndex)}
            >
              <h3 className="text-lg font-semibold text-gray-200">
                {category.name}
              </h3>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-400 font-medium">
                  {category.questions.length} questions
                </span>
                <span
                  className={`text-blue-400 transition-transform duration-300 ${
                    expandedCategories.has(categoryIndex)
                      ? "rotate-0"
                      : "-rotate-90"
                  }`}
                >
                  ▼
                </span>
              </div>
            </div>

            {/* Questions List */}
            {expandedCategories.has(categoryIndex) && (
              <div className="animate-fadeIn">
                {category.questions.map((questionItem, questionIndex) => {
                  const questionId = `${categoryIndex}-${questionIndex}`;
                  const isExpanded = expandedQuestions.has(questionId);

                  return (
                    <div
                      key={questionIndex}
                      className="border-t border-slate-700/30 hover:bg-slate-700/20 transition-all duration-200"
                    >
                      {/* Question Header */}
                      <div
                        className="flex items-center justify-between p-5 cursor-pointer group"
                        onClick={() => toggleQuestion(questionId)}
                      >
                        <span className="text-gray-300 font-medium leading-relaxed flex-1 mr-4 group-hover:text-gray-200 transition-colors">
                          {questionItem.question}
                        </span>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getDifficultyColor(
                              questionItem.difficulty
                            )} text-white`}
                          >
                            {questionItem.difficulty || "Medium"}
                          </span>
                          <span
                            className={`text-gray-400 transition-all duration-300 ${
                              isExpanded
                                ? "rotate-90 text-blue-400"
                                : "rotate-0"
                            }`}
                          >
                            ➤
                          </span>
                        </div>
                      </div>

                      {/* Question Hint */}
                      {isExpanded && questionItem.hint && (
                        <div className="px-5 pb-5 animate-fadeIn">
                          <div className="bg-slate-700/40 rounded-lg p-4 border border-slate-600/30">
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-lg">💡</span>
                              <span className="text-sm font-semibold text-blue-400">
                                What they're looking for:
                              </span>
                            </div>
                            <p className="text-gray-300 leading-relaxed italic text-sm">
                              {questionItem.hint}
                            </p>
                          </div>
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

      {/* Footer */}
      <div className="text-center pt-6 border-t border-slate-700/50">
        <button
          onClick={handleRefresh}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2 mx-auto"
        >
          🔄 Regenerate Questions
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

export default QuestionBank;
