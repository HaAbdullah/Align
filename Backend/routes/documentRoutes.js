/**
 * Document Routes - Saved Documents Management
 * Handles retrieval, favoriting, and management of user's generated documents
 */

const express = require("express");
const { asyncHandler } = require("../middleware/errorMiddleware");
const { simpleValidators } = require("../middleware/validation");
const databaseService = require("../services/databaseService");

const router = express.Router();

/**
 * GET /api/documents/recent/:firebaseUid
 * Get user's recent documents (last 20 generated)
 */
router.get(
  "/recent/:firebaseUid",
  simpleValidators.firebaseUid,
  asyncHandler(async (req, res) => {
    const { firebaseUid } = req.params;
    const { limit = 20, offset = 0, type } = req.query;

    console.log(`Recent documents request for: ${firebaseUid}`, {
      limit: parseInt(limit),
      offset: parseInt(offset),
      type,
    });

    try {
      const result = await databaseService.getRecentDocuments(firebaseUid, {
        limit: parseInt(limit),
        offset: parseInt(offset),
        documentType: type,
      });

      console.log(`Returning ${result.documents.length} recent documents`);

      res.json({
        success: true,
        data: {
          documents: result.documents,
          totalCount: result.totalCount,
          hasMore: result.hasMore,
          pagination: {
            limit: parseInt(limit),
            offset: parseInt(offset),
            nextOffset: result.hasMore
              ? parseInt(offset) + parseInt(limit)
              : null,
          },
        },
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
      throw error;
    }
  })
);

/**
 * GET /api/documents/favorites/:firebaseUid
 * Get user's favorited documents

 */
router.get(
  "/favorites/:firebaseUid",
  simpleValidators.firebaseUid,
  asyncHandler(async (req, res) => {
    const { firebaseUid } = req.params;
    const { limit = 50, offset = 0, type } = req.query;

    console.log(`Favorited documents request for: ${firebaseUid}`, {
      limit: parseInt(limit),
      offset: parseInt(offset),
      type,
    });

    try {
      const result = await databaseService.getFavoritedDocuments(firebaseUid, {
        limit: parseInt(limit),
        offset: parseInt(offset),
        documentType: type,
      });

      console.log(`Returning ${result.documents.length} favorited documents`);

      res.json({
        success: true,
        data: {
          documents: result.documents,
          totalCount: result.totalCount,
          hasMore: result.hasMore,
          pagination: {
            limit: parseInt(limit),
            offset: parseInt(offset),
            nextOffset: result.hasMore
              ? parseInt(offset) + parseInt(limit)
              : null,
          },
        },
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
      throw error;
    }
  })
);

/**
 * GET /api/documents/:documentId
 * Get a specific document by ID (works for both recent and favorited)
 */
router.get(
  "/:documentId",
  asyncHandler(async (req, res) => {
    const { documentId } = req.params;
    const { firebaseUid } = req.query; // Optional user verification

    console.log(`Single document request: ${documentId}`);

    try {
      const document = await databaseService.getDocumentById(
        documentId,
        firebaseUid
      );

      console.log(
        `📤 Returning document: ${document.document_type} (${document.id})`
      );

      res.json({
        success: true,
        data: document,
      });
    } catch (error) {
      if (error.message.includes("Document not found")) {
        return res.status(404).json({
          success: false,
          error: {
            message: "Document not found",
            status: 404,
          },
        });
      }
      if (error.message.includes("Access denied")) {
        return res.status(403).json({
          success: false,
          error: {
            message: "You don't have permission to access this document",
            status: 403,
          },
        });
      }
      throw error;
    }
  })
);

/**
 * POST /api/documents/save
 * Save a new document to recent_documents
 *
 * FAANG Pattern: Document creation with automatic cleanup
 */
router.post(
  "/save",
  asyncHandler(async (req, res) => {
    const { firebaseUid, documentType, htmlContent } = req.body;

    // Validation
    if (!firebaseUid || !documentType || !htmlContent) {
      return res.status(400).json({
        success: false,
        error: {
          message: "firebaseUid, documentType, and htmlContent are required",
          status: 400,
          missingFields: {
            firebaseUid: !firebaseUid,
            documentType: !documentType,
            htmlContent: !htmlContent,
          },
        },
      });
    }

    if (!["resume", "cover_letter"].includes(documentType)) {
      return res.status(400).json({
        success: false,
        error: {
          message: "documentType must be 'resume' or 'cover_letter'",
          status: 400,
        },
      });
    }

    console.log(`💾 Save document request for: ${firebaseUid}`, {
      type: documentType,
      htmlLength: htmlContent.length,
    });

    try {
      const savedDocument = await databaseService.saveDocument({
        firebaseUid,
        documentType,
        htmlContent,
      });

      console.log(`📤 Document saved with ID: ${savedDocument.id}`);

      res.status(201).json({
        success: true,
        data: savedDocument,
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
      throw error;
    }
  })
);

/**
 * POST /api/documents/:documentId/favorite
 * Add document to favorites (copy from recent to favorites)
 */
router.post(
  "/:documentId/favorite",
  asyncHandler(async (req, res) => {
    const { documentId } = req.params;
    const { firebaseUid } = req.body;

    if (!firebaseUid) {
      return res.status(400).json({
        success: false,
        error: {
          message: "firebaseUid is required",
          status: 400,
        },
      });
    }

    console.log(
      `⭐ Favorite document request: ${documentId} by ${firebaseUid}`
    );

    try {
      const result = await databaseService.favoriteDocument(
        documentId,
        firebaseUid
      );

      console.log(
        `Document favorited: ${
          result.alreadyFavorited ? "already existed" : "newly added"
        }`
      );

      res.json({
        success: true,
        data: {
          message: result.alreadyFavorited
            ? "Document was already in favorites"
            : "Document added to favorites",
          document: result.document,
          alreadyFavorited: result.alreadyFavorited,
        },
      });
    } catch (error) {
      if (error.message.includes("Document not found")) {
        return res.status(404).json({
          success: false,
          error: {
            message:
              "Document not found or you don't have permission to favorite it",
            status: 404,
          },
        });
      }
      throw error;
    }
  })
);

/**
 * DELETE /api/documents/favorites/:documentId
 * Remove document from favorites
 */
router.delete(
  "/favorites/:documentId",
  asyncHandler(async (req, res) => {
    const { documentId } = req.params;
    const { firebaseUid } = req.query;

    if (!firebaseUid) {
      return res.status(400).json({
        success: false,
        error: {
          message: "firebaseUid is required",
          status: 400,
        },
      });
    }

    console.log(`Remove favorite request: ${documentId} by ${firebaseUid}`);

    try {
      const result = await databaseService.removeFavorite(
        documentId,
        firebaseUid
      );

      console.log(`Favorite removed: ${result.removed}`);

      res.json({
        success: true,
        data: {
          message: result.removed
            ? "Document removed from favorites"
            : "Document was not in favorites",
          removed: result.removed,
        },
      });
    } catch (error) {
      throw error;
    }
  })
);

/**
 * DELETE /api/documents/recent/:documentId
 * Delete document from recent documents
 */
router.delete(
  "/recent/:documentId",
  asyncHandler(async (req, res) => {
    const { documentId } = req.params;
    const { firebaseUid } = req.query;

    if (!firebaseUid) {
      return res.status(400).json({
        success: false,
        error: {
          message: "firebaseUid is required",
          status: 400,
        },
      });
    }

    console.log(
      `Delete recent document request: ${documentId} by ${firebaseUid}`
    );

    try {
      const result = await databaseService.deleteRecentDocument(
        documentId,
        firebaseUid
      );

      console.log(`Recent document deleted: ${result.deleted}`);

      res.json({
        success: true,
        data: {
          message: result.deleted
            ? "Document deleted successfully"
            : "Document not found",
          deleted: result.deleted,
        },
      });
    } catch (error) {
      throw error;
    }
  })
);

module.exports = router;
