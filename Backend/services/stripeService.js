const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { APIError } = require("../middleware/errorMiddleware");
const { connectDB } = require("../db");
const User = require("../models/User");

const TIER_LIMITS = {
  FREEMIUM: 2,
  BASIC: 5,
  PREMIUM: 10,
  PREMIUM_PLUS: -1,
};

class StripeService {
  constructor() {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY environment variable is required");
    }
    connectDB().catch((err) => console.error("❌ DB connection failed:", err));
    console.log("✅ StripeService initialized");
  }

  /**
   * Updates user tier in MongoDB after successful payment.
   * Uses upsert so it works whether or not the user already exists.
   */
  async updateUserTier(userId, planName, subscriptionId = null, customerData = null) {
    try {
      console.log(`🔄 Updating user tier for ${userId} — plan: ${planName}`);

      const tierMapping = {
        Basic: "BASIC",
        Premium: "PREMIUM",
        "Premium+": "PREMIUM_PLUS",
        Freemium: "FREEMIUM",
      };

      const tier = tierMapping[planName] || "BASIC";

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

      await User.findOneAndUpdate(
        { firebase_uid: userId },
        {
          $set: {
            subscription_tier: tier,
            monthly_generations_limit: TIER_LIMITS[tier],
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            subscription_status: "active",
            subscription_start_date: new Date(),
          },
          $setOnInsert: {
            firebase_uid: userId,
            email: customerEmail,
            monthly_generations_used: 0,
          },
        },
        { upsert: true, returnDocument: 'after' }
      );

      console.log(`✅ User ${userId} updated to ${tier}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to update user tier for ${userId}:`, error);
      throw new APIError(`Failed to update user tier: ${error.message}`, 500);
    }
  }

  /**
   * Downgrades user to freemium tier
   */
  async downgradeUserToFreemium(userId) {
    try {
      await User.findOneAndUpdate(
        { firebase_uid: userId },
        {
          $set: {
            subscription_tier: "FREEMIUM",
            monthly_generations_limit: 2,
            subscription_status: "cancelled",
            stripe_subscription_id: null,
            stripe_customer_id: null,
          },
        }
      );
      console.log(`✅ Downgraded user ${userId} to freemium`);
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
      const user = await User.findOne({ stripe_customer_id: customerId }).lean();

      if (!user) {
        console.log(`⚠️ No user found for customer ID: ${customerId}`);
        return null;
      }

      return {
        userId: user.firebase_uid,
        tier: user.subscription_tier,
        limit: user.monthly_generations_limit,
      };
    } catch (error) {
      console.error(`❌ Error finding user by customer ID ${customerId}:`, error);
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

    const frontendUrl =
      isLocalhost && localhostUrl ? localhostUrl : productionUrl || frontendUrls[0];

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

      console.log(`💳 Creating checkout session for ${userEmail} — plan: ${planName}`);

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [{ price: priceId, quantity: 1 }],
        mode: "subscription",
        success_url: `${frontendUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${frontendUrl}/pricing`,
        customer_email: userEmail,
        metadata: { userId, planName },
        billing_address_collection: "auto",
        subscription_data: {
          trial_period_days: 7,
          metadata: { userId, planName },
        },
      });

      console.log(`✅ Checkout session created: ${session.id}`);
      return { sessionId: session.id, url: session.url };
    } catch (error) {
      console.error("❌ Stripe checkout session creation failed:", error);
      throw new APIError(`Failed to create checkout session: ${error.message}`, 500);
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
   */
  async verifySession(sessionId) {
    try {
      console.log(`🔍 Verifying session: ${sessionId}`);

      const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ["line_items", "customer", "subscription"],
      });

      if (session.payment_status !== "paid") {
        throw new APIError("Payment not completed", 400);
      }

      const planName = session.metadata?.planName || "Premium";
      const userId = session.metadata?.userId;

      if (!userId) {
        throw new APIError("No user ID found in session", 400);
      }

      const customerData = session.customer || session.customer_details;
      await this.updateUserTier(
        userId,
        planName,
        session.subscription?.id || session.subscription,
        customerData
      );

      console.log(`✅ Session verified for plan: ${planName}`);

      return {
        id: session.id,
        planName,
        amount_total: session.amount_total,
        currency: session.currency,
        status: session.status,
        payment_status: session.payment_status,
        customer_email: session.customer?.email || session.customer_details?.email,
        customer_id: session.customer?.id || session.customer,
        userId,
        created: session.created,
        subscription_id: session.subscription?.id || session.subscription,
      };
    } catch (error) {
      console.error("❌ Session verification failed:", error);
      throw new APIError(`Session verification failed: ${error.message}`, 400);
    }
  }

  async cancelSubscription({ userId, customerId, subscriptionId }) {
    try {
      let subscription;

      if (subscriptionId) {
        subscription = await stripe.subscriptions.cancel(subscriptionId);
      } else if (customerId) {
        const subscriptions = await stripe.subscriptions.list({
          customer: customerId,
          status: "active",
        });

        if (subscriptions.data.length === 0) {
          throw new APIError("No active subscriptions found", 404);
        }

        subscription = await stripe.subscriptions.cancel(subscriptions.data[0].id);
      } else {
        throw new APIError("Either customerId or subscriptionId is required", 400);
      }

      if (userId) {
        await this.downgradeUserToFreemium(userId);
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
      if (
        (error.message?.includes("No subscription found") ||
          error.message?.includes("already canceled") ||
          error.message?.includes("No active subscriptions found")) &&
        userId
      ) {
        console.log("⚠️ Subscription already cancelled in Stripe, updating DB only");
        await this.downgradeUserToFreemium(userId);
        return {
          success: true,
          message: "User downgraded to freemium (subscription was already cancelled)",
        };
      }

      throw new APIError(`Failed to cancel subscription: ${error.message}`, 500);
    }
  }

  /**
   * Processes Stripe webhook events
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
        case "checkout.session.completed": {
          const session = event.data.object;
          if (session.metadata?.userId && session.metadata?.planName) {
            await this.updateUserTier(
              session.metadata.userId,
              session.metadata.planName,
              session.subscription,
              session.customer
            );
          }
          break;
        }

        case "invoice.payment_succeeded": {
          const invoice = event.data.object;
          if (invoice.customer) {
            const user = await this.findUserByCustomerId(invoice.customer);
            if (user) {
              await User.findOneAndUpdate(
                { firebase_uid: user.userId },
                { $set: { subscription_status: "active" } }
              );
              console.log(`✅ Extended subscription for user: ${user.userId}`);
            }
          }
          break;
        }

        case "customer.subscription.deleted": {
          const deletedSubscription = event.data.object;
          if (deletedSubscription.customer) {
            const user = await this.findUserByCustomerId(deletedSubscription.customer);
            if (user) await this.downgradeUserToFreemium(user.userId);
          }
          break;
        }

        case "invoice.payment_failed": {
          const failedInvoice = event.data.object;
          if (failedInvoice.customer) {
            const user = await this.findUserByCustomerId(failedInvoice.customer);
            if (user) {
              await User.findOneAndUpdate(
                { firebase_uid: user.userId },
                { $set: { subscription_status: "past_due" } }
              );
              console.log(`⚠️ Marked user as past due: ${user.userId}`);
            }
          }
          break;
        }

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
