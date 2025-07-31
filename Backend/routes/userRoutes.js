/**
 * User Routes - COMPLETE WORKING VERSION
 * User profile and subscription management endpoints with proper response formatting
 */

const express = require("express");
const { asyncHandler } = require("../middleware/errorMiddleware");
const { simpleValidators } = require("../middleware/validation");
const databaseService = require("../services/databaseService");

const router = express.Router();

/**
 * GET /api/users/profile/:firebaseUid
 * Get user profile with subscription info and usage stats
 */
router.get(
  "/profile/:firebaseUid",
  simpleValidators.firebaseUid,
  asyncHandler(async (req, res) => {
    const { firebaseUid } = req.params;

    console.log(`📋 Profile request for: ${firebaseUid}`);

    try {
      const userProfile = await databaseService.getUserProfile(firebaseUid);

      console.log("📤 Sending profile response:", {
        firebaseUid: userProfile.firebase_uid,
        tier: userProfile.subscription_tier,
        canGenerate: userProfile.canGenerate,
        remaining: userProfile.remainingGenerations,
      });

      res.json({
        success: true,
        data: userProfile,
      });
    } catch (error) {
      // If user not found, return 404 with clear message
      if (error.message.includes("User not found")) {
        return res.status(404).json({
          success: false,
          error: {
            message: "User not found. Please create an account first.",
            status: 404,
            needsRegistration: true,
          },
        });
      }

      // Re-throw other errors to be handled by error middleware
      throw error;
    }
  })
);

/**
 * POST /api/users/:firebaseUid/increment-usage
 * Increment user's monthly generation usage
 */
router.post(
  "/:firebaseUid/increment-usage",
  simpleValidators.firebaseUid,
  asyncHandler(async (req, res) => {
    const { firebaseUid } = req.params;

    console.log(`📈 Increment usage request for: ${firebaseUid}`);

    try {
      const result = await databaseService.incrementUsage(firebaseUid);

      console.log("📤 Sending increment response:", result);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      // Handle specific increment usage errors
      if (error.message.includes("Generation limit exceeded")) {
        return res.status(403).json({
          success: false,
          error: {
            message: "Generation limit exceeded. Please upgrade your plan.",
            status: 403,
            needsUpgrade: true,
            currentTier: error.additionalData?.currentTier,
          },
        });
      }

      if (error.message.includes("User not found")) {
        return res.status(404).json({
          success: false,
          error: {
            message: "User not found. Please create an account first.",
            status: 404,
            needsRegistration: true,
          },
        });
      }

      // Re-throw other errors
      throw error;
    }
  })
);

/**
 * POST /api/users/:firebaseUid/update-subscription
 * Update user's subscription tier and Stripe information
 */
router.post(
  "/:firebaseUid/update-subscription",
  simpleValidators.firebaseUid,
  simpleValidators.subscriptionUpdate,
  asyncHandler(async (req, res) => {
    const { firebaseUid } = req.params;
    const { tier, stripeCustomerId, stripeSubscriptionId } = req.body;

    console.log(`🔄 Subscription update request for: ${firebaseUid}`, {
      tier,
      stripeCustomerId,
      stripeSubscriptionId,
    });

    try {
      const result = await databaseService.updateSubscription(firebaseUid, {
        tier,
        stripeCustomerId,
        stripeSubscriptionId,
      });

      console.log("📤 Sending subscription update response:", {
        success: result.success,
        userTier: result.user?.subscription_tier,
        canGenerate: result.user?.canGenerate,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      if (error.message.includes("User not found")) {
        return res.status(404).json({
          success: false,
          error: {
            message: "User not found. Cannot update subscription.",
            status: 404,
            needsRegistration: true,
          },
        });
      }

      // Re-throw other errors
      throw error;
    }
  })
);

/**
 * POST /api/users/create
 * Create a new user (for user registration)
 */
router.post(
  "/create",
  asyncHandler(async (req, res) => {
    const { firebaseUid, email, displayName } = req.body;

    // Basic validation
    if (!firebaseUid || !email) {
      return res.status(400).json({
        success: false,
        error: {
          message: "firebaseUid and email are required",
          status: 400,
          missingFields: {
            firebaseUid: !firebaseUid,
            email: !email,
          },
        },
      });
    }

    // Email format validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Valid email address is required",
          status: 400,
        },
      });
    }

    console.log(`👤 Create user request:`, { firebaseUid, email, displayName });

    try {
      const user = await databaseService.createUser({
        firebaseUid,
        email,
        displayName,
      });

      console.log("📤 Sending create user response:", {
        firebaseUid: user.firebase_uid,
        email: user.email,
        tier: user.subscription_tier,
      });

      res.status(201).json({
        success: true,
        data: user,
      });
    } catch (error) {
      // Handle duplicate user creation
      if (
        error.message.includes("duplicate key") ||
        error.message.includes("already exists")
      ) {
        return res.status(409).json({
          success: false,
          error: {
            message: "User already exists",
            status: 409,
          },
        });
      }

      // Re-throw other errors
      throw error;
    }
  })
);

/**
 * POST /api/users/:firebaseUid/cancel-subscription
 * Cancel user's subscription and downgrade to freemium
 */
router.post(
  "/:firebaseUid/cancel-subscription",
  simpleValidators.firebaseUid,
  asyncHandler(async (req, res) => {
    const { firebaseUid } = req.params;

    console.log(`❌ Cancel subscription request for: ${firebaseUid}`);

    try {
      // First get the user to find their Stripe info
      const userData = await databaseService.getUserProfile(firebaseUid);

      if (!userData.stripe_customer_id && !userData.stripe_subscription_id) {
        return res.status(400).json({
          success: false,
          error: {
            message: "No active subscription found to cancel",
            status: 400,
          },
        });
      }

      // Update user to freemium in database (this will be handled by Stripe webhooks normally)
      const updateResult = await databaseService.updateSubscription(
        firebaseUid,
        {
          tier: "FREEMIUM",
          stripeCustomerId: null,
          stripeSubscriptionId: null,
        }
      );

      console.log("📤 Sending cancellation response");

      res.json({
        success: true,
        data: {
          message: "Subscription cancelled successfully",
          user: updateResult.user,
        },
      });
    } catch (error) {
      if (error.message.includes("User not found")) {
        return res.status(404).json({
          success: false,
          error: {
            message: "User not found",
            status: 404,
          },
        });
      }

      // Re-throw other errors
      throw error;
    }
  })
);

/**
 * GET /api/users/:firebaseUid/subscription-status
 * Get current subscription status and details
 */
router.get(
  "/:firebaseUid/subscription-status",
  simpleValidators.firebaseUid,
  asyncHandler(async (req, res) => {
    const { firebaseUid } = req.params;

    console.log(`📊 Subscription status request for: ${firebaseUid}`);

    try {
      const userData = await databaseService.getUserProfile(firebaseUid);

      const subscriptionStatus = {
        tier: userData.subscription_tier,
        status: userData.subscription_status,
        hasActiveSubscription:
          userData.subscription_status === "active" &&
          userData.subscription_tier !== "FREEMIUM",
        generationsUsed: userData.monthly_generations_used,
        generationsLimit: userData.monthly_generations_limit,
        remainingGenerations: userData.remainingGenerations,
        canGenerate: userData.canGenerate,
        stripeCustomerId: userData.stripe_customer_id,
        stripeSubscriptionId: userData.stripe_subscription_id,
        subscriptionStartDate: userData.subscription_start_date,
      };

      console.log("📤 Sending subscription status:", subscriptionStatus);

      res.json({
        success: true,
        data: subscriptionStatus,
      });
    } catch (error) {
      if (error.message.includes("User not found")) {
        return res.status(404).json({
          success: false,
          error: {
            message: "User not found",
            status: 404,
            needsRegistration: true,
          },
        });
      }

      // Re-throw other errors
      throw error;
    }
  })
);

/**
 * POST /api/users/:firebaseUid/reset-usage
 * Reset monthly usage count (admin function or monthly reset)
 */
router.post(
  "/:firebaseUid/reset-usage",
  simpleValidators.firebaseUid,
  asyncHandler(async (req, res) => {
    const { firebaseUid } = req.params;

    console.log(`🔄 Reset usage request for: ${firebaseUid}`);

    try {
      // Simple query to reset usage
      const query = `
        UPDATE users 
        SET monthly_generations_used = 0,
            updated_at = CURRENT_TIMESTAMP
        WHERE firebase_uid = $1
        RETURNING monthly_generations_used, monthly_generations_limit
      `;

      const result = await databaseService.pool.query(query, [firebaseUid]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: {
            message: "User not found",
            status: 404,
          },
        });
      }

      const updatedUser = result.rows[0];

      console.log("📤 Usage reset successful");

      res.json({
        success: true,
        data: {
          message: "Usage count reset successfully",
          generationsUsed: updatedUser.monthly_generations_used,
          generationsLimit: updatedUser.monthly_generations_limit,
        },
      });
    } catch (error) {
      console.error("❌ Error resetting usage:", error);
      throw error;
    }
  })
);

module.exports = router;
