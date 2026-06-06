"use client";

import Script from "next/script";
import Link from "next/link";
import { createElement } from "react";
import { ArrowLeft, ClipboardList } from "lucide-react";
import NumiWordmark from "../../components/NumiWordmark";

const demoJson = {
  call_quality: "weak",
  main_failure: "Objection was accepted instead of isolated",
  discount_risk: "high",
  next_step: "unclear",
  truth: "The rep searched for approval instead of leading the decision."
};

export default function TryPage() {
  const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;

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
            Run a short English test call through the ElevenLabs agent. The point is not a charming assistant. The point is a
            transcript Numi can score without the usual politeness layer.
          </p>
          <div className="mt-7 border-l border-gray-300 pl-4 text-sm leading-7 text-gray-700">
            Keep it under one minute. Push on price. Ask for a follow-up. Then compare the call against the blunt analysis
            pattern on the right.
          </div>
        </div>

        <div className="grid gap-5">
          <section className="border border-gray-200 bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
            <div className="mb-5 flex items-center justify-between border-b border-gray-200 pb-4">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-widest text-gray-400">ElevenLabs call</p>
                <h2 className="mt-1 text-lg font-semibold tracking-tight text-gray-950">60-second test call</h2>
              </div>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-100">
                Voice
              </span>
            </div>

            {agentId ? (
              <div className="min-h-[360px]">
                {createElement("elevenlabs-convai", { "agent-id": agentId, variant: "expanded" })}
              </div>
            ) : (
              <div className="flex min-h-[360px] flex-col justify-center border border-dashed border-gray-300 bg-gray-50 p-6">
                <p className="text-sm font-semibold text-gray-950">ElevenLabs agent is not configured.</p>
                <p className="mt-3 max-w-xl text-sm leading-7 text-gray-600">
                  Add `NEXT_PUBLIC_ELEVENLABS_AGENT_ID` to `.env.local` with your ElevenLabs Conversational AI agent ID, then
                  restart the dev server. The official widget will render here.
                </p>
              </div>
            )}
          </section>

          <section className="border border-gray-200 bg-white p-5">
            <div className="mb-4 flex items-center gap-2">
              <ClipboardList size={16} strokeWidth={1.8} className="text-gray-500" />
              <h2 className="text-sm font-semibold tracking-tight text-gray-950">Anti-Sycophant Analysis Pattern</h2>
            </div>
            <p className="text-sm leading-7 text-gray-600">
              The dashboard analysis is generated after a recorded file or transcript is submitted. This demo page keeps the
              call live and the expected output blunt.
            </p>
            <pre className="mt-4 overflow-x-auto border border-gray-200 bg-[#fbfbfa] p-4 font-mono text-xs leading-6 text-gray-800">
              {JSON.stringify(demoJson, null, 2)}
            </pre>
            <Link
              href="/dashboard"
              className="mt-5 inline-flex h-10 items-center justify-center rounded-md bg-gray-950 px-4 text-sm font-medium text-white transition-colors hover:bg-gray-800"
            >
              Analyze a transcript
            </Link>
          </section>
        </div>
      </section>
    </main>
  );
}
