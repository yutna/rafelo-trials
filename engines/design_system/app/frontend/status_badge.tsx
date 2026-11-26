import type { StatusBadgeProps } from "./status_badge.types";

import { tv } from "./internal/tailwind";

const badge = tv({
  base: "inline-flex items-center rounded-card px-2 py-1 text-sm font-medium",
  variants: {
    tone: {
      neutral: "bg-muted text-slate-900",
      success: "bg-emerald-100 text-emerald-800",
      warning: "bg-amber-100 text-amber-800",
    },
  },
  defaultVariants: { tone: "neutral" },
});

// The text is the label: the accessible name repeats the same string, and the
// tone only repeats the meaning visually.
export function StatusBadge({ testId, tone, children }: StatusBadgeProps) {
  return (
    <span role="status" aria-label={children} data-testid={testId} className={badge({ tone })}>
      {children}
    </span>
  );
}
