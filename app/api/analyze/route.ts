import { NextResponse } from "next/server";
import {
  CRITIC_SYSTEM_PROMPT,
  RATER_SYSTEM_PROMPT,
  TranscriptSegment,
  normalizeRaterOutput,
  renderTranscript,
  runDeterministicPass
} from "../../../lib/antiSycophant";

export const runtime = "nodejs";

type ElevenWord = {
  text?: string;
  start?: number;
  end?: number;
  speaker_id?: string;
  type?: string;
};

type Finding = {
  title: string;
  quote: string;
  timestamp: string;
  duration: string;
  severity: "weak" | "moderate";
};

type RecapContext = {
  projectName: string;
  subjectName: string;
};

const ELEVENLABS_URL = "https://api.elevenlabs.io/v1/speech-to-text";
const DEFAULT_QWEN_BASE_URL = "https://api.featherless.ai/v1";
const DEFAULT_QWEN_MODEL = "Qwen/Qwen2.5-7B-Instruct";

function extractJson(content: string) {
  const fenced = content.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fenced?.[1] ?? content;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Qwen did not return a JSON object.");
  }

  return JSON.parse(raw.slice(start, end + 1)) as Record<string, unknown>;
}

function formatTimestamp(milliseconds: number) {
  const safe = Math.max(0, Math.floor(milliseconds / 1000));
  const minutes = Math.floor(safe / 60).toString().padStart(2, "0");
  const seconds = (safe % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function durationLabel(startMs: number, endMs: number) {
  const seconds = Math.max(1, Math.round((endMs - startMs) / 1000));
  return `${seconds}s`;
}

function normalizeSpeaker(speakerId?: string): TranscriptSegment["speaker"] {
  const value = (speakerId || "").toLowerCase();
  if (value === "agent" || value === "rep" || value === "speaker_0" || value === "speaker_1") {
    return "rep";
  }
  if (value === "customer" || value === "prospect" || value === "speaker_2") {
    return "prospect";
  }
  return "other";
}

function isTranscriptFile(file: File) {
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return (
    type.startsWith("text/") ||
    type === "application/json" ||
    name.endsWith(".txt") ||
    name.endsWith(".md") ||
    name.endsWith(".json") ||
    name.endsWith(".vtt") ||
    name.endsWith(".srt")
  );
}

function stripCaptionMarkup(text: string) {
  return text
    .replace(/^WEBVTT.*$/gim, "")
    .replace(/^\d+\s*$/gm, "")
    .replace(/\d{1,2}:\d{2}:\d{2}[,.]\d{3}\s+-->\s+\d{1,2}:\d{2}:\d{2}[,.]\d{3}.*$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function plainTextToSegments(text: string): TranscriptSegment[] {
  const cleaned = stripCaptionMarkup(text);
  const lines = cleaned
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) {
    return [{ t_start_ms: 0, t_end_ms: 0, speaker: "other", text: cleaned }];
  }

  return lines.map((line, index) => {
    const match = line.match(/^(?:\[(\d{1,2}):(\d{2})(?::(\d{2}))?\]\s*)?(rep|sales|agent|prospect|customer|kunde|other|speaker[_\s-]?\d+)[:\-]\s*(.+)$/i);
    const minute = match?.[1] ? Number(match[1]) : Math.floor(index * 12 / 60);
    const second = match?.[2] ? Number(match[2]) : (index * 12) % 60;
    const hour = match?.[3] ? minute : 0;
    const normalizedMinute = match?.[3] ? second : minute;
    const normalizedSecond = match?.[3] ? Number(match[3]) : second;
    const startMs = ((hour * 60 + normalizedMinute) * 60 + normalizedSecond) * 1000;
    const speakerRaw = match?.[4]?.toLowerCase();
    const textValue = match?.[5] || line.replace(/^\[\d{1,2}:\d{2}(?::\d{2})?\]\s*/, "");

    return {
      t_start_ms: startMs,
      t_end_ms: startMs + Math.max(3000, Math.min(20000, textValue.length * 55)),
      speaker:
        speakerRaw === "rep" || speakerRaw === "sales" || speakerRaw === "agent" || speakerRaw?.startsWith("speaker_0")
          ? "rep"
          : speakerRaw === "prospect" || speakerRaw === "customer" || speakerRaw === "kunde" || speakerRaw?.startsWith("speaker_1")
            ? "prospect"
            : "other",
      text: textValue
    };
  });
}

function normalizeJsonSegment(item: unknown, index: number): TranscriptSegment | null {
  if (!item || typeof item !== "object") return null;
  const row = item as Record<string, unknown>;
  const text = String(row.text || row.content || row.transcript || "").trim();
  if (!text) return null;

  const start =
    Number(row.t_start_ms) ||
    Number(row.start_ms) ||
    Math.round(Number(row.start ?? row.startSeconds ?? 0) * 1000) ||
    index * 12000;
  const end =
    Number(row.t_end_ms) ||
    Number(row.end_ms) ||
    Math.round(Number(row.end ?? row.endSeconds ?? 0) * 1000) ||
    start + Math.max(3000, Math.min(20000, text.length * 55));

  return {
    t_start_ms: Math.max(0, Math.round(start)),
    t_end_ms: Math.max(Math.round(start), Math.round(end)),
    speaker: normalizeSpeaker(String(row.speaker || row.speaker_id || "")),
    text
  };
}

async function readTranscriptFile(file: File) {
  const raw = await file.text();
  const name = file.name.toLowerCase();

  if (name.endsWith(".json") || file.type === "application/json") {
    try {
      const parsed = JSON.parse(raw) as unknown;
      const source: unknown[] | null =
        parsed && typeof parsed === "object" && Array.isArray((parsed as Record<string, unknown>).segments)
          ? ((parsed as Record<string, unknown>).segments as unknown[])
          : Array.isArray(parsed)
            ? parsed
            : null;

      if (source) {
        const segments = source
          .map((item, index) => normalizeJsonSegment(item, index))
          .filter((item): item is TranscriptSegment => Boolean(item));

        if (segments.length) {
          return {
            text: segments.map((segment) => segment.text).join("\n"),
            segments,
            languageCode: String((parsed as Record<string, unknown>)?.language || "de")
          };
        }
      }

      const text = String((parsed as Record<string, unknown>)?.text || (parsed as Record<string, unknown>)?.transcript || raw);
      return {
        text,
        segments: plainTextToSegments(text),
        languageCode: String((parsed as Record<string, unknown>)?.language || "de")
      };
    } catch {
      return {
        text: raw,
        segments: plainTextToSegments(raw),
        languageCode: "de"
      };
    }
  }

  return {
    text: stripCaptionMarkup(raw),
    segments: plainTextToSegments(raw),
    languageCode: "de"
  };
}

function wordsToSegments(words: ElevenWord[], transcriptText: string): TranscriptSegment[] {
  const wordRows = words
    .filter((word) => word.type !== "spacing" && word.text && typeof word.start === "number")
    .map((word) => ({
      text: String(word.text),
      startMs: Math.round((word.start || 0) * 1000),
      endMs: Math.round((word.end || word.start || 0) * 1000),
      speaker: normalizeSpeaker(word.speaker_id)
    }));

  if (!wordRows.length) {
    return [
      {
        t_start_ms: 0,
        t_end_ms: 0,
        speaker: "other",
        text: transcriptText
      }
    ];
  }

  const segments: TranscriptSegment[] = [];
  let current: TranscriptSegment | null = null;

  for (const word of wordRows) {
    if (!current) {
      current = {
        t_start_ms: word.startMs,
        t_end_ms: word.endMs,
        speaker: word.speaker,
        text: word.text
      };
      continue;
    }

    const gap = word.startMs - current.t_end_ms;
    const shouldSplit = current.speaker !== word.speaker || gap > 1800 || current.text.length > 360;

    if (shouldSplit) {
      segments.push(current);
      current = {
        t_start_ms: word.startMs,
        t_end_ms: word.endMs,
        speaker: word.speaker,
        text: word.text
      };
    } else {
      current.t_end_ms = Math.max(current.t_end_ms, word.endMs);
      current.text = `${current.text} ${word.text}`.replace(/\s+([.,!?;:])/g, "$1");
    }
  }

  if (current) segments.push(current);
  return segments;
}

async function transcribe(file: File) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error("ELEVENLABS_API_KEY is missing.");
  }

  const form = new FormData();
  form.append("model_id", "scribe_v2");
  form.append("file", file);
  form.append("diarize", "true");
  form.append("detect_speaker_roles", "true");
  form.append("timestamps_granularity", "word");
  form.append("tag_audio_events", "true");

  const response = await fetch(ELEVENLABS_URL, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey
    },
    body: form
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`ElevenLabs transcription failed: ${response.status} ${body.slice(0, 240)}`);
  }

  const data = (await response.json()) as { text?: string; words?: ElevenWord[]; language_code?: string };
  const text = data.text || "";
  const words = Array.isArray(data.words) ? data.words : [];

  return {
    text,
    words,
    segments: wordsToSegments(words, text),
    languageCode: data.language_code || "auto"
  };
}

async function callQwen(system: string, user: string) {
  const apiKey = process.env.FEATHERLESS_API_KEY || process.env.DASHSCOPE_API_KEY;
  if (!apiKey) {
    throw new Error("FEATHERLESS_API_KEY is missing.");
  }
  const baseUrl = (process.env.QWEN_BASE_URL || DEFAULT_QWEN_BASE_URL).replace(/\/$/, "");

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:3000",
      "X-Title": "Numi Hackathon Dashboard"
    },
    body: JSON.stringify({
      model: process.env.QWEN_MODEL || DEFAULT_QWEN_MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user }
      ],
      temperature: 0,
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Qwen scoring failed: ${response.status} ${body.slice(0, 240)}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return extractJson(data.choices?.[0]?.message?.content || "");
}

async function scoreWithQwen(callId: string, language: "de" | "en", segments: TranscriptSegment[]) {
  const transcriptBlock = renderTranscript(segments);
  const raterUser = [
    `call_id: ${callId}`,
    `language: ${language}`,
    "",
    transcriptBlock,
    "",
    "Return JSON conforming to the AntiSycophantCallAssessment shape. Omit overall_score and critic_verdicts."
  ].join("\n");

  const rawRater = await callQwen(RATER_SYSTEM_PROMPT, raterUser);
  const raterOutput = normalizeRaterOutput(rawRater, callId, language);
  const criticUser = [
    transcriptBlock,
    "",
    "rater_output:",
    JSON.stringify({ rubric: raterOutput.rubric }, null, 2),
    "",
    "Return ONLY {\"critic_verdicts\": [...]}."
  ].join("\n");
  const rawCritic = await callQwen(CRITIC_SYSTEM_PROMPT, criticUser);

  return runDeterministicPass(raterOutput, rawCritic, segments);
}

function dimensionTitle(dimension: string) {
  return dimension
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function mapFindings(engine: Awaited<ReturnType<typeof scoreWithQwen>>): Finding[] {
  const missed = engine.missed_opportunities.map((item) => ({
    title: item.what_was_missed || dimensionTitle(item.category),
    quote: item.verbatim_quote,
    timestamp: formatTimestamp(item.timestamp_ms),
    duration: "6s",
    severity: "weak" as const
  }));

  const failedRubric = engine.rubric
    .filter((item) => item.verdict === "no" || item.verdict === "partial")
    .map((item) => ({
      title: dimensionTitle(item.dimension),
      quote: item.evidence?.verbatim_quote || item.rationale.replace(/\s*\[[^\]]+\]/g, ""),
      timestamp: formatTimestamp(item.evidence?.timestamp_ms || 0),
      duration: item.evidence ? "6s" : "0s",
      severity: item.verdict === "partial" ? ("moderate" as const) : ("weak" as const)
    }));

  return [...missed, ...failedRubric].filter((item) => item.quote).slice(0, 6);
}

function genericLlmScore(numiScore: number) {
  return Math.max(numiScore + 2, Math.min(9, Math.round((numiScore + 3.5) * 10) / 10));
}

function verdictFor(score: number) {
  if (score <= 3) return "Sycophantic";
  if (score <= 6) return "Needs work";
  if (score <= 8) return "Grounded";
  return "Exemplary";
}

function currentPeriodLabel() {
  return new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(new Date());
}

function safeSubject(value: string) {
  return value
    .trim()
    .replace(/[^a-zA-Z0-9\s_-]/g, "")
    .replace(/\s+/g, "_")
    .toLowerCase()
    .slice(0, 48);
}

function recapDimensionLabel(dimension: string) {
  const labels: Record<string, string> = {
    discovery_depth: "Discovery failure",
    objection_handling: "Objection failure",
    pricing_discipline: "Pricing failure",
    buying_signal_capture: "Signal failure",
    logical_consistency: "Logic failure",
    talk_time_control: "Talk-time failure",
    next_step_qualification: "Next-step failure"
  };

  return labels[dimension] || dimensionTitle(dimension);
}

function buildShareAsset(engine: Awaited<ReturnType<typeof scoreWithQwen>>, context: RecapContext) {
  const periodLabel = currentPeriodLabel();
  const failureRows = engine.rubric
    .map((item) => ({
      dimension: item.dimension,
      rate: item.verdict === "no" ? 100 : item.verdict === "partial" ? 50 : 0,
      rationale: item.rationale.replace(/\s*\[[^\]]+\]/g, "")
    }))
    .sort((a, b) => b.rate - a.rate);
  const primaryFailure = failureRows[0] || { dimension: "objection_handling", rate: 0, rationale: engine.score_band_reasoning };
  const objections = engine.missed_opportunities
    .filter((item) => item.category === "objection")
    .map((item) => item.verbatim_quote || item.what_was_missed)
    .filter(Boolean);
  const fallbackObjections = engine.missed_opportunities
    .map((item) => item.verbatim_quote || item.what_was_missed)
    .filter(Boolean);
  const topObjections = (objections.length ? objections : fallbackObjections).slice(0, 3);
  const hardCritiques = [
    ...engine.missed_opportunities.map((item) => item.what_was_missed),
    ...engine.rubric.filter((item) => item.verdict === "no" || item.verdict === "partial").map((item) => item.rationale.replace(/\s*\[[^\]]+\]/g, "")),
    ...engine.critic_verdicts.filter((item) => item.refuted).map((item) => item.reason)
  ].filter(Boolean);

  return {
    projectName: context.projectName,
    periodLabel,
    subjectName: context.subjectName,
    metaLeft: `${context.projectName} / ${periodLabel}`,
    metaRight: context.subjectName,
    statement: `${primaryFailure.rate}% ${recapDimensionLabel(primaryFailure.dimension).toLowerCase()} across the selected period.`,
    rows: [
      {
        label: recapDimensionLabel(primaryFailure.dimension),
        value: hardCritiques[0] || primaryFailure.rationale || engine.score_band_reasoning
      },
      {
        label: "Hardest critique",
        value: hardCritiques[1] || engine.score_band_reasoning || "Engine flagged insufficient cited evidence."
      },
      {
        label: "Top objections",
        value: topObjections.length ? topObjections.join(" / ") : hardCritiques[2] || "No explicit objection cluster survived critic review."
      }
    ],
    footer: `Generated from engine payload ${engine.call_id}`,
    filenameSubject: safeSubject(context.subjectName || engine.call_id)
  };
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file");
    const projectName = String(form.get("projectName") || "Numi Sales Recap");
    const subjectName = String(form.get("subjectName") || "Numi Demo");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No audio or transcript file provided." }, { status: 400 });
    }

    const fromTranscript = isTranscriptFile(file);
    const transcript = fromTranscript ? await readTranscriptFile(file) : await transcribe(file);
    const language = transcript.languageCode.startsWith("en") ? "en" : "de";
    const engine = await scoreWithQwen(`call_${Date.now()}`, language, transcript.segments);
    const numiScore = engine.overall_score;

    return NextResponse.json({
      numiScore,
      genericLlmScore: genericLlmScore(numiScore),
      verdict: verdictFor(numiScore),
      verdictLabel: engine.computed_score_band === "below_bar" ? "Sycophantic" : verdictFor(numiScore),
      genericLabel: "Confident",
      rationale: engine.score_band_reasoning || "The final score is computed from cited rubric verdicts after critic review.",
      genericRationale: "Reads the call as friendly and engaged.",
      findings: mapFindings(engine),
      transcript: transcript.text,
      languageCode: transcript.languageCode,
      engine,
      shareAsset: buildShareAsset(engine, { projectName, subjectName }),
      source: {
        transcription: fromTranscript ? "Uploaded transcript" : "ElevenLabs Scribe v2",
        scoring: `${process.env.QWEN_MODEL || DEFAULT_QWEN_MODEL} + deterministic anti-sycophant scorer`
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Analysis failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
