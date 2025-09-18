import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Target, 
  GraduationCap, 
  BookOpen, 
  Users, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  MapPin,
  Star,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Filter,
  Search,
  Sparkles,
  Award,
  Brain
} from "lucide-react";

interface UserProfile {
  name: string;
  age: string;
  educationLevel: string;
  streamOfInterest: string;
}

interface CareerOption {
  id: string;
  title: string;
  description: string;
  match: number;
  salaryRange: string;
  growth: string;
  timeToEntry: string;
  workEnvironment: string;
  skills: string[];
  education: string[];
  whyItFits: string;
  futureRelevance: string;
  icon: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  category: string;
}

const CareerPathFinder = () => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [selectedEducationLevel, setSelectedEducationLevel] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [expandedCareer, setExpandedCareer] = useState<string | null>(null);

  useEffect(() => {
    // Load user profile from localStorage
    try {
      const savedProfile = localStorage.getItem("userProfile");
      if (savedProfile) {
        setUserProfile(JSON.parse(savedProfile));
        setSelectedEducationLevel(JSON.parse(savedProfile).educationLevel);
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
    }
  }, []);

  const educationLevels = [
    { id: "school", label: "School", icon: <BookOpen className="h-5 w-5" /> },
    { id: "college", label: "College/University", icon: <GraduationCap className="h-5 w-5" /> },
    { id: "graduate", label: "Graduate", icon: <Award className="h-5 w-5" /> }
  ];

  const categories = [
    "Technology", "Healthcare", "Business", "Creative", "Science", "Education", "Engineering", "Finance"
  ];

  // Mock career data - in real app, this would come from backend based on user profile
  const careerOptions: CareerOption[] = [
    {
      id: "software-engineer",
      title: "Software Engineer",
      description: "Design and develop software applications, websites, and systems using programming languages.",
      match: 95,
      salaryRange: "$70k - $180k+",
      growth: "22% (Much faster than average)",
      timeToEntry: "6 months - 4 years",
      workEnvironment: "Remote/Office flexibility",
      skills: ["Programming", "Problem-solving", "Logical thinking", "Team collaboration"],
      education: ["Computer Science Degree", "Coding Bootcamp", "Self-taught + Portfolio"],
      whyItFits: "Your interest in technology and analytical thinking makes this a perfect match. The field offers excellent growth opportunities and flexibility.",
      futureRelevance: "Critical role in digital transformation across all industries. AI and automation will enhance rather than replace software engineers.",
      icon: "💻",
      difficulty: "Intermediate",
      category: "Technology"
    },
    {
      id: "data-scientist",
      title: "Data Scientist",
      description: "Analyze complex data to help organizations make informed decisions using statistics and machine learning.",
      match: 88,
      salaryRange: "$80k - $200k+",
      growth: "35% (Much faster than average)",
      timeToEntry: "1-3 years",
      workEnvironment: "Hybrid work, collaborative teams",
      skills: ["Statistics", "Python/R", "Machine Learning", "Data Visualization"],
      education: ["Statistics/Math Degree", "Data Science Bootcamp", "Online Certifications"],
      whyItFits: "Your analytical mindset and interest in mathematics align perfectly with this data-driven career path.",
      futureRelevance: "Essential for AI implementation and business intelligence. Growing demand across all sectors.",
      icon: "📊",
      difficulty: "Advanced",
      category: "Technology"
    },
    {
      id: "product-manager",
      title: "Product Manager",
      description: "Lead product development from conception to launch, working with cross-functional teams.",
      match: 82,
      salaryRange: "$85k - $160k+",
      growth: "15% (Faster than average)",
      timeToEntry: "2-5 years",
      workEnvironment: "Office/Remote hybrid",
      skills: ["Leadership", "Strategic thinking", "Communication", "Analytics"],
      education: ["Business Degree", "MBA", "Product Management Certifications"],
      whyItFits: "Your leadership potential and strategic thinking make you well-suited for product management roles.",
      futureRelevance: "Critical for digital product development and innovation across industries.",
      icon: "🚀",
      difficulty: "Intermediate",
      category: "Business"
    },
    {
      id: "ui-ux-designer",
      title: "UI/UX Designer",
      description: "Create user-friendly interfaces and experiences for digital products and applications.",
      match: 85,
      salaryRange: "$55k - $120k+",
      growth: "18% (Much faster than average)",
      timeToEntry: "1-3 years",
      workEnvironment: "Creative agencies, tech companies",
      skills: ["Design thinking", "User research", "Prototyping", "Visual design"],
      education: ["Design Degree", "UI/UX Bootcamp", "Portfolio development"],
      whyItFits: "Your creative thinking and attention to detail make you a natural fit for user experience design.",
      futureRelevance: "Essential for digital transformation and user-centered product development.",
      icon: "🎨",
      difficulty: "Beginner",
      category: "Creative"
    },
    {
      id: "digital-marketing",
      title: "Digital Marketing Specialist",
      description: "Develop and execute marketing strategies using digital channels and analytics.",
      match: 78,
      salaryRange: "$45k - $100k+",
      growth: "12% (Faster than average)",
      timeToEntry: "1-2 years",
      workEnvironment: "Agency/Corporate, flexible",
      skills: ["Digital marketing", "Analytics", "Content creation", "SEO/SEM"],
      education: ["Marketing Degree", "Digital Marketing Certifications"],
      whyItFits: "Your communication skills and creativity align well with modern marketing approaches.",
      futureRelevance: "Growing importance of digital presence and data-driven marketing strategies.",
      icon: "📱",
      difficulty: "Beginner",
      category: "Business"
    },
    {
      id: "cybersecurity-analyst",
      title: "Cybersecurity Analyst",
      description: "Protect organizations from cyber threats and ensure information security.",
      match: 90,
      salaryRange: "$70k - $150k+",
      growth: "31% (Much faster than average)",
      timeToEntry: "2-4 years",
      workEnvironment: "Office/Remote, high-security environment",
      skills: ["Security protocols", "Risk assessment", "Incident response", "Technical analysis"],
      education: ["Computer Science Degree", "Cybersecurity Certifications"],
      whyItFits: "Your analytical skills and attention to detail are crucial for identifying and preventing security threats.",
      futureRelevance: "Critical role as cyber threats continue to evolve and increase.",
      icon: "🔒",
      difficulty: "Advanced",
      category: "Technology"
    }
  ];

  const filteredCareers = careerOptions.filter(career => {
    const matchesEducation = selectedEducationLevel === "all" || 
      (selectedEducationLevel === "school" && career.difficulty === "Beginner") ||
      (selectedEducationLevel === "college" && career.difficulty === "Intermediate") ||
      (selectedEducationLevel === "graduate" && career.difficulty === "Advanced");
    
    const matchesSearch = career.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      career.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      career.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === "all" || career.category === selectedCategory;
    
    return matchesEducation && matchesSearch && matchesCategory;
  });

  const toggleCareerExpansion = (careerId: string) => {
    setExpandedCareer(expandedCareer === careerId ? null : careerId);
  };

  const getMatchColor = (match: number) => {
    if (match >= 90) return "text-green-600 bg-green-100";
    if (match >= 80) return "text-blue-600 bg-blue-100";
    if (match >= 70) return "text-yellow-600 bg-yellow-100";
    return "text-gray-600 bg-gray-100";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="px-6 py-6 border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/features")}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="h-10 w-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                <Target className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">AI Career Path Finder</h1>
                <p className="text-muted-foreground">
                  Discover careers that match your profile and interests
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Filters */}
          <div className="bg-card rounded-xl border p-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Education Level Filter */}
              <div className="flex-1">
                <label className="block text-sm font-medium mb-3">Education Level</label>
                <div className="flex gap-2 flex-wrap">
                  {educationLevels.map((level) => (
                    <button
                      key={level.id}
                      onClick={() => setSelectedEducationLevel(level.id)}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                        selectedEducationLevel === level.id
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background hover:bg-muted border-border"
                      }`}
                    >
                      {level.icon}
                      {level.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              <div className="flex-1">
                <label className="block text-sm font-medium mb-3">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-background"
                >
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Search */}
              <div className="flex-1">
                <label className="block text-sm font-medium mb-3">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search careers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border rounded-lg bg-background"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                {filteredCareers.length} Career Path{filteredCareers.length !== 1 ? 's' : ''} Found
              </h2>
              <p className="text-muted-foreground">
                Based on your profile and preferences
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4" />
              <span>AI-Powered Matching</span>
            </div>
          </div>

          {/* Career Cards */}
          <div className="grid gap-6">
            {filteredCareers.map((career) => (
              <div
                key={career.id}
                className="bg-card rounded-xl border shadow-card hover:shadow-hover transition-all duration-300"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="text-4xl">{career.icon}</div>
                      <div>
                        <h3 className="text-xl font-semibold">{career.title}</h3>
                        <p className="text-muted-foreground">{career.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getMatchColor(career.match)}`}>
                        <Star className="h-3 w-3" />
                        {career.match}% Match
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium text-sm">{career.salaryRange}</div>
                        <div className="text-xs text-muted-foreground">Salary Range</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium text-sm">{career.growth}</div>
                        <div className="text-xs text-muted-foreground">Job Growth</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium text-sm">{career.timeToEntry}</div>
                        <div className="text-xs text-muted-foreground">Time to Entry</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium text-sm">{career.workEnvironment}</div>
                        <div className="text-xs text-muted-foreground">Work Style</div>
                      </div>
                    </div>
                  </div>

                  {/* Expandable Content */}
                  <div className="border-t pt-4">
                    <button
                      onClick={() => toggleCareerExpansion(career.id)}
                      className="w-full flex items-center justify-between text-left hover:bg-muted/50 rounded-lg p-2 -m-2 transition-colors"
                    >
                      <span className="font-medium">View Details & Analysis</span>
                      {expandedCareer === career.id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>

                    {expandedCareer === career.id && (
                      <div className="mt-4 space-y-6">
                        {/* Why It Fits */}
                        <div className="bg-primary/5 rounded-lg p-4">
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <Brain className="h-4 w-4 text-primary" />
                            Why This Career Fits You
                          </h4>
                          <p className="text-muted-foreground">{career.whyItFits}</p>
                        </div>

                        {/* Future Relevance */}
                        <div className="bg-success/5 rounded-lg p-4">
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-success" />
                            Future Growth & Relevance
                          </h4>
                          <p className="text-muted-foreground">{career.futureRelevance}</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                          {/* Required Skills */}
                          <div>
                            <h4 className="font-semibold mb-3">Key Skills</h4>
                            <div className="flex flex-wrap gap-2">
                              {career.skills.map((skill, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs bg-muted text-foreground"
                                >
                                  <CheckCircle className="h-3 w-3" />
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Education Paths */}
                          <div>
                            <h4 className="font-semibold mb-3">Education Options</h4>
                            <ul className="space-y-2">
                              {career.education.map((edu, index) => (
                                <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <GraduationCap className="h-3 w-3" />
                                  {edu}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4 border-t">
                          <button className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg font-medium transition-colors">
                            Explore Learning Path
                          </button>
                          <button className="flex-1 border border-border hover:bg-muted px-4 py-2 rounded-lg font-medium transition-colors">
                            Save Career
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredCareers.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">No careers found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your filters or search terms
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setSelectedEducationLevel("all");
                }}
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CareerPathFinder;
