import { 
  Target, 
  BookOpen, 
  TrendingUp, 
  Clock, 
  Award, 
  ArrowRight,
  MapPin,
  DollarSign,
  Users,
  ArrowLeft,
  Star,
  CheckCircle
} from "lucide-react";

interface UserProfile {
  name: string;
  age: string;
  educationLevel: string;
  streamOfInterest: string;
}

interface RecommendationsPageProps {
  profile: UserProfile;
  answers: Record<string, string>;
  onRestart: () => void;
  onSubmitAndContinue?: () => void;
}

interface CareerRecommendation {
  title: string;
  match: number;
  description: string;
  skills: string[];
  education: string[];
  salaryRange: string;
  growth: string;
  workEnvironment: string;
  timeToEntry: string;
}

interface LearningStep {
  step: number;
  title: string;
  description: string;
  timeframe: string;
  resources: string[];
}

export function RecommendationsPage({ profile, answers, onRestart, onSubmitAndContinue }: RecommendationsPageProps) {
  
  // Generate recommendations based on answers
  const generateRecommendations = (): CareerRecommendation[] => {
    const { favorite_subject, problem_solving, work_environment, motivation, skills, future_vision } = answers;
    
    const recommendations: CareerRecommendation[] = [];
    
    // Software Engineering path
    if (favorite_subject === "computer" || favorite_subject === "mathematics" || 
        skills === "technical" || work_environment === "remote") {
      recommendations.push({
        title: "Software Engineer",
        match: 95,
        description: "Design and develop software applications, websites, and systems. Work with cutting-edge technologies to solve real-world problems.",
        skills: ["Programming", "Problem-solving", "Logical thinking", "Team collaboration"],
        education: ["Computer Science Degree", "Coding Bootcamp", "Self-taught + Portfolio"],
        salaryRange: "$70k - $180k+",
        growth: "22% (Much faster than average)",
        workEnvironment: "Remote/Office flexibility",
        timeToEntry: "6 months - 4 years"
      });
    }

    // Data Science path
    if (favorite_subject === "mathematics" || favorite_subject === "science" || 
        skills === "analytical" || problem_solving === "analytical") {
      recommendations.push({
        title: "Data Scientist",
        match: 88,
        description: "Analyze complex data to help organizations make informed decisions. Use statistics, machine learning, and programming to extract insights.",
        skills: ["Statistics", "Python/R", "Machine Learning", "Data Visualization"],
        education: ["Statistics/Math Degree", "Data Science Bootcamp", "Online Certifications"],
        salaryRange: "$80k - $200k+",
        growth: "35% (Much faster than average)",
        workEnvironment: "Hybrid work, collaborative teams",
        timeToEntry: "1-3 years"
      });
    }

    // Healthcare path
    if (motivation === "helping_others" || work_environment === "healthcare" || 
        profile.streamOfInterest === "medical") {
      recommendations.push({
        title: "Healthcare Professional",
        match: 92,
        description: "Provide medical care and support to patients. Make a direct impact on people's health and well-being.",
        skills: ["Empathy", "Communication", "Problem-solving", "Attention to detail"],
        education: ["Medical School", "Nursing Program", "Healthcare Certifications"],
        salaryRange: "$60k - $300k+",
        growth: "15% (Much faster than average)",
        workEnvironment: "Hospitals, clinics, healthcare facilities",
        timeToEntry: "2-8 years"
      });
    }

    // Business/Management path
    if (skills === "leadership" || future_vision === "manager" || future_vision === "entrepreneur" ||
        motivation === "financial_success") {
      recommendations.push({
        title: "Business Manager",
        match: 85,
        description: "Lead teams and projects to achieve business goals. Strategic planning, team management, and organizational leadership.",
        skills: ["Leadership", "Communication", "Strategic thinking", "Project management"],
        education: ["Business Degree", "MBA", "Management Certifications"],
        salaryRange: "$65k - $150k+",
        growth: "10% (Faster than average)",
        workEnvironment: "Corporate offices, hybrid work",
        timeToEntry: "2-5 years"
      });
    }

    // Creative path
    if (favorite_subject === "arts" || skills === "artistic" || problem_solving === "creative" ||
        work_environment === "creative_studio") {
      recommendations.push({
        title: "Creative Professional",
        match: 90,
        description: "Use creativity and artistic skills to design, create, and communicate ideas through visual and digital media.",
        skills: ["Creativity", "Design software", "Visual communication", "Innovation"],
        education: ["Art/Design Degree", "Portfolio Development", "Online Courses"],
        salaryRange: "$45k - $120k+",
        growth: "13% (Faster than average)",
        workEnvironment: "Studios, agencies, freelance",
        timeToEntry: "1-4 years"
      });
    }

    // Default fallback recommendations
    if (recommendations.length === 0) {
      recommendations.push(
        {
          title: "Project Manager",
          match: 80,
          description: "Coordinate teams and resources to deliver projects on time and within budget. Bridge between technical and business teams.",
          skills: ["Organization", "Communication", "Leadership", "Problem-solving"],
          education: ["Any Degree + Certifications", "Project Management Bootcamp"],
          salaryRange: "$60k - $130k+",
          growth: "11% (Faster than average)",
          workEnvironment: "Office/Remote hybrid",
          timeToEntry: "2-4 years"
        },
        {
          title: "Marketing Specialist",
          match: 75,
          description: "Develop and execute marketing strategies to promote products and services. Analyze market trends and consumer behavior.",
          skills: ["Creativity", "Analytics", "Communication", "Digital marketing"],
          education: ["Marketing Degree", "Digital Marketing Certifications"],
          salaryRange: "$45k - $100k+",
          growth: "10% (Faster than average)",
          workEnvironment: "Agency/Corporate, flexible",
          timeToEntry: "1-3 years"
        }
      );
    }

    return recommendations.slice(0, 3); // Return top 3 recommendations
  };

  const generateLearningPath = (topCareer: CareerRecommendation): LearningStep[] => {
    const basePath: LearningStep[] = [
      {
        step: 1,
        title: "Foundation Building",
        description: "Build core knowledge and skills in your chosen field",
        timeframe: "3-6 months",
        resources: ["Online courses", "Books and tutorials", "Basic projects"]
      },
      {
        step: 2,
        title: "Skill Development",
        description: "Develop specific technical and soft skills required for the role",
        timeframe: "6-12 months",
        resources: ["Advanced courses", "Certification programs", "Practice projects"]
      },
      {
        step: 3,
        title: "Portfolio Building",
        description: "Create a portfolio showcasing your skills and knowledge",
        timeframe: "3-6 months",
        resources: ["Personal projects", "GitHub repository", "Professional portfolio"]
      },
      {
        step: 4,
        title: "Experience Gaining",
        description: "Get real-world experience through internships or entry-level positions",
        timeframe: "6-12 months",
        resources: ["Internships", "Freelance projects", "Volunteer work"]
      },
      {
        step: 5,
        title: "Career Launch",
        description: "Apply for full-time positions and continue growing in your field",
        timeframe: "Ongoing",
        resources: ["Job applications", "Networking events", "Continuous learning"]
      }
    ];

    return basePath;
  };

  const recommendations = generateRecommendations();
  const topCareer = recommendations[0];
  const learningPath = generateLearningPath(topCareer);

  const handleSubmitAndContinue = async () => {
    try {
      // Save counselling session results to backend
      // This would typically call an API to save the session data
      console.log('Saving counselling session results:', {
        profile,
        answers,
        recommendations,
        learningPath
      });
      
      // Call the callback to navigate to home/features page
      if (onSubmitAndContinue) {
        onSubmitAndContinue();
      }
    } catch (error) {
      console.error('Error saving session:', error);
      // Still navigate even if save fails
      if (onSubmitAndContinue) {
        onSubmitAndContinue();
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="px-6 py-6 border-b bg-card">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-success rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-success-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">Career Recommendations for {profile.name}</h1>
                <p className="text-sm text-muted-foreground">Your personalized career guidance is ready!</p>
              </div>
            </div>
            <button
              onClick={onRestart}
              className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted"
            >
              <ArrowLeft className="h-4 w-4" />
              Start Over
            </button>
          </div>
        </div>
      </header>

      <div className="px-6 py-12">
        <div className="max-w-6xl mx-auto space-y-12">
          
          {/* Career Recommendations */}
          <section>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Your Top Career Matches</h2>
              <p className="text-lg text-muted-foreground">
                Based on your interests, skills, and goals, here are the careers that best fit your profile
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {recommendations.map((career, index) => (
                <div key={index} className={`relative shadow-card rounded-xl border bg-card ${index === 0 ? 'ring-2 ring-primary' : ''}`}>
                  {index === 0 && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs bg-primary text-primary-foreground">
                        <Star className="w-3 h-3 mr-1" />
                        Best Match
                      </span>
                    </div>
                  )}
                  
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold">{career.title}</h3>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">{career.match}%</div>
                        <div className="text-xs text-muted-foreground">Match</div>
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {career.description}
                    </p>
                  </div>

                  <div className="space-y-4 p-6 pt-0">
                    {/* Key Skills */}
                    <div>
                      <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <Award className="h-4 w-4" />
                        Key Skills
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {career.skills.map((skill, i) => (
                          <span key={i} className="inline-flex items-center rounded-full px-2 py-0.5 text-xs bg-muted text-foreground">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{career.salaryRange}</div>
                          <div className="text-xs text-muted-foreground">Salary Range</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{career.growth}</div>
                          <div className="text-xs text-muted-foreground">Job Growth</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{career.workEnvironment}</div>
                          <div className="text-xs text-muted-foreground">Work Style</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{career.timeToEntry}</div>
                          <div className="text-xs text-muted-foreground">Time to Entry</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="h-px w-full bg-border" />

          {/* Learning Roadmap */}
          <section>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Your Career Roadmap</h2>
              <p className="text-lg text-muted-foreground">
                Step-by-step guide to become a <span className="font-semibold text-primary">{topCareer.title}</span>
              </p>
            </div>

            <div className="grid lg:grid-cols-5 gap-6">
              {learningPath.map((step, index) => (
                <div key={index} className="shadow-card rounded-xl border bg-card">
                  <div className="p-6 pb-3">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">
                        {step.step}
                      </div>
                      <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs border">
                        {step.timeframe}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold">{step.title}</h3>
                  </div>
                  <div className="space-y-3 p-6 pt-0">
                    <p className="text-sm text-muted-foreground">
                      {step.description}
                    </p>
                    <div>
                      <h5 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <BookOpen className="h-3 w-3" />
                        Resources
                      </h5>
                      <ul className="space-y-1">
                        {step.resources.map((resource, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-success" />
                            {resource}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Next Steps */}
          <section>
            <div className="shadow-card rounded-xl border bg-gradient-primary text-primary-foreground">
              <div className="p-6">
                <h3 className="text-2xl flex items-center gap-3 font-semibold">
                  <Target className="h-8 w-8" />
                  Ready to Start Your Journey?
                </h3>
                <p className="text-primary-foreground/90 text-base">
                  Your personalized career roadmap is ready. Submit your session and explore our comprehensive AI-powered career platform!
                </p>
              </div>
              <div className="p-6 pt-0">
                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={handleSubmitAndContinue}
                    className="bg-white text-primary hover:bg-white/90 inline-flex items-center justify-center rounded-md h-12 px-5 font-semibold"
                  >
                    Submit and Continue for AI Career
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                  <button 
                    className="border border-white text-white hover:bg-white/10 inline-flex items-center justify-center rounded-md h-12 px-5"
                    onClick={onRestart}
                  >
                    Take Assessment Again
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}