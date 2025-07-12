import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Chat from "../components/Chat";
import How from "../pages/How";
import Navbar from "../components/Navbar";

function Main() {
  const [conversation, setConversation] = useState([]);
  const [showATSTooltip, setShowATSTooltip] = useState(false);
  const [showATSTooltip2, setShowATSTooltip2] = useState(false);
  const [animateUnderline, setAnimateUnderline] = useState(false);

  useEffect(() => {
    // Trigger the underline animation after component mounts
    const timer = setTimeout(() => {
      setAnimateUnderline(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full min-h-screen bg-gray-900 text-gray-100">
      <Navbar />
      <div className="w-full flex justify-center items-center px-5 py-10 mt-14">
        <div className="flex-1 text-center max-w-4xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent leading-tight mb-6">
            Tailor-Made Resumes & Cover Letters
            <br />
            in{" "}
            <span className="relative inline-block">
              Seconds
              <span
                className={`absolute left-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-500 transition-all duration-1000 ease-out ${
                  animateUnderline ? "w-full" : "w-0"
                }`}
                style={{ bottom: "-6px" }}
              ></span>
            </span>
          </h1>
          <p className="text-lg md:text-xl leading-relaxed text-gray-300 mt-4 text-center max-w-3xl mx-auto">
            Upload your resume and job description. We'll{" "}
            <span className="text-purple-400 font-semibold">align</span> your
            experience with what employers are looking for, creating an
            application that stands out.
          </p>
          <div className="mt-8">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 border border-transparent rounded-full hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
      <Chat conversation={conversation} setConversation={setConversation} />
    </div>
  );
}

export default Main;
