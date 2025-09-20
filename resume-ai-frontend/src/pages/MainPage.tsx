import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sun, Moon, Facebook, Instagram, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ResumeUploader from "@/components/ResumeUploader";
import JobDescriptionInput from "@/components/JobDescriptionInput";
import SuggestionsPanel, { AIAnalysis } from "@/components/SuggestionsPanel";
import StarBackground from "@/components/StarBackground";
import { analyzeResume, SuggestionItem } from "../lib/api";
import ToSModal from "@/components/ui/ToS";
import InfoModal from "@/components/ui/InfoModal";
const techStacks = [
  "TypeScript",
  "Python",
  "JavaScript",
  "CSS",
  "OpenAI",
  "Vercel",
  "Render",
  "FramerMotion",
  "React",
];



const MainPage: React.FC = () => {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [canRefresh, setCanRefresh] = useState(true);
  const [countdown, setCountdown] = useState(0);

  const [showToS, setShowToS] = useState(true); // always true on refresh
  const [showInfo, setShowInfo] = useState(false);

  // Countdown timer effect
  useEffect(() => {
    let interval: number | undefined;
    if (!canRefresh && countdown > 0) {
      interval = window.setInterval(() => setCountdown((c) => c - 1), 1000);
    }
    if (countdown === 0 && !canRefresh) setCanRefresh(true);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [countdown, canRefresh]);

  const handleAnalyze = async () => {
    if (!resumeFile || !jobDescription) return;

    setLoading(true);
    setError(null);
    setShowSuggestions(false);
    setAiAnalysis(null);

    try {
      const data = await analyzeResume(resumeFile, jobDescription);
      if (data?.suggestions) {
        setSuggestions(data.suggestions);
        setShowSuggestions(true);

        setTimeout(() => triggerAIAnalysis(data.suggestions), 200);
      } else {
        setSuggestions([]);
        setError("Could not analyze resume. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("Error analyzing resume.");
    } finally {
      setLoading(false);
    }
  };

  const triggerAIAnalysis = async (suggestionList?: SuggestionItem[]) => {
    if (!canRefresh || (!suggestionList && suggestions.length === 0)) return;

    setLoading(true);
    setCanRefresh(false);
    setCountdown(5);

    const listToUse = suggestionList ?? suggestions;
    try {
      const API_BASE_URL = "https://resumeai-ahz1.onrender.com";
      const response = await fetch(`${API_BASE_URL}/api/openai-analysis`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matched: listToUse.flatMap((s) => s.items?.matched ?? []),
          missing: listToUse.flatMap((s) => s.items?.missing ?? []),
        }),
      });
      const data = await response.json();
      setAiAnalysis(data);
    } catch (err) {
      console.error("AI analysis failed:", err);
      setAiAnalysis({
        insight: "⚠️ Unable to generate AI insight",
        recommendations: [],
        grouped: {},
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={darkMode ? "dark" : ""}>
      {/* Info button (top-left) */}
      <div
  className="fixed top-4 left-4 z-50 flex items-center cursor-pointer"
  onClick={() => setShowInfo(true)}
>
  <Button
    variant="ghost"
    size="icon"
    className="rounded-full bg-transparent hover:bg-transparent active:bg-transparent
                 text-gray-600 hover:text-gray-900
                 dark:text-white dark:hover:text-gray-300"
  >
    <Info className="w-5 h-5 text-current" />
  </Button>
</div>

      {/* Dark mode toggle */}
      <div
        className="fixed top-4 right-4 z-50 flex items-center cursor-pointer"
        onClick={() => setDarkMode(!darkMode)}
      >
        <div
          className={`w-14 h-7 rounded-full flex items-center px-1 transition-colors duration-300 ${
            darkMode ? "bg-gray-700" : "bg-gray-300"
          }`}
        >
          <div
            className={`w-5 h-5 bg-white rounded-full shadow-md flex items-center justify-center text-sm transition-transform duration-300 ${
              darkMode ? "translate-x-7" : "translate-x-0"
            }`}
          >
            {darkMode ? "🌙" : "☀️"}
          </div>
        </div>
      </div>

      <motion.div
        className="min-h-screen w-full bg-transparent text-gray-900 dark:text-white flex flex-col items-center justify-center relative overflow-hidden p-4 sm:p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <StarBackground darkMode={darkMode} />

        <motion.h1
          className={`text-3xl sm:text-4xl md:text-5xl font-bold text-center ${
            darkMode ? "text-white" : "text-black"
          }`}
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          Resume AI
        </motion.h1>

        <motion.div
          className="w-full max-w-3xl mt-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="p-4 sm:p-6 shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold">Upload & Analyze</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <ResumeUploader file={resumeFile} setFile={setResumeFile} />
              <JobDescriptionInput value={jobDescription} onChange={setJobDescription} />
              <div className="flex justify-center -mt-3 gap-2">
                <Button
                  size="sm"
                  onClick={handleAnalyze}
                  disabled={loading || !resumeFile || !jobDescription || !canRefresh}
                >
                  {canRefresh ? (loading ? "Generating..." : "Analyze") : `Wait (${countdown}s)`}
                </Button>
              </div>
              {error && <p className="text-red-500 mt-2">{error}</p>}
            </CardContent>
          </Card>
        </motion.div>

        {showSuggestions && (
          <SuggestionsPanel
            open={showSuggestions}
            suggestions={suggestions}
            onClose={() => setShowSuggestions(false)}
            aiAnalysis={aiAnalysis}
            loading={loading}
            canRefresh={canRefresh}
            onRefresh={() => triggerAIAnalysis()}
          />
        )}

        {/* Footer */}
        <footer className="w-full mt-12 py-6 flex flex-col items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
          <p>
            Developed by{" "}
            <a
              href="https://my-portfolio-jusu.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold underline"
            >
              Luis
            </a>
          </p>

          <div className="flex flex-wrap justify-center gap-2">
            {techStacks.map((tech) => (
              <span
                key={tech}
                className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded-full text-xs font-medium"
              >
                {tech}
              </span>
            ))}
          </div>

          <div className="flex gap-4 mt-2">
            <a href="https://www.facebook.com/AntonioLuisASantos/" target="_blank" rel="noopener noreferrer">
              <Facebook className="w-5 h-5 hover:text-blue-600 transition-colors" />
            </a>
            <a href="https://www.instagram.com/0xlv1s_/" target="_blank" rel="noopener noreferrer">
              <Instagram className="w-5 h-5 hover:text-pink-500 transition-colors" />
            </a>
          </div>
        </footer>
      </motion.div>

      {/* ToS Modal */}
      {showToS && (
        <ToSModal
          onAgree={() => {
            setShowToS(false);
          }}
        />
      )}

      {/* Info Modal */}
<InfoModal
  open={showInfo}
  onClose={() => setShowInfo(false)}
/>

    </div>
  );
};

export default MainPage;
