import { motion } from "motion/react";
import { ShieldAlert, Activity, Users, BookOpen } from "lucide-react";
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
            Concordia: Your Live Mediation Assistant
          </h1>
          <p className="text-xl text-[var(--color-text-muted)] max-w-2xl leading-relaxed">
            Concordia by TACITUS is a live conversational app that gets parties together. It structures cases in real-time, builds common ground, and guides parties to generate actionable resolution pathways.
          </p>
          <div className="flex gap-4 pt-8">
            <Link to="/workspace" className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-[0_0_20px_rgba(242,125,38,0.4)] hover:shadow-[0_0_30px_rgba(242,125,38,0.6)] flex items-center gap-3">
              <Activity className="w-6 h-6" />
              Enter Live Mediation Workspace
            </Link>
            <Link to="/library" className="bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-white px-8 py-4 rounded-xl font-medium transition-colors flex items-center gap-3">
              <BookOpen className="w-6 h-6" />
              Resolution Library
            </Link>
          </div>
        </section>

        {/* How It Helps */}
        <section className="space-y-6 border-t border-[var(--color-border)] pt-12">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-[var(--color-accent)]" />
            Why Concordia?
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-white">Structured Understanding</h3>
              <p className="text-[var(--color-text-muted)] leading-relaxed">
                As parties speak, Concordia listens and structures the conflict into clear primitives (Claims, Interests, Constraints), ensuring nothing is lost in the heat of the moment.
              </p>
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-white">Actionable Pathways</h3>
              <p className="text-[var(--color-text-muted)] leading-relaxed">
                It doesn't just listen; it identifies critical questions, highlights discrepancies, and suggests common ground to help parties move forward.
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
              <h3 className="text-lg font-semibold mb-4">Mediators</h3>
              <ul className="space-y-2 text-sm text-[var(--color-text-muted)]">
                <li>• Real-time case structuring</li>
                <li>• Suggested critical questions</li>
                <li>• Automated drafting</li>
              </ul>
            </div>
            <div className="bg-[var(--color-surface)] p-6 rounded-xl border border-[var(--color-border)]">
              <h3 className="text-lg font-semibold mb-4">HR & Employee Relations</h3>
              <ul className="space-y-2 text-sm text-[var(--color-text-muted)]">
                <li>• Workplace dispute resolution</li>
                <li>• Neutral, objective facilitation</li>
                <li>• Clear resolution pathways</li>
              </ul>
            </div>
            <div className="bg-[var(--color-surface)] p-6 rounded-xl border border-[var(--color-border)]">
              <h3 className="text-lg font-semibold mb-4">Individuals</h3>
              <ul className="space-y-2 text-sm text-[var(--color-text-muted)]">
                <li>• Guided self-mediation</li>
                <li>• De-escalation assistance</li>
                <li>• Finding common ground</li>
              </ul>
            </div>
          </div>
        </section>

      </div>
    </motion.div>
  );
}
