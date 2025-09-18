import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Users, 
  Star, 
  MapPin, 
  Clock, 
  MessageCircle, 
  Video,
  Calendar,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  Award,
  Briefcase,
  GraduationCap,
  Globe,
  CheckCircle,
  Sparkles,
  Heart,
  Share2,
  ExternalLink,
  Zap,
  Target,
  BookOpen,
  TrendingUp
} from "lucide-react";

interface UserProfile {
  name: string;
  age: string;
  educationLevel: string;
  streamOfInterest: string;
}

interface Mentor {
  id: string;
  name: string;
  title: string;
  company: string;
  avatar: string;
  bio: string;
  expertise: string[];
  experience: string;
  rating: number;
  reviews: number;
  availability: "Available" | "Busy" | "Offline";
  location: string;
  timezone: string;
  languages: string[];
  specializations: string[];
  achievements: string[];
  hourlyRate?: string;
  matchScore: number;
  communicationStyle: string[];
  mentorshipAreas: string[];
  availabilitySlots: AvailabilitySlot[];
  verified: boolean;
  responseTime: string;
  successRate: number;
}

interface AvailabilitySlot {
  day: string;
  time: string;
  type: "Chat" | "Video Call";
}

interface FilterOptions {
  availability: string;
  expertise: string;
  experience: string;
  priceRange: string;
  rating: string;
  location: string;
}

const MentorMatching = () => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [filteredMentors, setFilteredMentors] = useState<Mentor[]>([]);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterOptions>({
    availability: "all",
    expertise: "all",
    experience: "all",
    priceRange: "all",
    rating: "all",
    location: "all"
  });
  const [showFilters, setShowFilters] = useState(false);
  const [savedMentors, setSavedMentors] = useState<string[]>([]);

  useEffect(() => {
    // Load user profile from localStorage
    try {
      const savedProfile = localStorage.getItem("userProfile");
      if (savedProfile) {
        setUserProfile(JSON.parse(savedProfile));
      }
      const saved = localStorage.getItem("savedMentors");
      if (saved) {
        setSavedMentors(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }

    // Load mentors data
    loadMentors();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [mentors, searchQuery, filters]);

  const loadMentors = () => {
    // Mock mentors data
    const mockMentors: Mentor[] = [
      {
        id: "1",
        name: "Sarah Chen",
        title: "Senior Software Engineer",
        company: "Google",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
        bio: "Experienced software engineer with 8+ years at Google. Passionate about mentoring and helping students break into tech. Specialized in full-stack development and system design.",
        expertise: ["JavaScript", "Python", "React", "Node.js", "System Design", "Interview Prep"],
        experience: "8+ years",
        rating: 4.9,
        reviews: 127,
        availability: "Available",
        location: "San Francisco, CA",
        timezone: "PST",
        languages: ["English", "Mandarin"],
        specializations: ["Software Engineering", "Career Guidance", "Technical Interviews"],
        achievements: ["Google Distinguished Engineer", "Mentored 200+ students", "Tech conference speaker"],
        hourlyRate: "$150",
        matchScore: 95,
        communicationStyle: ["Encouraging", "Direct", "Patient"],
        mentorshipAreas: ["Career Planning", "Technical Skills", "Interview Preparation"],
        availabilitySlots: [
          { day: "Monday", time: "2:00 PM - 4:00 PM", type: "Video Call" },
          { day: "Wednesday", time: "10:00 AM - 12:00 PM", type: "Chat" },
          { day: "Friday", time: "3:00 PM - 5:00 PM", type: "Video Call" }
        ],
        verified: true,
        responseTime: "Within 2 hours",
        successRate: 94
      },
      {
        id: "2",
        name: "Marcus Johnson",
        title: "Product Manager",
        company: "Microsoft",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        bio: "Product leader with 10+ years experience building consumer and enterprise products. Expert in product strategy, user research, and team leadership.",
        expertise: ["Product Strategy", "User Research", "Agile", "Leadership", "Data Analysis", "Roadmapping"],
        experience: "10+ years",
        rating: 4.8,
        reviews: 89,
        availability: "Available",
        location: "Seattle, WA",
        timezone: "PST",
        languages: ["English", "Spanish"],
        specializations: ["Product Management", "Leadership", "Strategy"],
        achievements: ["Launched 5 successful products", "Team of 20+ engineers", "MBA from Stanford"],
        hourlyRate: "$200",
        matchScore: 88,
        communicationStyle: ["Strategic", "Analytical", "Supportive"],
        mentorshipAreas: ["Product Strategy", "Career Growth", "Leadership"],
        availabilitySlots: [
          { day: "Tuesday", time: "1:00 PM - 3:00 PM", type: "Video Call" },
          { day: "Thursday", time: "11:00 AM - 1:00 PM", type: "Chat" }
        ],
        verified: true,
        responseTime: "Within 4 hours",
        successRate: 91
      },
      {
        id: "3",
        name: "Dr. Emily Rodriguez",
        title: "Data Science Director",
        company: "Netflix",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
        bio: "Data science leader with PhD in Statistics. Built ML systems serving millions of users. Passionate about diversity in tech and helping underrepresented groups succeed.",
        expertise: ["Machine Learning", "Python", "R", "Statistics", "Deep Learning", "A/B Testing"],
        experience: "12+ years",
        rating: 4.9,
        reviews: 156,
        availability: "Busy",
        location: "Los Gatos, CA",
        timezone: "PST",
        languages: ["English", "Spanish", "Portuguese"],
        specializations: ["Data Science", "Machine Learning", "Career Transition"],
        achievements: ["PhD in Statistics", "Published 20+ papers", "Diversity advocate"],
        hourlyRate: "$180",
        matchScore: 92,
        communicationStyle: ["Patient", "Educational", "Inspiring"],
        mentorshipAreas: ["Technical Skills", "Career Change", "Academic Research"],
        availabilitySlots: [
          { day: "Saturday", time: "10:00 AM - 12:00 PM", type: "Video Call" }
        ],
        verified: true,
        responseTime: "Within 6 hours",
        successRate: 96
      },
      {
        id: "4",
        name: "Alex Kumar",
        title: "UX Design Lead",
        company: "Airbnb",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        bio: "Creative UX designer with 7+ years creating user-centered experiences. Expert in design systems, user research, and cross-functional collaboration.",
        expertise: ["UX Design", "UI Design", "User Research", "Figma", "Prototyping", "Design Systems"],
        experience: "7+ years",
        rating: 4.7,
        reviews: 73,
        availability: "Available",
        location: "San Francisco, CA",
        timezone: "PST",
        languages: ["English", "Hindi"],
        specializations: ["UX/UI Design", "Design Thinking", "Portfolio Review"],
        achievements: ["Design award winner", "Portfolio featured in design blogs", "Mentored 50+ designers"],
        hourlyRate: "$120",
        matchScore: 85,
        communicationStyle: ["Creative", "Collaborative", "Constructive"],
        mentorshipAreas: ["Design Skills", "Portfolio Building", "Career Planning"],
        availabilitySlots: [
          { day: "Monday", time: "2:00 PM - 4:00 PM", type: "Video Call" },
          { day: "Wednesday", time: "10:00 AM - 12:00 PM", type: "Chat" },
          { day: "Friday", time: "3:00 PM - 5:00 PM", type: "Video Call" }
        ],
        verified: true,
        responseTime: "Within 3 hours",
        successRate: 89
      },
      {
        id: "5",
        name: "David Kim",
        title: "Startup Founder & CTO",
        company: "TechFlow",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
        bio: "Serial entrepreneur and technical founder. Built and sold 2 startups. Expert in early-stage product development, fundraising, and scaling engineering teams.",
        expertise: ["Entrepreneurship", "Startup Strategy", "Fundraising", "Team Building", "Product Development"],
        experience: "15+ years",
        rating: 4.8,
        reviews: 94,
        availability: "Available",
        location: "Austin, TX",
        timezone: "CST",
        languages: ["English", "Korean"],
        specializations: ["Entrepreneurship", "Startup Building", "Technical Leadership"],
        achievements: ["2 successful exits", "Raised $10M+ funding", "Built teams of 50+"],
        hourlyRate: "$250",
        matchScore: 90,
        communicationStyle: ["Direct", "Motivational", "Practical"],
        mentorshipAreas: ["Entrepreneurship", "Startup Strategy", "Technical Leadership"],
        availabilitySlots: [
          { day: "Tuesday", time: "1:00 PM - 3:00 PM", type: "Video Call" },
          { day: "Thursday", time: "11:00 AM - 1:00 PM", type: "Chat" }
        ],
        verified: true,
        responseTime: "Within 1 hour",
        successRate: 92
      }
    ];

    setMentors(mockMentors);
    setFilteredMentors(mockMentors);
  };

  const applyFilters = () => {
    let filtered = mentors.filter(mentor => {
      const matchesSearch = mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mentor.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mentor.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mentor.expertise.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesAvailability = filters.availability === "all" || mentor.availability.toLowerCase() === filters.availability;
      const matchesExpertise = filters.expertise === "all" || mentor.expertise.includes(filters.expertise);
      const matchesExperience = filters.experience === "all" || 
        (filters.experience === "junior" && mentor.experience.includes("3-5")) ||
        (filters.experience === "senior" && (mentor.experience.includes("5+") || mentor.experience.includes("8+") || mentor.experience.includes("10+")));
      const matchesRating = filters.rating === "all" || mentor.rating >= parseFloat(filters.rating);
      const matchesLocation = filters.location === "all" || 
        mentor.location.toLowerCase().includes(filters.location.toLowerCase());
      
      return matchesSearch && matchesAvailability && matchesExpertise && matchesExperience && matchesRating && matchesLocation;
    });

    // Sort by match score
    filtered.sort((a, b) => b.matchScore - a.matchScore);
    setFilteredMentors(filtered);
  };

  const toggleSaveMentor = (mentorId: string) => {
    const newSaved = savedMentors.includes(mentorId)
      ? savedMentors.filter(id => id !== mentorId)
      : [...savedMentors, mentorId];
    
    setSavedMentors(newSaved);
    localStorage.setItem("savedMentors", JSON.stringify(newSaved));
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case "Available": return "text-green-600 bg-green-100";
      case "Busy": return "text-yellow-600 bg-yellow-100";
      case "Offline": return "text-gray-600 bg-gray-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600 bg-green-100";
    if (score >= 80) return "text-blue-600 bg-blue-100";
    if (score >= 70) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const expertiseOptions = [
    "JavaScript", "Python", "React", "Node.js", "System Design", "Interview Prep",
    "Product Strategy", "User Research", "Agile", "Leadership", "Data Analysis",
    "Machine Learning", "Statistics", "Deep Learning", "UX Design", "UI Design",
    "Entrepreneurship", "Startup Strategy", "Fundraising", "Team Building"
  ];

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
              <div className="h-10 w-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Mentor Matching AI</h1>
                <p className="text-muted-foreground">
                  Connect with industry experts and mentors
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">{filteredMentors.length} mentors</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Search and Filters */}
          <div className="bg-card rounded-xl border p-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Search */}
              <div className="flex-1">
                <label className="block text-sm font-medium mb-3">Search Mentors</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search by name, company, or expertise..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border rounded-lg bg-background"
                  />
                </div>
              </div>

              {/* Filter Toggle */}
              <div className="flex items-end">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-muted transition-colors"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                  {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Availability</label>
                  <select
                    value={filters.availability}
                    onChange={(e) => setFilters(prev => ({ ...prev, availability: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg bg-background text-sm"
                  >
                    <option value="all">All</option>
                    <option value="available">Available</option>
                    <option value="busy">Busy</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Expertise</label>
                  <select
                    value={filters.expertise}
                    onChange={(e) => setFilters(prev => ({ ...prev, expertise: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg bg-background text-sm"
                  >
                    <option value="all">All</option>
                    {expertiseOptions.map(expertise => (
                      <option key={expertise} value={expertise}>{expertise}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Experience</label>
                  <select
                    value={filters.experience}
                    onChange={(e) => setFilters(prev => ({ ...prev, experience: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg bg-background text-sm"
                  >
                    <option value="all">All</option>
                    <option value="junior">3-5 years</option>
                    <option value="senior">5+ years</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Rating</label>
                  <select
                    value={filters.rating}
                    onChange={(e) => setFilters(prev => ({ ...prev, rating: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg bg-background text-sm"
                  >
                    <option value="all">All</option>
                    <option value="4.5">4.5+ stars</option>
                    <option value="4.0">4.0+ stars</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Location</label>
                  <select
                    value={filters.location}
                    onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg bg-background text-sm"
                  >
                    <option value="all">All</option>
                    <option value="remote">Remote</option>
                    <option value="san francisco">San Francisco</option>
                    <option value="seattle">Seattle</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Price Range</label>
                  <select
                    value={filters.priceRange}
                    onChange={(e) => setFilters(prev => ({ ...prev, priceRange: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg bg-background text-sm"
                  >
                    <option value="all">All</option>
                    <option value="under-100">Under $100</option>
                    <option value="100-200">$100-$200</option>
                    <option value="over-200">Over $200</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Results */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                {filteredMentors.length} Mentor{filteredMentors.length !== 1 ? 's' : ''} Found
              </h2>
              <p className="text-muted-foreground">
                Matched based on your career goals and interests
              </p>
            </div>
          </div>

          {/* Mentor Cards */}
          <div className="grid gap-6">
            {filteredMentors.map((mentor) => (
              <div
                key={mentor.id}
                className="bg-card rounded-xl border shadow-card hover:shadow-hover transition-all duration-300"
              >
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      <img
                        src={mentor.avatar}
                        alt={mentor.name}
                        className="h-20 w-20 rounded-full object-cover border-2 border-primary/20"
                      />
                      {mentor.verified && (
                        <div className="flex justify-center mt-2">
                          <div className="h-5 w-5 bg-blue-500 rounded-full flex items-center justify-center">
                            <CheckCircle className="h-3 w-3 text-white" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-semibold">{mentor.name}</h3>
                          <p className="text-primary font-medium">{mentor.title}</p>
                          <p className="text-muted-foreground">{mentor.company}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(mentor.availability)}`}>
                            {mentor.availability}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMatchScoreColor(mentor.matchScore)}`}>
                            {mentor.matchScore}% Match
                          </span>
                          <button
                            onClick={() => toggleSaveMentor(mentor.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              savedMentors.includes(mentor.id)
                                ? 'bg-red-100 text-red-600'
                                : 'bg-muted hover:bg-muted/80'
                            }`}
                          >
                            <Heart className={`h-4 w-4 ${
                              savedMentors.includes(mentor.id) ? 'fill-current' : ''
                            }`} />
                          </button>
                        </div>
                      </div>

                      <p className="text-muted-foreground mb-4 leading-relaxed">{mentor.bio}</p>

                      {/* Quick Stats */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <div>
                            <div className="font-medium">{mentor.rating}/5.0</div>
                            <div className="text-xs text-muted-foreground">({mentor.reviews} reviews)</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{mentor.responseTime}</div>
                            <div className="text-xs text-muted-foreground">Response</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{mentor.successRate}%</div>
                            <div className="text-xs text-muted-foreground">Success Rate</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{mentor.location}</div>
                            <div className="text-xs text-muted-foreground">Location</div>
                          </div>
                        </div>
                      </div>

                      {/* Expertise Tags */}
                      <div className="mb-4">
                        <h4 className="font-semibold mb-2">Expertise</h4>
                        <div className="flex flex-wrap gap-2">
                          {mentor.expertise.slice(0, 6).map((skill, index) => (
                            <span key={index} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md">
                              {skill}
                            </span>
                          ))}
                          {mentor.expertise.length > 6 && (
                            <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md">
                              +{mentor.expertise.length - 6} more
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <button className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center justify-center gap-2">
                          <MessageCircle className="h-4 w-4" />
                          Start Chat
                        </button>
                        <button className="px-4 py-2 border border-border hover:bg-muted rounded-lg font-medium transition-colors inline-flex items-center gap-2">
                          <Video className="h-4 w-4" />
                          Video Call
                        </button>
                        <button className="px-4 py-2 border border-border hover:bg-muted rounded-lg font-medium transition-colors inline-flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Schedule
                        </button>
                        <button 
                          onClick={() => setSelectedMentor(selectedMentor?.id === mentor.id ? null : mentor)}
                          className="px-4 py-2 border border-border hover:bg-muted rounded-lg font-medium transition-colors inline-flex items-center gap-2"
                        >
                          <ExternalLink className="h-4 w-4" />
                          View Profile
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Profile */}
                  {selectedMentor?.id === mentor.id && (
                    <div className="mt-6 pt-6 border-t space-y-6">
                      {/* Availability */}
                      <div>
                        <h4 className="font-semibold mb-3">Available Times</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {mentor.availabilitySlots.map((slot, index) => (
                            <div key={index} className="p-3 bg-muted/50 rounded-lg">
                              <div className="font-medium">{slot.day}</div>
                              <div className="text-sm text-muted-foreground">{slot.time}</div>
                              <div className="text-xs text-muted-foreground">{slot.type}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Achievements */}
                      <div>
                        <h4 className="font-semibold mb-3">Achievements</h4>
                        <div className="space-y-2">
                          {mentor.achievements.map((achievement, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <Award className="h-4 w-4 text-yellow-600" />
                              <span className="text-sm">{achievement}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Communication Style */}
                      <div>
                        <h4 className="font-semibold mb-3">Communication Style</h4>
                        <div className="flex flex-wrap gap-2">
                          {mentor.communicationStyle.map((style, index) => (
                            <span key={index} className="px-2 py-1 bg-secondary/20 text-secondary text-xs rounded-md">
                              {style}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Mentorship Areas */}
                      <div>
                        <h4 className="font-semibold mb-3">Mentorship Areas</h4>
                        <div className="flex flex-wrap gap-2">
                          {mentor.mentorshipAreas.map((area, index) => (
                            <span key={index} className="px-2 py-1 bg-accent/20 text-accent text-xs rounded-md">
                              {area}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredMentors.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">No mentors found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search criteria or filters
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setFilters({
                    availability: "all",
                    expertise: "all",
                    experience: "all",
                    priceRange: "all",
                    rating: "all",
                    location: "all"
                  });
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

export default MentorMatching;
