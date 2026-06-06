type ScoreBadgeProps = {
  score: number;
  size?: "sm" | "md" | "lg";
};

export function ScoreBadge({ score, size = "md" }: ScoreBadgeProps) {
  const color =
    score >= 7.5
      ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
      : score >= 5
        ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
        : "bg-red-50 text-red-700 ring-1 ring-red-200";

  const sizeClass =
    size === "lg"
      ? "rounded-xl px-4 py-2 text-3xl"
      : size === "sm"
        ? "rounded px-1.5 py-0.5 text-xs"
        : "rounded px-2 py-0.5 text-xs";

  return <span className={`inline-block font-mono font-semibold ${sizeClass} ${color}`}>{score}</span>;
}
