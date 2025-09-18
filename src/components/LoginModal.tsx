import { useState, useEffect } from "react";
import { LogIn, User, Lock, Sparkles } from "lucide-react";
import { signInWithGoogle } from "@/auth";
import { verifyToken } from "@/api";

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLogin: (credentials: { email: string; password: string }) => void;
}

export function LoginModal({ open, onOpenChange, onLogin }: LoginModalProps) {
  const [credentials, setCredentials] = useState({
    email: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (credentials.email && credentials.password) {
      setIsLoading(true);
      // Simulate login delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      onLogin(credentials);
      setIsLoading(false);
    }
  };

  const isFormValid = credentials.email && credentials.password;

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    if (open) document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={() => onOpenChange(false)} />
      <div className="relative z-10 sm:max-w-md w-[90vw] border-0 bg-gradient-card backdrop-blur-xl rounded-3xl overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-primary"></div>
        {/* Header */}
        <div className="px-8 pt-8 pb-4">
          <div className="flex items-center justify-center mb-4">
            <div className="h-16 w-16 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-glow">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl text-center font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Welcome Back!
          </h2>
          <p className="text-center text-lg text-muted-foreground">
            Access your personalized AI mentor
          </p>
        </div>
        {/* Login Form */}
        <div className="px-8 pb-8">
          <div className="border-0 bg-white/50 backdrop-blur-sm rounded-2xl">
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3">
                  <label htmlFor="email" className="text-base font-semibold flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={credentials.email}
                    onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                    className="h-12 w-full text-base border-2 focus:border-secondary focus:ring-secondary/20 rounded-xl px-3"
                  />
                </div>

                <div className="space-y-3">
                  <label htmlFor="password" className="text-base font-semibold flex items-center gap-2">
                    <Lock className="h-4 w-4 text-primary" />
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    className="h-12 w-full text-base border-2 focus:border-secondary focus:ring-secondary/20 rounded-xl px-3"
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full h-12 text-base font-bold rounded-xl mt-6 inline-flex items-center justify-center bg-gradient-to-r from-primary to-secondary text-white disabled:opacity-50"
                  disabled={!isFormValid || isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Accessing...
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-5 w-5" />
                      Access MentorMate
                    </>
                  )}
                </button>
              </form>

              <div className="mt-4">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      setIsGoogleLoading(true);
                      const user = await signInWithGoogle();
                      if (!user) throw new Error("No user returned");
                      const idToken = await user.getIdToken();
                      await verifyToken(idToken);
                      onOpenChange(false);
                    } catch (err) {
                      console.error("Google sign-in error", err);
                      alert("Google sign-in failed. Please try again.");
                    } finally {
                      setIsGoogleLoading(false);
                    }
                  }}
                  className="w-full h-12 text-base font-bold rounded-xl inline-flex items-center justify-center border-2 border-primary text-primary bg-white hover:bg-primary/5 disabled:opacity-50"
                  disabled={isGoogleLoading}
                >
                  {isGoogleLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary mr-2"></div>
                      Continue with Google...
                    </>
                  ) : (
                    <>
                      <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="h-5 w-5 mr-2" />
                      Continue with Google
                    </>
                  )}
                </button>
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  You can use email/password or Continue with Google
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}