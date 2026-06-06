import Link from "next/link";
import NumiWordmark from "../components/NumiWordmark";
import SalesRecapShareAsset from "../components/SalesRecapShareAsset";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#fafafa] text-gray-950">
      <header className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-8">
        <NumiWordmark size="md" href="/" />
        <nav className="flex items-center gap-2">
          <Link
            href="/try"
            className="inline-flex h-9 items-center justify-center rounded-md px-3 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-950"
          >
            Try it Yourself
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex h-9 items-center justify-center rounded-md bg-gray-950 px-3 text-sm font-medium text-white transition-colors hover:bg-gray-800"
          >
            Go to Platform
          </Link>
        </nav>
      </header>

      <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl flex-col justify-center px-5 pb-20 pt-12 sm:px-8">
        <div className="max-w-4xl">
          <p className="text-xs font-medium uppercase tracking-widest text-gray-500">Anti-sycophant analysis for sales calls</p>
          <h1 className="mt-7 max-w-4xl text-5xl font-semibold leading-[0.98] tracking-tight text-gray-950 sm:text-6xl lg:text-[84px]">
            Most AI call reviews are too polite to be useful.
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-8 text-gray-600">
            Standard models praise weak German sales calls because the transcript sounds friendly. Numi scores what actually
            moved the deal: objection handling, pricing discipline, buying signals, and next-step quality.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/dashboard"
              className="inline-flex h-10 items-center justify-center rounded-md bg-gray-950 px-4 text-sm font-medium text-white transition-colors hover:bg-gray-800"
            >
              Go to Platform
            </Link>
            <Link
              href="/try"
              className="inline-flex h-10 items-center justify-center rounded-md border border-gray-300 bg-white px-4 text-sm font-medium text-gray-800 transition-colors hover:border-gray-400 hover:text-gray-950"
            >
              Try it Yourself
            </Link>
          </div>
        </div>

        <div className="mt-20 grid max-w-4xl grid-cols-1 border-y border-gray-200 text-sm md:grid-cols-3">
          <div className="border-b border-gray-200 py-5 md:border-b-0 md:border-r md:pr-6">
            <p className="font-medium text-gray-950">No praise layer</p>
            <p className="mt-2 leading-6 text-gray-500">Weak calls are not reframed as promising conversations.</p>
          </div>
          <div className="border-b border-gray-200 py-5 md:border-b-0 md:border-r md:px-6">
            <p className="font-medium text-gray-950">Evidence first</p>
            <p className="mt-2 leading-6 text-gray-500">Findings are anchored to cited moments, not general sentiment.</p>
          </div>
          <div className="py-5 md:pl-6">
            <p className="font-medium text-gray-950">German market fit</p>
            <p className="mt-2 leading-6 text-gray-500">Built for direct, uncomfortable sales reality in DACH teams.</p>
          </div>
        </div>
      </section>

      <section className="border-t border-gray-200 bg-white">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-14 px-5 py-20 sm:px-8 lg:grid-cols-[0.88fr_1.12fr] lg:py-24">
          <div className="max-w-lg">
            <p className="text-xs font-medium uppercase tracking-widest text-gray-400">The Sales Recap</p>
            <h2 className="mt-5 text-4xl font-semibold leading-tight tracking-tight text-gray-950 sm:text-5xl">
              Spotify Wrapped for sales reps. Built to be shared.
            </h2>
            <p className="mt-6 text-base leading-8 text-gray-600">
              A monthly share card that lets strong reps show their craft without turning it into a motivational poster. It
              turns call behavior into a clean public proof point.
            </p>
            <p className="mt-5 text-base leading-8 text-gray-600">
              The hook is status with receipts: rankings, objection control, pricing discipline, and the moments where the rep
              actually moved the deal forward.
            </p>
          </div>

          <div className="lg:justify-self-end">
            <SalesRecapShareAsset />
          </div>
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-6 px-5 py-16 sm:px-8 md:flex-row md:items-center">
        <p className="max-w-2xl text-2xl font-semibold leading-tight tracking-tight text-gray-950">
          Your calls do not need a nicer summary. They need a more honest analysis.
        </p>
        <div className="flex gap-3">
          <Link
            href="/try"
            className="inline-flex h-10 items-center justify-center rounded-md border border-gray-300 bg-white px-4 text-sm font-medium text-gray-800"
          >
            Try it Yourself
          </Link>
          <Link href="/dashboard" className="inline-flex h-10 items-center justify-center rounded-md bg-gray-950 px-4 text-sm font-medium text-white">
            Go to Platform
          </Link>
        </div>
      </section>
    </main>
  );
}
