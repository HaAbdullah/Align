import React, { useState, useRef } from "react";
import { processPDFResume } from "../utils/pdfExtractor";
import uploadIcon from "../assets/upload.svg";

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
  const [isTextareaFocused, setIsTextareaFocused] = useState(false);

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
    <div className="w-full max-w-7xl mx-auto p-6 font-inter">
      <input
        type="file"
        accept=".pdf,.docx"
        onChange={handleFileUpload}
        ref={fileInputRef}
        className="hidden"
        multiple
      />

      <h2 className="text-center text-xl font-medium mb-8 text-gray-100">
        Upload 1–3 versions of your resume that best reflect your experience.
      </h2>

      {/* Upload Area Container */}
      <div className="flex gap-8 justify-center mb-8">
        {/* Upload Box with Gradient Border */}
        <div className="flex-1 max-w-md h-80 relative group">
          {/* Gradient border background */}
          <div
            className={`absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-500 rounded-xl transition-opacity duration-300 ${
              isDragging ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            }`}
          ></div>

          {/* Main upload content */}
          <div
            className={`absolute inset-[2px] bg-gray-800 border-2 ${
              isDragging
                ? "border-blue-400 bg-gray-700"
                : "border-gray-600 group-hover:border-transparent"
            } rounded-xl flex flex-col items-center justify-center p-8 cursor-pointer transition-all duration-300 hover:bg-gray-750 z-10`}
            onClick={triggerFileInput}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="mb-6 group-hover:scale-105 transition-transform duration-300">
              <img
                src={uploadIcon}
                alt="Upload"
                className="w-20 h-20 filter invert opacity-70 group-hover:opacity-100 transition-opacity duration-300"
              />
            </div>
            <p className="text-gray-300 text-lg font-medium mb-2 text-center group-hover:text-gray-200 transition-colors">
              Drag files here or click to upload
            </p>
            <p className="text-gray-500 text-sm text-center">(up to 5 files)</p>
            <p className="text-gray-500 text-sm mt-2">
              Accepted formats: PDF, DOCX
            </p>
          </div>
        </div>

        {/* Text Input Box with Gradient Border */}
        <div className="flex-1 max-w-md h-80 relative">
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
              value={resume}
              onChange={(e) => setResume(e.target.value)}
              onFocus={() => setIsTextareaFocused(true)}
              onBlur={() => setIsTextareaFocused(false)}
              placeholder="Or paste your resume content here..."
              disabled={isLoading}
              className="w-full h-full p-6 bg-transparent text-gray-200 placeholder-gray-500 resize-none border-none outline-none font-mono text-sm leading-relaxed"
            />

            {/* Action Buttons */}
            <div className="absolute top-4 right-4 flex gap-2">
              {resume.trim() && !isLoading && (
                <button
                  onClick={() => setShowSaveDialog(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-lg transition-colors duration-200 flex items-center gap-1"
                  title="Save Resume"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              )}

              {resume && (
                <button
                  onClick={clearResumeData}
                  disabled={isLoading}
                  className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors duration-200 disabled:opacity-50"
                  title="Clear"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Saved Resumes Display */}
      {savedResumes.length > 0 && (
        <div className="max-w-4xl mx-auto mb-8 p-6 bg-gray-800 border border-gray-700 rounded-xl">
          <h3 className="text-lg font-medium text-gray-200 mb-4">
            Your Saved Resumes
          </h3>
          <div className="flex flex-wrap gap-3">
            {savedResumes.map((savedResume) => (
              <div
                key={savedResume.id}
                className="flex items-center gap-3 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-650 transition-colors group"
              >
                <span
                  className="text-sm text-gray-300 cursor-pointer hover:text-blue-400 transition-colors"
                  onClick={() => loadResume(savedResume.content)}
                >
                  {savedResume.name}
                </span>
                <button
                  className="text-red-400 hover:text-red-300 text-lg font-bold transition-colors opacity-0 group-hover:opacity-100"
                  onClick={() => deleteResume(savedResume.id)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Save Resume Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-xl w-full max-w-md mx-4 border border-gray-700">
            <h3 className="text-lg font-semibold mb-3 text-gray-200">
              Save Your Resume
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Enter a name to save this resume for future use
            </p>
            <input
              type="text"
              value={resumeName}
              onChange={(e) => setResumeName(e.target.value)}
              placeholder="Resume name (e.g. Software Developer)"
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowSaveDialog(false);
                  setResumeName("");
                }}
                className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveResume}
                disabled={!resumeName.trim()}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="text-center">
        <button
          onClick={handleSendResume}
          disabled={!resume.trim() || isLoading}
          className="w-full max-w-md bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100"
        >
          Submit Resume
        </button>
      </div>
    </div>
  );
}

export default ResumeUpload;
