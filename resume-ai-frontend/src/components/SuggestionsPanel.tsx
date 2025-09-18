import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { SuggestionItem } from "@/lib/api";

export type AIAnalysis = {
  insight?: string;
  recommendations?: string[];
  grouped?: Record<string, string[]>;
};

type AISkillItem = SuggestionItem & {
  skill: string;
  confidence?: number;
  recommendation?: string;
  priority?: "Critical" | "Important" | "Nice-to-Have";
};

export type SuggestionsPanelProps = {
  open: boolean;
  suggestions: SuggestionItem[];
  onClose: () => void;
  aiAnalysis: AIAnalysis | null;
  loading: boolean;
  canRefresh: boolean;
  onRefresh: () => Promise<void>;
};

export default function SuggestionsPanel({
  open,
  suggestions,
  onClose,
  aiAnalysis,
  loading,
  canRefresh,
  onRefresh,
}: SuggestionsPanelProps) {
  if (!suggestions || suggestions.length === 0) return null;

  const isAIEnriched = suggestions.some(
    (s) => (s as AISkillItem).priority || (s as AISkillItem).recommendation
  );

  const allMatched = suggestions.flatMap((s) => s.items?.matched ?? []);
  const allMissing = suggestions.flatMap((s) => s.items?.missing ?? []);
  const totalTerms = allMatched.length + allMissing.length;
  const matchPercentage =
    totalTerms > 0 ? Math.round((allMatched.length / totalTerms) * 100) : 0;

  const groupedByPriority: Record<string, AISkillItem[]> = isAIEnriched
    ? {
        Critical: (suggestions as AISkillItem[]).filter(
          (s) => s.priority === "Critical"
        ),
        Important: (suggestions as AISkillItem[]).filter(
          (s) => s.priority === "Important"
        ),
        "Nice-to-Have": (suggestions as AISkillItem[]).filter(
          (s) => s.priority === "Nice-to-Have"
        ),
      }
    : {};

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="relative z-50 w-full max-w-3xl mx-4"
            initial={{ scale: 0.9, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 50 }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          >
            <Card className="shadow-xl rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md relative">
              <div className="absolute top-4 right-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="rounded-full"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <CardHeader className="flex justify-between items-center">
                <CardTitle className="text-xl font-semibold">
                  Resume Analysis Results
                </CardTitle>
                <Button
                  size="sm"
                  disabled={loading || !canRefresh}
                  onClick={onRefresh}
                  className="ml-2"
                >
                  {loading ? "Generating..." : "Refresh AI Insight"}
                </Button>
              </CardHeader>

              <CardContent className="flex flex-col gap-6">
                {!isAIEnriched ? (
                  <>
                    <SummarySection
                      allMatched={allMatched}
                      allMissing={allMissing}
                      matchPercentage={matchPercentage}
                    />
                    <AIAnalysisPanel analysis={aiAnalysis} loading={loading} />
                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                      {allMatched.length > 0 && (
                        <SkillColumn
                          title="Matched"
                          items={allMatched}
                          color="green"
                        />
                      )}
                      {allMissing.length > 0 && (
                        <SkillColumn
                          title="Missing"
                          items={allMissing}
                          color="red"
                        />
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    {Object.entries(groupedByPriority).map(
                      ([priority, skills]) =>
                        skills.length > 0 ? (
                          <PrioritySection
                            key={priority}
                            priority={priority}
                            skills={skills}
                          />
                        ) : null
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ------------------------- Subcomponents -------------------------

function SummarySection({
  allMatched,
  allMissing,
  matchPercentage,
}: {
  allMatched: string[];
  allMissing: string[];
  matchPercentage: number;
}) {
  return (
    <div>
      <p className="text-gray-700 dark:text-gray-300 text-sm">
        Your resume matches <span className="font-semibold">{allMatched.length}</span> of{" "}
        <span className="font-semibold">{allMatched.length + allMissing.length}</span> prioritized JD terms{" "}
        <span className="font-semibold">({matchPercentage}%)</span>.
      </p>
      {allMissing.length > 0 && (
        <p className="text-gray-700 dark:text-gray-300 text-sm">
          Consider adding the missing skills/keywords in your summary or skills section.
        </p>
      )}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
        <motion.div
          className="bg-green-500 h-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${matchPercentage}%` }}
          transition={{ duration: 0.6 }}
        />
      </div>
    </div>
  );
}

// ---------------- AI Analysis Panel ----------------

function AIAnalysisPanel({ analysis, loading }: { analysis: AIAnalysis | null; loading: boolean }) {
  if (!analysis && !loading) return null;

  const raw = analysis?.insight ?? "";
  const parsed = parseInsightText(raw);

  const recommendations =
    analysis?.recommendations?.length ? analysis.recommendations : parsed.recommendations;

  const grouped =
    analysis?.grouped && Object.keys(analysis.grouped).length > 0
      ? analysis.grouped
      : parsed.grouped;

  const insightMain =
    (analysis?.insight ?? "")
      .replace(/^\s*Insight Summary:?\s*/i, "")
      .split(/Recommendations:/i)[0]
      .trim() || parsed.main;

  const priorityMap: Record<string, string> = {
    High: "Critical",
    Medium: "Important",
    Low: "Nice-to-Have",
    Critical: "Critical",
    Important: "Important",
    "Nice-to-Have": "Nice-to-Have",
  };

  const normalizedGrouped: Record<string, string[]> = {};
  for (const [key, values] of Object.entries(grouped)) {
    const mappedKey = priorityMap[key] || key;
    if (!normalizedGrouped[mappedKey]) normalizedGrouped[mappedKey] = [];
    normalizedGrouped[mappedKey].push(...values);
  }

  return (
    <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
      {loading ? (
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">🤖 Generating AI insight...</p>
      ) : (
        <>
          {/* Insight Summary */}
          {insightMain && (
            <div className="mt-2 text-sm text-gray-700 dark:text-gray-300 space-y-2">
              <p className="font-bold text-left">Insight Summary:</p>
              {insightMain.split(/\n{2,}|\r\n{2,}/).map((paragraph, idx) => (
                <p key={idx} className="leading-relaxed text-left">
                  {paragraph.trim()}
                </p>
              ))}
            </div>
          )}

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div className="mt-3">
              <p className="font-bold text-sm text-gray-800 dark:text-gray-200 text-left">
                Recommendations:
              </p>
              <div className="mt-2 space-y-2">
                {recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="w-5 flex-shrink-0 font-bold text-xs text-left">{i + 1}.</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 leading-snug text-left">{rec}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills Relevance */}
          {["Critical", "Important", "Nice-to-Have"].some(
            (p) => normalizedGrouped[p]?.length
          ) && (
            <div className="mt-3">
              <p className="font-bold text-sm text-gray-800 dark:text-gray-200 text-left">
                Skills Relevance to Job Description:
              </p>
              <div className="mt-2 space-y-2 text-xs text-gray-600 dark:text-gray-400 text-left">
                {["Critical", "Important", "Nice-to-Have"].map((priority) =>
                  normalizedGrouped[priority]?.length ? (
                    <div key={priority}>
                      <span className="font-semibold">{priority}:</span>{" "}
                      <span className="ml-1">{normalizedGrouped[priority].join(", ")}</span>
                    </div>
                  ) : null
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ---------------- Text Parsing ----------------

function parseInsightText(raw?: string) {
  if (!raw) return { main: "", recommendations: [] as string[], grouped: {} as Record<string, string[]> };

  let t = raw.trim();
  t = t.replace(/^\s*Insight Summary:?\s*/i, "").trim();

  const [beforeRec, afterRec] = t.split(/Recommendations:/i);
  const main = (beforeRec || "").trim();

  let recBlock = (afterRec || "").trim();
  let groupBlock = "";

  if (recBlock) {
    const parts = recBlock.split(/(?:Group by Priority:|Group by:|Skills Relevance to Job Description:)/i);
    recBlock = (parts[0] || "").trim();
    groupBlock = (parts[1] || "").trim();
  }

  const recommendations = parseRecommendationsBlock(recBlock);
  const grouped = parseGroupedBlock(groupBlock);

  return { main, recommendations, grouped };
}

function parseRecommendationsBlock(block: string) {
  if (!block) return [] as string[];
  const lines = block.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  const numbered = lines.filter((l) => /^\d+[\.\)]\s*/.test(l));
  if (numbered.length) {
    return numbered.map((l) => l.replace(/^\d+[\.\)]\s*/, "").trim());
  }

  if (lines.length > 1) return lines;
  return block.split(/(?<=\.)\s+/).map((s) => s.trim()).filter(Boolean);
}

function parseGroupedBlock(block: string) {
  if (!block) return {} as Record<string, string[]>;
  const lines = block.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  const map: Record<string, string[]> = {};
  for (const line of lines) {
    const colon = line.match(/^([^:]+):\s*(.*)/);
    if (colon) {
      const key = colon[1].trim();
      const vals = colon[2].split(",").map((s) => s.trim()).filter(Boolean);
      map[key] = vals;
    }
  }
  return map;
}

// ---------------- Priority Section ----------------

function PrioritySection({ priority, skills }: { priority: string; skills: AISkillItem[] }) {
  return (
    <div>
      <p className="font-semibold mb-2 text-gray-800 dark:text-gray-200">{priority}</p>
      <div className="flex flex-col gap-2">
        {skills.map((s, idx) => (
          <motion.div
            key={s.skill + idx}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{s.skill}</span>
              <Badge variant="secondary">{((s.confidence ?? 0) * 100).toFixed(0)}%</Badge>
            </div>
            {s.recommendation && (
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{s.recommendation}</p>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ---------------- Skill Column ----------------

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
