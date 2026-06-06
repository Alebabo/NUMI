"use client";

import { useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";

export type SalesRecapExportPayload = {
  projectName: string;
  periodLabel: string;
  subjectName: string;
  metaLeft: string;
  metaRight: string;
  statement: string;
  rows: Array<{ label: string; value: string }>;
  footer: string;
  filenameSubject: string;
};

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 48);
}

const SLIDE_THEMES = [
  { bg: "linear-gradient(135deg, #1a0533 0%, #3b0764 60%, #6b21a8 100%)", accent: "rgba(255,255,255,0.15)" },
  { bg: "linear-gradient(135deg, #e8115b 0%, #c2185b 100%)",              accent: "rgba(255,255,255,0.18)" },
  { bg: "linear-gradient(135deg, #065f46 0%, #047857 60%, #10b981 100%)", accent: "rgba(255,255,255,0.15)" },
  { bg: "linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 60%, #3b82f6 100%)", accent: "rgba(255,255,255,0.15)" },
];

type SlideData = { label: string; headline: string; sub: string; stat?: string };

function buildSlides(payload: SalesRecapExportPayload): SlideData[] {
  return [
    {
      label: payload.periodLabel,
      headline: payload.statement,
      sub: `${payload.projectName} · ${payload.subjectName}`,
    },
    {
      label: payload.rows[0]?.label ?? "Finding 1",
      headline: payload.rows[0]?.value ?? "",
      sub: payload.subjectName,
    },
    {
      label: payload.rows[1]?.label ?? "Finding 2",
      headline: payload.rows[1]?.value ?? "",
      sub: payload.subjectName,
    },
    {
      label: payload.rows[2]?.label ?? "Finding 3",
      headline: payload.rows[2]?.value ?? "",
      sub: payload.footer,
    },
  ];
}

function SlideCard({
  data,
  theme,
  style,
  innerStyle,
}: {
  data: SlideData;
  theme: (typeof SLIDE_THEMES)[number];
  style?: React.CSSProperties;
  innerStyle?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        background: theme.bg,
        borderRadius: 12,
        overflow: "hidden",
        padding: 20,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxSizing: "border-box",
        ...style,
      }}
    >
      <div>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            background: theme.accent,
            borderRadius: 999,
            padding: "4px 10px",
            marginBottom: 12,
          }}
        >
          <span
            style={{
              color: "#fff",
              fontSize: innerStyle?.fontSize ? Number(innerStyle.fontSize) * 0.55 : 10,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            {data.label}
          </span>
        </div>
        {data.stat && (
          <p
            style={{
              color: "#fff",
              fontSize: innerStyle?.fontSize ? Number(innerStyle.fontSize) * 2.2 : 40,
              fontWeight: 900,
              lineHeight: 1,
              margin: "0 0 6px",
            }}
          >
            {data.stat}
          </p>
        )}
        <p
          style={{
            color: "#fff",
            fontWeight: 700,
            lineHeight: 1.2,
            margin: 0,
            ...innerStyle,
          }}
        >
          {data.headline}
        </p>
      </div>
      <p
        style={{
          color: "rgba(255,255,255,0.55)",
          fontSize: innerStyle?.fontSize ? Number(innerStyle.fontSize) * 0.7 : 11,
          lineHeight: 1.4,
          margin: "12px 0 0",
        }}
      >
        {data.sub}
      </p>
    </div>
  );
}

export function SalesRecapExportAsset({ payload }: { payload: SalesRecapExportPayload }) {
  const [exporting, setExporting] = useState(false);
  const assetRef = useRef<HTMLDivElement | null>(null);

  const slides = useMemo(() => buildSlides(payload), [payload]);

  const filename = useMemo(() => {
    const subject = slugify(payload.filenameSubject || payload.subjectName || "sales");
    const period = slugify(payload.periodLabel || "period");
    return `numi_recap_${subject}_${period}.png`;
  }, [payload.filenameSubject, payload.periodLabel, payload.subjectName]);

  async function exportPng() {
    if (!assetRef.current || exporting) return;
    setExporting(true);
    try {
      await document.fonts?.ready;
      const el = assetRef.current;
      const w = el.getBoundingClientRect().width;
      const canvas = await html2canvas(el, {
        backgroundColor: null,
        scale: 1400 / w,
        useCORS: true,
        removeContainer: true,
      });
      const link = document.createElement("a");
      link.download = filename;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      setExporting(false);
    }
  }

  const GAP = 8;
  const SMALL_W = "37%";
  const BIG_W = `calc(63% - ${GAP}px)`;
  const SMALL_H = `calc((100% - ${GAP * 2}px) / 3)`;

  return (
    <div className="w-full">
      {/* LinkedIn carousel preview */}
      <div
        ref={assetRef}
        style={{
          width: "100%",
          aspectRatio: "16 / 9",
          display: "flex",
          gap: GAP,
          padding: 0,
          background: "transparent",
          borderRadius: 16,
          overflow: "hidden",
        }}
      >
        {/* Big first slide */}
        <SlideCard
          data={slides[0]}
          theme={SLIDE_THEMES[0]}
          style={{ width: BIG_W, height: "100%", borderRadius: 12, flexShrink: 0 }}
          innerStyle={{ fontSize: 22 }}
        />

        {/* 3 smaller slides stacked */}
        <div style={{ width: SMALL_W, display: "flex", flexDirection: "column", gap: GAP, flexShrink: 0 }}>
          {slides.slice(1, 4).map((slide, i) => (
            <SlideCard
              key={slide.label + i}
              data={slide}
              theme={SLIDE_THEMES[i + 1]}
              style={{ height: SMALL_H, borderRadius: 10, padding: 14 }}
              innerStyle={{ fontSize: 11 }}
            />
          ))}
        </div>
      </div>

      <button
        type="button"
        data-wrapped-export
        className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-gray-950 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-700 disabled:cursor-wait disabled:opacity-50"
        disabled={exporting}
        onClick={exportPng}
      >
        {exporting ? "Rendering…" : "↓ PNG exportieren"}
      </button>
    </div>
  );
}
