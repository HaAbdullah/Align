/**
 * AI Routes
 * All AI-related endpoints for document generation and analysis
 * Clean, consistent API responses that match frontend expectations
 */
const express = require("express");
const { asyncHandler } = require("../middleware/errorMiddleware");
const { validators } = require("../middleware/validation");
const aiService = require("../services/aiService");

const router = express.Router();

// Grab the AI rate limiter set up in server.js
const getAiLimiter = (req) => req.app.locals.aiLimiter;

/**
 * POST /api/create-resume
 * Generates a tailored resume using the V2 pipeline:
 * 5 parallel Haiku section calls → LaTeX build → pdflatex → Sonnet review
 */
router.post(
  "/create-resume",
  (req, res, next) => getAiLimiter(req)(req, res, next),
  validators.jobDescription,
  asyncHandler(async (req, res) => {
    const { jobDescription, resumeText } = req.body;

    console.log(`Resume V2 generation request - JD length: ${jobDescription.length}, resumeText length: ${(resumeText||'').length}`);
    console.log(`FULL resumeText:\n${resumeText}`);

    const result = await aiService.generateResumeV2(resumeText || "", jobDescription);

    res.json({
      success: true,
      latex: result.latex,
      pdf: result.pdf,
    });
  })
);

/**
 * POST /api/create-cover-letter
 * Generates a tailored cover letter using Claude AI
 */
router.post(
  "/create-cover-letter",
  (req, res, next) => getAiLimiter(req)(req, res, next),
  validators.jobDescription,
  asyncHandler(async (req, res) => {
    const { jobDescription, resumeText } = req.body;

    console.log(`Cover letter V2 generation request - JD length: ${jobDescription.length}, resumeText length: ${(resumeText || '').length}`);

    const result = await aiService.generateCoverLetterV2(resumeText || "", jobDescription);

    res.json({
      success: true,
      latex: result.latex,
      pdf: result.pdf,
    });
  })
);

/**
 * POST /api/generate-questions
 * Generates interview questions using Claude AI
 */
router.post(
  "/generate-questions",
  (req, res, next) => getAiLimiter(req)(req, res, next),
  validators.jobDescription,
  asyncHandler(async (req, res) => {
    const { jobDescription } = req.body;

    console.log(
      `Question generation request - Length: ${jobDescription.length}`
    );

    const result = await aiService.generateQuestions(jobDescription);

    // Return direct format to match frontend expectations
    res.json(result);
  })
);

/**
 * POST /api/generate-compensation
 * Generates compensation analysis using Perplexity AI
 */
router.post(
  "/generate-compensation",
  (req, res, next) => getAiLimiter(req)(req, res, next),
  validators.jobDescription,
  asyncHandler(async (req, res) => {
    const { jobDescription } = req.body;

    console.log(
      `Compensation analysis request - Length: ${jobDescription.length}`
    );

    const result = await aiService.generateCompensation(jobDescription);

    // Return direct format to match frontend expectations
    res.json(result);
  })
);

/**
 * POST /api/generate-company-insights
 * Generates company insights using Perplexity AI
 */
router.post(
  "/generate-company-insights",
  (req, res, next) => getAiLimiter(req)(req, res, next),
  validators.jobDescription,
  asyncHandler(async (req, res) => {
    const { jobDescription } = req.body;

    console.log(`Company insights request - Length: ${jobDescription.length}`);

    const result = await aiService.generateCompanyInsights(jobDescription);

    // Return direct format to match frontend expectations
    res.json(result);
  })
);

/**
 * POST /api/generate-keywords
 * Generates keywords analysis using Perplexity AI
 */
router.post(
  "/generate-keywords",
  (req, res, next) => getAiLimiter(req)(req, res, next),
  asyncHandler(async (req, res) => {
    const { jobDescription, analysisResults } = req.body;

    // Custom validation for this endpoint
    if (!jobDescription || jobDescription.trim() === "") {
      return res.status(400).json({
        error: "Job description is required",
      });
    }

    if (!analysisResults) {
      return res.status(400).json({
        error: "Analysis results are required for keyword comparison",
      });
    }

    console.log(
      `Keywords analysis request - JD Length: ${
        jobDescription.length
      }, Analysis: ${!!analysisResults}`
    );

    const result = await aiService.generateKeywords(
      jobDescription,
      analysisResults
    );

    // Return direct format to match frontend expectations
    res.json(result);
  })
);

module.exports = router;
