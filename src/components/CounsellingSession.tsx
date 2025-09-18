import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Send, Clock, Bot, User, Sparkles } from "lucide-react";
import { getCounsellingResponse, CounsellingRequest } from "@/api";
import { auth } from "@/firebase";

interface UserProfile {
  name: string;
  age: string;
  educationLevel: string;
  streamOfInterest: string;
}

interface CounsellingSessionProps {
  profile: UserProfile;
  onComplete: (summary: string) => void;
  onBack: () => void;
}

interface Message {
  id: string;
  content: string;
  sender: "user" | "mentor";
  timestamp: Date;
}

const COUNSELLING_PROMPTS = {
  welcome: (name: string, education: string, stream: string) => 
    `Hi ${name}! 👋 I'm your personal career mentor. I see you're interested in ${stream} and currently at ${education} level. I'm here to help you discover your ideal career path through our conversation.

Let's start with something simple - what draws you most to ${stream}? Is it a particular subject, a career you've heard about, or something else entirely?`,
};

export function CounsellingSession({ profile, onComplete, onBack }: CounsellingSessionProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes in seconds
  const [isTyping, setIsTyping] = useState(false);
  const [conversationStage, setConversationStage] = useState(0);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSessionEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Initialize conversation
  useEffect(() => {
    const welcomeMessage: Message = {
      id: "welcome",
      content: COUNSELLING_PROMPTS.welcome(profile.name, profile.educationLevel, profile.streamOfInterest),
      sender: "mentor",
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, [profile]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const generateMentorResponse = async (userMessage: string, conversationHistory: Message[]) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("User not authenticated");
      }

      const idToken = await currentUser.getIdToken();
      
      // Convert messages to the format expected by the API
      const historyForAPI = conversationHistory.map(msg => ({
        sender: msg.sender,
        content: msg.content,
        timestamp: msg.timestamp
      }));

      const request: CounsellingRequest = {
        user_message: userMessage,
        conversation_history: historyForAPI,
        user_profile: {
          name: profile.name,
          age: profile.age,
          education_level: profile.educationLevel,
          stream_of_interest: profile.streamOfInterest
        }
      };

      const response = await getCounsellingResponse(idToken, request);
      // Prefer the backend-provided plain text field for professional formatting
      return response.text || response.answer;
    } catch (error) {
      console.error("Error generating mentor response:", error);
      return "I'm here to support you in your journey. Could you tell me more about what's on your mind?";
    }
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: currentMessage,
      sender: "user",
      timestamp: new Date()
    };

    const currentMessages = [...messages, userMessage];
    setMessages(currentMessages);
    setCurrentMessage("");
    setIsTyping(true);

    try {
      // Generate adaptive mentor response
      const mentorResponseText = await generateMentorResponse(currentMessage, currentMessages);
      
      const mentorResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: mentorResponseText,
        sender: "mentor",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, mentorResponse]);
      setConversationStage(prev => prev + 1);

      // End session after 8-10 exchanges
      if (conversationStage >= 8) {
        setTimeout(() => handleSessionEnd(), 2000);
      }
    } catch (error) {
      console.error("Error in handleSendMessage:", error);
      // Fallback response
      const fallbackResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm here to support you in your journey. Could you tell me more about what's on your mind?",
        sender: "mentor",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, fallbackResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSessionEnd = () => {
    const conversationSummary = messages
      .filter(msg => msg.sender === "user")
      .map(msg => msg.content)
      .join(" | ");
    
    onComplete(conversationSummary);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
      <header className="px-6 py-4 border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-sm">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">Career Counselling Session</h1>
                <p className="text-sm text-muted-foreground">with {profile.name}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-mono font-medium">
                  {formatTime(timeLeft)}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSessionEnd}
                  className="inline-flex items-center justify-center rounded-md bg-primary/90 text-primary-foreground hover:bg-primary px-3 py-2 text-sm font-medium transition duration-200"
                  title="Finish now and continue"
                >
                  Submit & Continue
                </button>
                <button
                  onClick={onBack}
                  className="inline-flex items-center justify-center rounded-md bg-muted/50 text-muted-foreground hover:bg-muted/70 px-3 py-2 text-sm transition duration-200"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Interface */}
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
                        <div className="h-8 w-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <Bot className="h-4 w-4 text-primary-foreground" />
                        </div>
                      )}
                      
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                          message.sender === "user"
                            ? "bg-primary text-primary-foreground ml-auto"
                            : "bg-muted/80 text-foreground"
                        }`}
                      >
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
                      <div className="h-8 w-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <Bot className="h-4 w-4 text-primary-foreground" />
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
              
              {/* Input Area */}
              <div className="border-t bg-muted/30 p-4">
                <div className="flex gap-3 items-end">
                  <div className="flex-1">
                    <input
                      ref={inputRef}
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Share your thoughts, ask questions, or tell me about your interests..."
                      className="min-h-[44px] w-full resize-none border-0 bg-background shadow-sm px-3 py-2 rounded-md"
                      disabled={timeLeft <= 0 || isTyping}
                    />
                  </div>
                  <button
                    onClick={handleSendMessage}
                    disabled={!currentMessage.trim() || timeLeft <= 0 || isTyping}
                    className="h-[44px] px-4 inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                  <span>Press Enter to send • Shift + Enter for new line</span>
                  <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs bg-muted text-foreground">
                    {messages.filter(m => m.sender === "user").length} messages sent
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}