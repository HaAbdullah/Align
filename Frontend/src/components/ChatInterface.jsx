import React, { useState, useRef, useEffect } from "react";
import "../styles/ChatInterface.css";
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
    <div className="chat-interface">
      <div className="chat-header">
        <h3>
          Improve Your{" "}
          {currentDocumentType.charAt(0).toUpperCase() +
            currentDocumentType.slice(1)}
        </h3>
      </div>

      <div className="chat-container" ref={chatContainerRef}>
        {chatHistory.map((msg, index) => (
          <div
            key={index}
            className={`chat-message ${
              msg.role === "user" ? "user-message" : "system-message"
            } ${msg.isLoading ? "loading-message" : ""} ${
              msg.error ? "error-message" : ""
            }`}
          >
            <div className="message-content">
              {msg.isLoading ? (
                <>
                  <div className="mini-spinner"></div>
                  <span>{msg.content}</span>
                </>
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}
      </div>

      {currentSuggestions.length > 0 && (
        <div className="suggestion-chips">
          {currentSuggestions.map((suggestion, index) => (
            <button
              key={index}
              className="suggestion-chip"
              onClick={() => {
                setMessage(suggestion);
                // Focus on the textarea after selecting a suggestion
                setTimeout(() => {
                  const textarea = document.querySelector(
                    ".chat-input textarea"
                  );
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
      )}

      <div className="chat-input">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={`How would you like to improve your ${currentDocumentType}?`}
          disabled={isChatLoading || isLoading}
          rows={2}
        />
        <button
          onClick={handleSendMessage}
          disabled={!message.trim() || isChatLoading || isLoading}
          className="send-button"
          aria-label="Send message"
        >
          <img src={sendIcon} alt="Send" />
        </button>
      </div>
    </div>
  );
}

export default ChatInterface;
