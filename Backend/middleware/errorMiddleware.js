/**
 * Error Handling Middleware
 * Centralized error handling for consistent responses
 */

const notFound = (req, res, next) => {
  const error = new Error(`🔍 Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  // Default to 500 if no status code is set
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  console.error(`❌ Error ${statusCode}:`, {
    message: err.message,
    url: req.originalUrl,
    method: req.method,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    body: req.body,
    query: req.query,
  });

  res.status(statusCode).json({
    success: false,
    error: {
      message: err.message,
      status: statusCode,
      timestamp: new Date().toISOString(),
      ...(err.additionalData && err.additionalData),
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    },
  });
};

// Custom error classes for better error handling
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
    this.statusCode = 400;
  }
}

class APIError extends Error {
  constructor(message, statusCode = 500, additionalData = {}) {
    super(message);
    this.name = "APIError";
    this.statusCode = statusCode;
    this.additionalData = additionalData;
  }
}

// Async wrapper to catch async errors
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  notFound,
  errorHandler,
  ValidationError,
  APIError,
  asyncHandler,
};
