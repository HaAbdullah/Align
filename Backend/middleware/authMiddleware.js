const admin = require("firebase-admin");

// Initialize Firebase Admin once (idempotent)
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

/**
 * Verifies the Firebase ID token in the Authorization header.
 * Sets req.firebaseUid on success.
 */
async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, error: { message: "Unauthorized", status: 401 } });
  }

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.firebaseUid = decoded.uid;
    next();
  } catch {
    return res.status(401).json({ success: false, error: { message: "Invalid or expired token", status: 401 } });
  }
}

module.exports = { requireAuth, admin };
