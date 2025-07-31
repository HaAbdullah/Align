const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Import middleware
const { errorHandler, notFound } = require("./middleware/errorMiddleware");
const { corsConfig } = require("./middleware/corsConfig");

// Import routes
const userRoutes = require("./routes/userRoutes");
const stripeRoutes = require("./routes/stripeRoutes");
const aiRoutes = require("./routes/aiRoutes");
const documentRoutes = require("./routes/documentRoutes");
const healthRoutes = require("./routes/healthRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

// Global middleware
app.use(express.json());
app.use(cors(corsConfig));

// Routes
app.use("/api", healthRoutes);
app.use("/api", stripeRoutes);
app.use("/api/users", userRoutes);
app.use("/api", aiRoutes);
app.use("/api/documents", documentRoutes);

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
    "DB_PASSWORD",
    "CLAUDE_API_KEY",
    "PERPLEXITY_API_KEY",
    "FRONTEND_URLS",
  ];

  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );
  if (missingVars.length > 0) {
    console.warn(
      `⚠️  Missing environment variables: ${missingVars.join(", ")}`
    );
  } else {
    console.log("✅ All required environment variables loaded");
  }

  console.log("✅ PostgreSQL-based Stripe integration ready");
});

module.exports = app;
