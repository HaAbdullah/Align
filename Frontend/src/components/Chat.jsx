import React, { useState, useEffect } from "react";
import ResumeUpload from "./ResumeUpload";
import JobAnalysis from "./JobAnalysis";
import TabsContainer from "./TabsContainer";
import "../styles/Chat.css";

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
    <div className="chat-container">
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

export default Chat;
