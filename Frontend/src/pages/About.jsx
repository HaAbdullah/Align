import React, { useState, useEffect } from "react";
import fullLogo from "../assets/full_logo_wide.png";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
const AboutPage = () => {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();
  const [activeFeature, setActiveFeature] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [showContactOptions, setShowContactOptions] = useState(false);
  const handleGetStarted = () => {
    if (currentUser) {
      navigate("/dashboard");
    } else {
      navigate("/signup");
    }
  };
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const features = [
    {
      title: "AI-Powered Resume Optimization",
      description:
        "Our advanced AI analyzes job descriptions and tailors your resume to match exactly what employers are looking for, increasing your interview chances by up to 300%.",
      icon: "🎯",
      tech: "Claude AI Integration",
    },
    {
      title: "Intelligent Cover Letter Generation",
      description:
        "Generate personalized, compelling cover letters that tell your unique story while addressing specific job requirements and company culture.",
      icon: "✉️",
      tech: "Natural Language Processing",
    },
    {
      title: "Real-Time Document Preview",
      description:
        "See your optimized documents in real-time with our Chrome-inspired tab interface, allowing seamless switching between resume and cover letter views.",
      icon: "👁️",
      tech: "React Dynamic Rendering",
    },
    {
      title: "Interactive Chat Refinement",
      description:
        "Fine-tune your documents with our intelligent chat interface that understands context and applies improvements instantly.",
      icon: "💬",
      tech: "Conversational AI",
    },
  ];

  const advancedFeatures = [
    {
      title: "Keywords Analysis",
      description:
        "Deep keyword matching between job descriptions and your resume with detailed analysis and suggestions.",
      icon: "🔍",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      title: "Company Insights",
      description:
        "Comprehensive company research including culture, ratings, reviews, and insider perspectives.",
      icon: "🏢",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      title: "Interview Question Bank",
      description:
        "Tailored interview questions with difficulty levels and strategic hints for optimal preparation.",
      icon: "❓",
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      title: "Compensation Benchmarking",
      description:
        "Market salary data, geographic insights, and experience-level breakdowns for informed negotiations.",
      icon: "💰",
      gradient: "from-orange-500 to-red-500",
    },
  ];

  const techStack = [
    {
      name: "React",
      description: "Modern component-based architecture",
      icon: "⚛️",
    },
    { name: "Vite", description: "Lightning-fast build tool", icon: "⚡" },
    {
      name: "Tailwind CSS",
      description: "Utility-first styling system",
      icon: "🎨",
    },
    { name: "Firebase", description: "Authentication & database", icon: "🔥" },
    { name: "Claude AI", description: "Advanced language model", icon: "🧠" },
    { name: "Express.js", description: "Backend API framework", icon: "🚀" },
  ];

  const stats = [
    { number: "AI-Powered", label: "Resume Optimization", icon: "🎯" },
    { number: "4", label: "Advanced Analytics Tools", icon: "📊" },
    { number: "Real-time", label: "Document Preview", icon: "👁️" },
    { number: "Modern", label: "Tech Stack", icon: "⚡" },
  ];

  return (
    <div className="min-h-screen bg-gray-900 font-inter">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-start justify-center px-6 pt-10 pb-32">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
                               radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
                               radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.3) 0%, transparent 50%)`,
              transform: `translateY(${scrollY * 0.5}px)`,
            }}
          />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto text-center pt-20">
          {/* Main Hero Content */}
          <div className="mb-8">
            <div className="flex flex-col justify-center items-center mb-12 space-y-4">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 leading-relaxed">
                About
              </h1>
              <img
                src={fullLogo}
                alt="Align Logo"
                className="h-20 sm:h-20 md:h-24 lg:h-28 w-auto object-contain"
              />
            </div>

            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              The future of job applications is here. Align uses cutting-edge AI
              to transform your resume and cover letter into{" "}
              <span className="text-emerald-400 font-semibold">
                interview magnets
              </span>
            </p>
          </div>

          {/* Glassy Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-16">
            {stats.map((stat, index) => (
              <div key={index} className="relative group">
                {/* Gradient Border */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 rounded-2xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>

                {/* Card Content */}
                <div className="relative bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 m-0.5 transform group-hover:scale-105 transition-all duration-300">
                  <div className="text-3xl mb-2">{stat.icon}</div>
                  <div className="text-2xl md:text-2xl font-bold text-white mb-1">
                    {stat.number}
                  </div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="relative py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="relative">
            {/* Gradient Border */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 rounded-3xl opacity-75"></div>

            {/* Content */}
            <div className="relative bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-12 m-1">
              <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                  Our Mission
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-emerald-400 to-blue-500 mx-auto rounded-full"></div>
              </div>

              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <p className="text-lg text-gray-300 leading-relaxed mb-6">
                    Stop wasting time with generic resumes that get lost in the
                    ATS black hole. Align empowers job seekers to create{" "}
                    <span className="text-emerald-400 font-semibold">
                      perfectly tailored applications
                    </span>{" "}
                    that speak directly to what employers want.
                  </p>
                  <p className="text-lg text-gray-300 leading-relaxed">
                    Built by a computer science student who understands the
                    modern job market's challenges, Align combines cutting-edge
                    AI with beautiful design to give you the competitive edge
                    you deserve.
                  </p>
                </div>

                <div className="relative">
                  <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/30">
                    <div className="text-center">
                      <div className="text-6xl mb-4">🎯</div>
                      <h3 className="text-2xl font-bold text-white mb-4">
                        Perfect Match
                      </h3>
                      <p className="text-gray-400">
                        Every resume optimized to match specific job
                        requirements with surgical precision.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Core Features
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Powerful AI-driven tools designed to maximize your job application
              success rate
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="relative group cursor-pointer"
                onMouseEnter={() => setActiveFeature(index)}
              >
                {/* Gradient Border */}
                <div
                  className={`absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 rounded-2xl transition-opacity duration-300 ${
                    activeFeature === index
                      ? "opacity-100"
                      : "opacity-0 group-hover:opacity-75"
                  }`}
                ></div>

                {/* Card Content */}
                <div className="relative bg-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 m-0.5 transform group-hover:scale-105 transition-all duration-300">
                  <div className="flex items-start space-x-4">
                    <div className="text-4xl">{feature.icon}</div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-white mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-gray-300 leading-relaxed mb-4">
                        {feature.description}
                      </p>
                      <div className="inline-block bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-sm font-medium">
                        {feature.tech}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Advanced Analytics Section */}
      <section className="py-16 px-6 bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Advanced Analytics
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Go beyond basic optimization with comprehensive job market
              insights
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {advancedFeatures.map((feature, index) => (
              <div key={index} className="group">
                <div className="relative h-full">
                  {/* Gradient Border */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                  ></div>

                  {/* Card Content */}
                  <div className="relative bg-gray-800/60 backdrop-blur-xl border border-gray-700/30 rounded-2xl p-6 m-0.5 h-full transform group-hover:scale-105 transition-all duration-300">
                    <div className="text-center">
                      <div className="text-4xl mb-4">{feature.icon}</div>
                      <h3 className="text-xl font-bold text-white mb-3">
                        {feature.title}
                      </h3>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Built with Modern Technology
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Cutting-edge tools and frameworks powering a seamless user
              experience
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {techStack.map((tech, index) => (
              <div key={index} className="group">
                <div className="relative">
                  {/* Gradient Border */}
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  {/* Card Content */}
                  <div className="relative bg-gray-800/40 backdrop-blur-xl border border-gray-700/30 rounded-2xl p-6 m-0.5 transform group-hover:scale-105 transition-all duration-300">
                    <div className="flex items-center space-x-4">
                      <div className="text-3xl">{tech.icon}</div>
                      <div>
                        <h3 className="text-lg font-bold text-white">
                          {tech.name}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          {tech.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Developer Section */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Gradient Border */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 rounded-3xl opacity-75"></div>

            {/* Content */}
            <div className="relative bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-12 m-1">
              <div className="text-center">
                <div className="text-6xl mb-6">🚀</div>
                <h2 className="text-4xl font-bold text-white mb-6">
                  Looking to Hire?
                </h2>
                <p className="text-lg text-gray-300 leading-relaxed mb-8 max-w-2xl mx-auto">
                  Align was built from the ground up by a driven computer
                  science student who understands both the technical challenges
                  of modern development and the real-world problems job seekers
                  face. This project showcases full-stack expertise, AI
                  integration, and product thinking.
                </p>

                <div className="grid md:grid-cols-3 gap-6 mt-12">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-400">
                      Full-Stack
                    </div>
                    <div className="text-gray-400">React, Node.js, AI APIs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">
                      Problem Solver
                    </div>
                    <div className="text-gray-400">Real-world solutions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">
                      Growth Mindset
                    </div>
                    <div className="text-gray-400">Always learning</div>
                  </div>
                </div>

                <div className="mt-12">
                  <button
                    onClick={() => setShowContactOptions(!showContactOptions)}
                    className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-lg inline-flex items-center gap-3"
                  >
                    <span>Let's Connect</span>
                    <span
                      className={`transition-transform duration-300 ${
                        showContactOptions ? "rotate-180" : ""
                      }`}
                    >
                      💼
                    </span>
                  </button>

                  {/* Animated Contact Options */}
                  <div
                    className={`mt-6 transition-all duration-500 ease-in-out ${
                      showContactOptions
                        ? "opacity-100 transform translate-y-0 max-h-32"
                        : "opacity-0 transform -translate-y-4 max-h-0 overflow-hidden"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      {/* LinkedIn */}
                      <a
                        href="https://www.linkedin.com/in/abdullah-hasanjee/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 hover:border-blue-400 text-blue-300 hover:text-white font-semibold py-3 px-6 rounded-full transition-all duration-300 transform hover:scale-105 inline-flex items-center gap-3"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                        <span>LinkedIn</span>
                      </a>

                      {/* Email */}
                      <a
                        href="mailto:abdullah.hasanjee@gmail.com"
                        className="group relative bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/30 hover:border-emerald-400 text-emerald-300 hover:text-white font-semibold py-3 px-6 rounded-full transition-all duration-300 transform hover:scale-105 inline-flex items-center gap-3"
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
                            d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                        <span>Email</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Job Search?
          </h2>
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
            Join thousands of successful job seekers who've elevated their
            applications with Align
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              {currentUser ? "Go to Dashboard" : "Start Free Today"}
            </button>
            <Link
              to="/dashboard"
              className="border-2 border-emerald-500 text-emerald-400 hover:bg-emerald-500 hover:text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105"
            >
              Try Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Floating Elements */}
      <div className="fixed top-1/4 left-10 w-20 h-20 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl animate-pulse hidden lg:block"></div>
      <div
        className="fixed bottom-1/4 right-10 w-32 h-32 bg-gradient-to-r from-pink-500/20 to-orange-500/20 rounded-full blur-xl animate-pulse hidden lg:block"
        style={{ animationDelay: "1s" }}
      ></div>
    </div>
  );
};

export default AboutPage;
