import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ResumeUploader from "@/components/ResumeUploader";
import JobDescriptionInput from "@/components/JobDescriptionInput";
import SuggestionsPanel, { AIAnalysis } from "@/components/SuggestionsPanel";
import StarBackground from "@/components/StarBackground";
import { analyzeResume, SuggestionItem } from "../lib/api";

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
  const cooldownRef = useRef<NodeJS.Timeout | null>(null);

  const handleAnalyze = async () => {
    if (!resumeFile || !jobDescription) return;
    setLoading(true);
    setError(null);
    setShowSuggestions(false);
    setAiAnalysis(null);

    try {
      console.log("Analyzing resume...");
      const data = await analyzeResume(resumeFile, jobDescription);
      if (data?.suggestions) {
        setSuggestions(data.suggestions);
        setShowSuggestions(true);
        console.log("Resume analysis suggestions:", data.suggestions);
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

  const triggerAIAnalysis = async () => {
    if (!canRefresh) return;
    setLoading(true);
    setCanRefresh(false);

    console.log("Triggering AI analysis...");
    try {
      const API_BASE_URL = "https://resumeai-ahz1.onrender.com";

const response = await fetch(`${API_BASE_URL}/api/openai-analysis`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    matched: suggestions.flatMap((s) => s.items?.matched ?? []),
    missing: suggestions.flatMap((s) => s.items?.missing ?? []),
  }),
});
      console.log("OpenAI API response status:", response.status);
      const data = await response.json();
      console.log("AI analysis data:", data);
      setAiAnalysis(data);
    } catch (err) {
      console.error("AI analysis failed:", err);
      setAiAnalysis({ insight: "⚠️ Unable to generate AI insight", recommendations: [], grouped: {} });
    } finally {
      setLoading(false);
      cooldownRef.current = setTimeout(() => setCanRefresh(true), 30000); // 30s cooldown
    }
  };

  return (
    <div className={darkMode ? "dark" : ""}>
      <motion.div className="min-h-screen w-full bg-transparent text-gray-900 dark:text-white flex flex-col items-center justify-center relative overflow-hidden p-4 sm:p-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
        <StarBackground darkMode={darkMode} />

        <div className="absolute top-4 right-4 z-30">
          <button aria-label="Toggle dark mode" onClick={() => setDarkMode(!darkMode)} className={`relative w-16 h-8 rounded-full transition-colors duration-300 focus:outline-none ${darkMode ? "bg-gray-700" : "bg-yellow-300"}`}>
            <motion.div className="absolute top-1 w-6 h-6 rounded-full bg-white flex items-center justify-center shadow" animate={{ left: darkMode ? 32 : 4 }} transition={{ type: "spring", stiffness: 500, damping: 30 }}>
              {darkMode ? <Moon className="w-4 h-4 text-blue-500" /> : <Sun className="w-4 h-4 text-yellow-400" />}
            </motion.div>
          </button>
        </div>

        <div className="flex flex-col items-center gap-6 relative z-10">
          <motion.h1 className={`text-3xl sm:text-4xl md:text-5xl font-bold text-center ${darkMode ? "text-white" : "text-black"}`} initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }}>
            Resume AI
          </motion.h1>

          <motion.div className="w-full max-w-3xl" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, delay: 0.2 }}>
            <Card className="p-4 sm:p-6 shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold">Upload & Analyze</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <ResumeUploader file={resumeFile} setFile={setResumeFile} />
                <JobDescriptionInput value={jobDescription} onChange={setJobDescription} />
                <div className="flex justify-center -mt-3">
                  <Button onClick={handleAnalyze} disabled={loading || !resumeFile || !jobDescription}>
                    {loading ? "Analyzing..." : "Analyze"}
                  </Button>
                </div>
                {error && <p className="text-red-500 mt-2">{error}</p>}
              </CardContent>
            </Card>
          </motion.div>

          {loading && (
            <motion.div className="flex justify-center items-center mt-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </motion.div>
          )}
        </div>

        {showSuggestions && (
          <SuggestionsPanel
            open={showSuggestions}
            suggestions={suggestions}
            onClose={() => setShowSuggestions(false)}
            aiAnalysis={aiAnalysis}
            loading={loading}
            canRefresh={canRefresh}
            onRefresh={triggerAIAnalysis}
          />
        )}
      </motion.div>
    </div>
  );
};

export default MainPage;
