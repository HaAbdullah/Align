import React, { useState } from "react";
import { Link } from "react-router-dom";
import Chat from "../components/Chat";
import How from "../pages/How";
import Navbar from "../components/Navbar";
// import HeroImage from "../assets/hero1.jpg";
// import HeroImage2 from "../assets/hero2.jpg";
// import HeroImage3 from "../assets/hero3.jpg";
import "../styles/Main.css";

function Main() {
  // State for conversation history
  const [conversation, setConversation] = useState([]);
  const [showATSTooltip, setShowATSTooltip] = useState(false);
  const [showATSTooltip2, setShowATSTooltip2] = useState(false);

  return (
    <div className="claude-chat-container">
      <Navbar />
      <div className="jobfit-hero-section">
        <div className="jobfit-content">
          <h3 className="jobfit-tagline">One-Click Career Upgrade</h3>
          <h1 className="jobfit-title">
            Tailor-Made Resumes & Cover Letters
            <br />
            in <span className="jobfit-highlight">Seconds</span>
          </h1>
          <h3 className="jobfit-tagline">
            JobFitt makes your job application stand out
          </h3>

          <p className="jobfit-description">
            Upload your latest / best resumes and the job you want - JobFit
            creates a customized resume, cover letter, company research and
            interview prep for you!
          </p>
          <Link to="/signup" className="jobfit-signup-button">
            Sign Up
          </Link>
        </div>
        {/* <div className="jobfit-image">
          <img src={HeroImage} alt="JobFit Hero" />
        </div> */}
      </div>

      <Chat conversation={conversation} setConversation={setConversation} />

      <div className="bg-white dark:bg-gray-900 py-16 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"></div>
        <div className="flex flex-col md:flex-row items-center">
          {/* Left Image Area */}
          <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
            {/* <img
              src={HeroImage2}
              alt="JobFitt.ai career optimization"
              className="rounded-lg shadow-lg object-cover max-h-90 w-full"
            /> */}
          </div>

          {/* Right Content Area */}
          <div className="md:w-1/2 relative">
            <div className="relative z-10 p-8 rounded-lg transition-colors text-left">
              {/* New Orange Tagline */}
              <p className="text-xl font-semibold text-orange-600 dark:text-orange-400 mb-2">
                Resumes Customized to Perfection
              </p>

              {/* Updated Green Headline */}
              <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-gradient-to-r from-green-600 via-green-700 to-green-800 bg-clip-text dark:text-transparent dark:bg-gradient-to-r dark:from-blue-500 dark:via-purple-500 dark:to-pink-500 dark:bg-clip-text mb-2 transition-colors">
                One-Click Career Upgrade – ATS -Ready for Top Selection
              </h1>

              {/* Bottom Orange Tagline, stacked just like in first hero */}
              <p className="text-2xl font-semibold text-orange-600 dark:text-orange-400 mb-4">
                JobFitt makes your job application stand out.
              </p>

              {/* ATS Button */}
              <div className="mb-4">
                <button
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline cursor-pointer relative transition-colors"
                  onMouseEnter={() => setShowATSTooltip(true)}
                  onMouseLeave={() => setShowATSTooltip(false)}
                  onClick={() => setShowATSTooltip(!showATSTooltip)}
                >
                  *What is ATS?
                  {showATSTooltip && (
                    <div className="absolute top-6 left-0 z-20 w-64 p-3 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded shadow-lg transition-colors">
                      Employers use AI/ML-powered ATS to screen resumes.
                      JobFitt's ATS-optimized CVs ensure you get shortlisted.
                    </div>
                  )}
                </button>
              </div>

              <Link
                to="/signup"
                className="inline-block mt-5 px-6 py-3 font-semibold text-white bg-[#074b3c] rounded-full shadow-md transition-all duration-300 hover:bg-[#063f33] hover:-translate-y-0.5 dark:bg-gradient-to-r dark:from-[#4a6bff] dark:via-[#8a64ff] dark:to-[#e85f88] dark:text-white dark:shadow-[0_4px_12px_rgba(255,255,255,0.1)] dark:hover:opacity-90"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 py-16 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center">
            {/* Left Content Area */}
            <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8 relative">
              <div className="relative z-10 p-8 rounded-lg transition-colors text-left">
                {/* New Orange Tagline */}
                <p className="text-xl font-semibold text-orange-600 dark:text-orange-400 mb-2">
                  More Job Apps - in Less Time
                </p>

                {/* Main Headline - Same styling as original */}
                <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-gradient-to-r from-green-600 via-green-700 to-green-800 bg-clip-text dark:text-transparent dark:bg-gradient-to-r dark:from-blue-500 dark:via-purple-500 dark:to-pink-500 dark:bg-clip-text mb-2 transition-colors">
                  JobFitt streamlines your job search process.
                </h1>

                {/* Bottom Orange Tagline */}
                <p className="text-2xl font-semibold text-orange-600 dark:text-orange-400 mb-4">
                  Drop in your best resume and target role—JobFit delivers an
                  ATS-ready custom resume, cover letter, company deep-dive, and
                  mock interview guide.
                </p>

                <Link
                  to="/how"
                  className="inline-block mt-5 px-6 py-3 font-semibold text-white bg-[#074b3c] rounded-full shadow-md transition-all duration-300 hover:bg-[#063f33] hover:-translate-y-0.5 dark:bg-gradient-to-r dark:from-[#4a6bff] dark:via-[#8a64ff] dark:to-[#e85f88] dark:text-white dark:shadow-[0_4px_12px_rgba(255,255,255,0.1)] dark:hover:opacity-90"
                >
                  Learn More
                </Link>
              </div>
            </div>

            {/* Right Image Area */}
            <div className="md:w-1/2">
              {/* <img
                src={HeroImage3}
                alt="JobFitt.ai career optimization"
                className="rounded-lg shadow-lg object-cover max-h-90 w-full"
              /> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Main;
