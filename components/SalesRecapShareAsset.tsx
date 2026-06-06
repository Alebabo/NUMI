"use client";

import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";

type RecapMode = "team" | "rep";

type Slide = {
  id: string;
  bg: string;           // background gradient/color
  label: string;        // small top label
  stat?: string;        // huge number/stat
  headline: string;     // main statement
  sub: string;          // supporting copy
  items?: string[];     // optional list
  accent: string;       // accent color for label pill
  textDark?: boolean;   // use dark text (for light slides)
};

const SLIDES: Record<RecapMode, Slide[]> = {
  rep: [
    {
      id: "cover",
      bg: "linear-gradient(135deg, #1a0533 0%, #3b0764 60%, #6b21a8 100%)",
      accent: "rgba(255,255,255,0.15)",
      label: "Your May Recap",
      stat: "#3",
      headline: "in objection control",
      sub: "Out of 24 reps across the DACH team. You held the line.",
    },
    {
      id: "price",
      bg: "linear-gradient(135deg, #e8115b 0%, #c2185b 100%)",
      accent: "rgba(255,255,255,0.18)",
      label: "Price Discipline",
      stat: "82%",
      headline: "of calls, you held price",
      sub: "Until pain and urgency were on the table. The team average? 61%.",
    },
    {
      id: "objections",
      bg: "linear-gradient(135deg, #065f46 0%, #047857 60%, #10b981 100%)",
      accent: "rgba(255,255,255,0.15)",
      label: "You Didn't Fold",
      headline: "Top objections you handled",
      sub: "",
      items: [
        "\"Call me next quarter\"",
        "\"We use a competitor\"",
        "\"No budget right now\"",
        "\"Send me an offer first\"",
      ],
    },
    {
      id: "behavior",
      bg: "linear-gradient(135deg, #ff6437 0%, #ea580c 100%)",
      accent: "rgba(255,255,255,0.18)",
      label: "Signature Move",
      headline: "Value before price.\nEvery. Single. Time.",
      sub: "9 out of 10 late-stage calls. You anchored impact before cost. That's what closers do.",
    },
    {
      id: "proof",
      bg: "linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 60%, #3b82f6 100%)",
      accent: "rgba(255,255,255,0.15)",
      label: "The Proof",
      stat: "11",
      headline: "hesitant calls → next steps",
      sub: "Zero ghosted after your follow-up. That's not luck. That's craft.",
    },
  ],
  team: [
    {
      id: "cover",
      bg: "linear-gradient(135deg, #1a0533 0%, #3b0764 60%, #6b21a8 100%)",
      accent: "rgba(255,255,255,0.15)",
      label: "DACH Team · May Recap",
      stat: "Top 12%",
      headline: "globally in price discipline",
      sub: "Across all teams tracked by Numi this month.",
    },
    {
      id: "price",
      bg: "linear-gradient(135deg, #e8115b 0%, #c2185b 100%)",
      accent: "rgba(255,255,255,0.18)",
      label: "Team Price Hold",
      stat: "82%",
      headline: "late-stage calls held price",
      sub: "Benchmark: 61%. Your team is not average.",
    },
    {
      id: "objections",
      bg: "linear-gradient(135deg, #065f46 0%, #047857 60%, #10b981 100%)",
      accent: "rgba(255,255,255,0.15)",
      label: "The Team Held the Line",
      headline: "Objections handled this month",
      sub: "",
      items: [
        "\"Too expensive\"",
        "\"Competitor in place\"",
        "\"No budget approved\"",
        "\"We need to think about it\"",
      ],
    },
    {
      id: "behavior",
      bg: "linear-gradient(135deg, #ff6437 0%, #ea580c 100%)",
      accent: "rgba(255,255,255,0.18)",
      label: "Strongest Team Behavior",
      headline: "Value anchored\nbefore pricing.",
      sub: "Reps introduced business impact before cost — consistently. That's what separates closers from pitch machines.",
    },
    {
      id: "proof",
      bg: "linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 60%, #3b82f6 100%)",
      accent: "rgba(255,255,255,0.15)",
      label: "The Result",
      stat: "47",
      headline: "qualified next steps",
      sub: "Generated from calls that started with objections. DACH reps turned pressure into pipeline.",
    },
  ],
};

export default function SalesRecapShareAsset() {
  const [mode, setMode] = useState<RecapMode>("rep");
  const [index, setIndex] = useState(0);
  const [exporting, setExporting] = useState(false);
  const slideRef = useRef<HTMLDivElement | null>(null);

  const slides = SLIDES[mode];
  const slide = slides[index];
  const total = slides.length;

  useEffect(() => { setIndex(0); }, [mode]);

  function prev() { setIndex((i) => (i - 1 + total) % total); }
  function next() { setIndex((i) => (i + 1) % total); }

  async function exportPng() {
    if (!slideRef.current || exporting) return;
    setExporting(true);
    try {
      const el = slideRef.current;
      const w = el.getBoundingClientRect().width;
      const canvas = await html2canvas(el, {
        scale: 1200 / w,
        useCORS: true,
        logging: false,
      });
      const link = document.createElement("a");
      link.download = `numi-recap-${mode}-${slide.id}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="w-full max-w-[340px] select-none">
      {/* Mode toggle */}
      <div className="mb-3 flex items-center gap-1 text-xs text-gray-400">
        {(["rep", "team"] as RecapMode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              mode === m
                ? "bg-gray-950 text-white"
                : "text-gray-400 hover:text-gray-700"
            }`}
          >
            {m === "rep" ? "Rep" : "Team"}
          </button>
        ))}
      </div>

      {/* Card */}
      <div
        ref={slideRef}
        style={{ background: slide.bg }}
        className="relative aspect-square w-full overflow-hidden rounded-2xl p-7"
      >
        {/* Label pill */}
        <div
          style={{ background: slide.accent }}
          className="mb-5 inline-flex items-center rounded-full px-3 py-1"
        >
          <span className="text-[11px] font-semibold uppercase tracking-widest text-white">
            {slide.label}
          </span>
        </div>

        {/* Main content */}
        <div className="flex h-[calc(100%-3rem)] flex-col justify-between">
          <div>
            {slide.stat && (
              <p className="text-[72px] font-black leading-none tracking-tight text-white">
                {slide.stat}
              </p>
            )}
            <p
              className={`${slide.stat ? "mt-1 text-[20px]" : "text-[26px]"} font-bold leading-tight text-white`}
              style={{ whiteSpace: "pre-line" }}
            >
              {slide.headline}
            </p>

            {slide.items ? (
              <ul className="mt-5 space-y-2.5">
                {slide.items.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-white opacity-70" />
                    <span className="text-[14px] font-medium leading-snug text-white/90">{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-[13px] leading-relaxed text-white/70">{slide.sub}</p>
            )}
          </div>

          {/* Footer branding + dots */}
          <div className="flex items-end justify-between">
            <p className="text-[11px] font-semibold text-white/40">numi</p>
            <div className="flex items-center gap-1.5">
              {slides.map((_, i) => (
                <span
                  key={i}
                  className={`block rounded-full bg-white transition-all duration-300 ${
                    i === index ? "h-1.5 w-5 opacity-100" : "h-1.5 w-1.5 opacity-30"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={prev}
            className="rounded-full border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:border-gray-400 hover:text-gray-950"
          >
            ← Back
          </button>
          <button
            type="button"
            onClick={next}
            className="rounded-full border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:border-gray-400 hover:text-gray-950"
          >
            Next →
          </button>
        </div>
        <button
          type="button"
          onClick={exportPng}
          disabled={exporting}
          className="text-xs font-medium text-gray-400 transition-colors hover:text-gray-950 disabled:cursor-wait disabled:opacity-40"
        >
          {exporting ? "Rendering…" : "↓ Export"}
        </button>
      </div>
    </div>
  );
}
