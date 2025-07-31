/**
 * CORS Configuration
 * Handles cross-origin requests for different environments
 */

const getAllowedOrigins = () => {
  const envUrls = process.env.FRONTEND_URLS?.split(",") || [];
  const defaultUrls = ["http://localhost:8888"];

  return [...envUrls, ...defaultUrls].filter(Boolean);
};

const corsConfig = {
  origin: (origin, callback) => {
    const allowedOrigins = getAllowedOrigins();

    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`🚫 CORS blocked origin: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "stripe-signature"],
  exposedHeaders: ["Content-Length", "X-Foo", "X-Bar"],
};

module.exports = { corsConfig, getAllowedOrigins };
