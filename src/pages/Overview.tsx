import { motion } from "motion/react";
import { ShieldAlert, Activity, Users, Database } from "lucide-react";
import { Link } from "react-router-dom";

export default function Overview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-1 overflow-y-auto p-8 lg:p-12"
    >
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Hero Section */}
        <section className="space-y-6">
          <h1 className="text-5xl font-bold tracking-tight leading-tight">
            The Conflict Context Layer for AI-assisted resolution and
            intelligence.
          </h1>
          <p className="text-xl text-[var(--color-text-muted)] max-w-2xl leading-relaxed">
            Conflict is a universal human experience. CONCORDIA makes conflict
            legible for humans and AI by extracting structural primitives,
            tracking temporal graphs, and ensuring provenance.
          </p>
          <div className="flex gap-4 pt-4">
            <Link
              to="/workspace"
              className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Activity className="w-5 h-5" />
              Try Conflict Companion
            </Link>
            <button className="bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-white px-6 py-3 rounded-lg font-medium transition-colors">
              Request API Access
            </button>
          </div>
        </section>

        {/* Why TACITUS */}
        <section className="space-y-6 border-t border-[var(--color-border)] pt-12">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Database className="w-6 h-6 text-[var(--color-accent)]" />
            Why TACITUS Core Engine?
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-white">
                Beyond Summaries
              </h3>
              <p className="text-[var(--color-text-muted)] leading-relaxed">
                Standard LLM summaries and embeddings fail for conflict. They
                lose nuance, flatten temporal dynamics, and hallucinate facts.
              </p>
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-white">
                Structural Legibility
              </h3>
              <p className="text-[var(--color-text-muted)] leading-relaxed">
                We need temporal, provenance-linked, auditable memory. TACITUS
                acts as infrastructure, reifying "traces of conflict" into a
                structured data asset.
              </p>
            </div>
          </div>
        </section>

        {/* Who It's For */}
        <section className="space-y-6 border-t border-[var(--color-border)] pt-12">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Users className="w-6 h-6 text-[var(--color-accent)]" />
            Who It's For
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-[var(--color-surface)] p-6 rounded-xl border border-[var(--color-border)]">
              <h3 className="text-lg font-semibold mb-4">Developers</h3>
              <ul className="space-y-2 text-sm text-[var(--color-text-muted)]">
                <li>• Peace-tech applications</li>
                <li>• Mediation & Legal-tech</li>
                <li>• HR-tech integrations</li>
              </ul>
            </div>
            <div className="bg-[var(--color-surface)] p-6 rounded-xl border border-[var(--color-border)]">
              <h3 className="text-lg font-semibold mb-4">Organizations</h3>
              <ul className="space-y-2 text-sm text-[var(--color-text-muted)]">
                <li>• HR & Employee Relations</li>
                <li>• Legal & Compliance</li>
                <li>• Diplomatic Analysis</li>
              </ul>
            </div>
            <div className="bg-[var(--color-surface)] p-6 rounded-xl border border-[var(--color-border)]">
              <h3 className="text-lg font-semibold mb-4">Individuals</h3>
              <ul className="space-y-2 text-sm text-[var(--color-text-muted)]">
                <li>• Personal dispute resolution</li>
                <li>• World-class conflict analysis</li>
                <li>• Actionable resolution pathways</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Disclaimers */}
        <section className="border-t border-[var(--color-border)] pt-12 pb-12 text-sm text-[var(--color-text-muted)] space-y-4">
          <p>
            <strong>Status:</strong> Experimental / Piloting phase. Developer
            access is currently in private beta.
          </p>
          <p>
            <strong>Disclaimer:</strong> This is experimental software. It does
            not constitute legal or professional advice. Human responsibility
            and oversight are required at all times. Please be mindful of data
            sensitivity when inputting conflict scenarios.
          </p>
        </section>
      </div>
    </motion.div>
  );
}
