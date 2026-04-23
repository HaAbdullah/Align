import React from "react";
import { Helmet } from "react-helmet-async";
import SEO from "../components/SEO";
// import HeroImage from "../assets/hero2.jpg";

const How = () => {
  return (
    <div className="bg-gray-900 py-16">
      <SEO
        title="How It Works: AI Resume Tailoring in 4 Steps"
        description="Upload your resume, paste the job description, and Align's AI rewrites your application in under 60 seconds using Jake's resume template."
        canonicalPath="/how"
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "HowTo",
          "name": "How to Tailor Your Resume with AI Using Align",
          "description": "Generate ATS-optimized, tailored resumes using Jake's resume template in under 60 seconds.",
          "totalTime": "PT1M",
          "step": [
            { "@type": "HowToStep", "position": 1, "name": "Upload Your Resume(s)", "text": "Upload up to 3 resume versions. Align analyzes your career from multiple angles to choose the strongest points for each application." },
            { "@type": "HowToStep", "position": 2, "name": "Add the Job Description", "text": "Paste the job posting. Align extracts responsibilities, ATS keywords, must-have skills, and role-specific tone." },
            { "@type": "HowToStep", "position": 3, "name": "Intelligent Matching and Rewrite", "text": "AI rewrites your resume using Jake's resume template, emphasizing relevant experience and optimizing for ATS filters." },
            { "@type": "HowToStep", "position": 4, "name": "Download and Apply Confidently", "text": "Receive a tailored resume and cover letter in under 60 seconds, ready to upload to job portals." }
          ]
        })}</script>
      </Helmet>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text mb-12">
          How Align Works: AI Resume Tailoring in 4 Steps
        </h1>
        <div className="bg-gray-800 rounded-lg shadow-lg shadow-emerald-500/5 p-8 mb-8">
          <div className="mb-12">
            <div className="inline-block px-4 py-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-full mb-4 shadow-sm">
              Step 1
            </div>
            <h2 className="text-2xl font-bold mb-4 text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text">
              Upload Your Resume(s)
            </h2>
            <p className="text-lg mb-4 text-gray-300">
              You can upload up to 3 versions of your resume — versions you've
              created for different roles or highlight different experiences.
            </p>
            <div className="bg-emerald-900/20 border-l-4 border-emerald-500 p-4 rounded transition-colors">
              <p className="font-semibold text-gray-50">
                Why?
              </p>
              <p className="text-gray-300">
                We use multiple natural language models to analyze your career
                from different angles. This gives Align more flexibility in
                choosing the strongest points for each unique application.
              </p>
            </div>
          </div>

          <div className="mb-12">
            <div className="inline-block px-4 py-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-full mb-4 shadow-sm">
              Step 2
            </div>
            <h2 className="text-2xl font-bold mb-4 text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text">
              Add the Job Description
            </h2>
            <p className="text-lg mb-4 text-gray-300">
              Upload the job posting or paste it in directly. We break it down
              using a combination of custom-trained models and parsing
              algorithms.
            </p>
            <div className="bg-emerald-900/20 border-l-4 border-emerald-500 p-4 rounded transition-colors">
              <p className="font-semibold text-gray-50">
                What we extract:
              </p>
              <div className="mt-2 text-gray-300">
                <p>Key responsibilities and must-have skills</p>
                <p>Keywords used by recruiters and ATS bots</p>
                <p>Role-specific tone, industry jargon, and priorities</p>
              </div>
            </div>
          </div>

          <div className="mb-12">
            <div className="inline-block px-4 py-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-full mb-4 shadow-sm">
              Step 3
            </div>
            <h2 className="text-2xl font-bold mb-4 text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text">
              Intelligent Matching & Rewrite
            </h2>
            <p className="text-lg mb-4 text-gray-300">
              Once we've analyzed your resumes and the job, our system goes to
              work:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="bg-emerald-900/20 p-5 rounded-lg transition-colors">
                <div className="text-2xl mb-2">🤖</div>
                <h3 className="font-semibold mb-2 text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text">
                  AI-Powered Tailoring
                </h3>
                <p className="text-gray-300">
                  We use a mix of language models, including GPT-based and
                  transformer-based custom models, to generate a resume and
                  cover letter that speak directly to the role.
                </p>
              </div>
              <div className="bg-emerald-900/20 p-5 rounded-lg transition-colors">
                <div className="text-2xl mb-2">🧠</div>
                <h3 className="font-semibold mb-2 text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text">
                  Strength Prioritization
                </h3>
                <p className="text-gray-300">
                  We emphasize your most relevant experiences, keywords, and
                  quantifiable achievements for that specific job.
                </p>
              </div>
              <div className="bg-emerald-900/20 p-5 rounded-lg transition-colors">
                <div className="text-2xl mb-2">🧾</div>
                <h3 className="font-semibold mb-2 text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text">
                  ATS Optimization
                </h3>
                <p className="text-gray-300">
                  We scan and format your documents to pass through applicant
                  tracking systems, so you don't get filtered out before a human
                  sees your name.
                </p>
              </div>
            </div>
          </div>

          <div className="mb-12">
            <div className="inline-block px-4 py-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-full mb-4 shadow-sm">
              Step 4
            </div>
            <h2 className="text-2xl font-bold mb-4 text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text">
              Download and Apply Confidently
            </h2>
            <p className="text-lg mb-4 text-gray-300">
              In under 60 seconds, you'll receive:
            </p>
            <div className="mb-4 text-gray-300">
              <p>A tailored resume aligned with the job's expectations</p>
              <p>A custom-written, well-formatted cover letter</p>
              <p>Files ready to upload to job portals or send directly</p>
            </div>
            <div className="bg-emerald-900/20 border-l-4 border-emerald-500 p-4 rounded transition-colors">
              <p className="font-semibold text-gray-50">
                Want to edit or fine-tune?
              </p>
              <p className="text-gray-300">
                You'll get clean, editable files so you can tweak anything
                before sending.
              </p>
            </div>
          </div>
        </div>

        {/* New Interview Prep Section */}
        <div className="bg-gray-800 rounded-lg shadow-lg shadow-emerald-500/5 p-8 mb-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text mb-4">
              Get Ready for the Interview
            </h2>
            <p className="text-lg text-gray-300">
              Your application is just the beginning. We prepare you for what
              comes next.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-emerald-900/20 p-6 rounded-lg transition-colors text-center">
              <div className="text-3xl mb-4">🔍</div>
              <h3 className="font-semibold mb-3 text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text">
                In-Depth Keyword Analysis
              </h3>
              <p className="text-gray-300">
                Discover the exact keywords and phrases that matter most for
                your role. Understand what recruiters and hiring managers are
                looking for.
              </p>
            </div>

            <div className="bg-emerald-900/20 p-6 rounded-lg transition-colors text-center">
              <div className="text-3xl mb-4">📊</div>
              <h3 className="font-semibold mb-3 text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text">
                Market Insights
              </h3>
              <p className="text-gray-300">
                Get comprehensive market analysis including salary ranges,
                industry trends, and competitive landscape for your target role.
              </p>
            </div>

            <div className="bg-emerald-900/20 p-6 rounded-lg transition-colors text-center">
              <div className="text-3xl mb-4">🏢</div>
              <h3 className="font-semibold mb-3 text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text">
                Company Research Insights
              </h3>
              <p className="text-gray-300">
                Deep dive into company culture, recent news, leadership, values,
                and strategic initiatives to help you stand out in interviews.
              </p>
            </div>

            <div className="bg-emerald-900/20 p-6 rounded-lg transition-colors text-center">
              <div className="text-3xl mb-4">❓</div>
              <h3 className="font-semibold mb-3 text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text">
                Custom Interview Questions
              </h3>
              <p className="text-gray-300">
                Practice with role-specific interview questions tailored to the
                job description and company. Get ready for behavioral and
                technical questions.
              </p>
            </div>
          </div>

          <div className="mt-8 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-6 rounded-lg text-center">
            <h3 className="text-xl font-semibold text-white mb-2">
              Complete Interview Preparation Suite
            </h3>
            <p className="text-green-100 dark:text-gray-200">
              From application to offer - we provide everything you need to
              succeed in today's competitive job market.
            </p>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-2xl font-semibold text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text">
            From Resume to Interview — We've Got You Covered. Tailored resumes,
            keyword-matched cover letters, culture insights, and company
            research — all designed to pass ATS filters and land interviews.
          </p>
        </div>
      </div>
    </div>
  );
};

export default How;
