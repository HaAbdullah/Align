/**
 * Sends a job description to Claude API and gets a resume
 * @param {string} prompt - The combined resume and job description to process
 * @returns {Promise} - Response from Claude API
 */
export const sendJobDescriptionToClaude = async (prompt) => {
  try {
    console.log("Sending prompt to Claude API, length:", prompt.length);
    const isLocalhost =
      typeof window !== "undefined" && window.location.hostname === "localhost";

    const API_BASE_URL = isLocalhost
      ? "http://localhost:3000/api"
      : "https://jobfit-backend-29ai.onrender.com/api";

    const response = await fetch(`${API_BASE_URL}/create-resume`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ jobDescription: prompt }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed (${response.status}): ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error calling Claude API:", error);
    throw error;
  }
};

/**
 * Sends a job description and resume to Claude API to generate a cover letter
 * @param {string} prompt - The combined resume and job description with instructions for cover letter
 * @returns {Promise} - Response from Claude API
 */
export const sendCoverLetterToClaude = async (prompt) => {
  try {
    console.log(
      "Sending cover letter prompt to Claude API, length:",
      prompt.length
    );
    const isLocalhost =
      typeof window !== "undefined" && window.location.hostname === "localhost";

    const API_BASE_URL = isLocalhost
      ? "http://localhost:3000/api"
      : "https://jobfit-backend-29ai.onrender.com/api";

    const response = await fetch(`${API_BASE_URL}/create-cover-letter`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ jobDescription: prompt }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed (${response.status}): ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error calling Claude API for cover letter:", error);
    throw error;
  }
};

/**
 * Sends user feedback to Claude API for regenerating a document
 * @param {string} documentType - Either "resume" or "cover letter"
 * @param {string} originalPrompt - The original resume and job description
 * @param {string} currentDocument - The current document content
 * @param {string} userFeedback - The user's feedback/instructions
 * @returns {Promise} - Response from Claude API with updated document
 */
export const sendChatFeedbackToClaude = async (
  documentType,
  originalPrompt,
  currentDocument,
  userFeedback
) => {
  try {
    const feedbackPrompt =
      originalPrompt +
      `\n\nCURRENT ${documentType.toUpperCase()}\n` +
      currentDocument +
      `\n\nUSER FEEDBACK\n${userFeedback}\n\nPlease regenerate the ${documentType} based on this feedback.`;

    console.log(
      `Sending ${documentType} feedback to Claude API, length:`,
      feedbackPrompt.length
    );

    const isLocalhost =
      typeof window !== "undefined" && window.location.hostname === "localhost";
    const API_BASE_URL = isLocalhost
      ? "http://localhost:3000/api"
      : "https://jobfit-backend-29ai.onrender.com/api";

    const endpoint =
      documentType === "resume" ? "create-resume" : "create-cover-letter";

    const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ jobDescription: feedbackPrompt }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed (${response.status}): ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(
      `Error calling Claude API for ${documentType} feedback:`,
      error
    );
    throw error;
  }
};

/**
 * Sends a job description to Claude API and gets interview questions
 * @param {string} jobDescription - The job description to process
 * @returns {Promise} - Response from Claude API with interview questions
 */
export const sendJobDescriptionForQuestions = async (jobDescription) => {
  try {
    console.log(
      "Sending job description for questions, length:",
      jobDescription.length
    );
    const isLocalhost =
      typeof window !== "undefined" && window.location.hostname === "localhost";

    const API_BASE_URL = isLocalhost
      ? "http://localhost:3000/api"
      : "https://jobfit-backend-29ai.onrender.com/api";

    const response = await fetch(`${API_BASE_URL}/generate-questions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ jobDescription }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed (${response.status}): ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error calling Claude API for questions:", error);
    throw error;
  }
};

/**
 * Sends a job description to get compensation benchmarking data
 * @param {string} jobDescription - The job description to process
 * @returns {Promise} - Response with compensation data
 */
export const sendJobDescriptionForCompensation = async (jobDescription) => {
  try {
    console.log(
      "Sending job description for compensation analysis, length:",
      jobDescription.length
    );
    const isLocalhost =
      typeof window !== "undefined" && window.location.hostname === "localhost";

    const API_BASE_URL = isLocalhost
      ? "http://localhost:3000/api"
      : "https://jobfit-backend-29ai.onrender.com/api";

    const response = await fetch(`${API_BASE_URL}/generate-compensation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ jobDescription }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed (${response.status}): ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error calling API for compensation data:", error);
    throw error;
  }
};
/**
 * Sends a job description to get company insights data
 * @param {string} jobDescription - The job description to process
 * @returns {Promise} - Response with company insights data
 */
export const sendJobDescriptionForCompanyInsights = async (jobDescription) => {
  try {
    console.log(
      "Sending job description for company insights analysis, length:",
      jobDescription.length
    );
    const isLocalhost =
      typeof window !== "undefined" && window.location.hostname === "localhost";

    const API_BASE_URL = isLocalhost
      ? "http://localhost:3000/api"
      : "https://jobfit-backend-29ai.onrender.com/api";

    const response = await fetch(`${API_BASE_URL}/generate-company-insights`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ jobDescription }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed (${response.status}): ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error calling API for company insights data:", error);
    throw error;
  }
};

/**
 * Sends a job description and analysis results to get keywords analysis
 * @param {string} jobDescription - The job description to process
 * @param {object} analysisResults - The existing analysis results
 * @returns {Promise} - Response with keywords analysis data
 */
export const sendJobDescriptionForKeywords = async (
  jobDescription,
  analysisResults
) => {
  try {
    console.log(
      "Sending job description for keywords analysis, JD length:",
      jobDescription.length,
      "Analysis results available:",
      !!analysisResults
    );

    const isLocalhost =
      typeof window !== "undefined" && window.location.hostname === "localhost";

    const API_BASE_URL = isLocalhost
      ? "http://localhost:3000/api"
      : "https://jobfit-backend-29ai.onrender.com/api";

    const response = await fetch(`${API_BASE_URL}/generate-keywords`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jobDescription,
        analysisResults,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed (${response.status}): ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error calling API for keywords analysis:", error);
    throw error;
  }
};
