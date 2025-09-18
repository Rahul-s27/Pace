import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  MessageCircle, 
  Send, 
  Mic, 
  Upload, 
  Paperclip,
  Bot,
  User,
  Sparkles,
  Lightbulb,
  TrendingUp,
  Target,
  BookOpen,
  Clock,
  Star,
  X,
  FileText,
  Image,
  Video
} from "lucide-react";

interface UserProfile {
  name: string;
  age: string;
  educationLevel: string;
  streamOfInterest: string;
}

interface Message {
  id: string;
  content: string;
  sender: "user" | "mentor";
  timestamp: Date;
  type: "text" | "file" | "voice";
  attachments?: FileAttachment[];
}

interface FileAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url?: string;
}

interface QuickQuestion {
  id: string;
  text: string;
  category: string;
}

const AIMentor = () => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<FileAttachment[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    // Initialize with welcome message
    const welcomeMessage: Message = {
      id: "welcome",
      content: `Hi ${userProfile?.name || "there"}! 👋 I'm your AI Career Mentor. I'm here to provide personalized guidance, answer your questions, and help you navigate your career journey. 

What would you like to explore today? You can ask me about:
• Career advice and planning
• Skill development recommendations  
• Industry insights and trends
• Interview preparation
• Resume and portfolio feedback
• Learning resources and courses

Feel free to upload your resume, portfolio, or any documents for personalized feedback!`,
      sender: "mentor",
      timestamp: new Date(),
      type: "text"
    };
    setMessages([welcomeMessage]);
  }, [userProfile?.name]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const quickQuestions: QuickQuestion[] = [
    { id: "1", text: "What skills should I focus on?", category: "Skills" },
    { id: "2", text: "How can I improve my resume?", category: "Career" },
    { id: "3", text: "What are the latest industry trends?", category: "Trends" },
    { id: "4", text: "Should I pursue a master's degree?", category: "Education" },
    { id: "5", text: "How do I prepare for technical interviews?", category: "Interviews" },
    { id: "6", text: "What career path matches my interests?", category: "Career" }
  ];

  const generateMentorResponse = async (userMessage: string, conversationHistory: Message[]): Promise<string> => {
    try {
      // Simulate AI mentor response - in real app, this would call your backend
      const responses = [
        "That's a great question! Let me provide you with some personalized insights based on your profile.",
        "I understand your concern. Here's what I recommend based on current industry trends:",
        "Excellent point! This is actually a common challenge many students face. Here's my advice:",
        "Based on your background in technology, I think you should consider the following approach:",
        "That's a smart question! Let me break this down into actionable steps for you:",
        "I can see you're thinking strategically about your career. Here's what the data shows:"
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 2000));
      
      return randomResponse + " " + generateDetailedResponse(userMessage);
    } catch (error) {
      console.error("Error generating mentor response:", error);
      return "I'm here to help! Could you please rephrase your question or provide more details?";
    }
  };

  const generateDetailedResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes("skill") || lowerMessage.includes("learn")) {
      return "Focus on building both technical and soft skills. For technical skills, consider learning programming languages like Python or JavaScript, and tools like Git and cloud platforms. For soft skills, work on communication, problem-solving, and collaboration. I recommend starting with one technical skill and mastering it before moving to the next.";
    }
    
    if (lowerMessage.includes("resume") || lowerMessage.includes("cv")) {
      return "Your resume should be tailored to each job application. Use action verbs, quantify your achievements, and highlight relevant projects. Make sure it's ATS-friendly with clear formatting. I'd be happy to review your resume if you upload it!";
    }
    
    if (lowerMessage.includes("interview") || lowerMessage.includes("prepare")) {
      return "Interview preparation involves researching the company, practicing common questions, and preparing examples using the STAR method. For technical roles, practice coding problems and system design. Mock interviews can be very helpful - would you like me to conduct a practice session?";
    }
    
    if (lowerMessage.includes("trend") || lowerMessage.includes("industry")) {
      return "Current industry trends include AI/ML integration, remote work adoption, sustainability focus, and digital transformation. Cybersecurity, data science, and cloud computing are particularly hot areas. Companies are also valuing soft skills more than ever.";
    }
    
    if (lowerMessage.includes("degree") || lowerMessage.includes("education")) {
      return "Whether to pursue further education depends on your career goals and current situation. For some roles, experience and certifications may be more valuable than additional degrees. Consider your financial situation, time commitment, and whether the degree will directly advance your career goals.";
    }
    
    return "That's an interesting perspective! Could you tell me more about your specific situation or goals? This will help me provide more targeted advice.";
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim() && attachedFiles.length === 0) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: currentMessage || "I've uploaded some files for review",
      sender: "user",
      timestamp: new Date(),
      type: attachedFiles.length > 0 ? "file" : "text",
      attachments: attachedFiles.length > 0 ? attachedFiles : undefined
    };

    const currentMessages = [...messages, userMessage];
    setMessages(currentMessages);
    setCurrentMessage("");
    setAttachedFiles([]);
    setIsTyping(true);

    try {
      const mentorResponseText = await generateMentorResponse(currentMessage, currentMessages);
      
      const mentorResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: mentorResponseText,
        sender: "mentor",
        timestamp: new Date(),
        type: "text"
      };

      setMessages(prev => [...prev, mentorResponse]);
    } catch (error) {
      console.error("Error in handleSendMessage:", error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickQuestion = (question: QuickQuestion) => {
    setCurrentMessage(question.text);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const attachment: FileAttachment = {
        id: Date.now().toString() + Math.random(),
        name: file.name,
        type: file.type,
        size: file.size,
        url: URL.createObjectURL(file)
      };
      setAttachedFiles(prev => [...prev, attachment]);
    });
  };

  const removeAttachment = (attachmentId: string) => {
    setAttachedFiles(prev => prev.filter(file => file.id !== attachmentId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (type.startsWith('video/')) return <Video className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="px-6 py-6 border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/features")}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="h-10 w-10 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">AI Career Mentor</h1>
                <p className="text-muted-foreground">
                  24/7 personalized career guidance
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-800 rounded-lg">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Online</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col h-[calc(100vh-80px)]">
        <div className="flex-1 px-6 py-4">
          <div className="max-w-4xl mx-auto h-full">
            <div className="h-full flex flex-col shadow-lg border-0 bg-card/50 backdrop-blur-sm rounded-xl">
              {/* Messages */}
              <div className="flex-1 p-6 overflow-y-auto" ref={scrollAreaRef}>
                <div className="space-y-6">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        message.sender === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      {message.sender === "mentor" && (
                        <div className="h-8 w-8 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                      )}
                      
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                          message.sender === "user"
                            ? "bg-primary text-primary-foreground ml-auto"
                            : "bg-muted/80 text-foreground"
                        }`}
                      >
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="mb-3 space-y-2">
                            {message.attachments.map((attachment) => (
                              <div key={attachment.id} className="flex items-center gap-2 p-2 bg-background/50 rounded-lg">
                                {getFileIcon(attachment.type)}
                                <span className="text-sm">{attachment.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  ({formatFileSize(attachment.size)})
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {message.content}
                        </p>
                        <span className="text-xs opacity-70 mt-2 block">
                          {message.timestamp.toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                      
                      {message.sender === "user" && (
                        <div className="h-8 w-8 bg-gradient-to-br from-accent to-accent/80 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <User className="h-4 w-4 text-accent-foreground" />
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex gap-3 justify-start">
                      <div className="h-8 w-8 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                      <div className="bg-muted/80 rounded-2xl px-4 py-3">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-pulse"></div>
                          <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                          <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Quick Questions */}
              {messages.length <= 1 && (
                <div className="px-6 pb-4">
                  <div className="bg-muted/30 rounded-lg p-4">
                    <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4" />
                      Quick Questions
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {quickQuestions.map((question) => (
                        <button
                          key={question.id}
                          onClick={() => handleQuickQuestion(question)}
                          className="text-xs px-3 py-1.5 bg-background hover:bg-muted rounded-full border transition-colors"
                        >
                          {question.text}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Input Area */}
              <div className="border-t bg-muted/30 p-4">
                {/* Attached Files */}
                {attachedFiles.length > 0 && (
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-2">
                      {attachedFiles.map((file) => (
                        <div key={file.id} className="flex items-center gap-2 p-2 bg-background rounded-lg border">
                          {getFileIcon(file.type)}
                          <span className="text-sm">{file.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ({formatFileSize(file.size)})
                          </span>
                          <button
                            onClick={() => removeAttachment(file.id)}
                            className="p-1 hover:bg-muted rounded"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex gap-3 items-end">
                  <div className="flex-1">
                    <input
                      ref={inputRef}
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask me anything about your career journey..."
                      className="min-h-[44px] w-full resize-none border-0 bg-background shadow-sm px-3 py-2 rounded-md"
                      disabled={isTyping}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="h-[44px] w-[44px] inline-flex items-center justify-center rounded-md bg-muted hover:bg-muted/80 transition-colors"
                    >
                      <Upload className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setIsRecording(!isRecording)}
                      className={`h-[44px] w-[44px] inline-flex items-center justify-center rounded-md transition-colors ${
                        isRecording ? 'bg-red-500 text-white' : 'bg-muted hover:bg-muted/80'
                      }`}
                    >
                      <Mic className="h-4 w-4" />
                    </button>
                    <button
                      onClick={handleSendMessage}
                      disabled={(!currentMessage.trim() && attachedFiles.length === 0) || isTyping}
                      className="h-[44px] px-4 inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground disabled:opacity-50"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                  <span>Press Enter to send • Shift + Enter for new line</span>
                  <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs bg-muted text-foreground">
                    <Sparkles className="w-3 h-3 mr-1" />
                    AI-Powered
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  );
};

export default AIMentor;
