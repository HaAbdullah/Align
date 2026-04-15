import React, { useState, useEffect } from "react";
import {
  sendJobDescriptionToClaude,
  sendChatFeedbackToClaude,
  saveDocument,
} from "../utils/claudeAPI";
import { apiFetch } from "../utils/api";
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

  const [resumeLatex, setResumeLatex] = useState("");
  const [resumePdf, setResumePdf] = useState(""); // base64
  const [coverLetterLatex, setCoverLetterLatex] = useState("");
  const [coverLetterPdf, setCoverLetterPdf] = useState(""); // base64
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

    if (activeDocument === "resume" && !resumeLatex) {
      setError("No resume to save. Please generate one first.");
      return;
    }
    if (activeDocument === "coverLetter" && !coverLetterLatex) {
      setError("No cover letter to save. Please generate one first.");
      return;
    }

    setSavingDocument(true);
    setSaveSuccess("");
    setError("");

    try {
      if (activeDocument === "resume") {
        await saveDocument(currentUser.uid, documentType, resumeLatex, resumePdf, "latex");
      } else {
        await saveDocument(currentUser.uid, documentType, coverLetterLatex, coverLetterPdf, "latex");
      }

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
      if (activeDocument === "resume") {
        const response = await sendResumeFeedbackToClaude(feedbackPrompt);
        // Resume V2 returns { latex, pdf }
        return { latex: response.latex, pdf: response.pdf };
      } else if (activeDocument === "coverLetter") {
        const response = await sendCoverLetterFeedbackToClaude(feedbackPrompt);
        return { latex: response.latex, pdf: response.pdf };
      } else {
        throw new Error("No active document selected");
      }
    } catch (error) {
      throw error;
    }
  };

  const sendResumeFeedbackToClaude = async (feedbackText) => {
    const feedbackPrompt = `USER FEEDBACK: ${feedbackText}\n\nCURRENT RESUME (LaTeX):\n${resumeLatex}`;
    const response = await apiFetch("/create-resume", {
      method: "POST",
      body: JSON.stringify({ resumeText: resume, jobDescription: feedbackPrompt }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Resume feedback API request failed (${response.status}): ${errorText}`);
    }
    return response.json();
  };

  const sendCoverLetterFeedbackToClaude = async (feedbackPrompt) => {
    const fullPrompt = `USER FEEDBACK: ${feedbackPrompt}\n\nCURRENT COVER LETTER (LaTeX):\n${coverLetterLatex}`;
    const response = await apiFetch("/create-cover-letter", {
      method: "POST",
      body: JSON.stringify({ resumeText: resume, jobDescription: fullPrompt }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Cover letter feedback API request failed (${response.status}): ${errorText}`);
    }
    return response.json();
  };

  useEffect(() => {
    if (!resumePdf) return;

    const iframe = document.getElementById("summary-preview");
    if (!iframe) return;

    const binary = atob(resumePdf);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const blob = new Blob([bytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    iframe.src = url;

    if (!activeDocument) setActiveDocument("resume");

    return () => URL.revokeObjectURL(url);
  }, [resumePdf]);

  useEffect(() => {
    if (!coverLetterPdf) return;

    const iframe = document.getElementById("cover-letter-preview");
    if (!iframe) return;

    const binary = atob(coverLetterPdf);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const blob = new Blob([bytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    iframe.src = url;

    setActiveDocument("coverLetter");

    return () => URL.revokeObjectURL(url);
  }, [coverLetterPdf]);
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
    setResumeLatex("");
    setResumePdf("");
    setCoverLetterLatex("");
    setCoverLetterPdf("");
    setActiveDocument(null);

    setFinalClaudePrompt(jobDescriptionInput);

    try {
      const response = await apiFetch("/create-resume", {
        method: "POST",
        body: JSON.stringify({ resumeText: resume, jobDescription: jobDescriptionInput }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Resume generation failed (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      if (!data.pdf || !data.latex) throw new Error("Invalid response from server");

      setSummary(data.latex); // keep summary populated so tabs show
      setResumeLatex(data.latex);
      setResumePdf(data.pdf);

      setJobDescription(jobDescriptionInput);
      setIsJobDescriptionSubmitted(true);
      if (setAnalysisResults) {
        setAnalysisResults(data.latex);
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
    setCoverLetterLatex("");
    setCoverLetterPdf("");

    try {
      const response = await apiFetch("/create-cover-letter", {
        method: "POST",
        body: JSON.stringify({ resumeText: resume, jobDescription: jobDescriptionInput }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Cover letter generation failed (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      if (!data.pdf || !data.latex) throw new Error("Invalid response from server");

      setCoverLetter(data.latex);
      setCoverLetterLatex(data.latex);
      setCoverLetterPdf(data.pdf);

      if (isAuthenticated) {
        incrementUsage();
      }
    } catch (err) {
      setError("Cover letter generation error: " + err.message);
    } finally {
      setGeneratingCoverLetter(false);
    }
  };


  const downloadPDF = (type) => {
    if (!isAuthenticated) {
      setShowAuthPrompt(true);
      return;
    }

    if (type === "resume") {
      if (!resumePdf) return;
      const binary = atob(resumePdf);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const blob = new Blob([bytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "resume.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } else {
      if (!coverLetterPdf) return;
      const binary = atob(coverLetterPdf);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const blob = new Blob([bytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "cover-letter.pdf";
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleUpdateResume = (newContent) => {
    if (newContent && typeof newContent === "object" && newContent.latex) {
      setSummary(newContent.latex);
      setResumeLatex(newContent.latex);
      setResumePdf(newContent.pdf);
    } else {
      // fallback for plain text (shouldn't happen for resumes)
      setSummary(newContent);
    }
  };

  const handleUpdateCoverLetter = (newContent) => {
    if (newContent && typeof newContent === "object" && newContent.latex) {
      setCoverLetter(newContent.latex);
      setCoverLetterLatex(newContent.latex);
      setCoverLetterPdf(newContent.pdf);
    }
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

      {summary && !isLoading && (
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

            {coverLetterPdf && (
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

          {coverLetterPdf && (
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
              onClick={() => downloadPDF(activeDocument === "resume" ? "resume" : "cover letter")}
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
          currentDocument={activeDocument === "resume" ? resumeLatex : coverLetterLatex}
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
