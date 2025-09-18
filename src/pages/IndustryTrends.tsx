import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Target,
  Globe,
  Clock,
  Users,
  DollarSign,
  Sparkles,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Star,
  Filter,
  Search,
  ChevronDown
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart as RechartsPieChart, Cell } from "recharts";

interface UserProfile {
  name: string;
  age: string;
  educationLevel: string;
  streamOfInterest: string;
}

interface IndustryData {
  id: string;
  name: string;
  growth: number;
  salary: string;
  demand: "High" | "Medium" | "Low";
  trend: "Growing" | "Stable" | "Declining";
  description: string;
  keyRoles: string[];
  skills: string[];
  color: string;
}

interface TrendInsight {
  id: string;
  title: string;
  description: string;
  impact: "Positive" | "Negative" | "Neutral";
  category: string;
  icon: React.ReactNode;
}

interface QuickFact {
  id: string;
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
}

const IndustryTrends = () => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>("2024-2030");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

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

  // Mock data for charts
  const growthData = [
    { name: "AI/ML", growth: 35, jobs: 150000 },
    { name: "Cybersecurity", growth: 31, jobs: 120000 },
    { name: "Data Science", growth: 28, jobs: 95000 },
    { name: "Cloud Computing", growth: 25, jobs: 110000 },
    { name: "DevOps", growth: 22, jobs: 85000 },
    { name: "Blockchain", growth: 18, jobs: 45000 },
    { name: "IoT", growth: 15, jobs: 60000 },
    { name: "AR/VR", growth: 12, jobs: 35000 }
  ];

  const salaryData = [
    { role: "AI Engineer", salary: 150000, growth: 25 },
    { role: "Data Scientist", salary: 125000, growth: 30 },
    { role: "Cybersecurity", salary: 110000, growth: 28 },
    { role: "Cloud Architect", salary: 135000, growth: 22 },
    { role: "DevOps Engineer", salary: 105000, growth: 20 },
    { role: "Full Stack Dev", salary: 95000, growth: 18 }
  ];

  const marketShareData = [
    { name: "Technology", value: 35, color: "#3b82f6" },
    { name: "Healthcare", value: 20, color: "#10b981" },
    { name: "Finance", value: 15, color: "#f59e0b" },
    { name: "Education", value: 12, color: "#8b5cf6" },
    { name: "Manufacturing", value: 10, color: "#ef4444" },
    { name: "Other", value: 8, color: "#6b7280" }
  ];

  const industries: IndustryData[] = [
    {
      id: "ai-ml",
      name: "Artificial Intelligence & Machine Learning",
      growth: 35,
      salary: "$90k - $200k+",
      demand: "High",
      trend: "Growing",
      description: "AI and ML are transforming every industry, creating massive opportunities for professionals who can build, deploy, and manage AI systems.",
      keyRoles: ["AI Engineer", "ML Engineer", "Data Scientist", "AI Product Manager"],
      skills: ["Python", "TensorFlow", "PyTorch", "Machine Learning", "Deep Learning"],
      color: "from-blue-500 to-indigo-600"
    },
    {
      id: "cybersecurity",
      name: "Cybersecurity",
      growth: 31,
      salary: "$75k - $180k+",
      demand: "High",
      trend: "Growing",
      description: "With increasing cyber threats, cybersecurity professionals are in high demand across all sectors to protect digital assets.",
      keyRoles: ["Security Analyst", "Penetration Tester", "Security Architect", "CISO"],
      skills: ["Security Protocols", "Risk Assessment", "Incident Response", "Ethical Hacking"],
      color: "from-red-500 to-pink-600"
    },
    {
      id: "cloud-computing",
      name: "Cloud Computing",
      growth: 25,
      salary: "$85k - $170k+",
      demand: "High",
      trend: "Growing",
      description: "Cloud adoption continues to accelerate, driving demand for professionals skilled in cloud platforms and architectures.",
      keyRoles: ["Cloud Architect", "DevOps Engineer", "Cloud Developer", "Solutions Architect"],
      skills: ["AWS", "Azure", "Google Cloud", "Docker", "Kubernetes"],
      color: "from-green-500 to-emerald-600"
    },
    {
      id: "data-science",
      name: "Data Science & Analytics",
      growth: 28,
      salary: "$80k - $160k+",
      demand: "High",
      trend: "Growing",
      description: "Data-driven decision making is becoming essential, creating opportunities for data professionals across industries.",
      keyRoles: ["Data Scientist", "Data Analyst", "Business Analyst", "Data Engineer"],
      skills: ["Python", "R", "SQL", "Statistics", "Machine Learning"],
      color: "from-purple-500 to-violet-600"
    },
    {
      id: "blockchain",
      name: "Blockchain & Web3",
      growth: 18,
      salary: "$95k - $220k+",
      demand: "Medium",
      trend: "Growing",
      description: "Blockchain technology is expanding beyond cryptocurrency into supply chain, finance, and identity management.",
      keyRoles: ["Blockchain Developer", "Smart Contract Developer", "Web3 Developer", "DeFi Analyst"],
      skills: ["Solidity", "Web3.js", "Ethereum", "Smart Contracts", "DApp Development"],
      color: "from-orange-500 to-red-500"
    },
    {
      id: "traditional-it",
      name: "Traditional IT Support",
      growth: -5,
      salary: "$45k - $85k",
      demand: "Low",
      trend: "Declining",
      description: "Traditional IT support roles are being automated and outsourced, with limited growth opportunities.",
      keyRoles: ["IT Support Specialist", "Help Desk Technician", "System Administrator"],
      skills: ["Hardware Support", "Software Installation", "Troubleshooting"],
      color: "from-gray-500 to-gray-600"
    }
  ];

  const insights: TrendInsight[] = [
    {
      id: "1",
      title: "AI Integration Accelerates",
      description: "85% of companies are planning to integrate AI into their operations by 2025, creating massive demand for AI-skilled professionals.",
      impact: "Positive",
      category: "Technology",
      icon: <Zap className="h-5 w-5" />
    },
    {
      id: "2",
      title: "Remote Work Becomes Standard",
      description: "73% of tech companies now offer permanent remote positions, expanding global opportunities for talent.",
      impact: "Positive",
      category: "Work Culture",
      icon: <Globe className="h-5 w-5" />
    },
    {
      id: "3",
      title: "Automation Threatens Routine Jobs",
      description: "Jobs involving repetitive tasks are at highest risk of automation, while creative and analytical roles remain secure.",
      impact: "Negative",
      category: "Job Market",
      icon: <AlertTriangle className="h-5 w-5" />
    },
    {
      id: "4",
      title: "Skills-Based Hiring Rises",
      description: "Companies are prioritizing skills over degrees, with 67% dropping degree requirements for technical roles.",
      impact: "Positive",
      category: "Hiring",
      icon: <Target className="h-5 w-5" />
    }
  ];

  const quickFacts: QuickFact[] = [
    {
      id: "1",
      title: "Tech Job Growth",
      value: "2.2M new jobs",
      change: 15,
      icon: <TrendingUp className="h-5 w-5" />
    },
    {
      id: "2",
      title: "Average Tech Salary",
      value: "$95,000",
      change: 8,
      icon: <DollarSign className="h-5 w-5" />
    },
    {
      id: "3",
      title: "Remote Positions",
      value: "73% of companies",
      change: 45,
      icon: <Globe className="h-5 w-5" />
    },
    {
      id: "4",
      title: "Skills Gap",
      value: "1.4M unfilled",
      change: -12,
      icon: <Users className="h-5 w-5" />
    }
  ];

  const filteredIndustries = industries.filter(industry => {
    if (selectedCategory === "all") return true;
    return industry.trend.toLowerCase() === selectedCategory.toLowerCase();
  });

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "Growing": return <ArrowUpRight className="h-4 w-4 text-green-600" />;
      case "Stable": return <Activity className="h-4 w-4 text-yellow-600" />;
      case "Declining": return <ArrowDownRight className="h-4 w-4 text-red-600" />;
      default: return null;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "Positive": return "text-green-600 bg-green-100";
      case "Negative": return "text-red-600 bg-red-100";
      case "Neutral": return "text-yellow-600 bg-yellow-100";
      default: return "text-gray-600 bg-gray-100";
    }
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
              <div className="h-10 w-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Industry & Future Trends</h1>
                <p className="text-muted-foreground">
                  Stay ahead with real-time market insights and trends
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg">
                <Activity className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Live Data</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Quick Facts */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickFacts.map((fact) => (
              <div key={fact.id} className="bg-card rounded-xl border p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                    {fact.icon}
                  </div>
                  <div>
                    <div className="text-lg font-bold">{fact.value}</div>
                    <div className="text-sm text-muted-foreground">{fact.title}</div>
                    <div className={`text-xs flex items-center gap-1 ${
                      fact.change > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {fact.change > 0 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {Math.abs(fact.change)}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts Section */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Growth Chart */}
            <div className="bg-card rounded-xl border p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Industry Growth Rates (2024-2030)
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={growthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="growth" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Salary Chart */}
            <div className="bg-card rounded-xl border p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Average Salaries by Role
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salaryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="role" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="salary" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Market Share */}
          <div className="bg-card rounded-xl border p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Tech Job Market Share by Industry
            </h3>
            <div className="grid lg:grid-cols-2 gap-6 items-center">
              <ResponsiveContainer width="100%" height={250}>
                <RechartsPieChart>
                  <Pie
                    data={marketShareData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {marketShareData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
              <div className="space-y-3">
                {marketShareData.map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-sm">{item.name}</span>
                    <span className="text-sm font-medium ml-auto">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Industry Analysis */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">Industry Analysis</h3>
              <div className="flex items-center gap-3">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border rounded-lg bg-background"
                >
                  <option value="all">All Trends</option>
                  <option value="growing">Growing</option>
                  <option value="stable">Stable</option>
                  <option value="declining">Declining</option>
                </select>
              </div>
            </div>

            <div className="grid gap-6">
              {filteredIndustries.map((industry) => (
                <div key={industry.id} className="bg-card rounded-xl border shadow-card hover:shadow-hover transition-all duration-300">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-xl font-semibold">{industry.name}</h4>
                          <div className="flex items-center gap-2">
                            {getTrendIcon(industry.trend)}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              industry.trend === "Growing" ? "text-green-600 bg-green-100" :
                              industry.trend === "Stable" ? "text-yellow-600 bg-yellow-100" :
                              "text-red-600 bg-red-100"
                            }`}>
                              {industry.trend}
                            </span>
                          </div>
                        </div>
                        <p className="text-muted-foreground mb-4">{industry.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">+{industry.growth}%</div>
                        <div className="text-sm text-muted-foreground">Growth Rate</div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{industry.salary}</div>
                          <div className="text-xs text-muted-foreground">Salary Range</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{industry.demand} Demand</div>
                          <div className="text-xs text-muted-foreground">Job Market</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{industry.keyRoles.length} Key Roles</div>
                          <div className="text-xs text-muted-foreground">Career Paths</div>
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-semibold mb-2">Key Roles</h5>
                        <div className="flex flex-wrap gap-2">
                          {industry.keyRoles.map((role, index) => (
                            <span key={index} className="px-2 py-1 bg-muted text-xs rounded-md">
                              {role}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h5 className="font-semibold mb-2">Essential Skills</h5>
                        <div className="flex flex-wrap gap-2">
                          {industry.skills.map((skill, index) => (
                            <span key={index} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trend Insights */}
          <div>
            <h3 className="text-2xl font-bold mb-6">Quick Insights</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {insights.map((insight) => (
                <div key={insight.id} className="bg-card rounded-xl border p-4">
                  <div className="flex items-start gap-3">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                      insight.impact === "Positive" ? "bg-green-100 text-green-600" :
                      insight.impact === "Negative" ? "bg-red-100 text-red-600" :
                      "bg-yellow-100 text-yellow-600"
                    }`}>
                      {insight.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{insight.title}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(insight.impact)}`}>
                          {insight.impact}
                        </span>
                        <span className="text-xs text-muted-foreground">{insight.category}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndustryTrends;
