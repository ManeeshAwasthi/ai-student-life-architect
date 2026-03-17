"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Calendar, MessageSquare, TrendingUp, FileText } from "lucide-react";
import { useAppStore } from "@/lib/store";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Today",    icon: LayoutDashboard },
  { href: "/plan",      label: "Plan",     icon: FileText },
  { href: "/schedule",  label: "Schedule", icon: Calendar },
  { href: "/coach",     label: "Coach",    icon: MessageSquare },
  { href: "/progress",  label: "Progress", icon: TrendingUp },
];

export default function Navbar() {
  const pathname = usePathname();
  const { studentProfile, currentStreak } = useAppStore();

  return (
    <>
      <style>{`
        .pm-nav-link {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 13px;
          border-radius: 9px;
          font-size: 13px;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.18s ease;
          border: 1px solid transparent;
          color: #6666888;
          font-family: 'DM Sans', sans-serif;
        }
        .pm-nav-link:hover {
          color: #a594ff;
          background: rgba(108,99,255,0.08);
          border-color: rgba(108,99,255,0.18);
        }
        .pm-nav-link.active {
          color: #a594ff;
          background: rgba(108,99,255,0.12);
          border-color: rgba(108,99,255,0.25);
        }
        .streak-badge {
          animation: streak-glow 2.5s ease-in-out infinite;
        }
      `}</style>

      <nav className="nav-slide" style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        height: "58px",
        background: "rgba(8,8,16,0.85)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderBottom: "1px solid rgba(30,30,53,0.8)",
      }}>
        <div style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0 28px",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>

          {/* Logo */}
          <Link href="/dashboard" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "9px" }}>
            <div style={{
              width: "28px", height: "28px", borderRadius: "8px",
              background: "linear-gradient(135deg, #6c63ff, #ff6b9d)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "14px", flexShrink: 0,
            }}>⚡</div>
            <span style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              fontSize: "17px",
              color: "#f0f0ff",
              letterSpacing: "-0.03em",
            }}>PeakMind</span>
          </Link>

          {/* Nav links */}
          <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className={`pm-nav-link${isActive ? " active" : ""}`}
                >
                  <Icon size={14} strokeWidth={isActive ? 2.5 : 2} />
                  <span>{label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {currentStreak > 0 && (
              <div className="streak-badge" style={{
                display: "flex", alignItems: "center", gap: "5px",
                padding: "5px 11px", borderRadius: "999px",
                background: "rgba(255,179,71,0.1)",
                border: "1px solid rgba(255,179,71,0.25)",
              }}>
                <span style={{ fontSize: "13px" }}>🔥</span>
                <span style={{
                  color: "#ffb347",
                  fontSize: "12px",
                  fontWeight: 700,
                  fontFamily: "'DM Mono', monospace",
                }}>{currentStreak}</span>
              </div>
            )}
            {studentProfile && (
              <div style={{
                width: "30px", height: "30px", borderRadius: "50%",
                background: "linear-gradient(135deg, #6c63ff, #a594ff)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontSize: "12px", fontWeight: 700,
                flexShrink: 0, cursor: "default",
                fontFamily: "'Syne', sans-serif",
              }}>
                {studentProfile.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

        </div>
      </nav>
    </>
  );
}
