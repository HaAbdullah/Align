/**
 * Health Routes
 * System health and status endpoints
 */

const express = require("express");
const { getAllowedOrigins } = require("../middleware/corsConfig");

const router = express.Router();

/**
 * GET /
 * Basic health check endpoint
 */
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Align API is running",
    timestamp: new Date().toISOString(),
    version: "2.0.0",
  });
});

/**
 * GET /api/health
 * Comprehensive health check with environment validation
 */
router.get("/health", (req, res) => {
  const frontendUrls = process.env.FRONTEND_URLS?.split(",") || [];
  const localhostUrl = frontendUrls.find(
    (url) => url.includes("localhost") || url.includes("127.0.0.1")
  );
  const productionUrl = frontendUrls.find((url) => url.includes("https://"));

  // Check environment variables
  const envCheck = {
    // Critical services
    has_stripe_key: !!process.env.STRIPE_SECRET_KEY,
    has_claude_api_key: !!process.env.CLAUDE_API_KEY,
    has_perplexity_api_key: !!process.env.PERPLEXITY_API_KEY,
    has_frontend_urls: !!process.env.FRONTEND_URLS,

    // Optional services
    has_stripe_webhook_secret: !!process.env.STRIPE_WEBHOOK_SECRET,

    // Environment info
    node_env: process.env.NODE_ENV || "development",
    port: process.env.PORT || 3000,

    // URLs configuration
    frontend_urls: frontendUrls,
    localhost_url: localhostUrl,
    production_url: productionUrl,
    allowed_origins: getAllowedOrigins(),
  };

  // Calculate health score
  const criticalServices = [
    envCheck.has_stripe_key,
    envCheck.has_claude_api_key,
    envCheck.has_perplexity_api_key,
    envCheck.has_frontend_urls,
  ];

  const healthyServices = criticalServices.filter(Boolean).length;
  const healthScore = (healthyServices / criticalServices.length) * 100;

  const status =
    healthScore === 100
      ? "healthy"
      : healthScore >= 75
      ? "degraded"
      : "unhealthy";

  res.json({
    success: true,
    status: status,
    health_score: healthScore,
    timestamp: new Date().toISOString(),
    environment_check: envCheck,
    services: {
      stripe: envCheck.has_stripe_key ? "configured" : "missing",
      claude_ai: envCheck.has_claude_api_key ? "configured" : "missing",
      perplexity_ai: envCheck.has_perplexity_api_key ? "configured" : "missing",
      frontend_cors: envCheck.has_frontend_urls ? "configured" : "missing",
    },
    warnings: criticalServices
      .map((service, index) => {
        const serviceNames = [
          "stripe",
          "claude_ai",
          "perplexity_ai",
          "frontend_urls",
        ];
        return service ? null : `${serviceNames[index]} not configured`;
      })
      .filter(Boolean),
  });
});

/**
 * GET /api/status
 * Simple status endpoint for monitoring
 */
router.get("/status", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || "development",
  });
});

module.exports = router;
