import React, { useState, useEffect } from "react";
import {
  sendJobDescriptionToClaude,
  sendChatFeedbackToClaude,
  saveDocument,
} from "../utils/claudeAPI";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import downloadIcon from "../assets/download.png";
import rotateIcon from "../assets/rotate.png";
import ChatInterface from "./ChatInterface";
import { useUsage } from "../context/UsageContext";
import UsageDisplay from "./UsageDisplay";
import UpgradeModal from "./UpgradeModal";

function JobAnalysis({
  resume,
  isResumeSubmitted,
  onStartNewApplication,
  jobDescription,
  setJobDescription,
  isJobDescriptionSubmitted,
  setIsJobDescriptionSubmitted,
  analysisResults,
  setAnalysisResults,
}) {
  const { currentUser } = useAuth();
  const isAuthenticated = !!currentUser;
  const { canGenerate, incrementUsage, setShowUpgradeModal } = useUsage();

  const [isLoading, setIsLoading] = useState(false);
  const [jobDescriptionInput, setJobDescriptionInput] = useState("");
  const [finalClaudePrompt, setFinalClaudePrompt] = useState("");
  const [error, setError] = useState("");
  const [summary, setSummary] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [generatingCoverLetter, setGeneratingCoverLetter] = useState(false);
  const [activeDocument, setActiveDocument] = useState(null);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [isTextareaFocused, setIsTextareaFocused] = useState(false);

  const [resumeHTML, setResumeHTML] = useState("");
  const [coverLetterHTML, setCoverLetterHTML] = useState("");
  const [savingDocument, setSavingDocument] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState("");

  const handleSaveDocument = async () => {
    if (!isAuthenticated) {
      setShowAuthPrompt(true);
      return;
    }

    if (!currentUser?.uid) {
      setError("User authentication required to save documents");
      return;
    }

    const documentType =
      activeDocument === "resume" ? "resume" : "cover_letter";
    const documentToSave =
      activeDocument === "resume" ? resumeHTML : coverLetterHTML;

    if (!documentToSave || documentToSave.trim() === "") {
      setError(
        `No ${
          documentType === "resume" ? "resume" : "cover letter"
        } to save. Please generate one first.`
      );
      return;
    }

    setSavingDocument(true);
    setSaveSuccess("");
    setError("");

    try {
      await saveDocument(currentUser.uid, documentType, documentToSave);

      setSaveSuccess(
        `${
          documentType === "resume" ? "Resume" : "Cover letter"
        } saved successfully!`
      );

      setTimeout(() => {
        setSaveSuccess("");
      }, 3000);
    } catch (error) {
      setError(`Failed to save ${documentType}: ${error.message}`);
    } finally {
      setSavingDocument(false);
    }
  };

  const handleSendMessage = async (feedbackPrompt) => {
    try {
      let response;

      if (activeDocument === "resume") {
        response = await sendResumeFeedbackToClaude(feedbackPrompt);
      } else if (activeDocument === "coverLetter") {
        response = await sendCoverLetterFeedbackToClaude(feedbackPrompt);
      } else {
        throw new Error("No active document selected");
      }

      if (
        !response.data ||
        !response.data.content ||
        !response.data.content[0]
      ) {
        throw new Error("Invalid response structure from API");
      }

      return response.data.content[0].text;
    } catch (error) {
      throw error;
    }
  };

  const sendResumeFeedbackToClaude = async (prompt) => {
    try {
      const isLocalhost = window.location.hostname === "localhost";

      const API_BASE_URL = isLocalhost
        ? "http://localhost:3000/api"
        : "https://align-vahq.onrender.com/api";

      const response = await fetch(`${API_BASE_URL}/create-resume`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobDescription: prompt,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Resume feedback API request failed (${response.status}): ${errorText}`
        );
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  };

  const sendCoverLetterFeedbackToClaude = async (prompt) => {
    try {
      const isLocalhost = window.location.hostname === "localhost";

      const API_BASE_URL = isLocalhost
        ? "http://localhost:3000/api"
        : "https://align-vahq.onrender.com/api";

      const response = await fetch(`${API_BASE_URL}/create-cover-letter`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobDescription: prompt,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Cover letter feedback API request failed (${response.status}): ${errorText}`
        );
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    if (!summary) return;

    const iframe = document.getElementById("summary-preview");
    if (!iframe) return;

    const doc = iframe.contentDocument || iframe.contentWindow.document;

    doc.open();

    const styledContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          background-color: white !important;
          color: black !important;
          font-family: Arial, sans-serif;
          line-height: 1.6;
          margin: 20px;
          padding: 0;
        }
        * {
          background-color: inherit !important;
          color: inherit !important;
        }
      </style>
    </head>
    <body>
      ${summary}
    </body>
    </html>
  `;

    doc.write(styledContent);
    doc.close();

    if (!activeDocument) {
      setActiveDocument("resume");
    }
  }, [summary, activeDocument]);

  useEffect(() => {
    if (!coverLetter) return;

    const iframe = document.getElementById("cover-letter-preview");
    if (!iframe) return;

    const doc = iframe.contentDocument || iframe.contentWindow.document;

    doc.open();

    const styledContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          background-color: white !important;
          color: black !important;
          font-family: Arial, sans-serif;
          line-height: 1.6;
          margin: 20px;
          padding: 0;
        }
        * {
          background-color: inherit !important;
          color: inherit !important;
        }
      </style>
    </head>
    <body>
      ${coverLetter}
    </body>
    </html>
  `;

    doc.write(styledContent);
    doc.close();

    setActiveDocument("coverLetter");
  }, [coverLetter]);
  const handleSendJobDescription = async () => {
    if (isAuthenticated && !canGenerate()) {
      setShowUpgradeModal(true);
      return;
    }

    if (!jobDescriptionInput.trim()) return;
    setIsLoading(true);
    setError("");
    setSummary("");
    setCoverLetter("");
    setResumeHTML("");
    setActiveDocument(null);

    let createdPrompt =
      "RESUME\n" + resume + "\nJOB DESCRIPTION\n" + jobDescriptionInput;
    setFinalClaudePrompt(createdPrompt);

    try {
      const response = await sendJobDescriptionToClaude(createdPrompt);

      if (
        !response.data ||
        !response.data.content ||
        !response.data.content[0]
      ) {
        throw new Error("Invalid response structure from API");
      }

      const fullText = response.data.content
        .filter((part) => part.type === "text")
        .map((part) => part.text)
        .join("");

      setSummary(fullText);
      setResumeHTML(fullText);

      setJobDescription(jobDescriptionInput);
      setIsJobDescriptionSubmitted(true);
      if (setAnalysisResults) {
        setAnalysisResults(fullText);
      }

      if (isAuthenticated) {
        incrementUsage();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateCoverLetter = async () => {
    if (!jobDescriptionInput.trim() || !resume.trim()) return;

    if (isAuthenticated && !canGenerate()) {
      setShowUpgradeModal(true);
      return;
    }

    setGeneratingCoverLetter(true);
    setError("");
    setCoverLetterHTML("");

    try {
      let coverLetterPrompt =
        "TASK: Generate a professional cover letter\n\nRESUME\n" +
        resume +
        "\nJOB DESCRIPTION\n" +
        jobDescriptionInput;

      const response = await sendCoverLetterToClaude(coverLetterPrompt);

      if (
        !response.data ||
        !response.data.content ||
        !response.data.content[0]
      ) {
        throw new Error("Invalid response structure from API");
      }

      const fullText = response.data.content
        .filter((part) => part.type === "text")
        .map((part) => part.text)
        .join("");

      setCoverLetter(fullText);
      setCoverLetterHTML(fullText);

      if (isAuthenticated) {
        incrementUsage();
      }
    } catch (err) {
      setError("Cover letter generation error: " + err.message);
    } finally {
      setGeneratingCoverLetter(false);
    }
  };

  const sendCoverLetterToClaude = async (prompt) => {
    try {
      const isLocalhost = window.location.hostname === "localhost";

      const API_BASE_URL = isLocalhost
        ? "http://localhost:3000/api"
        : "https://align-vahq.onrender.com/api";

      const response = await fetch(`${API_BASE_URL}/create-cover-letter`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobDescription: prompt,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `API request failed (${response.status}): ${errorText}`
        );
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  };

  const downloadPDF = (content, type) => {
    if (!isAuthenticated) {
      setShowAuthPrompt(true);
      return;
    }

    if (!content) return;

    try {
      const printWindow = window.open("", "_blank", "width=800,height=600");

      if (!printWindow) {
        alert("Pop-up blocked! Please allow pop-ups for this site.");
        return;
      }

      printWindow.document.open();
      printWindow.document.write(content);
      printWindow.document.close();

      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();

        printWindow.onafterprint = () => {
          printWindow.close();
        };
      };
    } catch (err) {
      alert(`An error occurred while printing the ${type}.`);
    }
  };

  const handleUpdateResume = (newContent) => {
    setSummary(newContent);
    setResumeHTML(newContent);
  };

  const handleUpdateCoverLetter = (newContent) => {
    setCoverLetter(newContent);
    setCoverLetterHTML(newContent);
  };

  const switchToResume = () => {
    setActiveDocument("resume");
  };

  const switchToCoverLetter = () => {
    setActiveDocument("coverLetter");
  };

  if (!isResumeSubmitted) {
    return null;
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6 font-inter">
      {isAuthenticated && <UsageDisplay />}

      <div className="mb-8">
        <h2 className="text-center text-xl font-medium mb-8 text-gray-100">
          Add the job posting. We'll analyze what the company is really looking
          for.
        </h2>

        <div className="max-w-4xl mx-auto mb-8">
          <div className="h-64 relative">
            <div
              className={`absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-500 rounded-xl transition-opacity duration-300 ${
                isTextareaFocused ? "opacity-100" : "opacity-0"
              }`}
            ></div>

            <div
              className={`absolute inset-[2px] bg-gray-800 border-2 ${
                isTextareaFocused ? "border-transparent" : "border-gray-600"
              } rounded-xl overflow-hidden transition-all duration-300 z-10`}
            >
              <textarea
                value={jobDescriptionInput}
                onChange={(e) => setJobDescriptionInput(e.target.value)}
                onFocus={() => setIsTextareaFocused(true)}
                onBlur={() => setIsTextareaFocused(false)}
                placeholder="Paste the job description here..."
                disabled={isLoading || generatingCoverLetter}
                className="w-full h-full p-6 bg-transparent text-gray-200 placeholder-gray-500 resize-none border-none outline-none font-mono text-sm leading-relaxed"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={handleSendJobDescription}
            disabled={
              !jobDescriptionInput.trim() || isLoading || generatingCoverLetter
            }
            className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 min-w-[200px]"
          >
            {isLoading ? "Generating..." : "Generate Resume"}
          </button>
          <button
            onClick={handleGenerateCoverLetter}
            disabled={
              !jobDescriptionInput.trim() || generatingCoverLetter || isLoading
            }
            className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 min-w-[200px]"
          >
            {generatingCoverLetter ? "Generating..." : "Generate Cover Letter"}
          </button>
        </div>
      </div>

      {(isLoading || generatingCoverLetter) && (
        <div className="flex flex-col items-center justify-center py-12">
          <div
            className="w-12 h-12 rounded-full animate-spin mb-4"
            style={{
              border: "4px solid rgba(255, 255, 255, 0.1)",
              borderLeftColor: "transparent",
              borderImage:
                "linear-gradient(90deg, #4a6bff, #8a64ff, #e85f88) 1",
            }}
          ></div>
          <p className="text-gray-300 text-lg">
            Generating {isLoading ? "resume" : "cover letter"}...
          </p>
        </div>
      )}

      {error && (
        <div className="max-w-4xl mx-auto mb-8 p-4 bg-red-900/50 border border-red-500 rounded-xl text-red-200">
          <p className="font-medium">Error: {error}</p>
        </div>
      )}

      {showAuthPrompt && !isAuthenticated && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 max-w-lg w-full mx-4 relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-200 text-xl transition-colors"
              onClick={() => setShowAuthPrompt(false)}
            >
              ✕
            </button>
            <h3 className="text-2xl font-bold text-emerald-400 mb-4 text-center">
              🎉 Your documents are ready!
            </h3>
            <p className="text-gray-300 mb-6 text-center">
              Sign up now to download your tailored resume and cover letter.
            </p>
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 mb-6">
              <p className="text-gray-300 text-sm mb-2">
                ✅ <strong>Free Freemium Account</strong>
              </p>
              <p className="text-gray-300 text-sm mb-2">
                ✅ No payment details required
              </p>
              <p className="text-gray-300 text-sm mb-2">
                ✅ 2 resume + cover letter generations per month
              </p>
              <p className="text-gray-300 text-sm">
                ✅ Basic ATS analysis included
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Link
                to="/signup"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg text-center transition-all duration-300 transform hover:scale-105"
              >
                Sign Up Free - No Payment Required
              </Link>
              <Link
                to="/login"
                className="border border-emerald-600 text-emerald-400 hover:bg-emerald-600 hover:text-white font-medium py-3 px-6 rounded-lg text-center transition-all duration-300"
              >
                Already have an account? Log In
              </Link>
            </div>
          </div>
        </div>
      )}

      {summary && !isLoading && !generatingCoverLetter && (
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end justify-start mb-0">
            <button
              className={`relative px-6 py-3 font-medium transition-all duration-300 rounded-t-lg border-l border-t border-r ${
                activeDocument === "resume"
                  ? "bg-gray-800 text-gray-100 border-gray-700 z-10 border-b-gray-800"
                  : "bg-gray-900 text-gray-400 hover:text-gray-200 hover:bg-gray-800 border-gray-600 border-b-gray-700"
              }`}
              onClick={switchToResume}
            >
              📄 Resume
            </button>

            {coverLetter && (
              <button
                className={`relative px-6 py-3 font-medium transition-all duration-300 rounded-t-lg border-l border-t border-r -ml-px ${
                  activeDocument === "coverLetter"
                    ? "bg-gray-800 text-gray-100 border-gray-700 z-10 border-b-gray-800"
                    : "bg-gray-900 text-gray-400 hover:text-gray-200 hover:bg-gray-800 border-gray-600 border-b-gray-700"
                }`}
                onClick={switchToCoverLetter}
              >
                ✉️ Cover Letter
              </button>
            )}
          </div>

          <div
            className={`${
              activeDocument === "resume" ? "block" : "hidden"
            } mb-6`}
          >
            <div className="w-full mx-auto bg-gray-800 border border-gray-700 border-t-0 rounded-b-xl rounded-tr-xl overflow-hidden">
              <iframe
                id="summary-preview"
                className="w-full h-[600px]"
                title="Resume Preview"
              />
            </div>
          </div>

          {coverLetter && (
            <div
              className={`${
                activeDocument === "coverLetter" ? "block" : "hidden"
              } mb-6`}
            >
              <div className="w-full mx-auto bg-gray-800 border border-gray-700 border-t-0 rounded-b-xl rounded-tr-xl overflow-hidden">
                <iframe
                  id="cover-letter-preview"
                  className="w-full h-[600px]"
                  title="Cover Letter Preview"
                />
              </div>
            </div>
          )}

          <div className="flex gap-4 justify-center mb-8">
            <button
              onClick={onStartNewApplication}
              className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-105 flex items-center gap-3"
            >
              <img src={rotateIcon} alt="New Application" className="w-5 h-5" />
              Start a New Application
            </button>

            <button
              onClick={handleSaveDocument}
              disabled={savingDocument || !activeDocument}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 flex items-center gap-3"
            >
              {savingDocument ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  Save {activeDocument === "resume" ? "Resume" : "Cover Letter"}
                </>
              )}
            </button>

            <button
              onClick={() =>
                downloadPDF(
                  activeDocument === "resume" ? summary : coverLetter,
                  activeDocument === "resume" ? "resume" : "cover letter"
                )
              }
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-105 flex items-center gap-3"
            >
              <img src={downloadIcon} alt="Download" className="w-5 h-5" />
              Download as PDF
            </button>
          </div>

          {saveSuccess && (
            <div className="max-w-4xl mx-auto mb-6 p-4 bg-emerald-900/50 border border-emerald-500 rounded-xl text-emerald-200 text-center">
              <p className="font-medium flex items-center justify-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                {saveSuccess}
              </p>
            </div>
          )}
        </div>
      )}

      {activeDocument && !isLoading && !generatingCoverLetter && (
        <ChatInterface
          onSendMessage={handleSendMessage}
          isLoading={isLoading || generatingCoverLetter}
          resume={resume}
          jobDescriptionInput={jobDescriptionInput}
          isGenerating={isLoading || generatingCoverLetter}
          onUpdateResume={handleUpdateResume}
          onUpdateCoverLetter={handleUpdateCoverLetter}
          activeDocument={activeDocument}
          currentDocumentType={
            activeDocument === "resume" ? "resume" : "cover letter"
          }
          currentDocument={activeDocument === "resume" ? summary : coverLetter}
          onUpdateDocument={
            activeDocument === "resume"
              ? handleUpdateResume
              : handleUpdateCoverLetter
          }
        />
      )}
      <UpgradeModal />
    </div>
  );
}

export default JobAnalysis;
