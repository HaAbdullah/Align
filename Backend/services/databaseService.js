/**
 * Database Service - FIXED & SIMPLIFIED VERSION
 * Handles all PostgreSQL database operations with proper response formatting
 */

const { Pool } = require("pg");
const { APIError } = require("../middleware/errorMiddleware");

// Tier configurations
const TIERS = {
  FREEMIUM: { name: "Freemium", limit: 2, price: 0 },
  BASIC: { name: "Basic", limit: 5, price: 5 },
  PREMIUM: { name: "Premium", limit: 10, price: 10 },
  PREMIUM_PLUS: { name: "Premium+", limit: -1, price: 15 },
};

class DatabaseService {
  constructor() {
    if (!process.env.DB_PASSWORD) {
      throw new Error("DB_PASSWORD environment variable is required");
    }

    // Database connection pool
    this.pool = new Pool({
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

    this.pool.on("connect", () => {
      console.log("🐘 Connected to PostgreSQL database");
    });

    this.pool.on("error", (err) => {
      console.error("🚨 PostgreSQL connection error:", err);
    });

    this.testConnection();
  }

  async testConnection() {
    try {
      const client = await this.pool.connect();
      console.log("✅ Database connection test successful");
      client.release();
    } catch (error) {
      console.error("❌ Database connection test failed:", error);
    }
  }

  /**
   * Get user profile by Firebase UID with computed properties
   */
  async getUserProfile(firebaseUid) {
    try {
      console.log(`🔍 Looking up user: ${firebaseUid}`);

      const result = await this.pool.query(
        "SELECT * FROM users WHERE firebase_uid = $1",
        [firebaseUid]
      );

      if (result.rows.length === 0) {
        throw new APIError("User not found. Please create user first.", 404);
      }

      const user = result.rows[0];
      console.log(`✅ Found user: ${user.email || user.firebase_uid}`);

      // Calculate computed fields
      const canGenerate =
        user.monthly_generations_limit === -1 ||
        user.monthly_generations_used < user.monthly_generations_limit;

      const remainingGenerations =
        user.monthly_generations_limit === -1
          ? "Unlimited"
          : Math.max(
              0,
              user.monthly_generations_limit - user.monthly_generations_used
            );

      // Return user with computed properties
      const userProfile = {
        ...user,
        canGenerate,
        remainingGenerations,
        tierInfo: TIERS[user.subscription_tier] || TIERS.FREEMIUM,
      };

      console.log("📊 Returning user profile:", {
        tier: userProfile.subscription_tier,
        used: userProfile.monthly_generations_used,
        limit: userProfile.monthly_generations_limit,
        canGenerate: userProfile.canGenerate,
        remaining: userProfile.remainingGenerations,
      });

      return userProfile;
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
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

      // Get current user
      const userResult = await this.pool.query(
        "SELECT * FROM users WHERE firebase_uid = $1",
        [firebaseUid]
      );

      if (userResult.rows.length === 0) {
        throw new APIError("User not found", 404);
      }

      const user = userResult.rows[0];

      // Check if user can generate
      const canGenerate =
        user.monthly_generations_limit === -1 ||
        user.monthly_generations_used < user.monthly_generations_limit;

      if (!canGenerate) {
        throw new APIError("Generation limit exceeded", 403, {
          needsUpgrade: true,
          currentTier: user.subscription_tier,
        });
      }

      // Increment usage
      const updateResult = await this.pool.query(
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

      const remainingGenerations =
        updatedUser.monthly_generations_limit === -1
          ? "Unlimited"
          : Math.max(
              0,
              updatedUser.monthly_generations_limit -
                updatedUser.monthly_generations_used
            );

      return {
        success: true,
        generationsUsed: updatedUser.monthly_generations_used,
        remainingGenerations,
        generationsLimit: updatedUser.monthly_generations_limit,
      };
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      console.error("❌ Error incrementing usage:", error);
      throw new APIError("Database error", 500);
    }
  }

  /**
   * Update user's subscription tier
   */
  async updateSubscription(
    firebaseUid,
    { tier, stripeCustomerId, stripeSubscriptionId }
  ) {
    try {
      // Validate tier
      if (!tier || !TIERS[tier]) {
        throw new APIError("Invalid tier specified", 400);
      }

      console.log(`🔄 Updating subscription for ${firebaseUid} to ${tier}`);

      const result = await this.pool.query(
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
        throw new APIError("User not found", 404);
      }

      console.log(`✅ Subscription updated to ${tier}`);

      const updatedUser = result.rows[0];

      // Add computed properties
      const canGenerate =
        updatedUser.monthly_generations_limit === -1 ||
        updatedUser.monthly_generations_used <
          updatedUser.monthly_generations_limit;

      const remainingGenerations =
        updatedUser.monthly_generations_limit === -1
          ? "Unlimited"
          : Math.max(
              0,
              updatedUser.monthly_generations_limit -
                updatedUser.monthly_generations_used
            );

      const userWithComputedProps = {
        ...updatedUser,
        canGenerate,
        remainingGenerations,
        tierInfo: TIERS[tier],
      };

      return {
        success: true,
        user: userWithComputedProps,
      };
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
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

      const result = await this.pool.query(
        `INSERT INTO users (
          firebase_uid, 
          email, 
          display_name, 
          subscription_tier, 
          monthly_generations_limit, 
          monthly_generations_used,
          subscription_status,
          created_at,
          updated_at
        )
         VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING *`,
        [
          firebaseUid,
          email,
          displayName || null,
          "FREEMIUM",
          TIERS.FREEMIUM.limit,
          0,
          "active",
        ]
      );

      console.log(`✅ User created: ${email}`);

      const newUser = result.rows[0];

      // Add computed properties
      const userWithComputedProps = {
        ...newUser,
        canGenerate: true, // New users can always generate (they start with 0 usage)
        remainingGenerations: TIERS.FREEMIUM.limit,
        tierInfo: TIERS.FREEMIUM,
      };

      return userWithComputedProps;
    } catch (error) {
      console.error("❌ Error creating user:", error);
      throw new APIError("Failed to create user", 500);
    }
  }

  /**
   * Get recent documents for a user with pagination
   */
  async getRecentDocuments(firebaseUid, options = {}) {
    try {
      const { limit = 20, offset = 0, documentType } = options;

      console.log(`📄 Getting recent documents for: ${firebaseUid}`, options);

      // Build dynamic WHERE clause
      let whereClause = "WHERE user_id = $1";
      let queryParams = [firebaseUid];
      let paramIndex = 2;

      if (documentType) {
        whereClause += ` AND document_type = $${paramIndex}`;
        queryParams.push(documentType);
        paramIndex++;
      }

      // Get total count for pagination
      const countQuery = `
        SELECT COUNT(*) as total 
        FROM recent_documents 
        ${whereClause}
      `;

      const countResult = await this.pool.query(countQuery, queryParams);
      const totalCount = parseInt(countResult.rows[0].total);

      // Get documents with pagination
      const documentsQuery = `
        SELECT 
          id,
          user_id,
          document_type,
          html_content,
          created_at,
          -- Add computed fields for frontend
          CASE 
            WHEN document_type = 'resume' THEN '📄 Resume'
            WHEN document_type = 'cover_letter' THEN '📝 Cover Letter'
            ELSE document_type
          END as display_type,
          -- Extract title from HTML if possible
          CASE 
            WHEN html_content LIKE '%<title>%</title>%' THEN 
              SUBSTRING(html_content FROM '<title>(.*?)</title>')
            ELSE 'Untitled Document'
          END as extracted_title
        FROM recent_documents 
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;

      queryParams.push(limit, offset);
      const documentsResult = await this.pool.query(
        documentsQuery,
        queryParams
      );

      const hasMore = offset + limit < totalCount;

      console.log(
        `✅ Retrieved ${documentsResult.rows.length} documents (${totalCount} total)`
      );

      return {
        documents: documentsResult.rows,
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
   * FAANG Pattern: Similar structure but different table
   */
  async getFavoritedDocuments(firebaseUid, options = {}) {
    try {
      const { limit = 50, offset = 0, documentType } = options;

      console.log(
        `⭐ Getting favorited documents for: ${firebaseUid}`,
        options
      );

      // Build dynamic WHERE clause
      let whereClause = "WHERE user_id = $1";
      let queryParams = [firebaseUid];
      let paramIndex = 2;

      if (documentType) {
        whereClause += ` AND document_type = $${paramIndex}`;
        queryParams.push(documentType);
        paramIndex++;
      }

      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total 
        FROM favorited_documents 
        ${whereClause}
      `;

      const countResult = await this.pool.query(countQuery, queryParams);
      const totalCount = parseInt(countResult.rows[0].total);

      // Get documents
      const documentsQuery = `
        SELECT 
          id,
          user_id,
          document_type,
          html_content,
          favorited_at,
          -- Add computed fields
          CASE 
            WHEN document_type = 'resume' THEN '📄 Resume'
            WHEN document_type = 'cover_letter' THEN '📝 Cover Letter'
            ELSE document_type
          END as display_type,
          CASE 
            WHEN html_content LIKE '%<title>%</title>%' THEN 
              SUBSTRING(html_content FROM '<title>(.*?)</title>')
            ELSE 'Untitled Document'
          END as extracted_title
        FROM favorited_documents 
        ${whereClause}
        ORDER BY favorited_at DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;

      queryParams.push(limit, offset);
      const documentsResult = await this.pool.query(
        documentsQuery,
        queryParams
      );

      const hasMore = offset + limit < totalCount;

      console.log(
        `✅ Retrieved ${documentsResult.rows.length} favorite documents`
      );

      return {
        documents: documentsResult.rows,
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
   * Get a specific document by ID from either table
   */
  async getDocumentById(documentId, firebaseUid = null) {
    try {
      console.log(`Getting document by ID: ${documentId}`);

      // Search both tables with UNION
      const query = `
        SELECT 
          'recent' as source_table,
          id,
          user_id,
          document_type,
          html_content,
          created_at as timestamp
        FROM recent_documents 
        WHERE id = $1
        
        UNION ALL
        
        SELECT 
          'favorited' as source_table,
          id,
          user_id,
          document_type,
          html_content,
          favorited_at as timestamp
        FROM favorited_documents 
        WHERE id = $1
        
        LIMIT 1
      `;

      const result = await this.pool.query(query, [documentId]);

      if (result.rows.length === 0) {
        throw new APIError("Document not found", 404);
      }

      const document = result.rows[0];

      // Optional: Verify user has access
      if (firebaseUid && document.user_id !== firebaseUid) {
        throw new APIError(
          "Access denied: Document belongs to different user",
          403
        );
      }

      console.log(`✅ Found document in ${document.source_table} table`);

      return document;
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      console.error("❌ Error getting document by ID:", error);
      throw new APIError("Failed to retrieve document", 500);
    }
  }

  /**
   * Save a new document to recent_documents
   */
  async saveDocument({ firebaseUid, documentType, htmlContent }) {
    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");

      console.log(`Saving document for: ${firebaseUid}`);

      // 1. Insert new document
      const insertQuery = `
        INSERT INTO recent_documents (user_id, document_type, html_content, created_at)
        VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
        RETURNING *
      `;

      // Escape single quotes in HTML content
      const escapedHtmlContent = htmlContent.replace(/'/g, "''");

      const insertResult = await client.query(insertQuery, [
        firebaseUid,
        documentType,
        escapedHtmlContent,
      ]);

      const savedDocument = insertResult.rows[0];

      // 2. Clean up old documents (keep only 20 most recent)
      const cleanupQuery = `
        DELETE FROM recent_documents 
        WHERE user_id = $1 
        AND id NOT IN (
          SELECT id FROM recent_documents 
          WHERE user_id = $1 
          ORDER BY created_at DESC 
          LIMIT 20
        )
      `;

      const cleanupResult = await client.query(cleanupQuery, [firebaseUid]);

      await client.query("COMMIT");

      console.log(
        `✅ Document saved (ID: ${savedDocument.id}), cleaned up ${cleanupResult.rowCount} old documents`
      );

      return savedDocument;
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("❌ Error saving document:", error);
      throw new APIError("Failed to save document", 500);
    } finally {
      client.release();
    }
  }

  /**
   * Add document to favorites (copy from recent to favorites)
   */
  async favoriteDocument(documentId, firebaseUid) {
    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");

      console.log(`Favoriting document: ${documentId} for ${firebaseUid}`);

      // 1. Get the document from recent_documents
      const getDocQuery = `
        SELECT * FROM recent_documents 
        WHERE id = $1 AND user_id = $2
      `;

      const docResult = await client.query(getDocQuery, [
        documentId,
        firebaseUid,
      ]);

      if (docResult.rows.length === 0) {
        throw new APIError("Document not found or access denied", 404);
      }

      const document = docResult.rows[0];

      const checkFavoriteQuery = `
        SELECT id FROM favorited_documents 
        WHERE user_id = $1 AND document_type = $2 AND html_content = $3
      `;

      const favoriteCheck = await client.query(checkFavoriteQuery, [
        firebaseUid,
        document.document_type,
        document.html_content,
      ]);

      if (favoriteCheck.rows.length > 0) {
        await client.query("COMMIT");
        return {
          alreadyFavorited: true,
          document: favoriteCheck.rows[0],
        };
      }

      const insertFavoriteQuery = `
        INSERT INTO favorited_documents (user_id, document_type, html_content, favorited_at)
        VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
        RETURNING *
      `;

      const favoriteResult = await client.query(insertFavoriteQuery, [
        firebaseUid,
        document.document_type,
        document.html_content,
      ]);

      await client.query("COMMIT");

      console.log(`✅ Document added to favorites`);

      return {
        alreadyFavorited: false,
        document: favoriteResult.rows[0],
      };
    } catch (error) {
      await client.query("ROLLBACK");

      if (error instanceof APIError) {
        throw error;
      }
      console.error("❌ Error favoriting document:", error);
      throw new APIError("Failed to favorite document", 500);
    } finally {
      client.release();
    }
  }

  /**
   * Remove document from favorites
   */
  async removeFavorite(documentId, firebaseUid) {
    try {
      console.log(`🗑️ Removing favorite: ${documentId} for ${firebaseUid}`);

      const deleteQuery = `
        DELETE FROM favorited_documents 
        WHERE id = $1 AND user_id = $2
        RETURNING id
      `;

      const result = await this.pool.query(deleteQuery, [
        documentId,
        firebaseUid,
      ]);

      console.log(
        `✅ Favorite removal: ${
          result.rows.length > 0 ? "success" : "not found"
        }`
      );

      return {
        removed: result.rows.length > 0,
      };
    } catch (error) {
      console.error("Error removing favorite:", error);
      throw new APIError("Failed to remove favorite", 500);
    }
  }

  /**
   * Delete document from recent documents
   */
  async deleteRecentDocument(documentId, firebaseUid) {
    try {
      console.log(
        `🗑️ Deleting recent document: ${documentId} for ${firebaseUid}`
      );

      const deleteQuery = `
        DELETE FROM recent_documents 
        WHERE id = $1 AND user_id = $2
        RETURNING id
      `;

      const result = await this.pool.query(deleteQuery, [
        documentId,
        firebaseUid,
      ]);

      console.log(
        `✅ Document deletion: ${
          result.rows.length > 0 ? "success" : "not found"
        }`
      );

      return {
        deleted: result.rows.length > 0,
      };
    } catch (error) {
      console.error("Error deleting recent document:", error);
      throw new APIError("Failed to delete document", 500);
    }
  }
  /**
   * Get tier configurations
   */
  getTiers() {
    return TIERS;
  }

  /**
   * Check if a tier is valid
   */
  isValidTier(tier) {
    return tier && TIERS.hasOwnProperty(tier);
  }

  /**
   * Close database connection
   */
  async close() {
    try {
      await this.pool.end();
      console.log("Database connection pool closed");
    } catch (error) {
      console.error("Error closing database pool:", error);
    }
  }
}

// Export singleton instance
module.exports = new DatabaseService();
