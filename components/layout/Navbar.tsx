"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Calendar, MessageSquare, TrendingUp,
  FileText, Settings, Flame,
} from "lucide-react";
import { useAppStore } from "@/lib/store";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Today",    icon: LayoutDashboard },
  { href: "/plan",      label: "Plan",     icon: FileText },
  { href: "/schedule",  label: "Schedule", icon: Calendar },
  { href: "/coach",     label: "Coach",    icon: MessageSquare },
  { href: "/progress",  label: "Progress", icon: TrendingUp },
];

export default function Navbar() {
  const pathname     = usePathname();
  const { studentProfile, currentStreak } = useAppStore();

  return (
    <>
      <style>{`
        .pm-sidebar {
          position: fixed;
          top: 0; left: 0; bottom: 0;
          width: 240px;
          background: var(--bg-surface);
          border-right: 1px solid var(--border-subtle);
          display: flex;
          flex-direction: column;
          z-index: 40;
          overflow: hidden;
        }
        .pm-nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          height: 44px;
          padding: 0 var(--space-4);
          border-radius: var(--radius-md);
          font-family: var(--font-body);
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-secondary);
          text-decoration: none;
          transition: background 0.15s ease, color 0.15s ease;
          border: 1px solid transparent;
        }
        .pm-nav-item:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
        }
        .pm-nav-item.active {
          background: var(--brand-glow);
          color: var(--brand-primary);
          border-color: rgba(124,92,252,0.15);
        }
        .pm-nav-item.active svg {
          color: var(--brand-primary);
        }
        .pm-streak {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: 5px 10px;
          border-radius: var(--radius-full);
          background: rgba(255,107,53,0.1);
          border: 1px solid rgba(255,107,53,0.25);
          animation: streak-glow 2.5s ease-in-out infinite;
        }
      `}</style>

      <aside className="pm-sidebar">
        {/* Logo */}
        <div style={{ padding: "var(--space-6) var(--space-6) var(--space-4)" }}>
          <Link href="/dashboard" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
            <div style={{
              width: 32, height: 32,
              borderRadius: "var(--radius-md)",
              background: "linear-gradient(135deg, var(--brand-primary), var(--accent-focus))",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 1L10.5 6H15L11 9.5L12.5 15L8 12L3.5 15L5 9.5L1 6H5.5L8 1Z" fill="white" />
              </svg>
            </div>
            <span style={{
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              fontSize: "1.0625rem",
              color: "var(--text-primary)",
              letterSpacing: "-0.02em",
            }}>PeakMind</span>
          </Link>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "var(--border-subtle)", margin: "0 var(--space-4)" }} />

        {/* Nav items */}
        <nav style={{ flex: 1, padding: "var(--space-4)", display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
          <div className="text-label" style={{ color: "var(--text-tertiary)", padding: "var(--space-2) var(--space-4)", marginBottom: "var(--space-1)" }}>
            Navigation
          </div>
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`pm-nav-item${isActive ? " active" : ""}`}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 1.75} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Divider */}
        <div style={{ height: 1, background: "var(--border-subtle)", margin: "0 var(--space-4)" }} />

        {/* Bottom section */}
        <div style={{ padding: "var(--space-4)" }}>
          {/* Streak badge */}
          {currentStreak > 0 && (
            <div className="pm-streak" style={{ marginBottom: "var(--space-3)" }}>
              <Flame size={14} color="var(--accent-streak)" />
              <span style={{
                color: "var(--accent-streak)",
                fontFamily: "var(--font-body)",
                fontSize: "0.75rem",
                fontWeight: 700,
              }}>{currentStreak} day streak</span>
            </div>
          )}

          {/* User row */}
          {studentProfile && (
            <div style={{
              display: "flex", alignItems: "center", gap: "var(--space-3)",
              padding: "var(--space-3) var(--space-3)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-subtle)",
              background: "var(--bg-elevated)",
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                background: "linear-gradient(135deg, var(--brand-primary), var(--accent-focus))",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff",
                fontFamily: "var(--font-display)",
                fontSize: "0.8125rem",
                fontWeight: 600,
                flexShrink: 0,
              }}>
                {studentProfile.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.8125rem",
                  fontWeight: 500,
                  color: "var(--text-primary)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}>
                  {studentProfile.name.split(" ")[0]}
                </div>
                <div style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.6875rem",
                  color: "var(--text-tertiary)",
                }}>Student</div>
              </div>
              <Settings size={14} color="var(--text-tertiary)" style={{ flexShrink: 0, cursor: "pointer" }} />
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
