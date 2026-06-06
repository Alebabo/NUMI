import { BentoCard } from "../layout/BentoCard";

type KpiCardProps = {
  title: string;
  value: string | number;
  subtitle?: string;
  colSpan?: 3 | 4 | 6 | 8 | 12;
};

export function KpiCard({ title, value, subtitle, colSpan = 4 }: KpiCardProps) {
  return (
    <BentoCard colSpan={colSpan}>
      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500">{title}</p>
      <p className="font-mono text-3xl font-semibold leading-none text-gray-900">{value}</p>
      {subtitle ? <p className="mt-1 text-xs text-gray-500">{subtitle}</p> : null}
    </BentoCard>
  );
}
