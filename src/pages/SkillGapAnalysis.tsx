import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  BarChart3, 
  Target, 
  TrendingUp, 
  TrendingDown,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Star,
  BookOpen,
  ExternalLink,
  Download,
  RefreshCw,
  Zap,
  Brain,
  Code,
  Users,
  Award,
  Clock,
  Sparkles,
  Lightbulb,
  ArrowRight
} from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

interface UserProfile {
  name: string;
  age: string;
  educationLevel: string;
  streamOfInterest: string;
}

interface Skill {
  id: string;
  name: string;
  category: string;
  currentLevel: number; // 0-100
  requiredLevel: number; // 0-100
  importance: "High" | "Medium" | "Low";
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  trend: "Growing" | "Stable" | "Declining";
  timeToMaster: string;
  resources: SkillResource[];
}

interface SkillResource {
  id: string;
  title: string;
  type: "Course" | "Tutorial" | "Book" | "Practice";
  platform: string;
  duration: string;
  rating: number;
  url: string;
  description: string;
}

interface SkillCategory {
  id: string;
  name: string;
  skills: Skill[];
  overallProgress: number;
  color: string;
}

const SkillGapAnalysis = () => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [analysisDate, setAnalysisDate] = useState<Date>(new Date());

  useEffect(() => {
    // Load user profile from localStorage
    try {
      const savedProfile = localStorage.getItem("userProfile");
      if (savedProfile) {
        setUserProfile(JSON.parse(savedProfile));
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
    }
  }, []);

  // Mock skill data based on user profile
  const skillCategories: SkillCategory[] = [
    {
      id: "technical",
      name: "Technical Skills",
      color: "#3b82f6",
      overallProgress: 65,
      skills: [
        {
          id: "programming",
          name: "Programming",
          category: "technical",
          currentLevel: 45,
          requiredLevel: 85,
          importance: "High",
          difficulty: "Intermediate",
          trend: "Growing",
          timeToMaster: "6-12 months",
          resources: [
            {
              id: "1",
              title: "Complete Python Bootcamp",
              type: "Course",
              platform: "Udemy",
              duration: "40 hours",
              rating: 4.7,
              url: "#",
              description: "Comprehensive Python programming course"
            }
          ]
        },
        {
          id: "data-structures",
          name: "Data Structures & Algorithms",
          category: "technical",
          currentLevel: 25,
          requiredLevel: 80,
          importance: "High",
          difficulty: "Advanced",
          trend: "Stable",
          timeToMaster: "8-12 months",
          resources: []
        },
        {
          id: "databases",
          name: "Database Management",
          category: "technical",
          currentLevel: 60,
          requiredLevel: 70,
          importance: "Medium",
          difficulty: "Intermediate",
          trend: "Growing",
          timeToMaster: "3-6 months",
          resources: []
        },
        {
          id: "cloud-computing",
          name: "Cloud Computing",
          category: "technical",
          currentLevel: 15,
          requiredLevel: 75,
          importance: "High",
          difficulty: "Intermediate",
          trend: "Growing",
          timeToMaster: "4-8 months",
          resources: []
        }
      ]
    },
    {
      id: "soft-skills",
      name: "Soft Skills",
      color: "#10b981",
      overallProgress: 75,
      skills: [
        {
          id: "communication",
          name: "Communication",
          category: "soft-skills",
          currentLevel: 80,
          requiredLevel: 85,
          importance: "High",
          difficulty: "Beginner",
          trend: "Stable",
          timeToMaster: "2-4 months",
          resources: []
        },
        {
          id: "leadership",
          name: "Leadership",
          category: "soft-skills",
          currentLevel: 45,
          requiredLevel: 70,
          importance: "Medium",
          difficulty: "Intermediate",
          trend: "Growing",
          timeToMaster: "6-12 months",
          resources: []
        },
        {
          id: "problem-solving",
          name: "Problem Solving",
          category: "soft-skills",
          currentLevel: 70,
          requiredLevel: 80,
          importance: "High",
          difficulty: "Intermediate",
          trend: "Stable",
          timeToMaster: "3-6 months",
          resources: []
        }
      ]
    },
    {
      id: "domain-knowledge",
      name: "Domain Knowledge",
      color: "#f59e0b",
      overallProgress: 55,
      skills: [
        {
          id: "software-engineering",
          name: "Software Engineering",
          category: "domain-knowledge",
          currentLevel: 40,
          requiredLevel: 80,
          importance: "High",
          difficulty: "Advanced",
          trend: "Growing",
          timeToMaster: "12-18 months",
          resources: []
        },
        {
          id: "project-management",
          name: "Project Management",
          category: "domain-knowledge",
          currentLevel: 30,
          requiredLevel: 65,
          importance: "Medium",
          difficulty: "Intermediate",
          trend: "Growing",
          timeToMaster: "6-9 months",
          resources: []
        }
      ]
    }
  ];

  // Prepare data for radar chart
  const radarData = skillCategories.map(category => ({
    category: category.name,
    current: category.overallProgress,
    required: 85, // Target level
    fullMark: 100
  }));

  // Prepare data for skill gap bar chart
  const skillGapData = skillCategories.flatMap(category => 
    category.skills.map(skill => ({
      name: skill.name,
      current: skill.currentLevel,
      required: skill.requiredLevel,
      gap: skill.requiredLevel - skill.currentLevel,
      category: category.name
    }))
  );

  const filteredSkills = selectedCategory === "all" 
    ? skillCategories.flatMap(cat => cat.skills)
    : skillCategories.find(cat => cat.id === selectedCategory)?.skills || [];

  const getSkillGapStatus = (skill: Skill) => {
    const gap = skill.requiredLevel - skill.currentLevel;
    if (gap <= 10) return { status: "excellent", color: "text-green-600 bg-green-100", icon: CheckCircle };
    if (gap <= 25) return { status: "good", color: "text-blue-600 bg-blue-100", icon: TrendingUp };
    if (gap <= 50) return { status: "needs-improvement", color: "text-yellow-600 bg-yellow-100", icon: AlertTriangle };
    return { status: "critical", color: "text-red-600 bg-red-100", icon: XCircle };
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case "High": return "text-red-600 bg-red-100";
      case "Medium": return "text-yellow-600 bg-yellow-100";
      case "Low": return "text-green-600 bg-green-100";
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

  const calculateOverallProgress = () => {
    const allSkills = skillCategories.flatMap(cat => cat.skills);
    const totalGap = allSkills.reduce((sum, skill) => sum + (skill.requiredLevel - skill.currentLevel), 0);
    const totalRequired = allSkills.reduce((sum, skill) => sum + skill.requiredLevel, 0);
    return Math.max(0, 100 - (totalGap / totalRequired * 100));
  };

  const getTopPrioritySkills = () => {
    return skillCategories
      .flatMap(cat => cat.skills)
      .filter(skill => skill.importance === "High")
      .sort((a, b) => (b.requiredLevel - b.currentLevel) - (a.requiredLevel - a.currentLevel))
      .slice(0, 5);
  };

  const overallProgress = calculateOverallProgress();
  const topPrioritySkills = getTopPrioritySkills();

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
              <div className="h-10 w-10 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Skill Gap Analysis</h1>
                <p className="text-muted-foreground">
                  Analyze your skills and identify areas for improvement
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
                <RefreshCw className="h-4 w-4" />
                <span className="text-sm">Update Analysis</span>
              </button>
              <button className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                <Download className="h-4 w-4" />
                <span className="text-sm">Export Report</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-card rounded-xl border p-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{overallProgress.toFixed(0)}%</div>
                  <div className="text-sm text-muted-foreground">Overall Progress</div>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-xl border p-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {skillCategories.flatMap(cat => cat.skills).filter(skill => 
                      skill.requiredLevel - skill.currentLevel <= 10
                    ).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Skills Mastered</div>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-xl border p-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {skillCategories.flatMap(cat => cat.skills).filter(skill => 
                      skill.requiredLevel - skill.currentLevel > 25
                    ).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Skills to Improve</div>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-xl border p-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Zap className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{topPrioritySkills.length}</div>
                  <div className="text-sm text-muted-foreground">High Priority</div>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Radar Chart */}
            <div className="bg-card rounded-xl border p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Skills Overview
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="category" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar
                    name="Current Level"
                    dataKey="current"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.3}
                  />
                  <Radar
                    name="Target Level"
                    dataKey="required"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.1}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
              <div className="flex items-center gap-4 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>Current Level</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Target Level</span>
                </div>
              </div>
            </div>

            {/* Skill Gap Bar Chart */}
            <div className="bg-card rounded-xl border p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingDown className="h-5 w-5" />
                Skill Gaps by Category
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={skillGapData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="gap" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Priority Skills */}
          <div className="bg-card rounded-xl border p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Star className="h-5 w-5" />
              Top Priority Skills
            </h3>
            <div className="grid gap-4">
              {topPrioritySkills.map((skill, index) => {
                const gapStatus = getSkillGapStatus(skill);
                const GapIcon = gapStatus.icon;
                const gap = skill.requiredLevel - skill.currentLevel;
                
                return (
                  <div key={skill.id} className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold">{skill.name}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImportanceColor(skill.importance)}`}>
                          {skill.importance} Priority
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(skill.difficulty)}`}>
                          {skill.difficulty}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                        <span>Current: {skill.currentLevel}%</span>
                        <span>Target: {skill.requiredLevel}%</span>
                        <span>Gap: {gap}%</span>
                        <span>Time: {skill.timeToMaster}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${(skill.currentLevel / skill.requiredLevel) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <GapIcon className={`h-5 w-5 ${gapStatus.color.includes('text-green') ? 'text-green-600' : 
                        gapStatus.color.includes('text-blue') ? 'text-blue-600' :
                        gapStatus.color.includes('text-yellow') ? 'text-yellow-600' : 'text-red-600'}`} />
                      <button className="px-3 py-1 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 transition-colors">
                        Improve
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed Skills Analysis */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">Detailed Skills Analysis</h3>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border rounded-lg bg-background"
              >
                <option value="all">All Categories</option>
                {skillCategories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>

            <div className="grid gap-6">
              {skillCategories
                .filter(category => selectedCategory === "all" || category.id === selectedCategory)
                .map((category) => (
                <div key={category.id} className="bg-card rounded-xl border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xl font-semibold">{category.name}</h4>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{category.overallProgress}%</div>
                      <div className="text-sm text-muted-foreground">Overall Progress</div>
                    </div>
                  </div>
                  
                  <div className="w-full bg-muted rounded-full h-3 mb-6">
                    <div 
                      className="h-3 rounded-full transition-all duration-300" 
                      style={{ 
                        width: `${category.overallProgress}%`,
                        backgroundColor: category.color
                      }}
                    ></div>
                  </div>

                  <div className="grid gap-4">
                    {category.skills.map((skill) => {
                      const gapStatus = getSkillGapStatus(skill);
                      const GapIcon = gapStatus.icon;
                      const gap = skill.requiredLevel - skill.currentLevel;
                      
                      return (
                        <div key={skill.id} className="border rounded-lg p-4 hover:bg-muted/30 transition-colors">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <h5 className="font-semibold">{skill.name}</h5>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${gapStatus.color}`}>
                                <GapIcon className="h-3 w-3 inline mr-1" />
                                {gapStatus.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">
                                Gap: {gap}%
                              </span>
                              <button
                                onClick={() => setSelectedSkill(selectedSkill === skill.id ? null : skill.id)}
                                className="p-1 hover:bg-muted rounded"
                              >
                                <ArrowRight className={`h-4 w-4 transition-transform ${
                                  selectedSkill === skill.id ? 'rotate-90' : ''
                                }`} />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm">
                            <div>
                              <div className="font-medium">{skill.currentLevel}%</div>
                              <div className="text-xs text-muted-foreground">Current</div>
                            </div>
                            <div>
                              <div className="font-medium">{skill.requiredLevel}%</div>
                              <div className="text-xs text-muted-foreground">Required</div>
                            </div>
                            <div>
                              <div className="font-medium">{skill.timeToMaster}</div>
                              <div className="text-xs text-muted-foreground">Time to Master</div>
                            </div>
                            <div>
                              <div className="font-medium">{skill.trend}</div>
                              <div className="text-xs text-muted-foreground">Market Trend</div>
                            </div>
                          </div>

                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full transition-all duration-300" 
                              style={{ width: `${(skill.currentLevel / skill.requiredLevel) * 100}%` }}
                            ></div>
                          </div>

                          {selectedSkill === skill.id && (
                            <div className="mt-4 pt-4 border-t space-y-4">
                              <div>
                                <h6 className="font-semibold mb-2">Recommended Resources</h6>
                                <div className="space-y-2">
                                  {skill.resources.length > 0 ? (
                                    skill.resources.map((resource) => (
                                      <div key={resource.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                        <div>
                                          <h6 className="font-medium">{resource.title}</h6>
                                          <p className="text-sm text-muted-foreground">{resource.description}</p>
                                          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                                            <span>{resource.platform}</span>
                                            <span>{resource.duration}</span>
                                            <div className="flex items-center gap-1">
                                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                              {resource.rating}
                                            </div>
                                          </div>
                                        </div>
                                        <a
                                          href={resource.url}
                                          className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                                        >
                                          <ExternalLink className="h-4 w-4" />
                                        </a>
                                      </div>
                                    ))
                                  ) : (
                                    <div className="text-center py-4 text-muted-foreground">
                                      <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                      <p>No specific resources available</p>
                                      <p className="text-xs">General learning recommended</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex gap-3">
                                <button className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg font-medium transition-colors">
                                  Start Learning
                                </button>
                                <button className="px-4 py-2 border border-border hover:bg-muted rounded-lg font-medium transition-colors">
                                  Add to Plan
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Personalized Recommendations
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Focus Areas</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Prioritize programming fundamentals
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Build data structures knowledge
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Learn cloud computing basics
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Learning Strategy</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    Dedicate 10-15 hours/week
                  </li>
                  <li className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-blue-600" />
                    Focus on high-impact skills first
                  </li>
                  <li className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    Join study groups or communities
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillGapAnalysis;
