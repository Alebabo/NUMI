import Link from "next/link";
import Image from "next/image";

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
  const logoFilter = variant === "light" ? "brightness-0 invert" : "brightness-0";

  const inner = (
    <span className={`inline-flex items-center gap-2 ${className}`} aria-label="Numi">
      <Image
        src="/assets/logo-numi.png"
        alt="Numi"
        width={s.logo}
        height={s.logo}
        className={`w-auto object-contain ${logoFilter}`}
        style={{ height: s.logo }}
        aria-hidden="true"
      />
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
