import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FileText, Mail, BarChart2, CheckCircle, Star } from "lucide-react";
import Chat from "../components/Chat";
import Footer from "../components/Footer";
import SEO from "../components/SEO";

const TESTIMONIALS = [
  {
    quote:
      "I sent out 40 applications over 3 months with zero callbacks. Used Align on a Monday, had two interviews by Wednesday. The resume it generated matched the job posting so precisely it felt unfair.",
    name: "Marcus T.",
    role: "Software Engineer",
    company: "Shopify",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
  },
  {
    quote:
      "Switching careers from finance to product management felt impossible. My resume never felt right. Align restructured my experience around PM skills in the exact language the companies were looking for. Got my first PM role within 6 weeks.",
    name: "Priya S.",
    role: "Product Manager",
    company: "Stripe",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face",
  },
  {
    quote:
      "I'm a recent CS grad competing against people with way more experience. Align helped me reframe every project and internship to sound like exactly what the company needed. 3 offers, took the best one.",
    name: "Jordan K.",
    role: "Junior Developer",
    company: "Series B Startup",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=80&h=80&fit=crop&crop=face",
  },
];

const FEATURES = [
  {
    icon: <FileText className="w-6 h-6 text-emerald-400" />,
    title: "ATS-Optimized Resumes",
    description:
      "Every resume is generated using Jake's resume template, the LaTeX-based format trusted by engineers at top tech companies to pass Applicant Tracking Systems.",
  },
  {
    icon: <Mail className="w-6 h-6 text-emerald-400" />,
    title: "AI Cover Letters",
    description:
      "Personalized cover letters written to match the tone, priorities, and culture of each specific job posting. Not a template. A real letter for that specific role.",
  },
  {
    icon: <BarChart2 className="w-6 h-6 text-emerald-400" />,
    title: "Interview Intelligence",
    description:
      "Keywords analysis, company insights, interview question bank, and salary benchmarking. Everything you need from application to offer.",
  },
];

const PRICING_PREVIEW = [
  {
    name: "Freemium",
    price: "$0",
    period: "forever",
    highlight: false,
    features: ["2 resume + cover letter generations/mo", "Keyword analysis", "ATS optimization"],
  },
  {
    name: "Basic",
    price: "$5",
    period: "/month",
    highlight: true,
    badge: "Most Popular",
    features: ["5 generations/month", "Resume saving", "Company insights", "Interview question bank"],
  },
  {
    name: "Premium",
    price: "$10",
    period: "/month",
    highlight: false,
    features: ["10 generations/month", "All Basic features", "Enhanced company analysis", "Priority support"],
  },
];

const LandingPage = () => {
  const [animateUnderline, setAnimateUnderline] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimateUnderline(true), 400);
    return () => clearTimeout(timer);
  }, []);

  const scrollToApp = (e) => {
    e.preventDefault();
    document.getElementById("try")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="w-full min-h-screen bg-gray-900 text-gray-100">
      <SEO
        title="AI Resume Builder Using Jake's Resume Template"
        description="Upload your resume and job description. Align's AI rewrites your application in seconds using Jake's resume template, ATS-optimized and recruiter-ready."
        canonicalPath="/"
      />

      {/* ── Hero ── */}
      <section className="w-full flex flex-col items-center px-5 pt-28 pb-12 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent leading-tight max-w-4xl">
          Land More Interviews{" "}
          <span className="relative inline-block">
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              in Seconds
            </span>
            <span
              className={`absolute left-0 h-0.5 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 transition-all duration-1000 ease-out ${
                animateUnderline ? "w-full" : "w-0"
              }`}
              style={{ bottom: "-4px" }}
            />
          </span>
        </h1>

        <p className="text-lg md:text-xl text-gray-300 mt-6 max-w-3xl leading-relaxed">
          Paste your resume and a job posting. Align's AI rewrites your application using{" "}
          <span className="text-emerald-400 font-semibold">Jake's resume template</span>, ATS-optimized,
          recruiter-ready, in under 60 seconds.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <a
            href="#try"
            onClick={scrollToApp}
            className="inline-flex items-center justify-center px-8 py-3 text-base font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-full transition-all duration-200 hover:scale-105 shadow-lg"
          >
            Try for Free →
          </a>
          <Link
            to="/signup"
            className="inline-flex items-center justify-center px-8 py-3 text-base font-semibold text-emerald-400 border-2 border-emerald-600 rounded-full hover:bg-emerald-600 hover:text-white transition-all duration-200 hover:scale-105"
          >
            Sign up for free
          </Link>
        </div>

        <p className="text-gray-500 text-sm mt-4">
          No credit card required · 2 free generations · Cancel anytime
        </p>
      </section>

      {/* ── Social Proof Bar ── */}
      <section className="w-full border-y border-gray-800 py-6 bg-gray-800/40">
        <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 justify-center md:justify-start">
            <span className="text-gray-400 text-sm mr-1">Trusted by job seekers at:</span>
            {["Google", "Microsoft", "Amazon", "Meta", "Apple", "Nvidia"].map((co) => (
              <span
                key={co}
                className="px-3 py-1 bg-gray-700/60 border border-gray-600/50 rounded-full text-gray-300 text-xs font-medium"
              >
                {co}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              ))}
            </div>
            <span className="text-gray-200 font-semibold text-sm">4.9/5</span>
            <span className="text-gray-400 text-sm">· Loved by 2,400+ users</span>
          </div>
        </div>
      </section>

      {/* ── Stats Row ── */}
      <section className="w-full py-12 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {[
            { stat: "10,000+", label: "Resumes Generated" },
            { stat: "78%", label: "Report more interview callbacks" },
            { stat: "< 60s", label: "Average generation time" },
          ].map(({ stat, label }) => (
            <div key={label}>
              <div className="text-4xl font-bold text-emerald-400 mb-1">{stat}</div>
              <div className="text-gray-400 text-sm">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Try It Now (THE APP) ── */}
      <section id="try" className="w-full py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white">Try it now. Paste your resume below.</h2>
            <p className="text-gray-400 text-sm mt-2">
              No account needed to generate. Sign up free to download.
            </p>
          </div>
          <Chat />
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="w-full py-16 px-4 bg-gray-800/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-white mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Upload your resume",
                desc: "Drag and drop your PDF or paste your resume text. We support up to 3 versions.",
              },
              {
                step: "2",
                title: "Paste the job description",
                desc: "Drop in the job posting. Our AI extracts keywords, skills, and tone.",
              },
              {
                step: "3",
                title: "Download & apply",
                desc: "Get a tailored resume and cover letter in under 60 seconds. Ready to send.",
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex flex-col items-center text-center gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                  {step}
                </div>
                <h3 className="text-lg font-semibold text-white">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="w-full py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-white mb-12">Real results from real job seekers</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ quote, name, role, company, avatar }) => (
              <div
                key={name}
                className="bg-gray-800 border border-gray-700 rounded-2xl p-6 flex flex-col gap-5 hover:border-gray-600 transition-colors"
              >
                <div className="flex gap-0.5 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed flex-1">"{quote}"</p>
                <div className="flex items-center gap-3">
                  <img
                    src={avatar}
                    alt={name}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0 bg-gray-700"
                  />
                  <div>
                    <p className="text-white font-semibold text-sm">{name}</p>
                    <p className="text-gray-400 text-xs">
                      {role} · {company}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="w-full py-16 px-4 bg-gray-800/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-white mb-12">Everything you need to land the job</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map(({ icon, title, description }) => (
              <div
                key={title}
                className="bg-gray-900 border border-gray-700 rounded-2xl p-6 flex flex-col gap-4 hover:border-emerald-800 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-900/40 flex items-center justify-center">
                  {icon}
                </div>
                <h3 className="text-white font-semibold text-base">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing Preview ── */}
      <section className="w-full py-16 px-4 bg-gray-800/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-white mb-4">Simple, transparent pricing</h2>
          <p className="text-center text-gray-400 mb-10">Start free. Upgrade when you're ready.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {PRICING_PREVIEW.map(({ name, price, period, highlight, badge, features }) => (
              <div
                key={name}
                className={`rounded-2xl p-6 flex flex-col gap-4 border ${
                  highlight
                    ? "bg-emerald-900/20 border-emerald-600 ring-1 ring-emerald-600"
                    : "bg-gray-800 border-gray-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-white font-bold text-lg">{name}</span>
                  {badge && (
                    <span className="text-xs bg-emerald-600 text-white px-2 py-0.5 rounded-full font-medium">
                      {badge}
                    </span>
                  )}
                </div>
                <div>
                  <span className="text-3xl font-bold text-white">{price}</span>
                  <span className="text-gray-400 text-sm ml-1">{period}</span>
                </div>
                <ul className="flex flex-col gap-2">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                      <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link
              to="/pricing"
              className="text-emerald-400 hover:text-emerald-300 font-semibold text-sm transition-colors"
            >
              See full pricing and all features →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="w-full py-20 px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Stop sending the same resume to every job.
        </h2>
        <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
          Join thousands of job seekers landing more interviews with Align.
        </p>
        <Link
          to="/signup"
          className="inline-flex items-center justify-center px-10 py-4 text-lg font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-full transition-all duration-200 hover:scale-105 shadow-lg"
        >
          Get started free →
        </Link>
        <p className="text-gray-600 text-sm mt-4">
          Free forever · No credit card · 2 generations/month
        </p>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
