import { apiFetch } from "./api";

export const sendJobDescriptionToClaude = async (prompt) => {
  const response = await apiFetch("/create-resume", {
    method: "POST",
    body: JSON.stringify({ jobDescription: prompt }),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API request failed (${response.status}): ${errorText}`);
  }
  return response.json();
};

export const sendCoverLetterToClaude = async (prompt) => {
  const response = await apiFetch("/create-cover-letter", {
    method: "POST",
    body: JSON.stringify({ jobDescription: prompt }),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API request failed (${response.status}): ${errorText}`);
  }
  return response.json();
};

export const sendChatFeedbackToClaude = async (
  documentType,
  originalPrompt,
  currentDocument,
  userFeedback
) => {
  const feedbackPrompt =
    originalPrompt +
    `\n\nCURRENT ${documentType.toUpperCase()}\n` +
    currentDocument +
    `\n\nUSER FEEDBACK\n${userFeedback}\n\nPlease regenerate the ${documentType} based on this feedback.`;

  const endpoint = documentType === "resume" ? "create-resume" : "create-cover-letter";
  const response = await apiFetch(`/${endpoint}`, {
    method: "POST",
    body: JSON.stringify({ jobDescription: feedbackPrompt }),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API request failed (${response.status}): ${errorText}`);
  }
  return response.json();
};

export const sendJobDescriptionForQuestions = async (jobDescription) => {
  const response = await apiFetch("/generate-questions", {
    method: "POST",
    body: JSON.stringify({ jobDescription }),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API request failed (${response.status}): ${errorText}`);
  }
  return response.json();
};

export const saveDocument = async (
  firebaseUid,
  documentType,
  htmlContent,
  pdfContent = null,
  contentFormat = "html"
) => {
  const response = await apiFetch("/documents/save", {
    method: "POST",
    body: JSON.stringify({ firebaseUid, documentType, htmlContent, pdfContent, contentFormat }),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Save request failed (${response.status}): ${errorText}`);
  }
  return response.json();
};

export const sendJobDescriptionForCompensation = async (jobDescription) => {
  const response = await apiFetch("/generate-compensation", {
    method: "POST",
    body: JSON.stringify({ jobDescription }),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API request failed (${response.status}): ${errorText}`);
  }
  return response.json();
};

export const sendJobDescriptionForCompanyInsights = async (jobDescription) => {
  const response = await apiFetch("/generate-company-insights", {
    method: "POST",
    body: JSON.stringify({ jobDescription }),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API request failed (${response.status}): ${errorText}`);
  }
  return response.json();
};

export const sendJobDescriptionForKeywords = async (jobDescription, analysisResults) => {
  const response = await apiFetch("/generate-keywords", {
    method: "POST",
    body: JSON.stringify({ jobDescription, analysisResults }),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API request failed (${response.status}): ${errorText}`);
  }
  return response.json();
};
