import { signInWithPopup, signOut } from "firebase/auth";
import { auth, provider } from "./firebase";

export async function signInWithGoogle() {
  try {
    // Ensure a fresh sign-in flow to show account/consent prompts
    try { await signOut(auth); } catch (_) {}
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Google sign-in failed", error);
    throw error;
  }
}
