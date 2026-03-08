import { useState } from "react";
import { motion } from "motion/react";
import { Zap, Loader2, FileText } from "lucide-react";
import { fastAnalysis } from "../services/geminiService";

export default function FastAnalysis() {
  const [text, setText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setIsAnalyzing(true);
    try {
      const res = await fastAnalysis(text);
      setResult(res);
    } catch (error) {
      console.error("Analysis error:", error);
      setResult("Error performing fast analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--color-bg)] p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Zap className="w-6 h-6 text-[var(--color-accent)]" />
          Fast Analysis
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          Quickly identify main actors and claims using Flash-Lite.
        </p>
      </header>

      <div className="flex-1 max-w-3xl mx-auto w-full space-y-8">
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 flex flex-col">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-4">
            Conflict Scenario
          </h3>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste a conflict scenario here for rapid analysis..."
            className="w-full h-48 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg p-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] resize-none"
          />

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleAnalyze}
              disabled={!text.trim() || isAnalyzing}
              className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  Analyze Now
                </>
              )}
            </button>
          </div>
        </div>

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 flex flex-col"
          >
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[var(--color-accent)]" />
              Analysis Result
            </h3>
            <div className="text-sm text-white leading-relaxed whitespace-pre-wrap">
              {result}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
