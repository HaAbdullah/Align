import { auth } from "../firebase/firebase";

// Base host (no path suffix). Set VITE_API_URL=http://your-backend-host in your .env
export const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
// BASE_URL + /api — used by apiFetch() so callers pass just the route (e.g. "/create-resume")
export const API_URL = `${BASE_URL}/api`;

/**
 * Returns the current user's Firebase ID token for API authentication.
 * Throws if no user is signed in.
 */
export async function getAuthToken() {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  return user.getIdToken();
}

/**
 * fetch wrapper that automatically attaches the Firebase Bearer token.
 * Use this for all authenticated API calls.
 */
export async function apiFetch(path, options = {}) {
  const token = await getAuthToken();
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };
  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  return response;
}
