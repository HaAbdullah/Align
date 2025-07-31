/**
 * Stripe Service with PostgreSQL Integration - FIXED VERSION
 * Handles all Stripe-related business logic and PostgreSQL user updates
 */

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { APIError } = require("../middleware/errorMiddleware");
const { Pool } = require("pg");

// PostgreSQL connection (matching your setup)
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

class StripeService {
  constructor() {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY environment variable is required");
    }
    console.log("✅ StripeService initialized with PostgreSQL connection");
  }

  /**
   * Updates user tier in PostgreSQL after successful payment
   * ✅ FIXED: Extract email from Stripe customer data and use correct customer ID format
   */
  async updateUserTier(
    userId,
    planName,
    subscriptionId = null,
    customerData = null
  ) {
    try {
      console.log(`🔄 Attempting to update user tier for ${userId}`);
      console.log(`📋 Plan: ${planName}, Subscription: ${subscriptionId}`);

      // Map plan names to tier levels (matching your TIERS)
      const tierMapping = {
        Basic: "BASIC",
        Premium: "PREMIUM",
        "Premium+": "PREMIUM_PLUS",
        Freemium: "FREEMIUM",
      };

      const tier = tierMapping[planName] || "BASIC";

      // Map tiers to limits (matching your TIERS config)
      const tierLimits = {
        FREEMIUM: 2,
        BASIC: 5,
        PREMIUM: 10,
        PREMIUM_PLUS: -1, // Unlimited
      };

      const generationLimit = tierLimits[tier] || 5;

      // ✅ FIX: Extract customer ID and email properly
      let customerId = null;
      let customerEmail = null;

      if (customerData) {
        if (typeof customerData === "string") {
          customerId = customerData;
        } else if (customerData.id) {
          customerId = customerData.id;
          customerEmail = customerData.email;
        }
      }

      console.log(`📋 Customer ID: ${customerId}, Email: ${customerEmail}`);

      // First, check if user exists
      const checkUserQuery =
        "SELECT id, email FROM users WHERE firebase_uid = $1";
      const userResult = await pool.query(checkUserQuery, [userId]);

      let query;
      let values;

      if (userResult.rows.length === 0) {
        // ✅ FIX: User doesn't exist, create them with email from Stripe customer
        console.log(`📝 User doesn't exist, creating new user for ${userId}`);

        if (!customerEmail) {
          throw new Error("Cannot create user without email address");
        }

        query = `
          INSERT INTO users (
            firebase_uid, 
            email,
            subscription_tier, 
            monthly_generations_limit,
            monthly_generations_used,
            stripe_subscription_id, 
            stripe_customer_id, 
            subscription_status,
            subscription_start_date,
            created_at, 
            updated_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          RETURNING id
        `;
        values = [
          userId,
          customerEmail, // ✅ FIX: Include email
          tier,
          generationLimit,
          0,
          subscriptionId,
          customerId, // ✅ FIX: Use just the ID string
          "active",
        ];
      } else {
        // User exists, update them (this is the normal case)
        console.log(`📝 User exists, updating user ${userId}`);
        query = `
          UPDATE users 
          SET subscription_tier = $2, 
              monthly_generations_limit = $3,
              stripe_subscription_id = $4,
              stripe_customer_id = $5,
              subscription_status = $6,
              subscription_start_date = CURRENT_TIMESTAMP,
              updated_at = CURRENT_TIMESTAMP
          WHERE firebase_uid = $1
          RETURNING id
        `;
        values = [
          userId,
          tier,
          generationLimit,
          subscriptionId,
          customerId, // ✅ FIX: Use just the ID string
          "active",
        ];
      }

      console.log(`📤 Executing PostgreSQL query:`, {
        query: query.replace(/\s+/g, " "),
        values: values,
      });

      const result = await pool.query(query, values);

      console.log(
        `✅ Successfully updated user ${userId} to ${tier} tier (plan: ${planName})`
      );

      // Verify the update worked
      const verifyQuery =
        "SELECT subscription_tier, monthly_generations_limit, subscription_status FROM users WHERE firebase_uid = $1";
      const verifyResult = await pool.query(verifyQuery, [userId]);
      console.log(
        `🔍 Verification - User data after update:`,
        verifyResult.rows[0]
      );

      return true;
    } catch (error) {
      console.error(`❌ Failed to update user tier for ${userId}:`, error);
      console.error(`❌ Error details:`, error.message);
      throw new APIError(`Failed to update user tier: ${error.message}`, 500);
    }
  }

  /**
   * Downgrades user to freemium tier
   */
  async downgradeUserToFreemium(userId) {
    try {
      const query = `
        UPDATE users 
        SET subscription_tier = 'FREEMIUM', 
            monthly_generations_limit = 2,
            subscription_status = 'cancelled',
            stripe_subscription_id = NULL,
            stripe_customer_id = NULL,
            updated_at = CURRENT_TIMESTAMP
        WHERE firebase_uid = $1
      `;

      await pool.query(query, [userId]);
      console.log(`✅ Downgraded user ${userId} to freemium tier`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to downgrade user ${userId}:`, error);
      throw new APIError(`Failed to downgrade user: ${error.message}`, 500);
    }
  }

  /**
   * Finds user by Stripe customer ID
   */
  async findUserByCustomerId(customerId) {
    try {
      const query =
        "SELECT firebase_uid, subscription_tier, monthly_generations_limit FROM users WHERE stripe_customer_id = $1";
      const result = await pool.query(query, [customerId]);

      if (result.rows.length === 0) {
        console.log(`⚠️ No user found for customer ID: ${customerId}`);
        return null;
      }

      const user = result.rows[0];
      return {
        userId: user.firebase_uid,
        tier: user.subscription_tier,
        limit: user.monthly_generations_limit,
      };
    } catch (error) {
      console.error(
        `❌ Error finding user by customer ID ${customerId}:`,
        error
      );
      return null;
    }
  }

  /**
   * Determines the appropriate frontend URL based on environment
   */
  getFrontendUrl(req) {
    const frontendUrls = process.env.FRONTEND_URLS?.split(",") || [];
    const localhostUrl = frontendUrls.find(
      (url) => url.includes("localhost") || url.includes("127.0.0.1")
    );
    const productionUrl = frontendUrls.find((url) => url.includes("https://"));

    const isLocalhost =
      process.env.NODE_ENV === "development" ||
      req.get("host")?.includes("localhost") ||
      req.headers.origin?.includes("localhost");

    let frontendUrl =
      isLocalhost && localhostUrl
        ? localhostUrl
        : productionUrl || frontendUrls[0];

    return frontendUrl?.replace(/\/$/, "");
  }

  /**
   * Creates a Stripe checkout session
   */
  async createCheckoutSession({ priceId, planName, userId, userEmail }, req) {
    try {
      const frontendUrl = this.getFrontendUrl(req);

      if (!frontendUrl) {
        throw new APIError("Frontend URL configuration is missing", 500);
      }

      console.log(
        `💳 Creating checkout session for ${userEmail} - Plan: ${planName} - User: ${userId}`
      );

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: `${frontendUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${frontendUrl}/pricing`,
        customer_email: userEmail,
        metadata: {
          userId: userId,
          planName: planName,
        },
        billing_address_collection: "auto",
        subscription_data: {
          trial_period_days: 7,
          metadata: {
            userId: userId,
            planName: planName,
          },
        },
      });

      console.log(`✅ Checkout session created: ${session.id}`);

      return {
        sessionId: session.id,
        url: session.url,
      };
    } catch (error) {
      console.error("❌ Stripe checkout session creation failed:", error);
      throw new APIError(
        `Failed to create checkout session: ${error.message}`,
        500
      );
    }
  }

  /**
   * Retrieves and validates a checkout session
   */
  async getCheckoutSession(sessionId) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ["line_items", "customer"],
      });

      return {
        id: session.id,
        amount_total: session.amount_total,
        currency: session.currency,
        status: session.status,
        payment_status: session.payment_status,
        customer_details: session.customer_details,
        metadata: session.metadata,
        created: session.created,
        line_items:
          session.line_items?.data.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            amount_total: item.amount_total,
          })) || [],
      };
    } catch (error) {
      console.error("❌ Failed to retrieve session:", error);
      throw new APIError(`Failed to retrieve session: ${error.message}`, 404);
    }
  }

  /**
   * Verifies a completed checkout session and updates user tier
   * ✅ FIXED: Better error handling and customer data extraction
   */
  async verifySession(sessionId) {
    try {
      console.log(`🔍 Starting session verification for: ${sessionId}`);

      const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ["line_items", "customer", "subscription"],
      });

      console.log(`📋 Session details:`, {
        id: session.id,
        payment_status: session.payment_status,
        planName: session.metadata?.planName,
        userId: session.metadata?.userId,
        customer_email:
          session.customer?.email || session.customer_details?.email,
        customer_id: session.customer?.id || session.customer,
      });

      if (session.payment_status !== "paid") {
        throw new APIError("Payment not completed", 400);
      }

      const planName = session.metadata?.planName || "Premium";
      const userId = session.metadata?.userId;

      console.log(
        `🔄 About to update user tier - User ID: ${userId}, Plan: ${planName}`
      );

      // ✅ FIX: Update user tier with proper customer data extraction
      if (userId) {
        console.log(`🚀 Calling updateUserTier...`);

        // Extract customer data properly
        const customerData = session.customer || session.customer_details;

        await this.updateUserTier(
          userId,
          planName,
          session.subscription?.id || session.subscription,
          customerData
        );
        console.log(`✅ updateUserTier completed successfully`);
      } else {
        console.error(`❌ No user ID found in session metadata`);
        throw new APIError("No user ID found in session", 400);
      }

      const verifiedSession = {
        id: session.id,
        planName: planName,
        amount_total: session.amount_total,
        currency: session.currency,
        status: session.status,
        payment_status: session.payment_status,
        customer_email:
          session.customer?.email || session.customer_details?.email,
        customer_id: session.customer?.id || session.customer,
        userId: userId,
        created: session.created,
        subscription_id: session.subscription?.id || session.subscription,
      };

      console.log(
        `✅ Session verified and user tier updated: ${sessionId} for plan: ${planName}`
      );

      return verifiedSession;
    } catch (error) {
      console.error("❌ Session verification failed:", error);
      throw new APIError(`Session verification failed: ${error.message}`, 400);
    }
  }
  async cancelSubscription({ userId, customerId, subscriptionId }) {
    try {
      let subscription;

      console.log(
        `🚫 Cancelling subscription - userId: ${userId}, customerId: ${customerId}, subscriptionId: ${subscriptionId}`
      );

      if (subscriptionId) {
        subscription = await stripe.subscriptions.cancel(subscriptionId);
        console.log(`✅ Cancelled subscription: ${subscriptionId}`);
      } else if (customerId) {
        const subscriptions = await stripe.subscriptions.list({
          customer: customerId,
          status: "active",
        });

        if (subscriptions.data.length === 0) {
          throw new APIError("No active subscriptions found", 404);
        }

        subscription = await stripe.subscriptions.cancel(
          subscriptions.data[0].id
        );
        console.log(
          `✅ Cancelled subscription: ${subscriptions.data[0].id} for customer: ${customerId}`
        );
      } else {
        throw new APIError(
          "Either customerId or subscriptionId is required",
          400
        );
      }

      // ✅ FIX: Update PostgreSQL database after successful Stripe cancellation
      if (userId) {
        console.log(`🔄 Downgrading user ${userId} to freemium...`);
        await this.downgradeUserToFreemium(userId);
        console.log(`✅ User ${userId} downgraded to freemium`);
      }

      return {
        success: true,
        message: "Subscription cancelled successfully",
        subscription: {
          id: subscription.id,
          status: subscription.status,
          canceled_at: subscription.canceled_at,
        },
      };
    } catch (error) {
      console.error("❌ Subscription cancellation failed:", error);

      // ✅ FIX: Handle case where subscription might already be cancelled
      if (
        (error.message.includes("No subscription found") ||
          error.message.includes("already canceled") ||
          error.message.includes("No active subscriptions found")) &&
        userId
      ) {
        console.log(
          "⚠️ Subscription already cancelled in Stripe, updating database only"
        );

        try {
          await this.downgradeUserToFreemium(userId);
          return {
            success: true,
            message:
              "User downgraded to freemium (subscription was already cancelled)",
          };
        } catch (dbError) {
          console.error("❌ Failed to downgrade user:", dbError);
          throw new APIError(
            `Failed to update user status: ${dbError.message}`,
            500
          );
        }
      }

      throw new APIError(
        `Failed to cancel subscription: ${error.message}`,
        500
      );
    }
  }
  /**
   * Processes Stripe webhook events with PostgreSQL updates
   */
  async processWebhookEvent(rawBody, signature) {
    try {
      const event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );

      console.log(`📧 Webhook received: ${event.type}`);

      switch (event.type) {
        case "checkout.session.completed":
          const session = event.data.object;
          console.log("💰 Payment succeeded:", session.id);

          // Update user subscription in PostgreSQL
          if (session.metadata?.userId && session.metadata?.planName) {
            console.log(
              `🔄 Webhook updating user tier: ${session.metadata.userId} to ${session.metadata.planName}`
            );
            await this.updateUserTier(
              session.metadata.userId,
              session.metadata.planName,
              session.subscription,
              session.customer
            );
          } else {
            console.warn("⚠️ Missing user metadata in session:", session.id);
          }
          break;

        case "invoice.payment_succeeded":
          console.log("💰 Recurring payment succeeded");
          const invoice = event.data.object;

          // Find user by customer ID and extend subscription
          if (invoice.customer) {
            const user = await this.findUserByCustomerId(invoice.customer);
            if (user) {
              // Update subscription status to ensure it's active
              const query = `
                UPDATE users 
                SET subscription_status = 'active', 
                    updated_at = CURRENT_TIMESTAMP
                WHERE firebase_uid = $1
              `;
              await pool.query(query, [user.userId]);
              console.log(`✅ Extended subscription for user: ${user.userId}`);
            }
          }
          break;

        case "customer.subscription.deleted":
          console.log("❌ Subscription cancelled");
          const deletedSubscription = event.data.object;

          // Find user by customer ID and downgrade to freemium
          if (deletedSubscription.customer) {
            const user = await this.findUserByCustomerId(
              deletedSubscription.customer
            );
            if (user) {
              await this.downgradeUserToFreemium(user.userId);
            }
          }
          break;

        case "invoice.payment_failed":
          console.log("❌ Payment failed");
          const failedInvoice = event.data.object;

          // Update user status to reflect payment failure
          if (failedInvoice.customer) {
            const user = await this.findUserByCustomerId(
              failedInvoice.customer
            );
            if (user) {
              const query = `
                UPDATE users 
                SET subscription_status = 'past_due',
                    updated_at = CURRENT_TIMESTAMP
                WHERE firebase_uid = $1
              `;
              await pool.query(query, [user.userId]);
              console.log(`⚠️ Marked user as past due: ${user.userId}`);
            }
          }
          break;

        default:
          console.log(`❓ Unhandled event type: ${event.type}`);
      }

      return { received: true };
    } catch (error) {
      console.error("❌ Webhook processing failed:", error);
      throw new APIError(`Webhook processing failed: ${error.message}`, 400);
    }
  }
}

module.exports = new StripeService();
