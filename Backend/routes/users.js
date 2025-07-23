console.log("🔧 Environment check in routes/users.js:");
console.log("- DB_PASSWORD exists:", !!process.env.DB_PASSWORD);
console.log(
  "- DB_PASSWORD value:",
  process.env.DB_PASSWORD ? "[HIDDEN]" : "UNDEFINED"
);
console.log(
  "- All env vars:",
  Object.keys(process.env).filter((key) => key.startsWith("DB_"))
);

// routes/users.js
const express = require("express");
const { Pool } = require("pg");
const router = express.Router();

// Database connection pool
const pool = new Pool({
  user: "postgres",
  host: "align-postgres-db.cpk4oao6u9lf.us-east-2.rds.amazonaws.com",
  database: "align_db",
  password: process.env.DB_PASSWORD,
  port: 5432,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test database connection
pool.on("connect", () => {
  console.log("🐘 Connected to PostgreSQL database");
});

pool.on("error", (err) => {
  console.error("🚨 PostgreSQL connection error:", err);
});

// TIER CONFIGURATIONS
const TIERS = {
  FREEMIUM: { name: "Freemium", limit: 2, price: 0 },
  BASIC: { name: "Basic", limit: 5, price: 5 },
  PREMIUM: { name: "Premium", limit: 10, price: 10 },
  PREMIUM_PLUS: { name: "Premium+", limit: -1, price: 15 },
}; // Replace your current profile endpoint with this:
router.get("/profile/:firebaseUid", async (req, res) => {
  const { firebaseUid } = req.params;

  try {
    console.log(`🔍 Looking up user: ${firebaseUid}`);

    const result = await pool.query(
      "SELECT * FROM users WHERE firebase_uid = $1",
      [firebaseUid]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "User not found. Please create user first.",
      });
    }

    const user = result.rows[0];
    console.log(`✅ Found user: ${user.email}`);

    // Return user data with computed fields
    res.json({
      ...user,
      canGenerate:
        user.monthly_generations_limit === -1 ||
        user.monthly_generations_used < user.monthly_generations_limit,
      remainingGenerations:
        user.monthly_generations_limit === -1
          ? "Unlimited"
          : Math.max(
              0,
              user.monthly_generations_limit - user.monthly_generations_used
            ),
      tierInfo: TIERS[user.subscription_tier] || TIERS.FREEMIUM,
    });
  } catch (error) {
    console.error("❌ Database error:", error);
    res.status(500).json({ error: "Database connection failed" });
  }
});

// POST /api/users/:firebaseUid/increment-usage
router.post("/:firebaseUid/increment-usage", async (req, res) => {
  const { firebaseUid } = req.params;

  try {
    console.log(`📊 Incrementing usage for: ${firebaseUid}`);

    // Get current user
    const userResult = await pool.query(
      "SELECT * FROM users WHERE firebase_uid = $1",
      [firebaseUid]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = userResult.rows[0];

    // Check if user can generate
    const canGenerate =
      user.monthly_generations_limit === -1 ||
      user.monthly_generations_used < user.monthly_generations_limit;

    if (!canGenerate) {
      return res.status(403).json({
        error: "Generation limit exceeded",
        needsUpgrade: true,
        currentTier: user.subscription_tier,
      });
    }

    // Increment usage
    const updateResult = await pool.query(
      `UPDATE users 
       SET monthly_generations_used = monthly_generations_used + 1,
           updated_at = CURRENT_TIMESTAMP
       WHERE firebase_uid = $1
       RETURNING monthly_generations_used, monthly_generations_limit`,
      [firebaseUid]
    );

    const updatedUser = updateResult.rows[0];
    console.log(
      `✅ Usage incremented. New count: ${updatedUser.monthly_generations_used}`
    );

    res.json({
      success: true,
      generationsUsed: updatedUser.monthly_generations_used,
      remainingGenerations:
        updatedUser.monthly_generations_limit === -1
          ? "Unlimited"
          : Math.max(
              0,
              updatedUser.monthly_generations_limit -
                updatedUser.monthly_generations_used
            ),
    });
  } catch (error) {
    console.error("❌ Error incrementing usage:", error);
    res.status(500).json({ error: "Database error" });
  }
});

// POST /api/users/:firebaseUid/update-subscription
router.post("/:firebaseUid/update-subscription", async (req, res) => {
  const { firebaseUid } = req.params;
  const { tier, stripeCustomerId, stripeSubscriptionId } = req.body;

  // DEBUG: Check what we're actually receiving
  console.log("🔍 Raw request body:", req.body);
  console.log("📏 Data lengths:", {
    tier: tier?.length || "null",
    customerId: stripeCustomerId?.length || "null",
    subscriptionId: stripeSubscriptionId?.length || "null",
  });
  console.log("🎯 Actual values:", {
    tier: typeof tier + ": " + tier,
    customerId: typeof stripeCustomerId + ": " + stripeCustomerId,
    subscriptionId: typeof stripeSubscriptionId + ": " + stripeSubscriptionId,
  });

  if (!tier || !TIERS[tier]) {
    return res.status(400).json({ error: "Invalid tier specified" });
  }

  try {
    console.log(`🔄 Updating subscription for ${firebaseUid} to ${tier}`);

    const result = await pool.query(
      `UPDATE users 
       SET subscription_tier = $1,
           monthly_generations_limit = $2,
           stripe_customer_id = $3,
           stripe_subscription_id = $4,
           subscription_status = 'active',
           subscription_start_date = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE firebase_uid = $5
       RETURNING *`,
      [
        tier,
        TIERS[tier].limit,
        stripeCustomerId,
        stripeSubscriptionId,
        firebaseUid,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    console.log(`✅ Subscription updated to ${tier}`);

    res.json({
      success: true,
      user: {
        ...result.rows[0],
        tierInfo: TIERS[tier],
      },
    });
  } catch (error) {
    console.error("❌ Error updating subscription:", error);
    res.status(500).json({ error: "Database error" });
  }
});

module.exports = router;
