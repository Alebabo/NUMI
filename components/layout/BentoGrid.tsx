import { ReactNode } from "react";

type BentoGridProps = {
  children: ReactNode;
  className?: string;
};

export function BentoGrid({ children, className = "" }: BentoGridProps) {
  return <div className={`grid grid-cols-12 gap-4 ${className}`}>{children}</div>;
}
