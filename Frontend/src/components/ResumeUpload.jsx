import React, { useState, useRef } from "react";
import { processPDFResume } from "../utils/pdfExtractor";
import { Upload, FileText, X, Save, ChevronRight } from "lucide-react";

function ResumeUpload({
  resume,
  setResume,
  isLoading,
  setError,
  savedResumes,
  setSavedResumes,
  setIsResumeSubmitted,
}) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState("upload"); // "upload" | "paste"
  const [uploadedFileName, setUploadedFileName] = useState("");
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
    const names = [];

    for (let i = 0; i < maxFiles; i++) {
      const file = files[i];
      if (
        file.type !== "application/pdf" &&
        file.type !== "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        continue;
      }
      try {
        const extractedText = await processPDFResume(file);
        if (combinedText && extractedText) combinedText += "\n\n--- NEXT RESUME ---\n\n";
        combinedText += extractedText;
        names.push(file.name);
        processedCount++;
      } catch (error) {
        hasError = true;
      }
    }

    if (processedCount > 0) {
      setResume(combinedText);
      setUploadedFileName(names.join(", "));
      setActiveTab("upload");
    }

    if (hasError) {
      setError(
        processedCount > 0
          ? `Processed ${processedCount} file(s), but some files couldn't be processed.`
          : "Failed to extract text from the resume(s). Try a different file or paste the text."
      );
    }
  };

  const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    if (e.dataTransfer.files.length > 5) { setError("You can only upload up to 5 files at once"); return; }
    handleFileUpload(e);
  };

  const clearResume = () => {
    setResume("");
    setUploadedFileName("");
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = null;
  };

  const handleSubmit = () => {
    if (!resume.trim()) return;
    setIsResumeSubmitted(true);
  };

  const saveResume = () => {
    if (!resume.trim() || !resumeName.trim()) return;
    const newSaved = [...savedResumes, { id: Date.now().toString(), name: resumeName, content: resume }];
    setSavedResumes(newSaved);
    localStorage.setItem("savedResumes", JSON.stringify(newSaved));
    setShowSaveDialog(false);
    setResumeName("");
  };

  const loadResume = (content) => {
    setResume(resume.trim() ? `${resume}\n\n--- NEXT RESUME ---\n\n${content}` : content);
  };

  const deleteResume = (id) => {
    const updated = savedResumes.filter((r) => r.id !== id);
    setSavedResumes(updated);
    localStorage.setItem("savedResumes", JSON.stringify(updated));
  };

  const hasContent = resume.trim().length > 0;

  return (
    <div className="w-full max-w-3xl mx-auto">
      <input
        type="file"
        accept=".pdf,.docx"
        onChange={handleFileUpload}
        ref={fileInputRef}
        className="hidden"
        multiple
      />

      {/* Tab switcher */}
      <div className="flex border-b border-gray-700 mb-6">
        <button
          onClick={() => setActiveTab("upload")}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "upload"
              ? "border-emerald-500 text-emerald-400"
              : "border-transparent text-gray-400 hover:text-gray-200"
          }`}
        >
          <Upload className="w-4 h-4" />
          Upload File
        </button>
        <button
          onClick={() => setActiveTab("paste")}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "paste"
              ? "border-emerald-500 text-emerald-400"
              : "border-transparent text-gray-400 hover:text-gray-200"
          }`}
        >
          <FileText className="w-4 h-4" />
          Paste Text
        </button>
      </div>

      {/* Upload tab */}
      {activeTab === "upload" && (
        <div>
          {hasContent && uploadedFileName ? (
            /* File loaded state */
            <div className="flex items-center gap-4 p-5 bg-emerald-900/20 border border-emerald-700 rounded-xl mb-4">
              <div className="w-10 h-10 rounded-full bg-emerald-700/40 flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm truncate">{uploadedFileName}</p>
                <p className="text-emerald-400 text-xs mt-0.5">Resume extracted successfully</p>
              </div>
              <button onClick={clearResume} className="text-gray-400 hover:text-red-400 transition-colors p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            /* Drop zone */
            <div
              onClick={() => fileInputRef.current.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`flex flex-col items-center justify-center gap-4 p-12 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 ${
                isDragging
                  ? "border-emerald-500 bg-emerald-900/20"
                  : "border-gray-600 hover:border-gray-500 hover:bg-gray-800/50"
              }`}
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${isDragging ? "bg-emerald-700/30" : "bg-gray-800"}`}>
                <Upload className={`w-7 h-7 transition-colors ${isDragging ? "text-emerald-400" : "text-gray-400"}`} />
              </div>
              <div className="text-center">
                <p className="text-gray-200 font-medium">Drop your resume here, or <span className="text-emerald-400">browse</span></p>
                <p className="text-gray-500 text-sm mt-1">PDF or DOCX · Up to 5 files</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Paste tab */}
      {activeTab === "paste" && (
        <div className="relative">
          <textarea
            value={resume}
            onChange={(e) => setResume(e.target.value)}
            placeholder="Paste your resume text here...&#10;&#10;Include your work experience, skills, education, and any other relevant sections."
            disabled={isLoading}
            className="w-full h-56 p-5 bg-gray-800 border border-gray-600 rounded-xl text-gray-200 placeholder-gray-500 resize-none focus:outline-none focus:border-emerald-500 text-sm leading-relaxed transition-colors"
          />
          {hasContent && (
            <button
              onClick={clearResume}
              className="absolute top-3 right-3 text-gray-500 hover:text-red-400 transition-colors p-1"
              title="Clear"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Saved resumes */}
      {savedResumes.length > 0 && (
        <div className="mt-5 p-4 bg-gray-800/60 border border-gray-700 rounded-xl">
          <p className="text-xs text-gray-400 font-medium mb-3 uppercase tracking-wide">Saved Resumes</p>
          <div className="flex flex-wrap gap-2">
            {savedResumes.map((saved) => (
              <div
                key={saved.id}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg group"
              >
                <span
                  className="text-sm text-gray-300 cursor-pointer hover:text-emerald-400 transition-colors"
                  onClick={() => loadResume(saved.content)}
                >
                  {saved.name}
                </span>
                <button
                  className="text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                  onClick={() => deleteResume(saved.id)}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action row */}
      <div className="flex items-center gap-3 mt-5">
        {hasContent && (
          <button
            onClick={() => setShowSaveDialog(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm font-medium rounded-lg transition-colors"
          >
            <Save className="w-4 h-4" />
            Save Resume
          </button>
        )}
        <button
          onClick={handleSubmit}
          disabled={!hasContent || isLoading}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 hover:scale-[1.01] disabled:hover:scale-100"
        >
          Continue with this resume
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Save dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-100 mb-1">Save Resume</h3>
            <p className="text-gray-400 text-sm mb-4">Give it a name so you can reuse it later.</p>
            <input
              type="text"
              value={resumeName}
              onChange={(e) => setResumeName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && saveResume()}
              placeholder="e.g. Software Engineer – Google"
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-emerald-500 mb-4 text-sm"
              autoFocus
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => { setShowSaveDialog(false); setResumeName(""); }}
                className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={saveResume}
                disabled={!resumeName.trim()}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ResumeUpload;
