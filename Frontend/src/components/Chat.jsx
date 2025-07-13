import React, { useState, useEffect } from "react";
import ResumeUpload from "./ResumeUpload";
import JobAnalysis from "./JobAnalysis";
import TabsContainer from "./TabsContainer";

// Add Google Fonts import
const fontLink = document.createElement("link");
fontLink.href =
  "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap";
fontLink.rel = "stylesheet";
if (!document.head.querySelector(`link[href="${fontLink.href}"]`)) {
  document.head.appendChild(fontLink);
}

function Chat() {
  // Main state
  const [isResumeSubmitted, setIsResumeSubmitted] = useState(false);
  const [resume, setResume] = useState("");
  const [error, setError] = useState("");
  const [savedResumes, setSavedResumes] = useState([]);
  const [jobDescription, setJobDescription] = useState("");
  const [isJobDescriptionSubmitted, setIsJobDescriptionSubmitted] =
    useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);

  useEffect(() => {
    // Check if html2pdf is already loaded
    if (typeof window.html2pdf === "undefined") {
      const script = document.createElement("script");
      script.src =
        "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
      script.async = true;
      script.onload = () => console.log("html2pdf loaded successfully");
      script.onerror = () => console.error("Failed to load html2pdf library");
      document.body.appendChild(script);
    }

    // Load saved resumes from localStorage
    const loadSavedResumes = () => {
      try {
        const savedResumesData = localStorage.getItem("savedResumes");
        if (savedResumesData) {
          setSavedResumes(JSON.parse(savedResumesData));
        }
      } catch (err) {
        console.error("Error loading saved resumes:", err);
      }
    };

    loadSavedResumes();
  }, []);

  // Add a debug log to monitor state changes
  useEffect(() => {
    console.log("Chat State Updated:", {
      isResumeSubmitted,
      isJobDescriptionSubmitted,
      resumeLength: resume?.length,
      jobDescriptionLength: jobDescription?.length,
      hasAnalysisResults: !!analysisResults,
    });
  }, [
    isResumeSubmitted,
    isJobDescriptionSubmitted,
    resume,
    jobDescription,
    analysisResults,
  ]);

  const handleStartNewApplication = () => {
    // Reset all state
    setResume("");
    setIsResumeSubmitted(false);
    setJobDescription("");
    setIsJobDescriptionSubmitted(false);
    setAnalysisResults(null);
    setError("");

    // Scroll back to top
    window.scrollTo(0, 0);
  };

  return (
    <div className="font-['Inter'] max-w-6xl h-auto mx-auto p-5 transition-colors duration-300">
      <div className="upload-options">
        <ResumeUpload
          resume={resume}
          setResume={setResume}
          isLoading={false}
          setError={setError}
          savedResumes={savedResumes}
          setSavedResumes={setSavedResumes}
          setIsResumeSubmitted={setIsResumeSubmitted}
        />
      </div>

      {error && <div className="error-message">{error}</div>}

      <JobAnalysis
        resume={resume}
        isResumeSubmitted={isResumeSubmitted}
        onStartNewApplication={handleStartNewApplication}
        jobDescription={jobDescription}
        setJobDescription={setJobDescription}
        isJobDescriptionSubmitted={isJobDescriptionSubmitted}
        setIsJobDescriptionSubmitted={setIsJobDescriptionSubmitted}
        analysisResults={analysisResults}
        setAnalysisResults={setAnalysisResults}
      />

      <TabsContainer
        resume={resume}
        jobDescription={jobDescription}
        analysisResults={analysisResults}
        isJobDescriptionSubmitted={isJobDescriptionSubmitted}
        isResumeSubmitted={isResumeSubmitted}
      />
    </div>
  );
}

// Utility components for the styles that would be used in child components
export const UploadTitle = ({ children, className = "" }) => (
  <h2
    className={`text-center text-lg font-medium mb-5 text-gray-100 transition-colors duration-300 ${className}`}
  >
    {children}
  </h2>
);

export const UploadAreaContainer = ({ children, className = "" }) => (
  <div className={`flex flex-row gap-5 ${className}`}>{children}</div>
);

export const SubmitResumeButton = ({
  disabled,
  onClick,
  children,
  className = "",
}) => (
  <button
    disabled={disabled}
    onClick={onClick}
    className={`
      bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg font-medium cursor-pointer transition-all duration-300
      disabled:bg-emerald-800 disabled:cursor-not-allowed
      ${className}
    `}
  >
    {children}
  </button>
);

export const SavedResumesContainer = ({ children, className = "" }) => (
  <div
    className={`
    mt-5 p-4 bg-gray-800 rounded-xl border border-transparent bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 transition-all duration-300
    ${className}
  `}
  >
    {children}
  </div>
);

export const SavedResumesTitle = ({ children, className = "" }) => (
  <h3
    className={`text-base font-medium text-gray-300 mb-3 transition-colors duration-300 ${className}`}
  >
    {children}
  </h3>
);

export const SavedResumesList = ({ children, className = "" }) => (
  <div className={`flex flex-wrap gap-2.5 md:flex-col ${className}`}>
    {children}
  </div>
);

export const SavedResumeItem = ({ children, className = "" }) => (
  <div
    className={`
    flex items-center px-3 py-2 bg-emerald-900 rounded-lg border border-transparent bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 transition-all duration-300
    ${className}
  `}
  >
    {children}
  </div>
);

export const SavedResumeName = ({ onClick, children, className = "" }) => (
  <span
    onClick={onClick}
    className={`
      text-sm text-gray-300 cursor-pointer transition-all duration-300
      hover:underline hover:text-transparent hover:bg-gradient-to-r hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 hover:bg-clip-text
      ${className}
    `}
  >
    {children}
  </span>
);

export const DeleteResumeButton = ({ onClick, children, className = "" }) => (
  <button
    onClick={onClick}
    className={`
      bg-transparent border-none text-red-400 text-lg font-bold cursor-pointer ml-2 px-1 transition-colors duration-300
      hover:text-red-300
      ${className}
    `}
  >
    {children}
  </button>
);

export const SaveResumeButton = ({ onClick, children, className = "" }) => (
  <button
    onClick={onClick}
    className={`
      bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg text-sm font-medium cursor-pointer mb-4 transition-all duration-300
      hover:from-blue-600 hover:via-purple-600 hover:to-pink-600
      ${className}
    `}
  >
    {children}
  </button>
);

export const SaveResumeDialog = ({ children, className = "" }) => (
  <div
    className={`
    fixed top-0 left-0 w-full h-full bg-black/70 flex justify-center items-center z-50
    ${className}
  `}
  >
    {children}
  </div>
);

export const SaveResumeContent = ({ children, className = "" }) => (
  <div
    className={`
    bg-gray-800 p-6 rounded-xl w-[90%] max-w-md shadow-black/30 transition-all duration-300
    ${className}
  `}
  >
    {children}
  </div>
);

export const SaveResumeContentTitle = ({ children, className = "" }) => (
  <h3
    className={`text-lg font-semibold mb-3 text-gray-200 transition-colors duration-300 ${className}`}
  >
    {children}
  </h3>
);

export const SaveResumeContentText = ({ children, className = "" }) => (
  <p
    className={`text-sm text-gray-400 mb-4 transition-colors duration-300 ${className}`}
  >
    {children}
  </p>
);

export const ResumeNameInput = ({
  value,
  onChange,
  placeholder,
  className = "",
}) => (
  <input
    type="text"
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className={`
      w-full p-2.5 border border-gray-600 rounded-md text-sm mb-4 
      bg-gray-700 text-gray-200 transition-all duration-300
      focus:outline-none focus:border-transparent focus:bg-gradient-to-r focus:from-blue-500 focus:via-purple-500 focus:to-pink-500 focus:p-2
      focus:placeholder-transparent
      ${className}
    `}
  />
);

export const SaveResumeButtons = ({ children, className = "" }) => (
  <div className={`flex justify-end gap-3 ${className}`}>{children}</div>
);

export const CancelSaveButton = ({ onClick, children, className = "" }) => (
  <button
    onClick={onClick}
    className={`
      px-4 py-2 rounded-md text-sm font-medium cursor-pointer border-none transition-all duration-300
      bg-gray-600 text-gray-200
      ${className}
    `}
  >
    {children}
  </button>
);

export const ConfirmSaveButton = ({
  onClick,
  disabled,
  children,
  className = "",
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`
      px-4 py-2 rounded-md text-sm font-medium cursor-pointer border-none transition-all duration-300
      bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white
      disabled:bg-emerald-800 disabled:cursor-not-allowed
      ${className}
    `}
  >
    {children}
  </button>
);

export default Chat;
