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

type StatusBadgeProps = {
  tone?: "neutral" | "success" | "warning";
  testId?: string;
  children: string;
};

export function StatusBadge({ tone, testId, children }: StatusBadgeProps) {
  return (
    <span role="status" aria-label={children} data-testid={testId} className={badge({ tone })}>
      {children}
    </span>
  );
}
