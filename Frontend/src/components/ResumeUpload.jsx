import React, { useState, useRef } from "react";
import { processPDFResume } from "../utils/pdfExtractor";
import uploadIcon from "../assets/upload.svg";
import "../styles/ResumeUpload.css";

function ResumeUpload({
  resume,
  setResume,
  isLoading,
  setError,
  savedResumes,
  setSavedResumes,
  setIsResumeSubmitted,
}) {
  // File upload states
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [resumeName, setResumeName] = useState("");

  const handleFileUpload = async (event) => {
    const files = event.target.files || event.dataTransfer.files;

    if (!files || files.length === 0) return;

    setError(null);

    const maxFiles = Math.min(files.length, 5);
    let combinedText = "";
    let processedCount = 0;
    let hasError = false;

    for (let i = 0; i < maxFiles; i++) {
      const file = files[i];

      if (
        file.type !== "application/pdf" &&
        file.type !==
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        // Skip invalid files but continue processing others
        console.warn(`Skipping file ${file.name}: Invalid file type`);
        continue;
      }

      try {
        const extractedText = await processPDFResume(file);

        // Add a separator between different resumes
        if (combinedText && extractedText) {
          combinedText += "\n\n--- NEXT RESUME ---\n\n";
        }

        combinedText += extractedText;
        processedCount++;
      } catch (error) {
        console.error(`Error processing resume ${file.name}:`, error);
        hasError = true;
      }
    }

    if (processedCount > 0) {
      setResume(combinedText);
    }

    if (hasError) {
      setError(
        processedCount > 0
          ? `Processed ${processedCount} file(s), but some files couldn't be processed.`
          : "Failed to extract text from the resume(s). Try different files or paste the text."
      );
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    // Check if more than 5 files are dropped
    if (e.dataTransfer.files.length > 5) {
      setError("You can only upload up to 3 resume files at once");
      return;
    }

    handleFileUpload(e);
  };

  const handleSendResume = async () => {
    if (!resume.trim()) return;
    setIsResumeSubmitted(true);
  };

  const clearResumeData = () => {
    setResume("");
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };

  // Resume saving functionality
  const saveResume = () => {
    if (!resume.trim() || !resumeName.trim()) return;

    const newSavedResumes = [
      ...savedResumes,
      {
        id: Date.now().toString(),
        name: resumeName,
        content: resume,
      },
    ];

    setSavedResumes(newSavedResumes);
    localStorage.setItem("savedResumes", JSON.stringify(newSavedResumes));
    setShowSaveDialog(false);
    setResumeName("");
  };

  const loadResume = (resumeContent) => {
    // Check if there's already content in the resume textarea
    if (resume.trim()) {
      // If there's existing content, append a separator and the new content
      setResume(
        (prevResume) =>
          `${prevResume}\n\n--- NEXT RESUME ---\n\n${resumeContent}`
      );
    } else {
      // If there's no existing content, just set the resume content
      setResume(resumeContent);
    }
  };

  const deleteResume = (id) => {
    const updatedResumes = savedResumes.filter((resume) => resume.id !== id);
    setSavedResumes(updatedResumes);
    localStorage.setItem("savedResumes", JSON.stringify(updatedResumes));
  };

  return (
    <div className="upload-section">
      <input
        type="file"
        accept=".pdf,.docx"
        onChange={handleFileUpload}
        ref={fileInputRef}
        className="file-input"
        multiple
        style={{ display: "none" }}
      />
      <h2 className="upload-title">
        Upload 1–3 versions of your resume that best reflect your experience.
      </h2>

      <div className="upload-area-container">
        <div
          className={`upload-box ${isDragging ? "dragging" : ""}`}
          onClick={triggerFileInput}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="upload-icon-container">
            <img src={uploadIcon} alt="Upload" className="upload-icon" />
          </div>
          <p className="upload-instruction">
            Drag files here or click to upload (up to 5 files)
          </p>
          <p className="upload-formats">Accepted formats: PDF, DOCX</p>
        </div>

        <div className="text-input-box">
          <div className="textarea-wrapper">
            <textarea
              value={resume}
              onChange={(e) => setResume(e.target.value)}
              placeholder="Or if you prefer, paste your resume(s) content here..."
              disabled={isLoading}
            />
            {resume && (
              <button
                onClick={clearResumeData}
                className="clear-button"
                disabled={isLoading}
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Save Resume Button and Saved Resumes Display */}
      <div className="saved-resumes-container">
        {resume.trim() && !isLoading && (
          <button
            onClick={() => setShowSaveDialog(true)}
            className="save-resume-button"
          >
            Save Current Resume
          </button>
        )}

        {savedResumes.length > 0 && (
          <>
            <h3 className="saved-resumes-title">Your Saved Resumes</h3>
            <div className="saved-resumes-list">
              {savedResumes.map((savedResume) => (
                <div key={savedResume.id} className="saved-resume-item">
                  <span
                    className="saved-resume-name"
                    onClick={() => loadResume(savedResume.content)}
                  >
                    {savedResume.name}
                  </span>
                  <button
                    className="delete-resume-button"
                    onClick={() => deleteResume(savedResume.id)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Save Resume Dialog */}
      {showSaveDialog && (
        <div className="save-resume-dialog">
          <div className="save-resume-content">
            <h3>Save Your Resume</h3>
            <p>Enter a name to save this resume for future use</p>
            <input
              type="text"
              value={resumeName}
              onChange={(e) => setResumeName(e.target.value)}
              placeholder="Resume name (e.g. Software Developer)"
              className="resume-name-input"
              autoFocus
            />
            <div className="save-resume-buttons">
              <button
                onClick={() => {
                  setShowSaveDialog(false);
                  setResumeName("");
                }}
                className="cancel-save-button"
              >
                Cancel
              </button>
              <button
                onClick={saveResume}
                className="confirm-save-button"
                disabled={!resumeName.trim()}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={handleSendResume}
        disabled={!resume.trim() || isLoading}
        className="submit-resume-button"
      >
        Submit Resume
      </button>
    </div>
  );
}

export default ResumeUpload;
