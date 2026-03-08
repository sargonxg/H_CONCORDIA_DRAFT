import { motion } from "motion/react";
import {
  Shield,
  Activity,
  Users,
  BookOpen,
  Brain,
  Target,
  Mic,
  TrendingUp,
  Heart,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Overview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-1 overflow-y-auto p-8 lg:p-12"
    >
      <div className="max-w-5xl mx-auto space-y-16">
        {/* Hero Section */}
        <section className="space-y-8">
          <div className="flex items-center gap-3 text-[var(--color-accent)]">
            <Shield className="w-5 h-5" />
            <span className="text-sm font-mono uppercase tracking-widest">
              TACITUS Institute
            </span>
          </div>
          <h1 className="text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
            AI-Powered
            <br />
            <span className="bg-gradient-to-r from-[var(--color-accent)] to-violet-500 bg-clip-text text-transparent">
              Live Mediation
            </span>
          </h1>
          <p className="text-xl text-[var(--color-text-muted)] max-w-2xl leading-relaxed">
            Two parties. One conversation. Concordia listens, structures the
            conflict in real time, tracks psychological indicators, identifies
            common ground, and guides both sides toward resolution.
          </p>
          <div className="flex gap-4 pt-4">
            <Link
              to="/workspace"
              className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-[var(--color-accent)]/25 hover:shadow-xl hover:shadow-[var(--color-accent)]/35 flex items-center gap-3"
            >
              <Mic className="w-6 h-6" />
              Start Mediation
            </Link>
            <Link
              to="/how-it-works"
              className="bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-white px-8 py-4 rounded-xl font-medium transition-colors flex items-center gap-3"
            >
              <BookOpen className="w-6 h-6" />
              How It Works
            </Link>
          </div>
        </section>

        {/* Live Session Visual */}
        <section className="relative">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 via-transparent to-violet-500/5" />
            <div className="relative grid grid-cols-3 gap-8 items-center">
              {/* Party A */}
              <div className="bg-[var(--color-bg)] border border-sky-500/30 rounded-xl p-6 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-sky-500/20 border border-sky-500/30 flex items-center justify-center mx-auto">
                  <span className="text-sky-400 font-bold text-lg">A</span>
                </div>
                <h3 className="text-sm font-semibold text-white">Party A</h3>
                <div className="space-y-1.5 text-[11px] text-[var(--color-text-muted)]">
                  <p>Emotional State</p>
                  <p>Communication Style</p>
                  <p>Key Needs & Risks</p>
                </div>
              </div>

              {/* Center: AI Mediator */}
              <div className="text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-[var(--color-accent)]/20 border-2 border-[var(--color-accent)]/40 flex items-center justify-center mx-auto shadow-lg shadow-[var(--color-accent)]/10">
                  <Brain className="w-10 h-10 text-[var(--color-accent)]" />
                </div>
                <h3 className="text-lg font-bold text-white">
                  CONCORDIA
                </h3>
                <p className="text-xs text-[var(--color-text-muted)]">
                  Guides conversation, tracks indicators, finds common ground
                </p>
                <div className="flex justify-center gap-2">
                  <span className="text-[9px] px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    Listening
                  </span>
                  <span className="text-[9px] px-2 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400">
                    Structuring
                  </span>
                  <span className="text-[9px] px-2 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400">
                    Resolving
                  </span>
                </div>
              </div>

              {/* Party B */}
              <div className="bg-[var(--color-bg)] border border-violet-500/30 rounded-xl p-6 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center mx-auto">
                  <span className="text-violet-400 font-bold text-lg">B</span>
                </div>
                <h3 className="text-sm font-semibold text-white">Party B</h3>
                <div className="space-y-1.5 text-[11px] text-[var(--color-text-muted)]">
                  <p>Emotional State</p>
                  <p>Communication Style</p>
                  <p>Key Needs & Risks</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Summary */}
        <section className="space-y-8 border-t border-[var(--color-border)] pt-12">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="w-6 h-6 text-[var(--color-accent)]" />
            What Happens in a Session
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Mic,
                title: "Live Audio",
                desc: "Both parties speak naturally. The AI mediator guides the conversation turn by turn, addressing each party individually.",
                color: "text-sky-400",
              },
              {
                icon: Brain,
                title: "Psychological Profiling",
                desc: "Real-time tracking of emotional states, defensiveness, cooperativeness, communication style, and underlying needs.",
                color: "text-violet-400",
              },
              {
                icon: Target,
                title: "Case Structuring",
                desc: "Claims, interests, constraints, and leverage are extracted and mapped to each party as they speak.",
                color: "text-amber-400",
              },
              {
                icon: TrendingUp,
                title: "Resolution Pathways",
                desc: "Common ground is identified, critical questions generated, and concrete resolution pathways proposed.",
                color: "text-emerald-400",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 space-y-3 hover:border-[var(--color-accent)]/30 transition-colors"
                >
                  <Icon className={`w-6 h-6 ${item.color}`} />
                  <h3 className="text-base font-semibold text-white">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                    {item.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Who It's For */}
        <section className="space-y-8 border-t border-[var(--color-border)] pt-12">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-[var(--color-accent)]" />
            Who Uses Concordia
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-[var(--color-surface)] p-6 rounded-xl border border-[var(--color-border)]">
              <h3 className="text-lg font-semibold mb-4">
                Professional Mediators
              </h3>
              <ul className="space-y-2 text-sm text-[var(--color-text-muted)]">
                <li className="flex items-start gap-2">
                  <Zap className="w-3.5 h-3.5 mt-0.5 text-[var(--color-accent)]" />
                  Real-time case structuring
                </li>
                <li className="flex items-start gap-2">
                  <Zap className="w-3.5 h-3.5 mt-0.5 text-[var(--color-accent)]" />
                  Psychological indicator tracking
                </li>
                <li className="flex items-start gap-2">
                  <Zap className="w-3.5 h-3.5 mt-0.5 text-[var(--color-accent)]" />
                  Automated resolution drafting
                </li>
              </ul>
            </div>
            <div className="bg-[var(--color-surface)] p-6 rounded-xl border border-[var(--color-border)]">
              <h3 className="text-lg font-semibold mb-4">
                HR & Employee Relations
              </h3>
              <ul className="space-y-2 text-sm text-[var(--color-text-muted)]">
                <li className="flex items-start gap-2">
                  <Zap className="w-3.5 h-3.5 mt-0.5 text-[var(--color-accent)]" />
                  Workplace dispute resolution
                </li>
                <li className="flex items-start gap-2">
                  <Zap className="w-3.5 h-3.5 mt-0.5 text-[var(--color-accent)]" />
                  Neutral, objective facilitation
                </li>
                <li className="flex items-start gap-2">
                  <Zap className="w-3.5 h-3.5 mt-0.5 text-[var(--color-accent)]" />
                  Structured outcome pathways
                </li>
              </ul>
            </div>
            <div className="bg-[var(--color-surface)] p-6 rounded-xl border border-[var(--color-border)]">
              <h3 className="text-lg font-semibold mb-4">
                Individuals & Couples
              </h3>
              <ul className="space-y-2 text-sm text-[var(--color-text-muted)]">
                <li className="flex items-start gap-2">
                  <Zap className="w-3.5 h-3.5 mt-0.5 text-[var(--color-accent)]" />
                  Guided self-mediation
                </li>
                <li className="flex items-start gap-2">
                  <Zap className="w-3.5 h-3.5 mt-0.5 text-[var(--color-accent)]" />
                  De-escalation assistance
                </li>
                <li className="flex items-start gap-2">
                  <Zap className="w-3.5 h-3.5 mt-0.5 text-[var(--color-accent)]" />
                  Finding common ground
                </li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </motion.div>
  );
}
