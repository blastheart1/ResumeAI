import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { SuggestionItem } from "@/lib/api";

type SuggestionsPanelProps = {
  suggestions: SuggestionItem[];
};

export default function SuggestionsPanel({ suggestions }: SuggestionsPanelProps) {
  const [expanded, setExpanded] = useState(false);

  if (!suggestions || suggestions.length === 0) {
    return (
      <p className="text-gray-600 dark:text-gray-300 text-center mt-4">
        No suggestions yet. Upload a resume and job description to start.
      </p>
    );
  }

  // Aggregate matched/missing items for summary
  const allMatched = suggestions.flatMap(s => s.items?.matched ?? []);
  const allMissing = suggestions.flatMap(s => s.items?.missing ?? []);
  const totalTerms = allMatched.length + allMissing.length;
  const matchPercentage = totalTerms > 0 ? Math.round((allMatched.length / totalTerms) * 100) : 0;

  const maxVisible = 6;
  const visibleMatched = expanded ? allMatched : allMatched.slice(0, maxVisible);
  const visibleMissing = expanded ? allMissing : allMissing.slice(0, maxVisible);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 w-full max-w-3xl"
    >
      <Card className="shadow-lg rounded-2xl border border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Resume Analysis Results</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {/* Summary */}
          <div>
            <p className="text-gray-700 dark:text-gray-300 text-sm">
              Your resume matches{" "}
              <span className="font-semibold">{allMatched.length}</span> of{" "}
              <span className="font-semibold">{totalTerms}</span> prioritized JD terms{" "}
              <span className="font-semibold">({matchPercentage}%)</span>.
            </p>
            {allMissing.length > 0 && (
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Consider adding the missing skills/keywords in your summary or skills section.
              </p>
            )}

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
              <motion.div
                className="bg-green-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${matchPercentage}%` }}
                transition={{ duration: 0.6 }}
              />
            </div>
          </div>

          {/* Matched / Missing Columns */}
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            {allMatched.length > 0 && <SkillColumn title="Matched" items={visibleMatched} color="green" />}
            {allMissing.length > 0 && <SkillColumn title="Missing" items={visibleMissing} color="red" />}
          </div>

          {/* Show More / Less Button */}
          {(allMatched.length > maxVisible || allMissing.length > maxVisible) && (
            <div className="flex justify-center mt-2">
              <Button
                
                size="sm"
                className="dark:text-black no-underline"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? "Show less" : "Show more"}
              </Button>
            </div>
          )}

          {/* Detailed Messages per category */}
          {suggestions.map((s, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <p className="text-gray-700 dark:text-gray-300 text-sm mt-2">
                <span className="font-semibold">{s.title}:</span> {s.message}
              </p>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function SkillColumn({ title, items, color }: { title: string; items: string[]; color: string }) {
  return (
    <div>
      <p className={`font-semibold mb-2 text-${color}-600 dark:text-${color}-400`}>{title}</p>
      <div className="flex flex-wrap gap-2">
        <AnimatePresence>
          {items.map((item, i) => (
            <motion.div
              key={item + i}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <Badge variant="secondary">{item}</Badge>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
