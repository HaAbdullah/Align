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
    // Allow any localhost or 127.0.0.1 origin for local development
    if (!origin || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }

    const allowedOrigins = getAllowedOrigins();
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
