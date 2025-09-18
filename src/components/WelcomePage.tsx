import { useEffect, useState, FormEvent } from "react";
import { ArrowRight, Target, Sparkles, Zap, Brain, Rocket } from "lucide-react";
import heroImage from "../assets/hero-image.jpg";
import { auth } from "@/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { signInWithGoogle } from "@/auth";
import { verifyToken } from "@/api";

interface UserProfile {
  name: string;
  age: string;
  educationLevel: string;
  streamOfInterest: string;
}

interface WelcomePageProps {
  onStart: (profile: UserProfile) => void;
}

export function WelcomePage({ onStart }: WelcomePageProps) {
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    age: "",
    educationLevel: "",
    streamOfInterest: ""
  });
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setFirebaseUser(u));
    return () => unsub();
  }, []);

  const handleLaunchClick = (e: FormEvent) => {
    e.preventDefault();
    if (!firebaseUser) return; // Guard; button will be disabled anyway
    if (profile.name && profile.age && profile.educationLevel) {
      onStart(profile);
    }
  };

  const isFormValid = profile.name && profile.age && profile.educationLevel;
  const isAuthenticated = !!firebaseUser;

  return (
    <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
      {/* Animated Background Mesh */}
      <div className="absolute inset-0 bg-gradient-mesh opacity-40"></div>
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-accent/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-60 right-20 w-24 h-24 bg-secondary/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-40 left-1/4 w-40 h-40 bg-primary/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header */}
      <header className="relative px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
              <Sparkles className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">MentorMate AI</h1>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Hero Content */}
            <div className="space-y-10">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                  <Zap className="h-4 w-4 text-accent animate-pulse" />
                  <span className="text-white/90 text-sm font-medium">AI-Powered Career Intelligence</span>
                </div>
                
                <h2 className="text-6xl lg:text-7xl font-black text-white leading-none tracking-tight">
                  Your 
                  <span className="bg-gradient-to-r from-accent to-warning bg-clip-text text-transparent"> Future</span>
                  <br />
                  Starts Here
                </h2>
                <p className="text-xl text-white/80 leading-relaxed max-w-lg">
                  Unlock personalized career insights with our next-generation AI mentor. 
                  Discover paths you never knew existed.
                </p>
              </div>

              {/* Features */}
              <div className="grid sm:grid-cols-3 gap-8">
                <div className="group">
                  <div className="flex items-center gap-4 text-white">
                    <div className="h-14 w-14 bg-gradient-to-br from-accent/30 to-accent/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform duration-300">
                      <Brain className="h-7 w-7 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">AI-Powered</h3>
                      <p className="text-sm text-white/70">Smart insights</p>
                    </div>
                  </div>
                </div>
                <div className="group">
                  <div className="flex items-center gap-4 text-white">
                    <div className="h-14 w-14 bg-gradient-to-br from-primary/30 to-primary/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform duration-300">
                      <Rocket className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Future-Ready</h3>
                      <p className="text-sm text-white/70">Tomorrow's careers</p>
                    </div>
                  </div>
                </div>
                <div className="group">
                  <div className="flex items-center gap-4 text-white">
                    <div className="h-14 w-14 bg-gradient-to-br from-secondary/30 to-secondary/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform duration-300">
                      <Target className="h-7 w-7 text-secondary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Precision</h3>
                      <p className="text-sm text-white/70">Targeted guidance</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right column: show either Google Sign-In card (unauthenticated) or the form (authenticated) */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-xl"></div>
              <div className="relative shadow-2xl border-0 bg-white/95 backdrop-blur-xl rounded-3xl overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-primary"></div>

                {isAuthenticated ? (
                  <>
                    <div className="space-y-4 pb-8 p-6">
                      <div className="flex items-center justify-center">
                        <div className="h-16 w-16 bg-gradient-primary rounded-2xl flex items-center justify-center">
                          <Sparkles className="h-8 w-8 text-white" />
                        </div>
                      </div>
                      <h3 className="text-3xl text-center font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        Tell us about you
                      </h3>
                      <p className="text-center text-lg text-muted-foreground">
                        You’re signed in. Complete the details to begin.
                      </p>
                    </div>
                    <div className="px-8 pb-8">
                      <form onSubmit={handleLaunchClick} className="space-y-6">
                        <div className="space-y-3">
                          <label htmlFor="name" className="text-base font-semibold">Your Name</label>
                          <input
                            id="name"
                            placeholder="Enter your full name"
                            value={profile.name}
                            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                            className="h-14 w-full text-lg border-2 px-3 focus:border-primary focus:ring-primary/20 rounded-xl"
                          />
                        </div>

                        <div className="space-y-3">
                          <label htmlFor="age" className="text-base font-semibold">Age Group</label>
                          <select
                            id="age"
                            className="h-14 w-full text-lg border-2 rounded-xl px-3 focus:outline-none focus:border-primary"
                            value={profile.age}
                            onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                          >
                            <option value="" disabled>Select your age group</option>
                            <option value="13-15">13-15 years</option>
                            <option value="16-18">16-18 years</option>
                            <option value="19-22">19-22 years</option>
                            <option value="23-25">23-25 years</option>
                            <option value="26+">26+ years</option>
                          </select>
                        </div>

                        <div className="space-y-3">
                          <label htmlFor="education" className="text-base font-semibold">Education Level</label>
                          <select
                            id="education"
                            className="h-14 w-full text-lg border-2 rounded-xl px-3 focus:outline-none focus:border-primary"
                            value={profile.educationLevel}
                            onChange={(e) => setProfile({ ...profile, educationLevel: e.target.value })}
                          >
                            <option value="" disabled>Select your education level</option>
                            <option value="high-school">High School (9th-12th)</option>
                            <option value="undergraduate">Undergraduate</option>
                            <option value="graduate">Graduate</option>
                            <option value="working">Working Professional</option>
                            <option value="other">Other</option>
                          </select>
                        </div>

                        <div className="space-y-3">
                          <label htmlFor="stream" className="text-base font-semibold">Interest Area <span className="text-muted-foreground font-normal">(Optional)</span></label>
                          <select
                            id="stream"
                            className="h-14 w-full text-lg border-2 rounded-xl px-3 focus:outline-none focus:border-primary"
                            value={profile.streamOfInterest}
                            onChange={(e) => setProfile({ ...profile, streamOfInterest: e.target.value })}
                          >
                            <option value="">Choose if you have a preference</option>
                            <option value="engineering">🔧 Engineering & Technology</option>
                            <option value="medical">🏥 Medical & Healthcare</option>
                            <option value="business">💼 Business & Management</option>
                            <option value="arts">🎨 Arts & Creative</option>
                            <option value="science">🔬 Science & Research</option>
                            <option value="social-sciences">📚 Social Sciences</option>
                            <option value="education">👨‍🏫 Education & Teaching</option>
                            <option value="exploring">🌟 Still Exploring</option>
                          </select>
                        </div>

                        <button
                          type="submit"
                          className="w-full h-16 text-xl font-bold rounded-xl mt-8 inline-flex items-center justify-center bg-gradient-to-r from-primary to-secondary text-white disabled:opacity-50"
                          disabled={!isFormValid}
                        >
                          <Rocket className="mr-3 h-6 w-6" />
                          Launch My AI Career Journey
                          <ArrowRight className="ml-3 h-6 w-6" />
                        </button>
                      </form>
                    </div>
                  </>
                ) : (
                  <div className="px-8 pb-8 pt-8">
                    <div className="flex items-center justify-center mb-6">
                      <div className="h-16 w-16 bg-gradient-primary rounded-2xl flex items-center justify-center">
                        <Sparkles className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <h3 className="text-3xl text-center font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      Sign in to continue
                    </h3>
                    <p className="text-center text-lg text-muted-foreground mt-2">
                      Use your Google account. You’ll see a Google authorization popup.
                    </p>
                    <div className="mt-8">
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            setIsGoogleLoading(true);
                            const user = await signInWithGoogle();
                            if (!user) throw new Error("No user returned");
                            const idToken = await user.getIdToken(true);
                            // Small delay to avoid rare 'token used too early' when client/server clocks differ by ~1s
                            await new Promise((r) => setTimeout(r, 1200));
                            await verifyToken(idToken);
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
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Image */}
      <div className="relative px-6 pb-20">
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl group">
            <img 
              src={heroImage} 
              alt="Next-generation AI career counseling platform"
              className="w-full h-72 sm:h-96 object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <h3 className="text-white text-2xl font-bold mb-2">AI-Powered Career Intelligence</h3>
              <p className="text-white/80">Experience the future of career counseling with our advanced AI mentor</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}