import Link from "next/link";

type Size = "sm" | "md";
type Variant = "dark" | "light";

const sizes: Record<Size, { mark: string; markText: string; wordmark: string }> = {
  sm: {
    mark: "h-5 w-5",
    markText: "text-[9px]",
    wordmark: "text-[13px]"
  },
  md: {
    mark: "h-7 w-7 rounded-md",
    markText: "text-[13px]",
    wordmark: "text-base"
  }
};

type NumiWordmarkProps = {
  size?: Size;
  href?: string;
  className?: string;
  variant?: Variant;
};

export default function NumiWordmark({ size = "sm", href, className = "", variant = "dark" }: NumiWordmarkProps) {
  const s = sizes[size];
  const wordmarkColor = variant === "light" ? "text-white" : "text-gray-800";
  const inner = (
    <span className={`inline-flex items-center gap-2 ${className}`} aria-label="Numi">
      <span
        className={`${s.mark} flex shrink-0 items-center justify-center rounded bg-gray-900`}
        aria-hidden="true"
      >
        <span className={`${s.markText} font-bold leading-none text-white`}>N</span>
      </span>
      <span className={`${s.wordmark} font-medium tracking-tight ${wordmarkColor}`}>Numi</span>
    </span>
  );

  if (!href) return inner;

  return (
    <Link href={href} className="inline-flex items-center">
      {inner}
    </Link>
  );
}
