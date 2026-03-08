import { Link, Outlet, useLocation } from "react-router-dom";
import {
  Activity,
  MessageSquare,
  Mic,
  Volume2,
  BookOpen,
  ShieldAlert,
  Info,
} from "lucide-react";

export default function Layout() {
  const location = useLocation();

  const navItems = [
    { path: "/", icon: ShieldAlert, label: "Overview" },
    { path: "/workspace", icon: Activity, label: "Mediation Workspace" },
    { path: "/library", icon: BookOpen, label: "Resolution Library" },
    { path: "/how-it-works", icon: Info, label: "How It Works" },
    { path: "/chat", icon: MessageSquare, label: "Advisor Chat" },
    { path: "/transcribe", icon: Mic, label: "Transcription" },
    { path: "/tts", icon: Volume2, label: "Speech Engine" },
  ];

  return (
    <div className="flex h-screen bg-[var(--color-bg)] text-[var(--color-text)] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-[var(--color-border)] bg-[var(--color-surface)] flex flex-col">
        <div className="p-6 border-b border-[var(--color-border)]">
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-[var(--color-accent)]" />
            CONCORDIA
          </h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-1 font-mono uppercase tracking-wider">
            by TACITUS
          </p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                  isActive
                    ? "bg-[var(--color-surface-hover)] text-white font-medium"
                    : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] hover:text-white"
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${isActive ? "text-[var(--color-accent)]" : ""}`}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[var(--color-border)] text-xs text-[var(--color-text-muted)] font-mono">
          <div className="flex justify-between items-center mb-2">
            <span>SYSTEM STATUS</span>
            <span className="flex items-center gap-1 text-emerald-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              ONLINE
            </span>
          </div>
          <div>TACITUS Mediation Engine v2.0</div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}
