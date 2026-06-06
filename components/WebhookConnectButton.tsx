"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Check, Clipboard, Code2, FileAudio, Plug, X } from "lucide-react";

type WebhookConnectButtonProps = {
  variant?: "dark" | "light";
  size?: "sm" | "md";
  iconOnly?: boolean;
};

export default function WebhookConnectButton({ variant = "light", size = "sm", iconOnly = false }: WebhookConnectButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<"url" | "curl" | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const webhookUrl = useMemo(() => {
    if (typeof window === "undefined") return "/api/webhook/call-score";
    return `${window.location.origin}/api/webhook/call-score`;
  }, []);

  const curlExample = useMemo(
    () =>
      [
        `curl -X POST "${webhookUrl}" \\`,
        `  -F "file=@sales-call.mp3" \\`,
        `  -F "subjectName=Demo Rep" \\`,
        `  -F "projectName=Numi Sales Recap"`
      ].join("\n"),
    [webhookUrl]
  );

  async function copy(value: string, kind: "url" | "curl") {
    await navigator.clipboard.writeText(value);
    setCopied(kind);
    window.setTimeout(() => setCopied(null), 1400);
  }

  const buttonClass =
    variant === "dark"
      ? "bg-gray-950 text-white hover:bg-gray-800"
      : "border border-gray-950 bg-white text-gray-950 hover:bg-gray-950 hover:text-white";
  const sizeClass = iconOnly
    ? size === "md"
      ? "h-11 w-11 text-sm"
      : "h-8 w-8 text-sm"
    : size === "md"
      ? "h-11 px-5 text-sm"
      : "h-8 px-3 text-sm";
  const shapeClass = iconOnly ? "rounded-full" : "rounded-md";

  const panel =
    open && mounted
      ? createPortal(
          <div
            className="fixed inset-0 z-[80] flex justify-end bg-black/35 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <div
              className="h-screen w-full max-w-md overflow-y-auto border-l border-gray-200 bg-white shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="border-b border-gray-100 bg-[#fbfbfa] px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-950 text-white">
                      <Plug size={17} strokeWidth={1.9} />
                    </span>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-widest text-gray-400">Agent webhook</p>
                      <h2 className="mt-1 text-lg font-semibold tracking-tight text-gray-950">Connect your agent</h2>
                      <p className="mt-1 text-sm leading-6 text-gray-600">
                        Give AI agents a direct way to send calls into Numi and get scored coaching evidence back.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-gray-500 ring-1 ring-gray-200 transition-colors hover:bg-gray-100"
                    aria-label="Close connect panel"
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>

              <div className="p-5">
                <div className="grid grid-cols-3 gap-px overflow-hidden rounded-lg bg-gray-200 text-sm">
                  <div className="bg-white p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Input</p>
                    <p className="mt-1 font-medium text-gray-950">Audio or transcript</p>
                  </div>
                  <div className="bg-white p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Method</p>
                    <p className="mt-1 font-mono font-medium text-gray-950">POST</p>
                  </div>
                  <div className="bg-white p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Output</p>
                    <p className="mt-1 font-medium text-gray-950">Score JSON</p>
                  </div>
                </div>

                <div className="mt-5 rounded-lg border border-gray-200 bg-white p-3">
                  <p className="text-xs font-medium uppercase tracking-widest text-gray-400">Why this matters</p>
                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    Agents should not click dashboards forever. They need structured endpoints they can call directly.
                    Numi becomes the scoring layer: audio in, evidence-backed sales judgment out.
                  </p>
                </div>

                <div className="mt-5">
                  <p className="mb-2 text-xs font-medium uppercase tracking-widest text-gray-400">Endpoint</p>
                  <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-[#fbfbfa] p-2">
                    <code className="min-w-0 flex-1 truncate px-2 font-mono text-xs text-gray-700">{webhookUrl}</code>
                    <button
                      type="button"
                      onClick={() => copy(webhookUrl, "url")}
                      className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md bg-gray-950 px-3 text-xs font-medium text-white transition-colors hover:bg-gray-800"
                      aria-label="Copy webhook URL"
                    >
                      {copied === "url" ? <Check size={14} /> : <Clipboard size={14} />}
                      {copied === "url" ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>

                <div className="mt-5 grid gap-3">
                  <div className="rounded-lg border border-gray-200 bg-white p-3">
                    <div className="mb-2 flex items-center gap-2">
                      <FileAudio size={15} className="text-gray-500" />
                      <p className="text-xs font-medium uppercase tracking-widest text-gray-400">Audio upload</p>
                    </div>
                    <pre className="min-h-36 overflow-x-auto rounded-lg bg-gray-950 p-3 font-mono text-[11px] leading-5 text-gray-100">
                      {curlExample}
                    </pre>
                  </div>

                  <div className="rounded-lg border border-gray-200 bg-white p-3">
                    <div className="mb-2 flex items-center gap-2">
                      <Code2 size={15} className="text-gray-500" />
                      <p className="text-xs font-medium uppercase tracking-widest text-gray-400">JSON transcript</p>
                    </div>
                    <pre className="min-h-36 overflow-x-auto rounded-lg bg-gray-950 p-3 font-mono text-[11px] leading-5 text-gray-100">
                      {`fetch("${webhookUrl}", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    transcript: "[00:00] rep: ..."
  })
})`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex items-center justify-center gap-1.5 font-medium transition-colors ${shapeClass} ${buttonClass} ${sizeClass}`}
        aria-label={iconOnly ? "Connect agents to Numi webhook" : undefined}
      >
        <Plug size={size === "md" ? 16 : 14} strokeWidth={1.8} />
        {iconOnly ? null : "Connect"}
      </button>
      {panel}
    </>
  );
}
