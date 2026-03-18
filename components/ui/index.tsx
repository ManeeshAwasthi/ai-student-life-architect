import React from "react";

// ── Pill ────────────────────────────────────────────────────
export function Pill({
  children,
  color = "var(--brand-primary)",
}: {
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "3px 10px",
        borderRadius: "var(--radius-full)",
        background: `${color}18`,
        border: `1px solid ${color}30`,
        color,
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: "0.04em",
        fontFamily: "var(--font-body)",
      }}
    >
      {children}
    </span>
  );
}

// ── SectionHeader ────────────────────────────────────────────
export function SectionHeader({
  label,
  title,
  action,
  onAction,
}: {
  label?: string;
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        marginBottom: "var(--space-6)",
      }}
    >
      <div>
        {label && (
          <div
            className="text-label"
            style={{ color: "var(--text-tertiary)", marginBottom: 4 }}
          >
            {label}
          </div>
        )}
        <div className="text-h1" style={{ color: "var(--text-primary)" }}>
          {title}
        </div>
      </div>
      {action && (
        <button
          type="button"
          className="text-sm"
          onClick={onAction}
          style={{
            color: "var(--brand-primary)",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontFamily: "var(--font-body)",
          }}
        >
          {action}
        </button>
      )}
    </div>
  );
}

// ── ProgressBar ──────────────────────────────────────────────
export function ProgressBar({
  value,
  max,
  color = "var(--accent-habits)",
  height = 6,
}: {
  value: number;
  max: number;
  color?: string;
  height?: number;
}) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div
      style={{
        height,
        background: "var(--border-subtle)",
        borderRadius: "var(--radius-full)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${pct}%`,
          background: `linear-gradient(90deg, ${color}, var(--brand-primary))`,
          borderRadius: "inherit",
          transition: "width 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      />
    </div>
  );
}

// ── MetricCard ───────────────────────────────────────────────
export function MetricCard({
  icon: Icon,
  value,
  unit,
  label,
  color,
  progress = 0,
}: {
  icon: React.ElementType;
  value: React.ReactNode;
  unit: string;
  label: string;
  color: string;
  progress?: number;
}) {
  return (
    <div className="card-metric">
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "var(--radius-md)",
          background: `${color}18`,
          border: `1px solid ${color}30`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon size={18} color={color} />
      </div>
      <div>
        <div className="text-metric" style={{ color }}>
          {value}
        </div>
        <div
          className="text-label"
          style={{ color: "var(--text-tertiary)", marginTop: 4 }}
        >
          {unit} · {label}
        </div>
      </div>
      <div
        style={{
          height: 3,
          background: "var(--border-subtle)",
          borderRadius: "var(--radius-full)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progress}%`,
            background: color,
            borderRadius: "inherit",
            transition: "width 1s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        />
      </div>
    </div>
  );
}
