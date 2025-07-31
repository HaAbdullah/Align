import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

const SavedDocuments = () => {
  const { currentUser, loading } = useAuth();
  const [recentDocuments, setRecentDocuments] = useState([]);
  const [favoritedDocuments, setFavoritedDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [activeTab, setActiveTab] = useState("recent");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Cache configuration
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
  const CACHE_KEY_PREFIX = "saved_docs_";

  // Redirect if not authenticated
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Cache management functions
  const getCacheKey = (type) => `${CACHE_KEY_PREFIX}${currentUser.uid}_${type}`;

  const getCachedData = (type) => {
    try {
      const cached = sessionStorage.getItem(getCacheKey(type));
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      const isExpired = Date.now() - timestamp > CACHE_DURATION;

      if (isExpired) {
        sessionStorage.removeItem(getCacheKey(type));
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error reading cache:", error);
      return null;
    }
  };

  const setCachedData = (type, data) => {
    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
      };
      sessionStorage.setItem(getCacheKey(type), JSON.stringify(cacheData));
    } catch (error) {
      console.error("Error setting cache:", error);
      // If sessionStorage is full, clear old cache entries
      try {
        Object.keys(sessionStorage).forEach((key) => {
          if (key.startsWith(CACHE_KEY_PREFIX)) {
            sessionStorage.removeItem(key);
          }
        });
        sessionStorage.setItem(
          getCacheKey(type),
          JSON.stringify({
            data,
            timestamp: Date.now(),
          })
        );
      } catch (secondError) {
        console.error("Cache storage failed completely:", secondError);
      }
    }
  };

  const clearUserCache = () => {
    try {
      Object.keys(sessionStorage).forEach((key) => {
        if (key.startsWith(getCacheKey(""))) {
          sessionStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error("Error clearing cache:", error);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [currentUser]);

  useEffect(() => {
    if (selectedDocument) {
      renderDocumentInIframe(selectedDocument.html_content);
    }
  }, [selectedDocument]);

  const loadDocuments = async (forceRefresh = false) => {
    try {
      setError(""); // Clear any previous errors

      // Try to load from cache first (unless force refresh)
      if (!forceRefresh) {
        const cachedRecent = getCachedData("recent");
        const cachedFavorites = getCachedData("favorites");

        if (cachedRecent && cachedFavorites) {
          console.log("Loading documents from cache");
          setRecentDocuments(cachedRecent);
          setFavoritedDocuments(cachedFavorites);

          // Auto-select first document if available and none currently selected
          if (!selectedDocument) {
            const firstDocument = cachedRecent[0] || cachedFavorites[0];
            if (firstDocument) {
              setSelectedDocument(firstDocument);
            }
          }

          setIsLoading(false);
          return;
        }
      }

      // If no cache or force refresh, fetch from API
      setIsLoading(true);
      await fetchDocuments(true);
    } catch (error) {
      console.error("Error loading documents:", error);
      setError("Failed to load documents. Please try again.");
      setIsLoading(false);
    }
  };

  const fetchDocuments = async (updateCache = false) => {
    try {
      const API_BASE_URL =
        window.location.hostname === "localhost"
          ? "http://localhost:3000/api"
          : "https://align-vahq.onrender.com/api";

      console.log("Fetching fresh documents from API");

      // Fetch recent documents
      const recentResponse = await fetch(
        `${API_BASE_URL}/documents/recent/${currentUser.uid}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Fetch favorited documents
      const favoritesResponse = await fetch(
        `${API_BASE_URL}/documents/favorites/${currentUser.uid}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      let recentData = null;
      let favoritesData = null;

      if (recentResponse.ok) {
        recentData = await recentResponse.json();
        const documents = recentData.data.documents || [];
        setRecentDocuments(documents);

        if (updateCache) {
          setCachedData("recent", documents);
        }
      } else {
        setError("Failed to load recent documents.");
        return;
      }

      if (favoritesResponse.ok) {
        favoritesData = await favoritesResponse.json();
        const documents = favoritesData.data.documents || [];
        setFavoritedDocuments(documents);

        if (updateCache) {
          setCachedData("favorites", documents);
        }
      } else {
        setError("Failed to load favorite documents.");
        return;
      }

      // Auto-select first document if available and none currently selected
      if (!selectedDocument) {
        const firstDocument =
          recentData?.data?.documents?.[0] ||
          favoritesData?.data?.documents?.[0];
        if (firstDocument) {
          setSelectedDocument(firstDocument);
        }
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
      setError("Failed to load documents. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderDocumentInIframe = (htmlContent) => {
    const iframe = document.getElementById("document-preview");
    if (!iframe || !htmlContent) return;

    const doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.open();
    doc.write(htmlContent);
    doc.close();
  };

  const favoriteDocument = async (documentId) => {
    try {
      setActionLoading(documentId);
      const API_BASE_URL =
        window.location.hostname === "localhost"
          ? "http://localhost:3000/api"
          : "https://align-vahq.onrender.com/api";

      const response = await fetch(
        `${API_BASE_URL}/documents/${documentId}/favorite`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            firebaseUid: currentUser.uid,
          }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        setSuccessMessage(result.data.message);

        // Update local state
        const docToMove = recentDocuments.find((doc) => doc.id === documentId);
        if (docToMove) {
          const favoriteDoc = {
            ...docToMove,
            favorited_at: new Date().toISOString(),
          };
          setFavoritedDocuments((prev) => {
            const updated = [favoriteDoc, ...prev];
            setCachedData("favorites", updated); // Update cache
            return updated;
          });
        }

        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (error) {
      console.error("Error favoriting document:", error);
      setError("Failed to favorite document.");
    } finally {
      setActionLoading(null);
    }
  };

  const unfavoriteDocument = async (documentId) => {
    try {
      setActionLoading(documentId);
      const API_BASE_URL =
        window.location.hostname === "localhost"
          ? "http://localhost:3000/api"
          : "https://align-vahq.onrender.com/api";

      const response = await fetch(
        `${API_BASE_URL}/documents/favorites/${documentId}?firebaseUid=${currentUser.uid}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setSuccessMessage("Document removed from favorites");

        // Update local state
        setFavoritedDocuments((prev) => {
          const updated = prev.filter((doc) => doc.id !== documentId);
          setCachedData("favorites", updated); // Update cache
          return updated;
        });

        // If this was the selected document and we're on favorites tab, clear selection
        if (selectedDocument?.id === documentId && activeTab === "favorites") {
          setSelectedDocument(null);
        }

        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (error) {
      console.error("Error unfavoriting document:", error);
      setError("Failed to remove from favorites.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRefresh = () => {
    clearUserCache();
    loadDocuments(true);
  };

  const downloadPDF = () => {
    if (!selectedDocument) return;

    try {
      const printWindow = window.open("", "_blank", "width=800,height=600");
      if (!printWindow) {
        alert("Pop-up blocked! Please allow pop-ups for this site.");
        return;
      }

      printWindow.document.open();
      printWindow.document.write(selectedDocument.html_content);
      printWindow.document.close();

      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
        printWindow.onafterprint = () => {
          printWindow.close();
        };
      };
    } catch (err) {
      console.error("Error during printing:", err);
      alert("An error occurred while printing the document.");
    }
  };

  // Check if document is already favorited
  const isDocumentFavorited = (documentId) => {
    return favoritedDocuments.some((fav) => {
      const recentDoc = recentDocuments.find(
        (recent) => recent.id === documentId
      );
      return recentDoc && fav.html_content === recentDoc.html_content;
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const currentDocuments =
    activeTab === "recent" ? recentDocuments : favoritedDocuments;

  return (
    <div className="min-h-screen bg-gray-900 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-4">
            <h1 className="text-4xl font-bold text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text">
              My Documents
            </h1>
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="p-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
              title="Refresh documents"
            >
              <svg
                className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>
          <p className="text-xl text-gray-300">
            <span className="font-semibold">View, manage, and download</span>{" "}
            your saved resumes and cover letters
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="max-w-4xl mx-auto mb-6 p-4 bg-emerald-900/50 border border-emerald-500 rounded-xl text-emerald-200 text-center">
            <p className="font-medium flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              {successMessage}
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="max-w-4xl mx-auto mb-6 p-4 bg-red-900/50 border border-red-500 rounded-xl text-red-200 text-center">
            <p className="font-medium">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div
              className="w-12 h-12 rounded-full animate-spin"
              style={{
                border: "4px solid rgba(255, 255, 255, 0.1)",
                borderLeftColor: "transparent",
                borderImage:
                  "linear-gradient(90deg, #4a6bff, #8a64ff, #e85f88) 1",
              }}
            ></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Sidebar - Document List */}
            <div className="lg:col-span-1">
              <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden h-[700px] flex flex-col">
                {/* Tabs */}
                <div className="flex border-b border-gray-700 flex-shrink-0">
                  <button
                    onClick={() => setActiveTab("recent")}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                      activeTab === "recent"
                        ? "bg-gray-700 text-white border-b-2 border-purple-500"
                        : "text-gray-400 hover:text-gray-200"
                    }`}
                  >
                    📄 Recent ({recentDocuments.length})
                  </button>
                  <button
                    onClick={() => setActiveTab("favorites")}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                      activeTab === "favorites"
                        ? "bg-gray-700 text-white border-b-2 border-purple-500"
                        : "text-gray-400 hover:text-gray-200"
                    }`}
                  >
                    ⭐ Favorites ({favoritedDocuments.length})
                  </button>
                </div>

                {/* Document List */}
                <div className="flex-1 overflow-y-auto">
                  {currentDocuments.length === 0 ? (
                    <div className="p-6 text-center text-gray-400">
                      <div className="text-4xl mb-3">📄</div>
                      <p>No {activeTab} documents yet</p>
                      <p className="text-sm mt-2">
                        {activeTab === "recent"
                          ? "Generate some documents to see them here"
                          : "Favorite some documents to see them here"}
                      </p>
                    </div>
                  ) : (
                    currentDocuments.map((doc) => (
                      <div
                        key={doc.id}
                        onClick={() => setSelectedDocument(doc)}
                        className={`p-3 border-b border-gray-700 cursor-pointer transition-colors hover:bg-gray-700 ${
                          selectedDocument?.id === doc.id ? "bg-gray-700" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <span className="text-lg flex-shrink-0">
                              {doc.document_type === "resume" ? "📄" : "📝"}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span
                                  className={`px-2 py-0.5 rounded text-xs font-medium ${
                                    doc.document_type === "resume"
                                      ? "bg-blue-600/20 text-blue-400"
                                      : "bg-purple-600/20 text-purple-400"
                                  }`}
                                >
                                  {doc.document_type === "resume"
                                    ? "Resume"
                                    : "Cover Letter"}
                                </span>
                              </div>
                              <p className="text-sm text-gray-300 truncate mb-1">
                                {doc.extracted_title || "Untitled Document"}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatDate(doc.created_at || doc.favorited_at)}
                              </p>
                            </div>
                          </div>

                          {/* Action Button */}
                          <div className="ml-2 flex-shrink-0">
                            {activeTab === "recent" ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  favoriteDocument(doc.id);
                                }}
                                disabled={
                                  actionLoading === doc.id ||
                                  isDocumentFavorited(doc.id)
                                }
                                className={`p-1.5 transition-colors disabled:opacity-50 ${
                                  isDocumentFavorited(doc.id)
                                    ? "text-yellow-400"
                                    : "text-gray-400 hover:text-yellow-400"
                                }`}
                                title={
                                  isDocumentFavorited(doc.id)
                                    ? "Already in favorites"
                                    : "Add to favorites"
                                }
                              >
                                {actionLoading === doc.id ? (
                                  <div className="w-3 h-3 border border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                                ) : isDocumentFavorited(doc.id) ? (
                                  <svg
                                    className="w-3 h-3"
                                    fill="currentColor"
                                    viewBox="0 0 16 16"
                                  >
                                    <path d="M2 2v13.5a.5.5 0 0 0 .74.439L8 13.069l5.26 2.87A.5.5 0 0 0 14 15.5V2a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2" />
                                  </svg>
                                ) : (
                                  <svg
                                    className="w-3 h-3"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M18 7v14l-6-4-6 4V7a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4z"
                                    />
                                  </svg>
                                )}
                              </button>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  unfavoriteDocument(doc.id);
                                }}
                                disabled={actionLoading === doc.id}
                                className="p-1.5 text-yellow-400 hover:text-gray-400 transition-colors disabled:opacity-50"
                                title="Remove from favorites"
                              >
                                {actionLoading === doc.id ? (
                                  <div className="w-3 h-3 border border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                  <svg
                                    className="w-3 h-3"
                                    fill="currentColor"
                                    viewBox="0 0 16 16"
                                  >
                                    <path d="M2 2v13.5a.5.5 0 0 0 .74.439L8 13.069l5.26 2.87A.5.5 0 0 0 14 15.5V2a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2" />
                                  </svg>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right Side - Document Preview */}
            <div className="lg:col-span-2">
              {selectedDocument ? (
                <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden h-[700px] flex flex-col">
                  {/* Preview Header */}
                  <div className="flex items-center justify-between p-6 border-b border-gray-700 flex-shrink-0">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {selectedDocument.document_type === "resume"
                          ? "📄"
                          : "📝"}
                      </span>
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {selectedDocument.extracted_title ||
                            "Untitled Document"}
                        </h3>
                        <p className="text-sm text-gray-400">
                          {selectedDocument.document_type === "resume"
                            ? "Resume"
                            : "Cover Letter"}{" "}
                          •
                          {formatDate(
                            selectedDocument.created_at ||
                              selectedDocument.favorited_at
                          )}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={downloadPDF}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                    >
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
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      Download PDF
                    </button>
                  </div>

                  {/* Document Preview */}
                  <div className="bg-white flex-1">
                    <iframe
                      id="document-preview"
                      className="w-full h-full"
                      title="Document Preview"
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-gray-800 rounded-xl border border-gray-700 h-[700px] flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <div className="text-6xl mb-4">📄</div>
                    <h3 className="text-xl font-semibold mb-2">
                      No Document Selected
                    </h3>
                    <p>Choose a document from the list to preview it here</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedDocuments;
