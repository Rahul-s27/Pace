import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Target, 
  BookOpen, 
  MessageCircle, 
  TrendingUp, 
  Search, 
  BarChart3, 
  Users,
  ArrowRight,
  Sparkles,
  Star,
  Clock,
  Award,
  Brain,
  Lightbulb,
  Zap,
  Globe,
  ChevronRight
} from "lucide-react";

interface UserProfile {
  name: string;
  age: string;
  educationLevel: string;
  streamOfInterest: string;
}

interface FeatureCard {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
  route: string;
  highlight?: boolean;
  stats?: string;
}

const FeaturesPage = () => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    // Load user profile from localStorage or context
    try {
      const savedProfile = localStorage.getItem("userProfile");
      if (savedProfile) {
        setUserProfile(JSON.parse(savedProfile));
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
    }
  }, []);

  const features: FeatureCard[] = [
    {
      id: "career-path",
      title: "AI Career Path Finder",
      description: "Discover personalized career paths tailored to your interests, skills, and education level.",
      icon: <Target className="h-8 w-8" />,
      color: "text-blue-600",
      gradient: "from-blue-500 to-indigo-600",
      route: "/career-path-finder",
      highlight: true,
      stats: "95% accuracy match"
    },
    {
      id: "learning-pathways",
      title: "Personalized Learning Pathways",
      description: "Get custom roadmaps with courses, certifications, and projects to reach your career goals.",
      icon: <BookOpen className="h-8 w-8" />,
      color: "text-green-600",
      gradient: "from-green-500 to-emerald-600",
      route: "/learning-pathways",
      stats: "500+ courses mapped"
    },
    {
      id: "ai-mentor",
      title: "AI Mentor-like Guidance",
      description: "Chat with your personal AI mentor for career advice, motivation, and personalized guidance.",
      icon: <MessageCircle className="h-8 w-8" />,
      color: "text-purple-600",
      gradient: "from-purple-500 to-violet-600",
      route: "/ai-mentor",
      stats: "24/7 available"
    },
    {
      id: "industry-trends",
      title: "Industry & Future Trends",
      description: "Stay ahead with insights on growing industries, emerging roles, and market trends.",
      icon: <TrendingUp className="h-8 w-8" />,
      color: "text-orange-600",
      gradient: "from-orange-500 to-red-500",
      route: "/industry-trends",
      stats: "Real-time data"
    },
    {
      id: "opportunity-finder",
      title: "Opportunity Finder",
      description: "Find internships, scholarships, competitions, and job opportunities matching your profile.",
      icon: <Search className="h-8 w-8" />,
      color: "text-teal-600",
      gradient: "from-teal-500 to-cyan-600",
      route: "/opportunity-finder",
      stats: "10,000+ opportunities"
    },
    {
      id: "skill-gap-analysis",
      title: "Skill Gap Analysis",
      description: "Analyze your current skills vs. required skills with personalized improvement recommendations.",
      icon: <BarChart3 className="h-8 w-8" />,
      color: "text-pink-600",
      gradient: "from-pink-500 to-rose-600",
      route: "/skill-gap-analysis",
      stats: "AI-powered insights"
    },
    {
      id: "mentor-matching",
      title: "Mentor Matching AI",
      description: "Connect with industry experts and mentors who match your career goals and learning style.",
      icon: <Users className="h-8 w-8" />,
      color: "text-indigo-600",
      gradient: "from-indigo-500 to-purple-600",
      route: "/mentor-matching",
      stats: "500+ mentors"
    }
  ];

  const quickInsights = [
    {
      icon: <Brain className="h-5 w-5" />,
      title: "AI-Powered",
      description: "Advanced algorithms analyze your profile"
    },
    {
      icon: <Lightbulb className="h-5 w-5" />,
      title: "Personalized",
      description: "Tailored recommendations just for you"
    },
    {
      icon: <Zap className="h-5 w-5" />,
      title: "Real-time",
      description: "Up-to-date market insights and trends"
    },
    {
      icon: <Globe className="h-5 w-5" />,
      title: "Global Reach",
      description: "Opportunities worldwide at your fingertips"
    }
  ];

  const handleFeatureClick = (route: string) => {
    navigate(route);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
      <header className="px-6 py-6 border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  {userProfile ? `Welcome back, ${userProfile.name}!` : "AI Career Platform"}
                </h1>
                <p className="text-muted-foreground">
                  Your comprehensive career development hub
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium">Premium Features</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="px-6 py-12">
        <div className="max-w-7xl mx-auto space-y-12">
          
          {/* Hero Section */}
          <section className="text-center">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Explore Your Career Journey
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Discover personalized career paths, learning opportunities, and industry insights powered by AI
              </p>
              
              {/* Quick Insights */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                {quickInsights.map((insight, index) => (
                  <div key={index} className="flex items-center gap-3 p-4 bg-card rounded-xl border shadow-sm">
                    <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                      {insight.icon}
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-sm">{insight.title}</h3>
                      <p className="text-xs text-muted-foreground">{insight.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Features Grid */}
          <section>
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold mb-4">All Features</h3>
              <p className="text-lg text-muted-foreground">
                Choose from our comprehensive suite of career development tools
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <div
                  key={feature.id}
                  onClick={() => handleFeatureClick(feature.route)}
                  className={`group relative cursor-pointer transition-all duration-300 hover:scale-105 ${
                    feature.highlight ? 'ring-2 ring-primary/50' : ''
                  }`}
                >
                  <div className="shadow-card rounded-xl border bg-card hover:shadow-hover transition-all duration-300 h-full">
                    {feature.highlight && (
                      <div className="absolute -top-3 left-4">
                        <span className="inline-flex items-center rounded-full px-3 py-1 text-xs bg-primary text-primary-foreground font-semibold">
                          <Star className="w-3 h-3 mr-1" />
                          Recommended
                        </span>
                      </div>
                    )}
                    
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`h-12 w-12 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center text-white shadow-lg`}>
                          {feature.icon}
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      
                      <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground mb-4 leading-relaxed">
                        {feature.description}
                      </p>
                      
                      {feature.stats && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                          <div className="h-1 w-1 bg-muted-foreground rounded-full"></div>
                          <span>{feature.stats}</span>
                        </div>
                      )}
                      
                      <button className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors py-2.5 px-4 font-medium">
                        Explore
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Stats Section */}
          <section className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-2xl p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-primary mb-1">10K+</div>
                <div className="text-sm text-muted-foreground">Students Helped</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-secondary mb-1">500+</div>
                <div className="text-sm text-muted-foreground">Career Paths</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-accent mb-1">95%</div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-1">24/7</div>
                <div className="text-sm text-muted-foreground">AI Support</div>
              </div>
            </div>
          </section>

          {/* Call to Action */}
          <section className="text-center">
            <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-8 text-primary-foreground">
              <h3 className="text-2xl font-bold mb-4">Ready to Transform Your Career?</h3>
              <p className="text-primary-foreground/90 mb-6 max-w-2xl mx-auto">
                Join thousands of students who have found their dream career path with our AI-powered platform
              </p>
              <button 
                onClick={() => handleFeatureClick("/career-path-finder")}
                className="bg-white text-primary hover:bg-white/90 inline-flex items-center justify-center rounded-lg h-12 px-6 font-semibold transition-colors"
              >
                Start Your Journey
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default FeaturesPage;
