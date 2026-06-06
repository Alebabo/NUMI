import Link from "next/link";

type Size = "sm" | "md";
type Variant = "dark" | "light";

const sizes: Record<Size, { logo: number; wordmark: string }> = {
  sm: { logo: 22, wordmark: "text-[13px]" },
  md: { logo: 30, wordmark: "text-base" },
};

type NumiWordmarkProps = {
  size?: Size;
  href?: string;
  className?: string;
  variant?: Variant;
};

export default function NumiWordmark({ size = "sm", href, className = "", variant = "dark" }: NumiWordmarkProps) {
  const s = sizes[size];
  const wordmarkColor = variant === "light" ? "text-white" : "text-gray-900";
  const bgFill = variant === "light" ? "#ffffff" : "#09090b";
  const textFill = variant === "light" ? "#09090b" : "#ffffff";
  const fontSize = Math.round(s.logo * 0.65);

  const inner = (
    <span className={`inline-flex items-center gap-2 ${className}`} aria-label="Numi">
      <svg
        width={s.logo}
        height={s.logo}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        style={{ flexShrink: 0 }}
      >
        <rect width="32" height="32" rx="8" fill={bgFill} />
        <text
          x="16"
          y="23"
          fontFamily="Arial, Helvetica, sans-serif"
          fontSize={fontSize}
          fontWeight="700"
          fill={textFill}
          textAnchor="middle"
          letterSpacing="-0.5"
        >
          N
        </text>
      </svg>
      <span className={`${s.wordmark} font-semibold tracking-tight ${wordmarkColor}`}>Numi</span>
    </span>
  );

  if (!href) return inner;

  return (
    <Link href={href} className="inline-flex items-center">
      {inner}
    </Link>
  );
}
