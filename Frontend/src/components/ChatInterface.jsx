import React, { useState, useRef, useEffect } from "react";
import sendIcon from "../assets/send.svg";

function ChatInterface({
  onSendMessage,
  isLoading,
  currentDocumentType,
  onUpdateDocument,
  currentDocument,
}) {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isTextareaFocused, setIsTextareaFocused] = useState(false);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    // Add initial system message when chat opens
    setChatHistory([
      {
        role: "system",
        content: `Your ${currentDocumentType} has been generated! How would you like to improve it?`,
      },
    ]);
  }, [currentDocumentType]);

  useEffect(() => {
    // Scroll to bottom when chat history updates
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleSendMessage = async () => {
    if (!message.trim() || isChatLoading) return;

    const userMessage = message.trim();
    setMessage("");

    // Update chat history with user message
    const updatedHistory = [
      ...chatHistory,
      { role: "user", content: userMessage },
    ];
    setChatHistory(updatedHistory);

    // Set loading state
    setIsChatLoading(true);

    try {
      // Add a loading message
      setChatHistory((prev) => [
        ...prev,
        {
          role: "system",
          content: "Processing your feedback...",
          isLoading: true,
        },
      ]);

      // Create the prompt with the current document and user feedback
      const feedbackPrompt = `
USER FEEDBACK:
${userMessage}

CURRENT ${currentDocumentType.toUpperCase()}:
${currentDocument}
      `;

      // Send message for processing
      const updatedDocument = await onSendMessage(feedbackPrompt);

      // Remove loading message and add response
      setChatHistory((prev) => {
        const history = prev.filter((msg) => !msg.isLoading);
        return [
          ...history,
          {
            role: "system",
            content: "Your feedback has been applied to the document!",
          },
        ];
      });

      // Trigger document update in parent component with the updated HTML
      if (onUpdateDocument && updatedDocument) {
        onUpdateDocument(updatedDocument);
      }
    } catch (error) {
      console.error("Error processing message:", error);

      // Remove loading message and add error message
      setChatHistory((prev) => {
        const history = prev.filter((msg) => !msg.isLoading);
        return [
          ...history,
          {
            role: "system",
            content:
              "Sorry, there was an error processing your feedback. Please try again.",
            error: true,
          },
        ];
      });
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Suggested feedback options
  const suggestedFeedback = [
    {
      type: "resume",
      suggestions: [
        "Make it more concise",
        "Emphasize my leadership skills",
        "Highlight my technical expertise",
        "Better align with the job requirements",
      ],
    },
    {
      type: "cover letter",
      suggestions: [
        "Make it more personalized",
        "Highlight my passion for the industry",
        "Address why I'm a good cultural fit",
        "Make it more concise",
      ],
    },
  ];

  // Get suggestions based on current document type
  const currentSuggestions =
    suggestedFeedback.find((item) => item.type === currentDocumentType)
      ?.suggestions || [];

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 mb-6 font-inter">
      {/* Chat Header with Gradient */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white p-4 rounded-t-xl">
        <h3 className="text-lg font-semibold text-center">
          Improve Your{" "}
          {currentDocumentType.charAt(0).toUpperCase() +
            currentDocumentType.slice(1)}
        </h3>
        <p className="text-emerald-100 text-sm text-center mt-1">
          Tell us how you'd like to enhance your document
        </p>
      </div>

      {/* Chat Container */}
      <div className="bg-gray-800 border-l border-r border-gray-700 flex flex-col h-80">
        {/* Messages Area */}
        <div
          className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800"
          ref={chatContainerRef}
        >
          {chatHistory.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                  msg.role === "user"
                    ? "bg-emerald-600 text-white rounded-br-md"
                    : msg.error
                    ? "bg-red-900/50 border border-red-500 text-red-200 rounded-bl-md"
                    : msg.isLoading
                    ? "bg-gray-700 text-gray-300 rounded-bl-md"
                    : "bg-gray-700 text-gray-200 rounded-bl-md"
                } transition-all duration-200`}
              >
                <div className="flex items-center">
                  {msg.isLoading && (
                    <div className="w-4 h-4 border-2 border-gray-500 border-t-emerald-500 rounded-full animate-spin mr-3 flex-shrink-0"></div>
                  )}
                  <span className="text-sm leading-relaxed">{msg.content}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Suggestion Chips */}
        {currentSuggestions.length > 0 && (
          <div className="p-4 bg-gray-750 border-t border-gray-700">
            <p className="text-gray-400 text-xs mb-3 font-medium">
              Quick suggestions:
            </p>
            <div className="flex gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 pb-3">
              {currentSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  className="bg-gray-700 hover:bg-gray-600 border border-gray-600 hover:border-emerald-500 text-gray-300 hover:text-white px-3 py-2 rounded-full text-sm transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 whitespace-nowrap flex-shrink-0"
                  onClick={() => {
                    setMessage(suggestion);
                    setTimeout(() => {
                      const textarea = document.querySelector(".chat-textarea");
                      if (textarea) {
                        textarea.focus();
                      }
                    }, 0);
                  }}
                  disabled={isChatLoading || isLoading}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="bg-gray-800 border border-gray-700 border-t-0 rounded-b-xl p-4">
        <div className="relative">
          {/* Gradient border background */}
          <div
            className={`absolute inset-0 bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-xl transition-opacity duration-300 ${
              isTextareaFocused ? "opacity-100" : "opacity-0"
            }`}
          ></div>

          {/* Input container */}
          <div
            className={`relative bg-gray-800 border-2 ${
              isTextareaFocused ? "border-transparent" : "border-gray-600"
            } rounded-xl overflow-hidden transition-all duration-300`}
            style={{ margin: isTextareaFocused ? "2px" : "0px" }}
          >
            <div className="flex items-center">
              <textarea
                className="chat-textarea flex-1 bg-transparent text-gray-200 placeholder-gray-500 p-4 pr-2 resize-none border-none outline-none text-sm leading-relaxed h-14"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                onFocus={() => setIsTextareaFocused(true)}
                onBlur={() => setIsTextareaFocused(false)}
                placeholder={`How would you like to improve your ${currentDocumentType}?`}
                disabled={isChatLoading || isLoading}
                rows={1}
              />
              <button
                onClick={handleSendMessage}
                disabled={!message.trim() || isChatLoading || isLoading}
                className="m-2 w-10 h-10 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 shadow-lg"
                aria-label="Send message"
              >
                <img src={sendIcon} alt="Send" className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatInterface;
