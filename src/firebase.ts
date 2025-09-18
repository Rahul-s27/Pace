// Firebase initialization for web (React + Vite)
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, setPersistence, browserSessionPersistence } from "firebase/auth";

// Firebase Web App config
// Source: Firebase Console -> Project settings -> General -> Your apps -> SDK setup and configuration
const firebaseConfig = {
  apiKey: "AIzaSyBeBqzMcKWDUPdeSuVijMzF_vri-ayFHb8",
  authDomain: "pace-36576.firebaseapp.com",
  projectId: "pace-36576",
  storageBucket: "pace-36576.firebasestorage.app",
  messagingSenderId: "715534574795",
  appId: "1:715534574795:web:4d06e078c0fb4b9890a74e",
  measurementId: "G-K92WFENHZ4",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth + Google provider exports
export const auth = getAuth(app);
// Use session persistence so reloads don't auto-sign in from previous browser sessions
setPersistence(auth, browserSessionPersistence).catch((err) => {
  // Non-fatal; fallback to default persistence if setting fails
  console.warn("Failed to set auth persistence to session:", err);
});
export const provider = new GoogleAuthProvider();
// Force showing the Google consent screen and account picker every time
provider.setCustomParameters({
  // Space-delimited per OAuth spec to combine prompts
  prompt: "consent select_account",
});
// Ensure standard scopes (these are defaults, but kept explicit for clarity)
provider.addScope("email");
provider.addScope("profile");
