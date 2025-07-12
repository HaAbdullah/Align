import React, { useState, useEffect } from "react";
import {
  sendJobDescriptionToClaude,
  sendChatFeedbackToClaude,
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

  // Handler for chat feedback
  const handleSendMessage = async (feedbackPrompt) => {
    try {
      const response = await sendChatFeedbackToClaude(feedbackPrompt);
      return response.content[0].text;
    } catch (error) {
      console.error("Error sending chat feedback:", error);
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
    setActiveDocument(null);

    let createdPrompt =
      "RESUME\n" + resume + "\nJOB DESCRIPTION\n" + jobDescriptionInput;
    setFinalClaudePrompt(createdPrompt);

    try {
      const response = await sendJobDescriptionToClaude(createdPrompt);

      setSummary(response.content[0].text);

      setJobDescription(jobDescriptionInput);
      setIsJobDescriptionSubmitted(true);
      if (setAnalysisResults) {
        setAnalysisResults(response.content[0].text);
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

    try {
      let coverLetterPrompt =
        "TASK: Generate a professional cover letter\n\nRESUME\n" +
        resume +
        "\nJOB DESCRIPTION\n" +
        jobDescriptionInput;

      const response = await sendCoverLetterToClaude(coverLetterPrompt);

      setCoverLetter(response.content[0].text);

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
      console.log(
        "Sending cover letter prompt to Claude API, length:",
        prompt.length
      );
      const isLocalhost = window.location.hostname === "localhost";

      const API_BASE_URL = isLocalhost
        ? "http://localhost:3000/api"
        : "https://jobfit-backend-29ai.onrender.com/api";

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
      console.error("Error calling Claude API for cover letter:", error);
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
      console.error(`Error during printing ${type}:`, err);
      alert(`An error occurred while printing the ${type}.`);
    }
  };

  const handleUpdateResume = (newContent) => {
    setSummary(newContent);
  };

  const handleUpdateCoverLetter = (newContent) => {
    setCoverLetter(newContent);
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

      {/* Job Description Input Section */}
      <div className="mb-8">
        <h2 className="text-center text-xl font-medium mb-8 text-gray-100">
          Add the job posting. We'll analyze what the company is really looking
          for.
        </h2>

        {/* Text Input Box with Gradient Border */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="h-64 relative">
            {/* Gradient border background */}
            <div
              className={`absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-500 rounded-xl transition-opacity duration-300 ${
                isTextareaFocused ? "opacity-100" : "opacity-0"
              }`}
            ></div>

            {/* Main textarea container */}
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

        {/* Action Buttons */}
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

      {/* Loading Spinner */}
      {(isLoading || generatingCoverLetter) && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-12 h-12 border-4 border-gray-600 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-300 text-lg">
            Generating {isLoading ? "resume" : "cover letter"}...
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="max-w-4xl mx-auto mb-8 p-4 bg-red-900/50 border border-red-500 rounded-xl text-red-200">
          <p className="font-medium">Error: {error}</p>
        </div>
      )}

      {/* Auth Prompt Modal */}
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

      {/* Document Display Section */}
      {summary && (
        <div className="max-w-4xl mx-auto">
          {/* Document Tabs */}
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

          {/* Resume Preview */}
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

          {/* Cover Letter Preview */}
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

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center mb-8">
            <button
              onClick={onStartNewApplication}
              className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-105 flex items-center gap-3"
            >
              <img src={rotateIcon} alt="New Application" className="w-5 h-5" />
              Start a New Application
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
        </div>
      )}

      {/* Chat Interface */}
      {activeDocument && (
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
