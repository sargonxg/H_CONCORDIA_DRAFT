import { motion } from "motion/react";
import { Info, Database, Mic, MessageSquare, ArrowRight } from "lucide-react";

export default function HowItWorks() {
  return (
    <div className="flex-1 overflow-y-auto p-8 lg:p-12 bg-[var(--color-bg)]">
      <div className="max-w-4xl mx-auto space-y-12">
        <header className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
            <Info className="w-8 h-8 text-[var(--color-accent)]" />
            How Concordia Works
          </h1>
          <p className="text-lg text-[var(--color-text-muted)] leading-relaxed">
            Concordia is a structured conversational agent designed to facilitate mediation. It uses a neurosymbolic approach, combining the deterministic structure of a knowledge graph with the probabilistic reasoning of Large Language Models.
          </p>
        </header>

        <section className="space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 space-y-4"
            >
              <div className="w-12 h-12 rounded-full bg-[var(--color-accent)]/20 flex items-center justify-center">
                <Mic className="w-6 h-6 text-[var(--color-accent)]" />
              </div>
              <h2 className="text-xl font-semibold text-white">1. Live Listening & Structuring</h2>
              <p className="text-[var(--color-text-muted)] leading-relaxed text-sm">
                During a live session, the Gemini 2.5 Native Audio API listens to the parties. It doesn't just transcribe; it actively extracts "primitives" (Claims, Interests, Constraints) and maps them to the specific Actors involved.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 space-y-4"
            >
              <div className="w-12 h-12 rounded-full bg-[var(--color-accent)]/20 flex items-center justify-center">
                <Database className="w-6 h-6 text-[var(--color-accent)]" />
              </div>
              <h2 className="text-xl font-semibold text-white">2. The Case Graph</h2>
              <p className="text-[var(--color-text-muted)] leading-relaxed text-sm">
                These primitives populate a live Knowledge Graph. This graph ensures that the AI maintains a strict, hallucination-free understanding of who wants what, and why. It acts as the "ground truth" for the mediation.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 space-y-4 md:col-span-2"
            >
              <div className="w-12 h-12 rounded-full bg-[var(--color-accent)]/20 flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-[var(--color-accent)]" />
              </div>
              <h2 className="text-xl font-semibold text-white">3. Guided Resolution & Common Ground</h2>
              <p className="text-[var(--color-text-muted)] leading-relaxed text-sm">
                Based on the Case Graph, Concordia's Advisor Agent (powered by Gemini 3.1 Pro) analyzes the discrepancies between parties. It generates critical questions to ask, identifies areas of common ground, and proposes actionable resolution pathways based on established mediation frameworks (like Principled Negotiation).
              </p>
            </motion.div>
          </div>
        </section>

        <section className="border-t border-[var(--color-border)] pt-12">
          <h2 className="text-2xl font-semibold text-white mb-6">The AI Architecture</h2>
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-8 font-mono text-sm text-[var(--color-text-muted)] space-y-4">
            <p className="text-white font-semibold">Agentic Workflow:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><span className="text-[var(--color-accent)]">Listener Agent (Live API):</span> Handles real-time voice I/O and maintains conversational flow.</li>
              <li><span className="text-[var(--color-accent)]">Extraction Agent (Pro):</span> Parses transcripts into structured JSON primitives.</li>
              <li><span className="text-[var(--color-accent)]">Advisor Agent (Pro):</span> Analyzes the graph to generate pathways and critical questions.</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
