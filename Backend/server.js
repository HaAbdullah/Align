require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

// Import middleware
const { errorHandler, notFound } = require("./middleware/errorMiddleware");
const { corsConfig } = require("./middleware/corsConfig");
const { requireAuth } = require("./middleware/authMiddleware");

// Import routes
const userRoutes = require("./routes/userRoutes");
const stripeRoutes = require("./routes/stripeRoutes");
const aiRoutes = require("./routes/aiRoutes");
const documentRoutes = require("./routes/documentRoutes");
const healthRoutes = require("./routes/healthRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

// Security headers
app.use(helmet());

// Rate limiters — exported so route files can apply them per-route
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
const stripeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});
const defaultLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});

// Global middleware
app.use(express.json({ limit: "10mb" }));
app.use(cors(corsConfig));
app.use(defaultLimiter);

// Pass limiters to route files via app.locals so they can apply them per-route
app.locals.aiLimiter = aiLimiter;
app.locals.stripeLimiter = stripeLimiter;

// Routes — NO limiters at app.use() level: each route file applies its own limiter
app.use("/api", healthRoutes);
app.use("/api", stripeRoutes);
app.use("/api/users", requireAuth, userRoutes);
app.use("/api", requireAuth, aiRoutes);
app.use("/api/documents", requireAuth, documentRoutes);

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);

  // Environment validation on startup
  const requiredEnvVars = [
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "MONGODB_URI",
    "CLAUDE_API_KEY",
    "PERPLEXITY_API_KEY",
    "FRONTEND_URLS",
  ];

  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName],
  );
  if (missingVars.length > 0) {
    console.warn(
      `⚠️  Missing environment variables: ${missingVars.join(", ")}`,
    );
  } else {
    console.log("✅ All required environment variables loaded");
  }

  console.log("✅ Stripe integration ready");
});

module.exports = app;
