import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import FeaturesPage from "./pages/FeaturesPage";
import CareerPathFinder from "./pages/CareerPathFinder";
import LearningPathways from "./pages/LearningPathways";
import AIMentor from "./pages/AIMentor";
import IndustryTrends from "./pages/IndustryTrends";
import OpportunityFinder from "./pages/OpportunityFinder";
import SkillGapAnalysis from "./pages/SkillGapAnalysis";
import MentorMatching from "./pages/MentorMatching";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/career-path-finder" element={<CareerPathFinder />} />
        <Route path="/learning-pathways" element={<LearningPathways />} />
        <Route path="/ai-mentor" element={<AIMentor />} />
        <Route path="/industry-trends" element={<IndustryTrends />} />
        <Route path="/opportunity-finder" element={<OpportunityFinder />} />
        <Route path="/skill-gap-analysis" element={<SkillGapAnalysis />} />
        <Route path="/mentor-matching" element={<MentorMatching />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
