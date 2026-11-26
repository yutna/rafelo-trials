export type StatusBadgeTone = "neutral" | "success" | "warning";

export type StatusBadgeProps = {
  testId: string;
  tone?: StatusBadgeTone;
  children: string;
};
