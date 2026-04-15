const { APIError } = require("../middleware/errorMiddleware");
const { connectDB } = require("../db");
const User = require("../models/User");
const Document = require("../models/Document");

// Maps MongoDB _id → id and strips __v so the frontend gets a clean object
const normalizeDoc = (doc) => {
  if (!doc) return null;
  const { _id, __v, ...rest } = doc;
  return { ...rest, id: _id?.toString() };
};

const TIERS = {
  FREEMIUM: { name: "Freemium", limit: 2, price: 0 },
  BASIC: { name: "Basic", limit: 5, price: 5 },
  PREMIUM: { name: "Premium", limit: 10, price: 10 },
  PREMIUM_PLUS: { name: "Premium+", limit: -1, price: 15 },
};

class DatabaseService {
  constructor() {
    connectDB().catch((err) => console.error("❌ DB connection failed:", err));
  }

  /**
   * Reset monthly usage counter if the reset date has passed (lazy reset).
   * Called before any usage check so users are never blocked past their reset date.
   */
  async _resetUsageIfNeeded(firebaseUid) {
    const user = await User.findOne({
      firebase_uid: firebaseUid,
      usage_reset_date: { $lt: new Date() },
    });

    if (user) {
      const newResetDate = new Date(user.usage_reset_date);
      newResetDate.setMonth(newResetDate.getMonth() + 1);
      await User.findOneAndUpdate(
        { firebase_uid: firebaseUid },
        {
          $set: { monthly_generations_used: 0, usage_reset_date: newResetDate },
        },
      );
    }
  }

  /**
   * Get user profile by Firebase UID with computed properties
   */
  async getUserProfile(firebaseUid) {
    try {
      console.log(`🔍 Looking up user: ${firebaseUid}`);

      await this._resetUsageIfNeeded(firebaseUid);

      const user = await User.findOne({ firebase_uid: firebaseUid }).lean();

      if (!user) {
        throw new APIError("User not found. Please create user first.", 404);
      }

      console.log(`✅ Found user: ${user.email || user.firebase_uid}`);

      const canGenerate =
        user.monthly_generations_limit === -1 ||
        user.monthly_generations_used < user.monthly_generations_limit;

      const remainingGenerations =
        user.monthly_generations_limit === -1
          ? "Unlimited"
          : Math.max(
              0,
              user.monthly_generations_limit - user.monthly_generations_used,
            );

      return {
        ...user,
        canGenerate,
        remainingGenerations,
        tierInfo: TIERS[user.subscription_tier] || TIERS.FREEMIUM,
      };
    } catch (error) {
      if (error instanceof APIError) throw error;
      console.error("❌ Database error in getUserProfile:", error);
      throw new APIError("Database connection failed", 500);
    }
  }

  /**
   * Increment user's monthly generation usage
   */
  async incrementUsage(firebaseUid) {
    try {
      console.log(`📊 Incrementing usage for: ${firebaseUid}`);

      await this._resetUsageIfNeeded(firebaseUid);

      const user = await User.findOne({ firebase_uid: firebaseUid }).lean();

      if (!user) throw new APIError("User not found", 404);

      const canGenerate =
        user.monthly_generations_limit === -1 ||
        user.monthly_generations_used < user.monthly_generations_limit;

      if (!canGenerate) {
        throw new APIError("Generation limit exceeded", 403, {
          needsUpgrade: true,
          currentTier: user.subscription_tier,
        });
      }

      const updated = await User.findOneAndUpdate(
        { firebase_uid: firebaseUid },
        { $inc: { monthly_generations_used: 1 } },
        { returnDocument: 'after' },
      ).lean();

      console.log(
        `✅ Usage incremented. New count: ${updated.monthly_generations_used}`,
      );

      const remainingGenerations =
        updated.monthly_generations_limit === -1
          ? "Unlimited"
          : Math.max(
              0,
              updated.monthly_generations_limit -
                updated.monthly_generations_used,
            );

      return {
        success: true,
        generationsUsed: updated.monthly_generations_used,
        remainingGenerations,
        generationsLimit: updated.monthly_generations_limit,
      };
    } catch (error) {
      if (error instanceof APIError) throw error;
      console.error("❌ Error incrementing usage:", error);
      throw new APIError("Database error", 500);
    }
  }

  /**
   * Update user's subscription tier
   */
  async updateSubscription(
    firebaseUid,
    { tier, stripeCustomerId, stripeSubscriptionId },
  ) {
    try {
      if (!tier || !TIERS[tier]) {
        throw new APIError("Invalid tier specified", 400);
      }

      console.log(`🔄 Updating subscription for ${firebaseUid} to ${tier}`);

      const updated = await User.findOneAndUpdate(
        { firebase_uid: firebaseUid },
        {
          $set: {
            subscription_tier: tier,
            monthly_generations_limit: TIERS[tier].limit,
            stripe_customer_id: stripeCustomerId,
            stripe_subscription_id: stripeSubscriptionId,
            subscription_status: "active",
            subscription_start_date: new Date(),
          },
        },
        { returnDocument: 'after' },
      ).lean();

      if (!updated) throw new APIError("User not found", 404);

      console.log(`✅ Subscription updated to ${tier}`);

      const canGenerate =
        updated.monthly_generations_limit === -1 ||
        updated.monthly_generations_used < updated.monthly_generations_limit;

      const remainingGenerations =
        updated.monthly_generations_limit === -1
          ? "Unlimited"
          : Math.max(
              0,
              updated.monthly_generations_limit -
                updated.monthly_generations_used,
            );

      return {
        success: true,
        user: {
          ...updated,
          canGenerate,
          remainingGenerations,
          tierInfo: TIERS[tier],
        },
      };
    } catch (error) {
      if (error instanceof APIError) throw error;
      console.error("❌ Error updating subscription:", error);
      throw new APIError("Database error", 500);
    }
  }

  /**
   * Create a new user
   */
  async createUser(userData) {
    try {
      const { firebaseUid, email, displayName } = userData;

      console.log(`👤 Creating user: ${email}`);

      const result = await User.create({
        firebase_uid: firebaseUid,
        email: email,
        display_name: displayName || null,
      });

      return {
        ...result.toObject(),
        canGenerate: true,
        remainingGenerations: TIERS.FREEMIUM.limit,
        tierInfo: TIERS.FREEMIUM,
      };
    } catch (error) {
      console.error("❌ Error creating user:", error);
      throw new APIError("Failed to create user", 500);
    }
  }

  /**
   * Get recent (unfavorited) documents for a user with pagination
   */
  async getRecentDocuments(firebaseUid, options = {}) {
    try {
      const { limit = 20, offset = 0, documentType } = options;

      console.log(`📄 Getting recent documents for: ${firebaseUid}`, options);

      const filter = { firebase_uid: firebaseUid, favorited: false };
      if (documentType) filter.document_type = documentType;

      const [totalCount, documents] = await Promise.all([
        Document.countDocuments(filter),
        Document.find(filter)
          .sort({ createdAt: -1 })
          .skip(offset)
          .limit(limit)
          .lean(),
      ]);

      const hasMore = offset + limit < totalCount;

      console.log(
        `✅ Retrieved ${documents.length} documents (${totalCount} total)`,
      );

      return {
        documents: documents.map(normalizeDoc),
        totalCount,
        hasMore,
        pagination: {
          limit,
          offset,
          nextOffset: hasMore ? offset + limit : null,
        },
      };
    } catch (error) {
      console.error("❌ Error getting recent documents:", error);
      throw new APIError("Failed to retrieve recent documents", 500);
    }
  }

  /**
   * Get favorited documents for a user
   */
  async getFavoritedDocuments(firebaseUid, options = {}) {
    try {
      const { limit = 50, offset = 0, documentType } = options;

      console.log(
        `⭐ Getting favorited documents for: ${firebaseUid}`,
        options,
      );

      const filter = { firebase_uid: firebaseUid, favorited: true };
      if (documentType) filter.document_type = documentType;

      const [totalCount, documents] = await Promise.all([
        Document.countDocuments(filter),
        Document.find(filter)
          .sort({ favorited_at: -1 })
          .skip(offset)
          .limit(limit)
          .lean(),
      ]);

      const hasMore = offset + limit < totalCount;

      console.log(`✅ Retrieved ${documents.length} favorite documents`);

      return {
        documents: documents.map(normalizeDoc),
        totalCount,
        hasMore,
        pagination: {
          limit,
          offset,
          nextOffset: hasMore ? offset + limit : null,
        },
      };
    } catch (error) {
      console.error("❌ Error getting favorited documents:", error);
      throw new APIError("Failed to retrieve favorited documents", 500);
    }
  }

  /**
   * Get a specific document by ID
   */
  async getDocumentById(documentId, firebaseUid = null) {
    try {
      console.log(`Getting document by ID: ${documentId}`);

      const document = await Document.findById(documentId).lean();

      if (!document) throw new APIError("Document not found", 404);

      if (firebaseUid && document.firebase_uid !== firebaseUid) {
        throw new APIError(
          "Access denied: Document belongs to different user",
          403,
        );
      }

      return normalizeDoc(document);
    } catch (error) {
      if (error instanceof APIError) throw error;
      console.error("❌ Error getting document by ID:", error);
      throw new APIError("Failed to retrieve document", 500);
    }
  }

  /**
   * Save a new document and keep only the 20 most recent per user
   */
  async saveDocument({
    firebaseUid,
    documentType,
    htmlContent,
    pdfContent = null,
    contentFormat = "html",
  }) {
    try {
      console.log(`Saving document for: ${firebaseUid}`);

      const saved = await Document.create({
        firebase_uid: firebaseUid,
        document_type: documentType,
        html_content: htmlContent,
        pdf_content: pdfContent,
        content_format: contentFormat,
        favorited: false,
      });

      // Keep only 20 most recent unfavorited documents per user
      const overflow = await Document.find({
        firebase_uid: firebaseUid,
        favorited: false,
      })
        .sort({ createdAt: -1 })
        .skip(20)
        .select("_id")
        .lean();

      if (overflow.length > 0) {
        await Document.deleteMany({ _id: { $in: overflow.map((d) => d._id) } });
        console.log(
          `✅ Document saved, cleaned up ${overflow.length} old documents`,
        );
      }

      return normalizeDoc(saved.toObject());
    } catch (error) {
      console.error("❌ Error saving document:", error);
      throw new APIError("Failed to save document", 500);
    }
  }

  /**
   * Mark a document as favorited
   */
  async favoriteDocument(documentId, firebaseUid) {
    try {
      console.log(`Favoriting document: ${documentId} for ${firebaseUid}`);

      const document = await Document.findOne({
        _id: documentId,
        firebase_uid: firebaseUid,
      });

      if (!document)
        throw new APIError("Document not found or access denied", 404);

      if (document.favorited) {
        return { alreadyFavorited: true, document: normalizeDoc(document.toObject()) };
      }

      document.favorited = true;
      document.favorited_at = new Date();
      await document.save();

      console.log(`✅ Document added to favorites`);

      return { alreadyFavorited: false, document: normalizeDoc(document.toObject()) };
    } catch (error) {
      if (error instanceof APIError) throw error;
      console.error("❌ Error favoriting document:", error);
      throw new APIError("Failed to favorite document", 500);
    }
  }

  /**
   * Remove document from favorites
   */
  async removeFavorite(documentId, firebaseUid) {
    try {
      console.log(`🗑️ Removing favorite: ${documentId} for ${firebaseUid}`);

      const result = await Document.findOneAndUpdate(
        { _id: documentId, firebase_uid: firebaseUid },
        { $set: { favorited: false, favorited_at: null } },
        { returnDocument: 'after' },
      );

      console.log(`✅ Favorite removal: ${result ? "success" : "not found"}`);

      return { removed: !!result };
    } catch (error) {
      console.error("Error removing favorite:", error);
      throw new APIError("Failed to remove favorite", 500);
    }
  }

  /**
   * Delete a document from recent documents
   */
  async deleteRecentDocument(documentId, firebaseUid) {
    try {
      console.log(
        `🗑️ Deleting recent document: ${documentId} for ${firebaseUid}`,
      );

      const result = await Document.findOneAndDelete({
        _id: documentId,
        firebase_uid: firebaseUid,
      });

      console.log(`✅ Document deletion: ${result ? "success" : "not found"}`);

      return { deleted: !!result };
    } catch (error) {
      console.error("Error deleting recent document:", error);
      throw new APIError("Failed to delete document", 500);
    }
  }

  getTiers() {
    return TIERS;
  }

  isValidTier(tier) {
    return tier && TIERS.hasOwnProperty(tier);
  }
}

module.exports = new DatabaseService();
