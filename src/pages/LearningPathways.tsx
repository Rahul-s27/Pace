import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  BookOpen, 
  Clock, 
  CheckCircle, 
  Play, 
  ExternalLink, 
  Star,
  Award,
  Target,
  Calendar,
  TrendingUp,
  Users,
  Zap,
  Sparkles,
  ChevronRight,
  Download,
  Bookmark
} from "lucide-react";

interface UserProfile {
  name: string;
  age: string;
  educationLevel: string;
  streamOfInterest: string;
}

interface LearningStep {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  skills: string[];
  resources: LearningResource[];
  projects: Project[];
  completed: boolean;
  progress: number;
}

interface LearningResource {
  id: string;
  title: string;
  type: "Course" | "Tutorial" | "Book" | "Article" | "Video";
  platform: string;
  duration: string;
  rating: number;
  cost: string;
  url: string;
  description: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedTime: string;
  skills: string[];
  description: string;
}

const LearningPathways = () => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [selectedPath, setSelectedPath] = useState<string>("software-engineer");
  const [activeStep, setActiveStep] = useState<string>("step-1");

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

  const learningPaths = {
    "software-engineer": [
      {
        id: "step-1",
        title: "Programming Fundamentals",
        description: "Master the basics of programming and software development",
        duration: "3-4 months",
        difficulty: "Beginner" as const,
        skills: ["Python/JavaScript", "Problem Solving", "Algorithms", "Version Control"],
        resources: [
          {
            id: "cs50",
            title: "CS50's Introduction to Computer Science",
            type: "Course" as const,
            platform: "edX",
            duration: "12 weeks",
            rating: 4.8,
            cost: "Free",
            url: "#",
            description: "Harvard's comprehensive introduction to computer science"
          },
          {
            id: "python-crash",
            title: "Python Crash Course",
            type: "Book" as const,
            platform: "Self-paced",
            duration: "6-8 weeks",
            rating: 4.7,
            cost: "$30",
            url: "#",
            description: "Hands-on introduction to Python programming"
          },
          {
            id: "freecodecamp",
            title: "Responsive Web Design",
            type: "Course" as const,
            platform: "freeCodeCamp",
            duration: "8 weeks",
            rating: 4.6,
            cost: "Free",
            url: "#",
            description: "Learn HTML, CSS, and responsive design"
          }
        ],
        projects: [
          {
            id: "calculator",
            title: "Calculator App",
            description: "Build a basic calculator with GUI",
            difficulty: "Beginner" as const,
            estimatedTime: "1-2 weeks",
            skills: ["Python", "GUI Programming"],
            description: "Create a functional calculator using tkinter or similar framework"
          },
          {
            id: "portfolio-website",
            title: "Personal Portfolio Website",
            description: "Design and develop your own portfolio site",
            difficulty: "Beginner" as const,
            estimatedTime: "2-3 weeks",
            skills: ["HTML", "CSS", "JavaScript"],
            description: "Build a responsive portfolio website showcasing your projects"
          }
        ],
        completed: false,
        progress: 25
      },
      {
        id: "step-2",
        title: "Data Structures & Algorithms",
        description: "Learn fundamental computer science concepts and problem-solving techniques",
        duration: "4-6 months",
        difficulty: "Intermediate" as const,
        skills: ["Data Structures", "Algorithms", "Complexity Analysis", "Problem Solving"],
        resources: [
          {
            id: "leetcode",
            title: "LeetCode Problems",
            type: "Tutorial" as const,
            platform: "LeetCode",
            duration: "Ongoing",
            rating: 4.5,
            cost: "Free/Premium",
            url: "#",
            description: "Practice coding problems and algorithm challenges"
          },
          {
            id: "algorithms-book",
            title: "Introduction to Algorithms",
            type: "Book" as const,
            platform: "Self-paced",
            duration: "6 months",
            rating: 4.9,
            cost: "$80",
            url: "#",
            description: "Comprehensive guide to algorithms and data structures"
          }
        ],
        projects: [
          {
            id: "sorting-visualizer",
            title: "Sorting Algorithm Visualizer",
            description: "Visualize different sorting algorithms",
            difficulty: "Intermediate" as const,
            estimatedTime: "2-3 weeks",
            skills: ["JavaScript", "Canvas API", "Algorithms"],
            description: "Build an interactive tool to visualize sorting algorithms"
          }
        ],
        completed: false,
        progress: 10
      },
      {
        id: "step-3",
        title: "Web Development",
        description: "Build modern web applications with popular frameworks",
        duration: "6-8 months",
        difficulty: "Intermediate" as const,
        skills: ["React", "Node.js", "Database Design", "API Development"],
        resources: [
          {
            id: "react-course",
            title: "Complete React Developer",
            type: "Course" as const,
            platform: "Udemy",
            duration: "40 hours",
            rating: 4.7,
            cost: "$90",
            url: "#",
            description: "Comprehensive React.js course with real-world projects"
          },
          {
            id: "nodejs-guide",
            title: "Node.js Complete Guide",
            type: "Course" as const,
            platform: "Coursera",
            duration: "8 weeks",
            rating: 4.6,
            cost: "Free",
            url: "#",
            description: "Learn backend development with Node.js"
          }
        ],
        projects: [
          {
            id: "ecommerce-app",
            title: "E-commerce Platform",
            description: "Full-stack e-commerce application",
            difficulty: "Advanced" as const,
            estimatedTime: "4-6 weeks",
            skills: ["React", "Node.js", "MongoDB", "Payment Integration"],
            description: "Build a complete e-commerce platform with user authentication and payment processing"
          }
        ],
        completed: false,
        progress: 0
      },
      {
        id: "step-4",
        title: "Software Engineering Practices",
        description: "Learn professional development practices and tools",
        duration: "3-4 months",
        difficulty: "Advanced" as const,
        skills: ["Testing", "CI/CD", "Docker", "Cloud Computing"],
        resources: [
          {
            id: "testing-course",
            title: "Software Testing Fundamentals",
            type: "Course" as const,
            platform: "edX",
            duration: "6 weeks",
            rating: 4.4,
            cost: "Free",
            url: "#",
            description: "Learn testing methodologies and best practices"
          }
        ],
        projects: [
          {
            id: "microservices",
            title: "Microservices Architecture",
            description: "Design and implement microservices",
            difficulty: "Advanced" as const,
            estimatedTime: "6-8 weeks",
            skills: ["Docker", "Kubernetes", "API Gateway", "Service Mesh"],
            description: "Build a scalable microservices architecture"
          }
        ],
        completed: false,
        progress: 0
      },
      {
        id: "step-5",
        title: "Career Preparation",
        description: "Prepare for job applications and interviews",
        duration: "2-3 months",
        difficulty: "Intermediate" as const,
        skills: ["Resume Building", "Portfolio Development", "Interview Preparation", "Networking"],
        resources: [
          {
            id: "resume-guide",
            title: "Technical Resume Guide",
            type: "Article" as const,
            platform: "Medium",
            duration: "30 min",
            rating: 4.5,
            cost: "Free",
            url: "#",
            description: "Tips for creating an effective technical resume"
          }
        ],
        projects: [
          {
            id: "portfolio-v2",
            title: "Professional Portfolio",
            description: "Enhanced portfolio with case studies",
            difficulty: "Intermediate" as const,
            estimatedTime: "2-3 weeks",
            skills: ["Design", "Content Creation", "SEO"],
            description: "Create a professional portfolio showcasing your best work"
          }
        ],
        completed: false,
        progress: 0
      }
    ]
  };

  const currentPath = learningPaths[selectedPath as keyof typeof learningPaths] || [];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "text-green-600 bg-green-100";
      case "Intermediate": return "text-yellow-600 bg-yellow-100";
      case "Advanced": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getResourceTypeIcon = (type: string) => {
    switch (type) {
      case "Course": return <Play className="h-4 w-4" />;
      case "Book": return <BookOpen className="h-4 w-4" />;
      case "Tutorial": return <Zap className="h-4 w-4" />;
      case "Video": return <Play className="h-4 w-4" />;
      default: return <ExternalLink className="h-4 w-4" />;
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
              <div className="h-10 w-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Personalized Learning Pathways</h1>
                <p className="text-muted-foreground">
                  Your step-by-step roadmap to career success
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">AI-Recommended</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Path Overview */}
          <div className="bg-card rounded-xl border p-6">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">Software Engineer Pathway</h2>
                <p className="text-muted-foreground mb-4">
                  Complete roadmap from beginner to professional software engineer
                </p>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Total Duration: 18-24 months</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <span>5 Learning Steps</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>50+ Resources</span>
                  </div>
                </div>
              </div>
              <div className="lg:w-64">
                <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary mb-1">25%</div>
                    <div className="text-sm text-muted-foreground mb-3">Overall Progress</div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '25%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Learning Steps */}
          <div className="space-y-6">
            {currentPath.map((step, index) => (
              <div
                key={step.id}
                className={`bg-card rounded-xl border shadow-card transition-all duration-300 ${
                  activeStep === step.id ? 'ring-2 ring-primary/50' : ''
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className={`h-12 w-12 rounded-full flex items-center justify-center text-white font-bold ${
                          step.completed 
                            ? 'bg-success' 
                            : step.progress > 0 
                              ? 'bg-primary' 
                              : 'bg-muted'
                        }`}>
                          {step.completed ? (
                            <CheckCircle className="h-6 w-6" />
                          ) : (
                            <span>{index + 1}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold">{step.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(step.difficulty)}`}>
                            {step.difficulty}
                          </span>
                        </div>
                        <p className="text-muted-foreground mb-3">{step.description}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {step.duration}
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4" />
                            {step.progress}% Complete
                          </div>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveStep(activeStep === step.id ? "" : step.id)}
                      className="p-2 hover:bg-muted rounded-lg transition-colors"
                    >
                      <ChevronRight className={`h-4 w-4 transition-transform ${
                        activeStep === step.id ? 'rotate-90' : ''
                      }`} />
                    </button>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-muted rounded-full h-2 mb-4">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${step.progress}%` }}
                    ></div>
                  </div>

                  {/* Expanded Content */}
                  {activeStep === step.id && (
                    <div className="space-y-6 pt-4 border-t">
                      {/* Skills */}
                      <div>
                        <h4 className="font-semibold mb-3">Skills You'll Learn</h4>
                        <div className="flex flex-wrap gap-2">
                          {step.skills.map((skill, skillIndex) => (
                            <span
                              key={skillIndex}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs bg-muted text-foreground"
                            >
                              <CheckCircle className="h-3 w-3" />
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Resources */}
                      <div>
                        <h4 className="font-semibold mb-3">Recommended Resources</h4>
                        <div className="grid gap-3">
                          {step.resources.map((resource) => (
                            <div
                              key={resource.id}
                              className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                                  {getResourceTypeIcon(resource.type)}
                                </div>
                                <div>
                                  <h5 className="font-medium">{resource.title}</h5>
                                  <p className="text-sm text-muted-foreground">{resource.description}</p>
                                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                                    <span>{resource.platform}</span>
                                    <span>{resource.duration}</span>
                                    <span>{resource.cost}</span>
                                    <div className="flex items-center gap-1">
                                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                      {resource.rating}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button className="p-2 hover:bg-background rounded-lg transition-colors">
                                  <Bookmark className="h-4 w-4" />
                                </button>
                                <button className="p-2 hover:bg-background rounded-lg transition-colors">
                                  <ExternalLink className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Projects */}
                      <div>
                        <h4 className="font-semibold mb-3">Hands-on Projects</h4>
                        <div className="grid gap-3">
                          {step.projects.map((project) => (
                            <div
                              key={project.id}
                              className="p-4 bg-accent/10 rounded-lg border border-accent/20"
                            >
                              <div className="flex items-start justify-between">
                                <div>
                                  <h5 className="font-medium">{project.title}</h5>
                                  <p className="text-sm text-muted-foreground mb-2">{project.description}</p>
                                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {project.estimatedTime}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded-full text-xs ${getDifficultyColor(project.difficulty)}`}>
                                      {project.difficulty}
                                    </span>
                                  </div>
                                </div>
                                <button className="p-2 hover:bg-accent/20 rounded-lg transition-colors">
                                  <Play className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-4 border-t">
                        <button className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg font-medium transition-colors">
                          Start This Step
                        </button>
                        <button className="flex-1 border border-border hover:bg-muted px-4 py-2 rounded-lg font-medium transition-colors">
                          Download Roadmap
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Timeline View */}
          <div className="bg-card rounded-xl border p-6">
            <h3 className="text-xl font-semibold mb-4">Learning Timeline</h3>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border"></div>
              {currentPath.map((step, index) => (
                <div key={step.id} className="relative flex items-start gap-4 pb-8 last:pb-0">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white font-bold z-10 ${
                    step.completed 
                      ? 'bg-success' 
                      : step.progress > 0 
                        ? 'bg-primary' 
                        : 'bg-muted'
                  }`}>
                    {step.completed ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <span className="text-sm">{index + 1}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{step.title}</h4>
                    <p className="text-sm text-muted-foreground">{step.duration}</p>
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

export default LearningPathways;
