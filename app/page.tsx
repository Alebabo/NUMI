import Link from "next/link";
import Image from "next/image";
import NumiWordmark from "../components/NumiWordmark";
import SalesRecapShareAsset from "../components/SalesRecapShareAsset";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#fafafa] text-gray-950">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-[#fafafa]/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-5 sm:px-8">
          <NumiWordmark size="md" href="/" />
          <nav className="flex items-center gap-2">
            <Link
              href="/try"
              className="inline-flex h-8 items-center justify-center rounded-md px-3 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-950"
            >
              Try it Yourself
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex h-8 items-center justify-center rounded-md bg-gray-950 px-3 text-sm font-medium text-white transition-colors hover:bg-gray-800"
            >
              Go to Platform
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative mx-auto flex min-h-[calc(100vh-3.5rem)] w-full max-w-6xl flex-col justify-center overflow-hidden px-5 pb-20 pt-12 sm:px-8">
        {/* Figure — desktop only */}
        <div className="pointer-events-none absolute bottom-0 right-[-80px] hidden select-none lg:block">
          <Image
            src="/assets/firefly-1.png"
            alt=""
            height={900}
            width={780}
            className="h-[55vh] w-auto object-contain object-bottom"
            priority
          />
        </div>

        {/* Text — left side */}
        <div className="relative z-10 max-w-[52%] lg:max-w-[48%]">
          <h1 className="text-5xl font-black leading-[0.95] tracking-tight text-gray-950 sm:text-6xl lg:text-[76px]">
            The No.1 Sales Coach<br /> that doesn&apos;t lie.
          </h1>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/dashboard"
              className="inline-flex h-11 items-center justify-center rounded-md bg-gray-950 px-5 text-sm font-medium text-white transition-colors hover:bg-gray-800"
            >
              Go to Platform
            </Link>
            <Link
              href="/try"
              className="inline-flex h-11 items-center justify-center rounded-md border border-gray-200 bg-white px-5 text-sm font-medium text-gray-700 transition-colors hover:border-gray-300 hover:text-gray-950"
            >
              Try it Yourself
            </Link>
          </div>

          {/* Trusted by — inline in hero */}
          <div className="mt-12 flex flex-col gap-4">
            <p className="text-[11px] font-medium uppercase tracking-widest text-gray-400">Trusted by</p>
            <div className="flex items-center gap-8">
              <Image
                src="/assets/logo-aybee.svg"
                alt="aybee"
                width={80}
                height={28}
                className="h-6 w-auto object-contain opacity-50 grayscale"
              />
              <span className="h-3 w-px bg-gray-300" />
              <Image
                src="/assets/logo-refinq.avif"
                alt="refinq"
                width={80}
                height={28}
                className="h-6 w-auto object-contain opacity-50 grayscale"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Why Numi — ehemaliger Subtitle-Text als eigener Abschnitt */}
      <section className="bg-[#fafafa]">
        <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 lg:py-24">
          <p className="text-xs font-medium uppercase tracking-widest text-gray-400">Why Numi</p>
          <p className="mt-6 max-w-3xl text-2xl font-semibold leading-snug tracking-tight text-gray-950 sm:text-3xl">
            Standard models praise weak calls because the transcript sounds friendly. Numi scores what actually
            moved the deal: objection handling, pricing discipline, buying signals, and next-step quality.
          </p>
          <div className="mt-14 grid grid-cols-1 border-t border-gray-200 text-sm md:grid-cols-3">
            <div className="border-b border-gray-200 py-6 md:border-b-0 md:border-r md:pr-8">
              <p className="font-semibold text-gray-950">No praise layer</p>
              <p className="mt-2 leading-6 text-gray-500">Weak calls are not reframed as promising conversations.</p>
            </div>
            <div className="border-b border-gray-200 py-6 md:border-b-0 md:border-r md:px-8">
              <p className="font-semibold text-gray-950">Evidence first</p>
              <p className="mt-2 leading-6 text-gray-500">Findings are anchored to cited moments, not general sentiment.</p>
            </div>
            <div className="py-6 md:pl-8">
              <p className="font-semibold text-gray-950">German market fit</p>
              <p className="mt-2 leading-6 text-gray-500">Built for direct, uncomfortable sales reality in DACH teams.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Sales Recap */}
      <section className="border-t border-gray-100 bg-white">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:py-28">
          <div className="max-w-md">
            <p className="text-xs font-medium uppercase tracking-widest text-gray-400">The Sales Recap</p>
            <h2 className="mt-5 text-4xl font-black leading-tight tracking-tight text-gray-950 sm:text-5xl">
              Spotify Wrapped for sales reps. Built to be shared.
            </h2>
            <p className="mt-6 text-base leading-8 text-gray-500">
              Five slides. One honest month. Rankings, objection control, pricing discipline — packaged for LinkedIn in one click.
            </p>
            <p className="mt-4 text-base leading-8 text-gray-500">
              The hook is status with receipts: no motivational poster, just the moments where the rep actually moved the deal.
            </p>
            <div className="mt-8">
              <Link
                href="/dashboard"
                className="inline-flex h-10 items-center justify-center rounded-md bg-gray-950 px-5 text-sm font-medium text-white transition-colors hover:bg-gray-800"
              >
                Go to Platform
              </Link>
            </div>
          </div>
          <div className="flex justify-center lg:justify-end">
            <SalesRecapShareAsset />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-gray-100 bg-[#fafafa]">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-6 px-5 py-16 sm:px-8 md:flex-row md:items-center">
          <p className="max-w-xl text-2xl font-bold leading-tight tracking-tight text-gray-950">
            Your calls do not need a nicer summary. They need a more honest analysis.
          </p>
          <div className="flex shrink-0 gap-3">
            <Link
              href="/try"
              className="inline-flex h-10 items-center justify-center rounded-md border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 transition-colors hover:border-gray-300"
            >
              Try it Yourself
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex h-10 items-center justify-center rounded-md bg-gray-950 px-4 text-sm font-medium text-white transition-colors hover:bg-gray-800"
            >
              Go to Platform
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
