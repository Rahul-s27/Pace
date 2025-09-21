import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { WelcomePage } from "@/components/WelcomePage";
import { CounsellingSession } from "@/components/CounsellingSession";
import { auth } from "@/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";

interface UserProfile {
  name: string;
  age: string;
  educationLevel: string;
  streamOfInterest: string;
}

type AppState = "welcome" | "counselling";

const Index = () => {
  const navigate = useNavigate();
  const [currentState, setCurrentState] = useState<AppState>("welcome");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setFirebaseUser(u));
    return () => unsub();
  }, []);

  // Persist state whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem("appState", currentState);
      if (userProfile) {
        localStorage.setItem("userProfile", JSON.stringify(userProfile));
      } else {
        localStorage.removeItem("userProfile");
      }
    } catch (_) {
      // storage might be unavailable; fail silently
    }
  }, [currentState, userProfile]);

  const handleStart = (profile: UserProfile) => {
    setUserProfile(profile);
    setCurrentState("counselling");
  };

  const handleCounsellingComplete = (_conversationSummary: string) => {
    // Directly navigate to features after counselling session completes
    navigate("/features");
  };

  const handleRestart = () => {
    setCurrentState("welcome");
    setUserProfile(null);
    try {
      localStorage.removeItem("appState");
      localStorage.removeItem("userProfile");
    } catch (_) {}
  };

  const handleBackToWelcome = () => {
    setCurrentState("welcome");
    try {
      localStorage.removeItem("appState");
      localStorage.removeItem("userProfile");
    } catch (_) {}
  };

  if (currentState === "welcome") {
    return (
      <div className="relative min-h-screen">
        {/* Top-right user avatar and logout */}
        <div className="absolute top-4 right-6 z-50">
          {firebaseUser ? (
            <div className="flex items-center gap-3">
              <img
                src={firebaseUser.photoURL || "https://ui-avatars.com/api/?name=" + encodeURIComponent(firebaseUser.displayName || firebaseUser.email || "U")}
                alt="avatar"
                className="h-9 w-9 rounded-full border"
              />
              <div className="hidden sm:block text-white">
                <div className="text-sm font-semibold leading-tight">
                  {firebaseUser.displayName || firebaseUser.email}
                </div>
              </div>
              <button
                onClick={() => signOut(auth)}
                className="ml-2 text-sm font-semibold px-3 py-1 rounded-lg bg-white/15 text-white border border-white/30 hover:bg-white/25"
              >
                Logout
              </button>
            </div>
          ) : null}
        </div>

        <WelcomePage onStart={handleStart} />
      </div>
    );
  }

  if (currentState === "counselling" && userProfile) {
    return (
      <CounsellingSession 
        profile={userProfile} 
        onComplete={handleCounsellingComplete}
        onBack={handleBackToWelcome}
      />
    );
  }

  return <WelcomePage onStart={handleStart} />;
};

export default Index;