/**
 * Input Validation Middleware - FIXED VERSION
 * Validates request bodies and parameters
 */

const { ValidationError } = require("./errorMiddleware");

// Validation schemas
const validationSchemas = {
  jobDescription: {
    required: true,
    type: "string",
    minLength: 10,
    maxLength: 50000,
  },
  sessionId: {
    required: true,
    type: "string",
    pattern: /^cs_[a-zA-Z0-9_]+$/,
  },
  priceId: {
    required: true,
    type: "string",
    pattern: /^price_[a-zA-Z0-9_]+$/,
  },
  userEmail: {
    required: true,
    type: "string",
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  firebaseUid: {
    required: true,
    type: "string",
    minLength: 10,
    maxLength: 128,
  },
  tier: {
    required: true,
    type: "string",
    allowedValues: ["FREEMIUM", "BASIC", "PREMIUM", "PREMIUM_PLUS"],
  },
};

// Generic validator function
const validateField = (value, schema, fieldName) => {
  // Check if field is required and missing
  if (
    schema.required &&
    (value === undefined || value === null || value === "")
  ) {
    throw new ValidationError(`${fieldName} is required`);
  }

  // If value exists, validate it
  if (value !== undefined && value !== null && value !== "") {
    // Type validation
    if (schema.type === "string" && typeof value !== "string") {
      throw new ValidationError(`${fieldName} must be a string`);
    }

    if (schema.type === "number" && typeof value !== "number") {
      throw new ValidationError(`${fieldName} must be a number`);
    }

    // String length validation
    if (schema.type === "string") {
      if (schema.minLength && value.length < schema.minLength) {
        throw new ValidationError(
          `${fieldName} must be at least ${schema.minLength} characters`
        );
      }

      if (schema.maxLength && value.length > schema.maxLength) {
        throw new ValidationError(
          `${fieldName} exceeds maximum length of ${schema.maxLength} characters`
        );
      }

      // Pattern validation
      if (schema.pattern && !schema.pattern.test(value)) {
        throw new ValidationError(`${fieldName} format is invalid`);
      }

      // Allowed values validation
      if (schema.allowedValues && !schema.allowedValues.includes(value)) {
        throw new ValidationError(
          `${fieldName} must be one of: ${schema.allowedValues.join(", ")}`
        );
      }
    }
  }
};

// Middleware factory for different validation types
const createValidator = (fields) => (req, res, next) => {
  try {
    // ✅ FIX: Add safety check for fields parameter
    if (!fields || typeof fields !== "object") {
      console.warn("⚠️ createValidator called with invalid fields parameter");
      return next();
    }

    for (const [fieldName, schemaKey] of Object.entries(fields)) {
      // ✅ FIX: Add safety check for schema existence
      const schema = validationSchemas[schemaKey];
      if (!schema) {
        console.warn(`⚠️ No validation schema found for: ${schemaKey}`);
        continue;
      }

      // Get value from request (params, body, or query)
      const value =
        req.body?.[fieldName] ||
        req.params?.[fieldName] ||
        req.query?.[fieldName];

      validateField(value, schema, fieldName);
    }
    next();
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({
        success: false,
        error: {
          message: error.message,
          status: 400,
          timestamp: new Date().toISOString(),
        },
      });
    }
    next(error);
  }
};

// Simple validator functions that don't rely on complex schemas
const simpleValidators = {
  firebaseUid: (req, res, next) => {
    const { firebaseUid } = req.params;

    if (
      !firebaseUid ||
      typeof firebaseUid !== "string" ||
      firebaseUid.length < 10
    ) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Valid firebaseUid is required (min 10 characters)",
          status: 400,
        },
      });
    }

    next();
  },

  subscriptionUpdate: (req, res, next) => {
    const { tier } = req.body;
    const validTiers = ["FREEMIUM", "BASIC", "PREMIUM", "PREMIUM_PLUS"];

    if (!tier) {
      return res.status(400).json({
        success: false,
        error: { message: "Tier is required", status: 400 },
      });
    }

    if (!validTiers.includes(tier)) {
      return res.status(400).json({
        success: false,
        error: {
          message: `Invalid tier. Must be one of: ${validTiers.join(", ")}`,
          status: 400,
        },
      });
    }

    next();
  },

  sessionId: (req, res, next) => {
    const { sessionId } = req.body || req.params;

    if (!sessionId || !sessionId.startsWith("cs_")) {
      return res.status(400).json({
        success: false,
        error: { message: "Valid Stripe session ID is required", status: 400 },
      });
    }

    next();
  },

  email: (req, res, next) => {
    const { email, userEmail } = req.body;
    const emailValue = email || userEmail;

    if (!emailValue || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
      return res.status(400).json({
        success: false,
        error: { message: "Valid email address is required", status: 400 },
      });
    }

    next();
  },
};

// Pre-configured validators using the original system
const validators = {
  jobDescription: createValidator({ jobDescription: "jobDescription" }),
  stripeCheckout: createValidator({
    priceId: "priceId",
    userEmail: "userEmail",
  }),
  stripeSession: createValidator({
    sessionId: "sessionId",
  }),
  firebaseUid: createValidator({
    firebaseUid: "firebaseUid",
  }),
};

module.exports = {
  createValidator,
  validators,
  simpleValidators, // ✅ Export simple validators for reliable validation
  validateField,
  validationSchemas,
};
