"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Calendar, MessageSquare, TrendingUp, FileText } from "lucide-react";
import { useAppStore } from "@/lib/store";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/plan", label: "My Plan", icon: FileText },
  { href: "/schedule", label: "Schedule", icon: Calendar },
  { href: "/coach", label: "Coach", icon: MessageSquare },
  { href: "/progress", label: "Progress", icon: TrendingUp },
];

export default function Navbar() {
  const pathname = usePathname();
  const { studentProfile, currentStreak } = useAppStore();

  return (
    <nav style={{ position: "sticky", top: 0, zIndex: 50, borderBottom: "1px solid #1a1a1a", background: "rgba(10,10,10,0.95)", backdropFilter: "blur(12px)" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: "60px" }}>

        {/* Logo */}
        <Link href="/dashboard" style={{ textDecoration: "none" }}>
          <span style={{ fontFamily: "Playfair Display, Georgia, serif", fontWeight: 700, fontSize: "20px", color: "#ffffff", letterSpacing: "-0.02em" }}>
            PeakMind
          </span>
        </Link>

        {/* Nav links */}
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link key={href} href={href} style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "7px 14px", borderRadius: "8px", fontSize: "13px", fontWeight: 500,
                textDecoration: "none", transition: "all 0.15s",
                background: isActive ? "rgba(124,58,237,0.15)" : "transparent",
                color: isActive ? "#a78bfa" : "#a0a0a0",
                border: isActive ? "1px solid rgba(124,58,237,0.25)" : "1px solid transparent",
              }}>
                <Icon size={15} />
                <span>{label}</span>
              </Link>
            );
          })}
        </div>

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {currentStreak > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 12px", borderRadius: "999px", background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)" }}>
              <span style={{ fontSize: "14px" }}>🔥</span>
              <span style={{ color: "#a78bfa", fontSize: "13px", fontWeight: 600 }}>{currentStreak}</span>
            </div>
          )}
          {studentProfile && (
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "linear-gradient(135deg, #7c3aed, #a78bfa)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", fontSize: "13px", fontWeight: 700 }}>
              {studentProfile.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

      </div>
    </nav>
  );
}