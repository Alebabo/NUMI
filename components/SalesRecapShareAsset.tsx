"use client";

import { useEffect, useRef, useState } from "react";
import pptxgen from "pptxgenjs";
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

  async function exportPptx() {
    const pptx = new pptxgen();
    pptx.layout = "LAYOUT_WIDE"; // 16:9

    // Helper: extract a solid color from gradient string (take first hex)
    function gradientToColor(bg: string): string {
      const match = bg.match(/#([0-9a-fA-F]{6})/);
      return match ? match[1] : "1a0533";
    }

    for (const s of slides) {
      const slide = pptx.addSlide();
      const bgColor = gradientToColor(s.bg);
      slide.background = { color: bgColor };

      // Label pill text
      slide.addText(s.label.toUpperCase(), {
        x: 0.4, y: 0.3, w: 8, h: 0.35,
        fontSize: 9, bold: true, color: "FFFFFF", transparency: 40,
        charSpacing: 3,
      });

      let contentY = 1.0;

      if (s.stat) {
        slide.addText(s.stat, {
          x: 0.4, y: contentY, w: 9, h: 1.8,
          fontSize: 96, bold: true, color: "FFFFFF",
          charSpacing: -2, lineSpacingMultiple: 1,
        });
        contentY += 1.9;
      }

      // Headline
      const headlineFontSize = !s.stat && !s.items ? 48 : 24;
      slide.addText(s.headline, {
        x: 0.4, y: contentY, w: 9, h: s.stat ? 1.0 : 2.5,
        fontSize: headlineFontSize, bold: true, color: "FFFFFF",
        lineSpacingMultiple: 1.05, breakLine: true,
      });
      contentY += s.stat ? 1.1 : 2.6;

      if (s.items) {
        const bulletRows = s.items.map((item) => ({ text: item, options: {} }));
        slide.addText(bulletRows, {
          x: 0.4, y: contentY, w: 9, h: 2.5,
          fontSize: 16, bold: false, color: "FFFFFFCC",
          bullet: { type: "bullet", characterCode: "2022", indent: 10 },
          lineSpacingMultiple: 1.4,
        });
      } else if (s.sub) {
        slide.addText(s.sub, {
          x: 0.4, y: contentY, w: 9, h: 1.5,
          fontSize: 14, color: "FFFFFF", transparency: 45,
          lineSpacingMultiple: 1.5,
        });
      }

      // Footer branding
      slide.addText("numi", {
        x: 0.4, y: 6.8, w: 2, h: 0.3,
        fontSize: 10, bold: true, color: "FFFFFF", transparency: 65,
        charSpacing: 2,
      });
    }

    await pptx.writeFile({ fileName: `numi-recap-${mode}.pptx` });
  }

  async function exportPng() {
    if (exporting) return;
    setExporting(true);

    try {
      await document.fonts?.ready;

      const GAP = 8;
      const SMALL = 420;                        // small slide square size
      const BIG = SMALL * 3 + GAP * 2;         // big slide = same height as 3 small stacked
      const LAYOUT_W = BIG + GAP + SMALL;
      const LAYOUT_H = BIG;
      const allSlides = slides.slice(0, 4);

      function buildCard(s: Slide, w: number, h: number, bigStat = false): HTMLElement {
        const PAD = Math.round(w * 0.088); // ~p-7 proportional
        const card = document.createElement("div");
        Object.assign(card.style, {
          width: `${w}px`, height: `${h}px`,
          background: s.bg,
          borderRadius: "16px",
          padding: `${PAD}px`,
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          flexShrink: "0",
          fontFamily: "Arial, Helvetica, sans-serif",
        });

        // Label pill
        const pill = document.createElement("div");
        Object.assign(pill.style, {
          display: "inline-flex",
          alignItems: "center",
          background: s.accent,
          borderRadius: "999px",
          padding: `${Math.round(PAD * 0.18)}px ${Math.round(PAD * 0.5)}px`,
          marginBottom: `${Math.round(PAD * 0.55)}px`,
          alignSelf: "flex-start",
        });
        const pillText = document.createElement("span");
        Object.assign(pillText.style, {
          color: "#fff",
          fontSize: `${Math.round(w * 0.018)}px`,
          fontWeight: "700",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
        });
        pillText.textContent = s.label;
        pill.appendChild(pillText);
        card.appendChild(pill);

        // Content area — flex column, grows to fill
        const content = document.createElement("div");
        Object.assign(content.style, {
          display: "flex",
          flexDirection: "column",
          flex: "1",
          justifyContent: "space-between",
        });

        const top = document.createElement("div");

        if (s.stat) {
          const statEl = document.createElement("p");
          Object.assign(statEl.style, {
            color: "#fff",
            fontSize: `${Math.round(w * (bigStat ? 0.38 : 0.19))}px`,
            fontWeight: "900",
            lineHeight: "1",
            margin: "0 0 4px 0",
            letterSpacing: "-0.03em",
          });
          statEl.textContent = s.stat;
          top.appendChild(statEl);
        }

        const headlineEl = document.createElement("p");
        const headlineFontSize = !s.stat && !s.items ? Math.round(w * 0.082) : Math.round(w * 0.052);
        Object.assign(headlineEl.style, {
          color: "#fff",
          fontSize: `${headlineFontSize}px`,
          fontWeight: "900",
          lineHeight: "1.1",
          margin: s.stat ? `${Math.round(w * 0.008)}px 0 0` : "0",
          whiteSpace: "pre-line",
        });
        headlineEl.textContent = s.headline;
        top.appendChild(headlineEl);

        if (s.items) {
          const ul = document.createElement("ul");
          Object.assign(ul.style, {
            margin: `${Math.round(w * 0.028)}px 0 0`,
            padding: "0",
            listStyle: "none",
            display: "flex",
            flexDirection: "column",
            gap: `${Math.round(w * 0.018)}px`,
          });
          s.items.forEach((item) => {
            const li = document.createElement("li");
            Object.assign(li.style, { display: "flex", alignItems: "flex-start", gap: `${Math.round(w * 0.014)}px` });
            li.innerHTML = `<span style="width:${Math.round(w * 0.012)}px;height:${Math.round(w * 0.012)}px;border-radius:50%;background:rgba(255,255,255,0.7);flex-shrink:0;margin-top:${Math.round(w * 0.012)}px"></span><span style="color:rgba(255,255,255,0.9);font-size:${Math.round(w * 0.038)}px;font-weight:600;line-height:1.35">${item}</span>`;
            ul.appendChild(li);
          });
          top.appendChild(ul);
        } else if (s.sub) {
          const subEl = document.createElement("p");
          Object.assign(subEl.style, {
            color: "rgba(255,255,255,0.55)",
            fontSize: `${Math.round(w * 0.032)}px`,
            lineHeight: "1.5",
            margin: `${Math.round(w * 0.022)}px 0 0`,
          });
          subEl.textContent = s.sub;
          top.appendChild(subEl);
        }

        content.appendChild(top);

        // Footer
        const footer = document.createElement("div");
        Object.assign(footer.style, { display: "flex", alignItems: "flex-end", justifyContent: "space-between" });
        const numiLabel = document.createElement("span");
        Object.assign(numiLabel.style, {
          color: "rgba(255,255,255,0.35)",
          fontSize: `${Math.round(w * 0.018)}px`,
          fontWeight: "700",
          letterSpacing: "0.05em",
        });
        numiLabel.textContent = "numi";
        footer.appendChild(numiLabel);
        content.appendChild(footer);

        card.appendChild(content);
        return card;
      }

      // Build off-screen container: big slide left, 3 small squares stacked right
      const container = document.createElement("div");
      Object.assign(container.style, {
        position: "fixed", top: "-99999px", left: "-99999px",
        width: `${LAYOUT_W}px`, height: `${LAYOUT_H}px`,
        display: "flex", gap: `${GAP}px`,
        background: "#111",
        borderRadius: "20px",
        overflow: "hidden",
      });

      container.appendChild(buildCard(allSlides[0], BIG, BIG, true));

      const stack = document.createElement("div");
      Object.assign(stack.style, {
        display: "flex", flexDirection: "column", gap: `${GAP}px`, flexShrink: "0",
      });
      allSlides.slice(1, 4).forEach((s) => stack.appendChild(buildCard(s, SMALL, SMALL)));
      container.appendChild(stack);

      document.body.appendChild(container);

      const canvas = await html2canvas(container, {
        backgroundColor: "#111111",
        scale: 2,
        width: LAYOUT_W,
        height: LAYOUT_H,
        useCORS: true,
        removeContainer: false,
        logging: false,
      });

      document.body.removeChild(container);

      const link = document.createElement("a");
      link.download = "numi-recap.png";
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
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={exportPptx}
            className="text-xs font-medium text-gray-400 transition-colors hover:text-gray-950"
          >
            ↓ PPTX
          </button>
          <button
            type="button"
            onClick={exportPng}
            disabled={exporting}
            className="text-xs font-medium text-gray-400 transition-colors hover:text-gray-950 disabled:cursor-wait disabled:opacity-40"
          >
            {exporting ? "Rendering…" : "↓ PNG"}
          </button>
        </div>
      </div>
    </div>
  );
}
