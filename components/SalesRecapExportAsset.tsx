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
  rows: Array<{
    label: string;
    value: string;
  }>;
  footer: string;
  filenameSubject: string;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 48);
}

export function SalesRecapExportAsset({
  payload,
  pinExportButton = false
}: {
  payload: SalesRecapExportPayload;
  pinExportButton?: boolean;
}) {
  const [exporting, setExporting] = useState(false);
  const assetRef = useRef<HTMLElement | null>(null);

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
      const source = assetRef.current;
      const width = source.getBoundingClientRect().width;
      const scale = 1200 / width;
      const canvas = await html2canvas(source, {
        backgroundColor: "#ffffff",
        scale,
        width,
        height: width * 1.25,
        useCORS: true,
        removeContainer: true,
        onclone: (clonedDocument) => {
          const style = clonedDocument.createElement("style");
          style.textContent = `
            .numi-export-asset, .numi-export-asset * {
              box-sizing: border-box !important;
              font-synthesis: none !important;
              letter-spacing: 0 !important;
              -webkit-font-smoothing: antialiased !important;
              text-rendering: geometricPrecision !important;
            }
          `;
          clonedDocument.head.appendChild(style);
        }
      });

      const link = document.createElement("a");
      link.download = filename;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="w-full max-w-[480px]">
      <article
        ref={assetRef}
        className="numi-export-asset"
        aria-label={`${payload.subjectName} Numi Sales Recap export preview`}
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "4 / 5",
          background: "#fcfcfc",
          border: "1px solid #111111",
          color: "#000000",
          padding: 40,
          fontFamily: "var(--font-geist-sans), Arial, Helvetica, sans-serif"
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 10,
            border: "1px solid rgba(0,0,0,0.025)",
            pointerEvents: "none"
          }}
        />

        <div style={{ position: "relative", zIndex: 1, display: "flex", height: "100%", flexDirection: "column" }}>
          <div style={{ borderBottom: "1px solid #000000", paddingBottom: 16 }}>
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 20,
                fontFamily: "var(--font-geist-mono), Consolas, monospace",
                fontSize: 10,
                lineHeight: "16px",
                textTransform: "uppercase"
              }}
            >
              <p style={{ margin: 0 }}>{payload.metaLeft}</p>
              <p style={{ margin: 0, textAlign: "right" }}>{payload.metaRight}</p>
            </div>
          </div>

          <div style={{ borderBottom: "1px solid #000000", padding: "32px 0" }}>
            <div
              style={{
                marginBottom: 20,
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontFamily: "var(--font-geist-mono), Consolas, monospace",
                fontSize: 10,
                lineHeight: "16px",
                textTransform: "uppercase"
              }}
            >
              <span style={{ height: 8, width: 8, borderRadius: 999, background: "#ff0000" }} />
              <span>{payload.projectName}</span>
            </div>
            <h3
              style={{
                margin: 0,
                maxWidth: 390,
                fontSize: 38,
                fontWeight: 650,
                lineHeight: 1.04,
                letterSpacing: 0
              }}
            >
              {payload.statement}
            </h3>
          </div>

          <dl style={{ margin: 0, borderBottom: "1px solid #000000" }}>
            {payload.rows.slice(0, 3).map((row) => (
              <div
                key={row.label}
                style={{
                  display: "grid",
                  gridTemplateColumns: "118px 1fr",
                  gap: 20,
                  borderBottom: "1px solid #000000",
                  padding: "16px 0"
                }}
              >
                <dt
                  style={{
                    fontFamily: "var(--font-geist-mono), Consolas, monospace",
                    fontSize: 10,
                    lineHeight: "16px",
                    textTransform: "uppercase"
                  }}
                >
                  {row.label}
                </dt>
                <dd style={{ margin: 0, fontSize: 13, fontWeight: 600, lineHeight: "20px" }}>{row.value}</dd>
              </div>
            ))}
          </dl>

          <div style={{ marginTop: "auto", paddingTop: 16 }}>
            <p
              style={{
                margin: 0,
                fontFamily: "var(--font-geist-mono), Consolas, monospace",
                fontSize: 9,
                lineHeight: "16px",
                textTransform: "uppercase"
              }}
            >
              {payload.footer}
            </p>
          </div>
        </div>
      </article>

      <button
        type="button"
        className={
          pinExportButton
            ? "fixed right-6 top-6 z-50 border border-black bg-white px-3 py-2 font-mono text-[11px] uppercase text-black shadow-sm transition-colors hover:bg-black hover:text-white disabled:cursor-wait disabled:opacity-35"
            : "mt-3 p-0 font-mono text-[11px] uppercase text-black opacity-60 transition-opacity hover:opacity-100 disabled:cursor-wait disabled:opacity-35"
        }
        disabled={exporting}
        onClick={exportPng}
      >
        [ {exporting ? "Rendering PNG" : "Export for LinkedIn (PNG)"} ]
      </button>
      {!pinExportButton ? <p className="mt-2 font-mono text-[10px] text-gray-400">{filename}</p> : null}
    </div>
  );
}
