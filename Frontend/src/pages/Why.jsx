import React, { useState } from "react";

const Why = () => {
  const [showATSTooltip1, setShowATSTooltip1] = useState(false);
  const [showATSTooltip2, setShowATSTooltip2] = useState(false);
  const [showATSTooltip3, setShowATSTooltip3] = useState(false);

  return (
    <div className="pt-24 pb-16 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-green-800 dark:text-transparent dark:bg-gradient-to-r dark:from-blue-500 dark:via-purple-500 dark:to-pink-500 dark:bg-clip-text mb-4 transition-colors">
            Most People Use One Resume for Every Job. That's Why They Don't Get
            Interviews.
          </h1>
          <p className="text-xl font-medium mb-6 text-gray-900 dark:text-gray-200 transition-colors">
            <strong>JobFit fixes that.</strong> We help you stand out by
            tailoring your application to <em>each</em> job you apply to—without
            the hours of rewriting.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-12 transition-colors">
          <h2 className="text-2xl font-bold text-green-800 dark:text-transparent dark:bg-gradient-to-r dark:from-blue-500 dark:via-purple-500 dark:to-pink-500 dark:bg-clip-text mb-6 transition-colors">
            Why it works:
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-4">
                <span className="text-3xl">🧠</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-200 transition-colors">
                  Smarter Matching
                </h3>
                <p className="text-gray-700 dark:text-gray-300 transition-colors">
                  We analyze the job posting and your resume to surface what
                  matters most for that role, ensuring your application beats
                  the{" "}
                  <button
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline cursor-pointer relative transition-colors"
                    onMouseEnter={() => setShowATSTooltip1(true)}
                    onMouseLeave={() => setShowATSTooltip1(false)}
                    onClick={() => setShowATSTooltip1(!showATSTooltip1)}
                  >
                    ATS*
                    {showATSTooltip1 && (
                      <div className="absolute top-6 left-0 z-20 w-64 p-3 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded shadow-lg transition-colors">
                        Employers use AI/ML-powered ATS to screen resumes.
                        JobFit's ATS-optimized CVs ensure you get shortlisted.
                      </div>
                    )}
                  </button>
                  .
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 mr-4">
                <span className="text-3xl">✏️</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-200 transition-colors">
                  Custom-Written, Every Time
                </h3>
                <p className="text-gray-700 dark:text-gray-300 transition-colors">
                  No templates, no fill-in-the-blanks. Your new resume and cover
                  letter are written from scratch tailored for the job you
                  choose, beating the{" "}
                  <button
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline cursor-pointer relative transition-colors"
                    onMouseEnter={() => setShowATSTooltip2(true)}
                    onMouseLeave={() => setShowATSTooltip2(false)}
                    onClick={() => setShowATSTooltip2(!showATSTooltip2)}
                  >
                    ATS*
                    {showATSTooltip2 && (
                      <div className="absolute top-6 left-0 z-20 w-64 p-3 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded shadow-lg transition-colors">
                        Employers use AI/ML-powered ATS to screen resumes.
                        JobFit's ATS-optimized CVs ensure you get shortlisted.
                      </div>
                    )}
                  </button>
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 mr-4">
                <span className="text-3xl">⚡</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-200 transition-colors">
                  Fast and Simple
                </h3>
                <p className="text-gray-700 dark:text-gray-300 transition-colors">
                  Upload → Match → Download. All in under a minute.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 mr-4">
                <span className="text-3xl">🎯</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-200 transition-colors">
                  Built for Real Job Seekers
                </h3>
                <p className="text-gray-700 dark:text-gray-300 transition-colors">
                  Whether you're applying to 1 job or 100, JobFit helps you show
                  your best self—every time, with{" "}
                  <button
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline cursor-pointer relative transition-colors"
                    onMouseEnter={() => setShowATSTooltip3(true)}
                    onMouseLeave={() => setShowATSTooltip3(false)}
                    onClick={() => setShowATSTooltip3(!showATSTooltip3)}
                  >
                    ATS-optimized*
                    {showATSTooltip3 && (
                      <div className="absolute top-6 left-0 z-20 w-64 p-3 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded shadow-lg transition-colors">
                        Employers use AI/ML-powered ATS to screen resumes.
                        JobFit's ATS-optimized CVs ensure you get shortlisted.
                      </div>
                    )}
                  </button>{" "}
                  applications.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Interview Preparation Section */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-lg shadow-lg p-8 mb-12 transition-colors border border-blue-100 dark:border-gray-600">
          <h2 className="text-2xl font-bold text-green-800 dark:text-transparent dark:bg-gradient-to-r dark:from-blue-500 dark:via-purple-500 dark:to-pink-500 dark:bg-clip-text mb-6 transition-colors">
            But getting the interview is just the beginning...
          </h2>

          <p className="text-lg text-gray-800 dark:text-gray-200 mb-8 transition-colors">
            <strong>JobFit's AI doesn't stop at your resume.</strong> We prepare
            you for what comes next with comprehensive interview preparation
            tools.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md transition-colors">
              <div className="flex items-center mb-4">
                <span className="text-3xl mr-3">🏢</span>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200 transition-colors">
                  Company Deep Dive
                </h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 transition-colors">
                Get AI-powered insights into company culture, recent news,
                values, and mission to speak their language in your interview.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md transition-colors">
              <div className="flex items-center mb-4">
                <span className="text-3xl mr-3">❓</span>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200 transition-colors">
                  Practice Questions
                </h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 transition-colors">
                Role-specific interview questions with AI-generated sample
                answers based on your background and the job requirements.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md transition-colors">
              <div className="flex items-center mb-4">
                <span className="text-3xl mr-3">🎭</span>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200 transition-colors">
                  Mock Interviews
                </h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 transition-colors">
                AI-powered practice sessions that simulate real interviews,
                complete with feedback on your responses and areas for
                improvement.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md transition-colors">
              <div className="flex items-center mb-4">
                <span className="text-3xl mr-3">💡</span>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200 transition-colors">
                  Smart Questions to Ask
                </h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 transition-colors">
                Thoughtful, role-specific questions that show you've done your
                research and are genuinely interested in the opportunity.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md transition-colors">
              <div className="flex items-center mb-4">
                <span className="text-3xl mr-3">📊</span>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200 transition-colors">
                  Success Strategies
                </h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 transition-colors">
                Personalized tips on how to highlight your unique strengths and
                address potential concerns for this specific role.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md transition-colors">
              <div className="flex items-center mb-4">
                <span className="text-3xl mr-3">🔍</span>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200 transition-colors">
                  Industry Insights
                </h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 transition-colors">
                Stay current with industry trends, challenges, and opportunities
                that you can reference during your interview.
              </p>
            </div>
          </div>
        </div>

        {/* Market Intelligence Section */}
        <div className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-gray-800 dark:to-gray-700 rounded-lg shadow-lg p-8 mb-12 transition-colors border border-green-100 dark:border-gray-600">
          <h2 className="text-2xl font-bold text-green-800 dark:text-transparent dark:bg-gradient-to-r dark:from-blue-500 dark:via-purple-500 dark:to-pink-500 dark:bg-clip-text mb-6 transition-colors">
            Know your worth with AI-powered market intelligence
          </h2>

          <p className="text-lg text-gray-800 dark:text-gray-200 mb-8 transition-colors">
            Make informed decisions with comprehensive market data and
            compensation insights tailored to your role, experience, and
            location.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-4">
                  <span className="text-3xl">💰</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-200 transition-colors">
                    Compensation Research
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 transition-colors">
                    Get real-time salary data, bonus structures, and total
                    compensation packages for your target roles across different
                    companies and locations.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 mr-4">
                  <span className="text-3xl">📈</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-200 transition-colors">
                    Market Trends
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 transition-colors">
                    Understand which skills are in demand, emerging job titles,
                    and how the market is evolving in your field.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-4">
                  <span className="text-3xl">🎯</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-200 transition-colors">
                    Negotiation Insights
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 transition-colors">
                    AI-powered recommendations on salary negotiation strategies,
                    including when and how to ask for more based on market data.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 mr-4">
                  <span className="text-3xl">🌍</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-200 transition-colors">
                    Location Intelligence
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 transition-colors">
                    Compare opportunities across different cities, including
                    cost of living adjustments and remote work implications.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-2xl font-semibold text-green-800 dark:text-transparent dark:bg-gradient-to-r dark:from-blue-500 dark:via-purple-500 dark:to-pink-500 dark:bg-clip-text transition-colors">
            Smart Tools for Serious Job Seekers. From custom resumes and cover
            letters to interview prep and market insights — all optimized to
            beat ATS and boost your chances every step of the way.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Why;
