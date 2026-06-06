import { ReactNode } from "react";

type Span = 3 | 4 | 6 | 8 | 12;

const spanClasses: Record<Span, string> = {
  3: "col-span-12 md:col-span-3",
  4: "col-span-12 md:col-span-4",
  6: "col-span-12 md:col-span-6",
  8: "col-span-12 md:col-span-8",
  12: "col-span-12"
};

type BentoCardProps = {
  children: ReactNode;
  colSpan?: Span;
  className?: string;
};

export function BentoCard({ children, colSpan = 4, className = "" }: BentoCardProps) {
  return (
    <div className={`${spanClasses[colSpan]} rounded-xl border border-gray-200 bg-white p-5 ${className}`}>
      {children}
    </div>
  );
}
