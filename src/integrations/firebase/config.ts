/**
 * Firebase configuration for phone authentication (OTP).
 *
 * The `firebase` package is already installed in package.json.
 * This file initialises the Firebase app and exports the Auth instance
 * so that PhoneOTPAuth can use it to send / verify SMS OTP codes.
 *
 * ── IMPORTANT ─────────────────────────────────────────────────────────
 * You MUST add the following variables to your `.env` file:
 *   VITE_FIREBASE_API_KEY=…
 *   VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
 *   VITE_FIREBASE_PROJECT_ID=your-project-id
 *   VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
 *   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
 *   VITE_FIREBASE_APP_ID=your-app-id
 *
 * Also make sure Phone Authentication is enabled in the Firebase Console.
 * ─────────────────────────────────────────────────────────────────────
 */

import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
};

// Initialise Firebase only once (Vite HMR can cause double-inits)
const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

// Export the Auth instance for use throughout the app
export const firebaseAuth: Auth = getAuth(app);

export default app;
