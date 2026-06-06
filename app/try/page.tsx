"use client";

import Script from "next/script";
import Link from "next/link";
import { useState } from "react";
import { AlertCircle, ArrowLeft, ClipboardList, RefreshCcw, Sparkles } from "lucide-react";
import NumiWordmark from "../../components/NumiWordmark";

type Finding = {
  title: string;
  quote: string;
  timestamp: string;
  duration: string;
  severity: "weak" | "moderate";
};

type TryAnalysis = {
  numiScore: number;
  verdictLabel: string;
  rationale: string;
  findings: Finding[];
};

export default function TryPage() {
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analysis, setAnalysis] = useState<TryAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function analyzeTranscript() {
    const cleanTranscript = transcript.trim();
    if (!cleanTranscript || loading) return;

    setLoading(true);
    setProgress(10);
    setError(null);
    setAnalysis(null);

    const progressTimer = window.setInterval(() => {
      setProgress((current) => Math.min(90, current + (current < 55 ? 10 : 5)));
    }, 450);

    const form = new FormData();
    const file = new Blob([cleanTranscript], { type: "text/plain" });
    form.append("file", file, "try-call-transcript.txt");
    form.append("projectName", "Numi Sales Recap");
    form.append("subjectName", "Live Demo Rep");

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: form
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Analysis failed.");
      }

      setProgress(100);
      setAnalysis(payload as TryAnalysis);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Analysis failed.");
    } finally {
      window.clearInterval(progressTimer);
      window.setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 350);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f7f5] text-gray-950">
      <Script src="https://unpkg.com/@elevenlabs/convai-widget-embed" strategy="afterInteractive" />
      <header className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-5 sm:px-8">
        <NumiWordmark size="md" href="/" />
        <Link
          href="/"
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 transition-colors hover:border-gray-400 hover:text-gray-950"
        >
          <ArrowLeft size={14} strokeWidth={1.8} />
          Back
        </Link>
      </header>

      <section className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[0.86fr_1.14fr] lg:py-16">
        <div className="max-w-xl">
          <p className="text-xs font-medium uppercase tracking-widest text-gray-500">Live Demo</p>
          <h1 className="mt-5 text-5xl font-semibold leading-none tracking-tight text-gray-950 sm:text-6xl">
            Talk to the sales-call demo.
          </h1>
          <p className="mt-6 text-base leading-8 text-gray-600">
            Run a short test call through the ElevenLabs agent. Your job is to sell Numi to a skeptical sales leader and
            create a transcript Numi can score without the usual politeness layer.
          </p>
          <div className="mt-7 border-l border-gray-300 pl-4 text-sm leading-7 text-gray-700">
            Product to sell: <span className="font-semibold text-gray-950">Numi</span>. Keep it under one minute, handle price
            pressure, and ask for a concrete follow-up.
          </div>

          {/* Widget hint */}
          <div className="mt-8 flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3.5 shadow-sm">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4"><path d="M7 4a3 3 0 016 0v6a3 3 0 11-6 0V4zm-2 6a2 2 0 104 0V4a1 1 0 10-2 0v6zm9 0a5 5 0 01-10 0H3a7 7 0 0014 0h-3z"/></svg>
            </span>
            <div className="min-w-0 flex-1 text-sm">
              <p className="font-medium text-gray-900">Voice agent is live</p>
              <p className="text-gray-500">Open the chat widget in the <span className="font-medium text-gray-700">bottom-right corner</span> to start your call.</p>
            </div>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 shrink-0 translate-y-1 text-gray-300">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        <div className="grid gap-5">
          <section className="border border-gray-200 bg-white p-5">
            <div className="mb-4 flex items-center gap-2">
              <ClipboardList size={16} strokeWidth={1.8} className="text-gray-500" />
              <h2 className="text-sm font-semibold tracking-tight text-gray-950">Analyze this call</h2>
            </div>
            <p className="text-sm leading-7 text-gray-600">
              After the call, paste the transcript here to run the Anti-Sycophant Engine.{" "}
              <span className="font-medium text-gray-800">Or skip the voice call entirely</span> — type directly below to save tokens.
            </p>

            <textarea
              value={transcript}
              onChange={(event) => setTranscript(event.target.value)}
              className="mt-4 min-h-40 w-full resize-y border border-gray-200 bg-[#fbfbfa] p-4 font-mono text-xs leading-6 text-gray-800 transition-colors placeholder:text-gray-400 focus:border-gray-400"
              placeholder="[00:00] prospect: Hi, I have five minutes. What exactly does Numi do?&#10;[00:05] rep: Numi gives sales teams honest call feedback..."
            />

            {loading ? (
              <div className="mt-4" aria-label="Try call analysis progress">
                <div className="mb-2 flex items-center justify-between font-mono text-[11px] uppercase text-gray-500">
                  <span>Analyzing call</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                  <div className="h-full rounded-full bg-gray-950 transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
                </div>
              </div>
            ) : null}

            {error ? (
              <div className="mt-4 flex gap-2 border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <p>{error}</p>
              </div>
            ) : null}

            <button
              type="button"
              disabled={!transcript.trim() || loading}
              onClick={analyzeTranscript}
              className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-md bg-gray-950 px-4 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
            >
              {loading ? <RefreshCcw size={15} /> : <Sparkles size={15} />}
              {loading ? "Analyzing" : "Analyze call"}
            </button>

            {analysis ? (
              <div className="mt-5 border border-gray-200 bg-[#fbfbfa] p-4">
                <div className="flex items-start justify-between gap-4 border-b border-gray-200 pb-4">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-widest text-gray-400">Numi verdict</p>
                    <p className="mt-1 text-sm font-semibold text-gray-950">{analysis.verdictLabel}</p>
                  </div>
                  <p className="font-mono text-4xl font-semibold leading-none text-gray-950">{analysis.numiScore}/10</p>
                </div>
                <p className="mt-4 text-sm leading-7 text-gray-600">{analysis.rationale}</p>
                <div className="mt-4 space-y-2">
                  {analysis.findings.slice(0, 3).map((finding, index) => (
                    <article key={`${finding.timestamp}-${index}`} className="border border-gray-200 bg-white p-3">
                      <p className="text-sm font-semibold text-gray-950">{finding.title}</p>
                      <p className="mt-1 font-mono text-xs italic leading-5 text-gray-600">&quot;{finding.quote}&quot;</p>
                    </article>
                  ))}
                </div>
                <Link
                  href="/dashboard"
                  className="mt-5 inline-flex h-10 items-center justify-center rounded-md border border-gray-300 bg-white px-4 text-sm font-medium text-gray-800 transition-colors hover:border-gray-400 hover:text-gray-950"
                >
                  Open full dashboard
                </Link>
              </div>
            ) : null}
          </section>
        </div>
      </section>
    </main>
  );
}
