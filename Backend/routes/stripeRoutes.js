/**
 * Stripe Routes
 * All Stripe-related endpoints
 */

const express = require("express");
const { asyncHandler } = require("../middleware/errorMiddleware");
const { validators } = require("../middleware/validation");
const stripeService = require("../services/stripeService");

const router = express.Router();

/**
 * POST /api/create-checkout-session
 * Creates a new Stripe checkout session for subscription
 */
router.post(
  "/create-checkout-session",
  // validators.stripeCheckout, // Comment out if you don't have validators yet
  asyncHandler(async (req, res) => {
    const { priceId, planName, userId, userEmail } = req.body;

    const session = await stripeService.createCheckoutSession(
      { priceId, planName, userId, userEmail },
      req
    );

    res.status(201).json({
      success: true,
      data: session,
    });
  })
);

/**
 * GET /api/checkout-session/:sessionId
 * Retrieves checkout session details
 */
router.get(
  "/checkout-session/:sessionId",
  // validators.stripeSession, // Comment out if you don't have validators yet
  asyncHandler(async (req, res) => {
    const { sessionId } = req.params;

    const session = await stripeService.getCheckoutSession(sessionId);

    res.json({
      success: true,
      data: session,
    });
  })
);

/**
 * POST /api/verify-session
 * Verifies a completed checkout session
 */
router.post(
  "/verify-session",
  asyncHandler(async (req, res) => {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: "Session ID is required",
      });
    }

    const verifiedSession = await stripeService.verifySession(sessionId);

    res.json({
      success: true,
      data: verifiedSession,
    });
  })
);

/**
 * POST /api/cancel-subscription
 * Cancels an active subscription
 */
router.post(
  "/cancel-subscription",
  asyncHandler(async (req, res) => {
    const { userId, customerId, subscriptionId } = req.body; // ✅ FIX: Extract userId

    const result = await stripeService.cancelSubscription({
      userId, // ✅ FIX: Pass userId to service
      customerId,
      subscriptionId,
    });

    res.json({
      success: true,
      data: result,
    });
  })
);

/**
 * POST /api/stripe-webhook
 * Handles Stripe webhook events
 */
router.post(
  "/stripe-webhook",
  express.raw({ type: "application/json" }),
  asyncHandler(async (req, res) => {
    const signature = req.headers["stripe-signature"];

    const result = await stripeService.processWebhookEvent(req.body, signature);

    res.json(result);
  })
);

/**
 * POST /api/webhook (legacy endpoint)
 * Handles Stripe webhook events (alternative endpoint)
 */
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  asyncHandler(async (req, res) => {
    const signature = req.headers["stripe-signature"];

    const result = await stripeService.processWebhookEvent(req.body, signature);

    res.json(result);
  })
);

// IMPORTANT: Make sure you're exporting the router, not the service
module.exports = router;
