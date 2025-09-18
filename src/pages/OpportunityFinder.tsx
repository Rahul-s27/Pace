import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  Users, 
  Star,
  ExternalLink,
  Calendar,
  Award,
  GraduationCap,
  Briefcase,
  Trophy,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Bookmark,
  Share2,
  Eye,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Target,
  Globe
} from "lucide-react";

interface UserProfile {
  name: string;
  age: string;
  educationLevel: string;
  streamOfInterest: string;
}

interface Opportunity {
  id: string;
  title: string;
  type: "Internship" | "Scholarship" | "Competition" | "Job" | "Fellowship" | "Exchange";
  organization: string;
  description: string;
  location: string;
  deadline: string;
  requirements: string[];
  benefits: string[];
  applicationUrl: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  category: string;
  isRemote: boolean;
  isUrgent: boolean;
  rating: number;
  applicants: number;
  salary?: string;
  duration?: string;
  eligibility: string[];
}

const OpportunityFinder = () => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("relevance");
  const [expandedOpportunity, setExpandedOpportunity] = useState<string | null>(null);
  const [savedOpportunities, setSavedOpportunities] = useState<string[]>([]);

  useEffect(() => {
    // Load user profile from localStorage
    try {
      const savedProfile = localStorage.getItem("userProfile");
      if (savedProfile) {
        setUserProfile(JSON.parse(savedProfile));
      }
      const saved = localStorage.getItem("savedOpportunities");
      if (saved) {
        setSavedOpportunities(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
  }, []);

  const opportunityTypes = [
    { id: "all", label: "All", icon: <Target className="h-4 w-4" /> },
    { id: "internship", label: "Internships", icon: <Briefcase className="h-4 w-4" /> },
    { id: "scholarship", label: "Scholarships", icon: <Award className="h-4 w-4" /> },
    { id: "competition", label: "Competitions", icon: <Trophy className="h-4 w-4" /> },
    { id: "job", label: "Jobs", icon: <Users className="h-4 w-4" /> },
    { id: "fellowship", label: "Fellowships", icon: <GraduationCap className="h-4 w-4" /> },
    { id: "exchange", label: "Exchange Programs", icon: <Globe className="h-4 w-4" /> }
  ];

  const categories = [
    "Technology", "Healthcare", "Business", "Creative", "Science", "Education", "Engineering", "Finance", "Non-profit"
  ];

  const locations = [
    "Remote", "New York", "San Francisco", "London", "Berlin", "Tokyo", "Singapore", "Toronto", "Sydney"
  ];

  // Mock opportunities data
  const opportunities: Opportunity[] = [
    {
      id: "1",
      title: "Google Software Engineering Internship",
      type: "Internship",
      organization: "Google",
      description: "Join Google's engineering team for a 12-week internship working on cutting-edge projects that impact billions of users worldwide.",
      location: "Mountain View, CA",
      deadline: "2024-03-15",
      requirements: ["Computer Science or related field", "Strong programming skills", "Problem-solving ability", "Team collaboration"],
      benefits: ["$7,000/month stipend", "Housing provided", "Mentorship program", "Full-time conversion opportunity"],
      applicationUrl: "#",
      difficulty: "Advanced",
      category: "Technology",
      isRemote: false,
      isUrgent: true,
      rating: 4.9,
      applicants: 15420,
      duration: "12 weeks",
      eligibility: ["Undergraduate students", "Graduate students", "Recent graduates"]
    },
    {
      id: "2",
      title: "Microsoft Research Fellowship",
      type: "Fellowship",
      organization: "Microsoft Research",
      description: "A prestigious 2-year fellowship program for exceptional PhD students in computer science and related fields.",
      location: "Redmond, WA",
      deadline: "2024-04-30",
      requirements: ["PhD student in CS or related field", "Research publications", "Strong academic record", "Innovation mindset"],
      benefits: ["$50,000 annual stipend", "Research funding", "Access to Microsoft resources", "Industry mentorship"],
      applicationUrl: "#",
      difficulty: "Advanced",
      category: "Technology",
      isRemote: false,
      isUrgent: false,
      rating: 4.8,
      applicants: 892,
      duration: "2 years",
      eligibility: ["PhD students", "Postdoctoral researchers"]
    },
    {
      id: "3",
      title: "MIT Global Entrepreneurship Bootcamp",
      type: "Competition",
      organization: "MIT",
      description: "An intensive 6-week program for aspiring entrepreneurs to develop and pitch innovative startup ideas.",
      location: "Cambridge, MA",
      deadline: "2024-02-28",
      requirements: ["Entrepreneurial mindset", "Business idea", "Team of 2-4 people", "English proficiency"],
      benefits: ["$10,000 prize pool", "Mentorship from industry leaders", "Access to MIT network", "Startup incubation"],
      applicationUrl: "#",
      difficulty: "Intermediate",
      category: "Business",
      isRemote: false,
      isUrgent: true,
      rating: 4.7,
      applicants: 2340,
      duration: "6 weeks",
      eligibility: ["Undergraduate students", "Graduate students", "Young professionals"]
    },
    {
      id: "4",
      title: "Amazon Web Services Cloud Scholarship",
      type: "Scholarship",
      organization: "Amazon Web Services",
      description: "Full scholarship for AWS cloud certification courses and hands-on training programs.",
      location: "Remote",
      deadline: "2024-03-31",
      requirements: ["Basic programming knowledge", "Interest in cloud computing", "Commitment to complete program", "Academic excellence"],
      benefits: ["Full tuition coverage", "AWS certification voucher", "Job placement assistance", "Mentorship program"],
      applicationUrl: "#",
      difficulty: "Beginner",
      category: "Technology",
      isRemote: true,
      isUrgent: false,
      rating: 4.6,
      applicants: 5670,
      duration: "4 months",
      eligibility: ["Undergraduate students", "Recent graduates", "Career changers"]
    },
    {
      id: "5",
      title: "Apple Design Competition",
      type: "Competition",
      organization: "Apple",
      description: "Annual competition for students to showcase innovative app and product design solutions.",
      location: "Cupertino, CA",
      deadline: "2024-05-15",
      requirements: ["Student status", "Original design work", "Portfolio submission", "Presentation skills"],
      benefits: ["$15,000 grand prize", "Apple product bundle", "Internship opportunity", "Design mentorship"],
      applicationUrl: "#",
      difficulty: "Intermediate",
      category: "Creative",
      isRemote: false,
      isUrgent: false,
      rating: 4.8,
      applicants: 4320,
      duration: "3 months",
      eligibility: ["High school students", "Undergraduate students", "Graduate students"]
    },
    {
      id: "6",
      title: "Facebook Data Science Internship",
      type: "Internship",
      organization: "Meta",
      description: "Work on data science projects that drive product decisions and user experience improvements.",
      location: "Menlo Park, CA",
      deadline: "2024-04-15",
      requirements: ["Statistics/Data Science background", "Python/R programming", "SQL knowledge", "Analytical thinking"],
      benefits: ["$8,000/month stipend", "Housing assistance", "Learning and development", "Networking events"],
      applicationUrl: "#",
      difficulty: "Advanced",
      category: "Technology",
      isRemote: false,
      isUrgent: true,
      rating: 4.5,
      applicants: 9870,
      duration: "12 weeks",
      eligibility: ["Undergraduate students", "Graduate students"]
    }
  ];

  const filteredOpportunities = opportunities.filter(opportunity => {
    const matchesSearch = opportunity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opportunity.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opportunity.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = selectedType === "all" || opportunity.type.toLowerCase() === selectedType;
    const matchesCategory = selectedCategory === "all" || opportunity.category === selectedCategory;
    const matchesLocation = selectedLocation === "all" || 
      (selectedLocation === "Remote" && opportunity.isRemote) ||
      opportunity.location.toLowerCase().includes(selectedLocation.toLowerCase());
    
    return matchesSearch && matchesType && matchesCategory && matchesLocation;
  });

  const sortedOpportunities = [...filteredOpportunities].sort((a, b) => {
    switch (sortBy) {
      case "deadline":
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      case "rating":
        return b.rating - a.rating;
      case "applicants":
        return b.applicants - a.applicants;
      default:
        return 0; // relevance - keep original order
    }
  });

  const toggleOpportunityExpansion = (opportunityId: string) => {
    setExpandedOpportunity(expandedOpportunity === opportunityId ? null : opportunityId);
  };

  const toggleSaveOpportunity = (opportunityId: string) => {
    const newSaved = savedOpportunities.includes(opportunityId)
      ? savedOpportunities.filter(id => id !== opportunityId)
      : [...savedOpportunities, opportunityId];
    
    setSavedOpportunities(newSaved);
    localStorage.setItem("savedOpportunities", JSON.stringify(newSaved));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Internship": return <Briefcase className="h-4 w-4" />;
      case "Scholarship": return <Award className="h-4 w-4" />;
      case "Competition": return <Trophy className="h-4 w-4" />;
      case "Job": return <Users className="h-4 w-4" />;
      case "Fellowship": return <GraduationCap className="h-4 w-4" />;
      case "Exchange": return <Globe className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Internship": return "text-blue-600 bg-blue-100";
      case "Scholarship": return "text-green-600 bg-green-100";
      case "Competition": return "text-purple-600 bg-purple-100";
      case "Job": return "text-orange-600 bg-orange-100";
      case "Fellowship": return "text-indigo-600 bg-indigo-100";
      case "Exchange": return "text-teal-600 bg-teal-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "text-green-600 bg-green-100";
      case "Intermediate": return "text-yellow-600 bg-yellow-100";
      case "Advanced": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const formatDeadline = (deadline: string) => {
    const date = new Date(deadline);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "Expired";
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays <= 7) return `${diffDays} days left`;
    
    return date.toLocaleDateString();
  };

  const isDeadlineUrgent = (deadline: string) => {
    const date = new Date(deadline);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays <= 7 && diffDays > 0;
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
              <div className="h-10 w-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center">
                <Search className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Opportunity Finder</h1>
                <p className="text-muted-foreground">
                  Discover internships, scholarships, competitions, and more
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">{filteredOpportunities.length} opportunities</span>
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
              {/* Search */}
              <div className="flex-1">
                <label className="block text-sm font-medium mb-3">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search opportunities..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border rounded-lg bg-background"
                  />
                </div>
              </div>

              {/* Type Filter */}
              <div className="flex-1">
                <label className="block text-sm font-medium mb-3">Type</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-background"
                >
                  {opportunityTypes.map((type) => (
                    <option key={type.id} value={type.id}>{type.label}</option>
                  ))}
                </select>
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

              {/* Location Filter */}
              <div className="flex-1">
                <label className="block text-sm font-medium mb-3">Location</label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-background"
                >
                  <option value="all">All Locations</option>
                  {locations.map((location) => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div className="flex-1">
                <label className="block text-sm font-medium mb-3">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-background"
                >
                  <option value="relevance">Relevance</option>
                  <option value="deadline">Deadline</option>
                  <option value="rating">Rating</option>
                  <option value="applicants">Popularity</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                {sortedOpportunities.length} Opportunity{sortedOpportunities.length !== 1 ? 'ies' : ''} Found
              </h2>
              <p className="text-muted-foreground">
                Based on your profile and preferences
              </p>
            </div>
          </div>

          {/* Opportunity Cards */}
          <div className="space-y-6">
            {sortedOpportunities.map((opportunity) => (
              <div
                key={opportunity.id}
                className="bg-card rounded-xl border shadow-card hover:shadow-hover transition-all duration-300"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold">{opportunity.title}</h3>
                        {opportunity.isUrgent && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                            Urgent
                          </span>
                        )}
                        {opportunity.isRemote && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                            Remote
                          </span>
                        )}
                      </div>
                      <p className="text-lg text-primary font-medium mb-1">{opportunity.organization}</p>
                      <p className="text-muted-foreground mb-3">{opportunity.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(opportunity.type)}`}>
                        {opportunity.type}
                      </span>
                      <button
                        onClick={() => toggleSaveOpportunity(opportunity.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          savedOpportunities.includes(opportunity.id)
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted hover:bg-muted/80'
                        }`}
                      >
                        <Bookmark className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Quick Info */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium text-sm">{opportunity.location}</div>
                        <div className="text-xs text-muted-foreground">Location</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className={`font-medium text-sm ${
                          isDeadlineUrgent(opportunity.deadline) ? 'text-red-600' : ''
                        }`}>
                          {formatDeadline(opportunity.deadline)}
                        </div>
                        <div className="text-xs text-muted-foreground">Deadline</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium text-sm">{opportunity.rating}/5.0</div>
                        <div className="text-xs text-muted-foreground">Rating</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium text-sm">{opportunity.applicants.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">Applicants</div>
                      </div>
                    </div>
                  </div>

                  {/* Expandable Content */}
                  <div className="border-t pt-4">
                    <button
                      onClick={() => toggleOpportunityExpansion(opportunity.id)}
                      className="w-full flex items-center justify-between text-left hover:bg-muted/50 rounded-lg p-2 -m-2 transition-colors"
                    >
                      <span className="font-medium">View Details & Requirements</span>
                      {expandedOpportunity === opportunity.id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>

                    {expandedOpportunity === opportunity.id && (
                      <div className="mt-4 space-y-6">
                        {/* Requirements & Benefits */}
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-semibold mb-3">Requirements</h4>
                            <ul className="space-y-2">
                              {opportunity.requirements.map((req, index) => (
                                <li key={index} className="flex items-center gap-2 text-sm">
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                  {req}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-3">Benefits</h4>
                            <ul className="space-y-2">
                              {opportunity.benefits.map((benefit, index) => (
                                <li key={index} className="flex items-center gap-2 text-sm">
                                  <Award className="h-4 w-4 text-blue-600" />
                                  {benefit}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Eligibility */}
                        <div>
                          <h4 className="font-semibold mb-3">Eligibility</h4>
                          <div className="flex flex-wrap gap-2">
                            {opportunity.eligibility.map((item, index) => (
                              <span key={index} className="px-2 py-1 bg-muted text-xs rounded-md">
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4 border-t">
                          <a
                            href={opportunity.applicationUrl}
                            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg font-medium transition-colors text-center inline-flex items-center justify-center gap-2"
                          >
                            Apply Now
                            <ExternalLink className="h-4 w-4" />
                          </a>
                          <button className="px-4 py-2 border border-border hover:bg-muted rounded-lg font-medium transition-colors inline-flex items-center gap-2">
                            <Share2 className="h-4 w-4" />
                            Share
                          </button>
                          <button className="px-4 py-2 border border-border hover:bg-muted rounded-lg font-medium transition-colors inline-flex items-center gap-2">
                            <Eye className="h-4 w-4" />
                            View Details
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {sortedOpportunities.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">No opportunities found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your filters or search terms
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedType("all");
                  setSelectedCategory("all");
                  setSelectedLocation("all");
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

export default OpportunityFinder;
