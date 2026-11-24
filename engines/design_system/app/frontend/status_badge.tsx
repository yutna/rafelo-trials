import type { ReactNode } from "react";

import { tv } from "./internal/tailwind";

const statusBadge = tv({
  base: "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
  variants: {
    tone: {
      neutral: "bg-muted text-slate-700",
      success: "bg-emerald-100 text-emerald-900",
      warning: "bg-amber-100 text-amber-900",
    },
  },
  defaultVariants: { tone: "neutral" },
});

type StatusBadgeProps = {
  testId: string;
  tone?: "neutral" | "success" | "warning";
  children: ReactNode;
};

// The badge's text carries the meaning; the tone only repeats it visually.
export function StatusBadge({ testId, tone, children }: StatusBadgeProps) {
  return (
    <span data-testid={testId} className={statusBadge({ tone })}>
      {children}
    </span>
  );
}
