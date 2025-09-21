import { useState, useEffect, useMemo } from "react";
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

import { saveOpportunity, type OpportunityDoc as ApiOpportunityDoc } from "../api";

// Firestore doc type (extends API type with organization)
type FirestoreOpportunityDoc = ApiOpportunityDoc & { organization?: string };
import { db } from "../firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

interface UserProfile {
  name?: string;
  age?: string;
  educationLevel?: string;
  streamOfInterest?: string;
}

const OpportunityFinder = () => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  // Simplified filters: only search query
  const [expandedOpportunity, setExpandedOpportunity] = useState<string | null>(null);
  const [savedOpportunities, setSavedOpportunities] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<FirestoreOpportunityDoc[]>([]);
  // Canonical filter type values: '', 'JOB', 'HACKATHON', 'INTERNSHIP', 'SCHOLARSHIP'
  const [filterType, setFilterType] = useState<string>("");

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

  // Removed type list and other filters

  // Removed categories and locations lists

  // Data source config
  const USE_BACKEND = (import.meta.env.VITE_USE_BACKEND === 'true');
  // Fetch opportunities from backend
  const idToken = useMemo(() => localStorage.getItem("idToken") || "", []);
  const authUser = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; }
  }, []);
  const uid = authUser?.uid || "";

  // No type/location/sort mapping needed

  useEffect(() => {
    setLoading(true); setError(null);
    if (USE_BACKEND) {
      // Use backend API search for filtering/sorting server-side
      (async () => {
        try {
          if (!idToken) {
            setItems([]); setLoading(false); return;
          }
          const resp = await (await import("../api")).searchOpportunities(idToken, {
            q: searchQuery || undefined,
            sort: "newest",
            page: 1,
            page_size: 50,
            source: undefined,
            // Send canonical type to backend; backend matches exact value in Firestore
            type: filterType || undefined,
          });
          setItems(resp.items as unknown as FirestoreOpportunityDoc[]);
        } catch (err: any) {
          setError(err?.message || "Failed to load opportunities");
        } finally {
          setLoading(false);
        }
      })();
      return () => {};
    } else {
      // Direct Firestore live updates
      const qy = query(collection(db, "opportunities"), orderBy("fetched_at", "desc"));
      const unsub = onSnapshot(qy,
        (snap) => {
          const docs: FirestoreOpportunityDoc[] = [];
          snap.forEach(doc => {
            docs.push({ ...(doc.data() as FirestoreOpportunityDoc), id: doc.id });
          });
          setItems(docs);
          setLoading(false);
        },
        (err) => {
          setError(err?.message || "Failed to load opportunities");
          setLoading(false);
        }
      );
      return () => unsub();
    }
  }, [USE_BACKEND, idToken, searchQuery, filterType]);

  // Filtering/searching
  const filteredOpportunities = useMemo(() => {
    let filtered = items;
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      filtered = filtered.filter(
        o => (o.title?.toLowerCase().includes(q) || o.organization?.toLowerCase().includes(q))
      );
    }
    if (filterType) {
      filtered = filtered.filter(o => (String(o.type || "").toUpperCase() === filterType));
    }
    return filtered;
  }, [items, searchQuery, filterType]);
  const sortedOpportunities = filteredOpportunities;

  const toggleOpportunityExpansion = (opportunityId: string) => {
    setExpandedOpportunity(expandedOpportunity === opportunityId ? null : opportunityId);
  };

  const toggleSaveOpportunity = async (opportunityId: string) => {
    try {
      if (idToken && uid) {
        await saveOpportunity(idToken, uid, opportunityId);
      }
      const newSaved = savedOpportunities.includes(opportunityId)
        ? savedOpportunities.filter(id => id !== opportunityId)
        : [...savedOpportunities, opportunityId];
      setSavedOpportunities(newSaved);
      localStorage.setItem("savedOpportunities", JSON.stringify(newSaved));
    } catch (e) {
      console.error("Failed to save opportunity", e);
    }
  };

  const getTypeIcon = (type: string) => {
    const t = (type || '').toUpperCase();
    switch (type) {
      case "Internship":
      case "INTERNSHIP": return <Briefcase className="h-4 w-4" />;
      case "Scholarship":
      case "SCHOLARSHIP": return <Award className="h-4 w-4" />;
      case "Competition": return <Trophy className="h-4 w-4" />;
      case "Job":
      case "JOB": return <Users className="h-4 w-4" />;
      case "Hackathon":
      case "HACKATHON": return <Trophy className="h-4 w-4" />;
      case "Fellowship": return <GraduationCap className="h-4 w-4" />;
      case "Exchange": return <Globe className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    const t = (type || '').toUpperCase();
    switch (type) {
      case "Internship":
      case "INTERNSHIP": return "text-blue-600 bg-blue-100";
      case "Scholarship":
      case "SCHOLARSHIP": return "text-green-600 bg-green-100";
      case "Competition": return "text-purple-600 bg-purple-100";
      case "Job":
      case "JOB": return "text-orange-600 bg-orange-100";
      case "Hackathon":
      case "HACKATHON": return "text-purple-600 bg-purple-100";
      case "Fellowship": return "text-indigo-600 bg-indigo-100";
      case "Exchange": return "text-teal-600 bg-teal-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const displayType = (type: string) => {
    const t = (type || '').toUpperCase();
    if (t === 'JOB') return 'Job';
    if (t === 'HACKATHON') return 'Hackathon';
    if (t === 'INTERNSHIP') return 'Internship';
    if (t === 'SCHOLARSHIP') return 'Scholarship';
    if (t === 'COMPETITION') return 'Competition';
    return type || 'Opportunity';
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
                <span className="text-sm font-medium">{sortedOpportunities.length} opportunities</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Search only */}
          <div className="bg-card rounded-xl border p-6">
            <div className="grid md:grid-cols-3 gap-6 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-3">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search Unstop opportunities..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border rounded-lg bg-background"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-3">Category</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-background"
                >
                  <option value="">All</option>
                  <option value="JOB">Jobs</option>
                  <option value="HACKATHON">Hackathons</option>
                  <option value="INTERNSHIP">Internships</option>
                  <option value="SCHOLARSHIP">Scholarships</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{sortedOpportunities.length} Opportunity{sortedOpportunities.length !== 1 ? 'ies' : ''} Found</h2>
              <p className="text-muted-foreground">Based on your profile and preferences</p>
            </div>
          </div>

          {/* Opportunity Cards */}
          <div className="space-y-6">
            {loading && <div className="text-muted-foreground">Loading opportunities…</div>}
            {error && <div className="text-red-600">{error}</div>}

            {!loading && !error && sortedOpportunities.map((opportunity) => (
              <div key={opportunity.id} className="bg-card rounded-xl border shadow-card hover:shadow-hover transition-all duration-300">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold">{opportunity.title}</h3>
                        {opportunity.deadline && isDeadlineUrgent(opportunity.deadline) && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">Urgent</span>
                        )}
                        {(opportunity.location || "").toLowerCase() === "remote" && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">Remote</span>
                        )}
                      </div>
                      <p className="text-lg text-primary font-medium mb-1">{opportunity.organization || ""}</p>
                      <p className="text-muted-foreground mb-3">{(opportunity.description || opportunity.full_description || "").slice(0, 240)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(opportunity.type || "")}`}>{displayType(opportunity.type || "")}</span>
                      <button onClick={() => toggleSaveOpportunity(opportunity.id)} className={`p-2 rounded-lg transition-colors ${savedOpportunities.includes(opportunity.id) ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}>
                        <Bookmark className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Quick Info */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium text-sm">{opportunity.location || ""}</div>
                        <div className="text-xs text-muted-foreground">Location</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className={`font-medium text-sm ${opportunity.deadline && isDeadlineUrgent(opportunity.deadline) ? 'text-red-600' : ''}`}>
                          {opportunity.deadline ? formatDeadline(opportunity.deadline) : '—'}
                        </div>
                        <div className="text-xs text-muted-foreground">Deadline</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium text-sm">—</div>
                        <div className="text-xs text-muted-foreground">Rating</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium text-sm">—</div>
                        <div className="text-xs text-muted-foreground">Applicants</div>
                      </div>
                    </div>
                  </div>

                  {/* Expandable Content */}
                  <div className="border-t pt-4">
                    <button onClick={() => toggleOpportunityExpansion(opportunity.id)} className="w-full flex items-center justify-between text-left hover:bg-muted/50 rounded-lg p-2 -m-2 transition-colors">
                      <span className="font-medium">View Details & Requirements</span>
                      {expandedOpportunity === opportunity.id ? (<ChevronUp className="h-4 w-4" />) : (<ChevronDown className="h-4 w-4" />)}
                    </button>

                    {expandedOpportunity === opportunity.id && (
                      <div className="mt-4 space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-semibold mb-3">Requirements</h4>
                            <ul className="space-y-2">
                              {(opportunity.skills_required || []).map((req, index) => (
                                <li key={index} className="flex items-center gap-2 text-sm"><CheckCircle className="h-4 w-4 text-green-600" />{req}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-3">Benefits</h4>
                            <ul className="space-y-2">
                              {([] as string[]).map((benefit, index) => (
                                <li key={index} className="flex items-center gap-2 text-sm"><Award className="h-4 w-4 text-blue-600" />{benefit}</li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-3">Eligibility</h4>
                          <div className="flex flex-wrap gap-2">
                            {(opportunity.education_level || []).map((item, index) => (
                              <span key={index} className="px-2 py-1 bg-muted text-xs rounded-md">{item}</span>
                            ))}
                          </div>
                        </div>

                        <div className="flex gap-3 pt-4 border-t">
                          <a href={opportunity.apply_link || "#"} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg font-medium transition-colors text-center inline-flex items-center justify-center gap-2">
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

          {/* Empty state */}
          {!loading && !error && sortedOpportunities.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">No opportunities found</h3>
              <p className="text-muted-foreground mb-4">Try a different keyword or clear the search</p>
              <button onClick={() => setSearchQuery("")} className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg font-medium transition-colors">Clear Search</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OpportunityFinder;

