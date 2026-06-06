"use client";

import { ChangeEvent, DragEvent, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  Check,
  FileAudio,
  FileText,
  Mic,
  Plus,
  RefreshCcw,
  Save,
  Sparkles,
  Target,
  Upload,
  X
} from "lucide-react";
import { DashboardShell, NavView } from "../../components/layout/DashboardShell";
import { BentoCard } from "../../components/layout/BentoCard";
import { BentoGrid } from "../../components/layout/BentoGrid";
import { KpiCard } from "../../components/ui/KpiCard";
import { ScoreBadge } from "../../components/ui/ScoreBadge";
import { SalesRecapExportAsset, SalesRecapExportPayload } from "../../components/SalesRecapExportAsset";

type Finding = {
  title: string;
  quote: string;
  timestamp: string;
  duration: string;
  severity: "weak" | "moderate";
};

type CallRecord = {
  id: string;
  rep: string;
  repId: "anna" | "ben" | "clara" | "demo";
  date: string;
  duration: string;
  numiScore: number | null;
  status: "analyzed" | "pending" | "failed";
  transcript: string;
};

const mockCalls: CallRecord[] = [
  {
    id: "c001", rep: "Anna Müller", repId: "anna", date: "2026-06-05", duration: "32 min",
    numiScore: 8.1, status: "analyzed",
    transcript: `[00:01] rep: Guten Tag Herr Schmidt, danke dass Sie sich Zeit nehmen.\n[00:15] prospect: Kein Problem, ich habe aber nur 20 Minuten.\n[00:18] rep: Verstehe. Darf ich direkt fragen — was hat Sie dazu bewogen, diesen Termin anzunehmen?\n[01:02] prospect: Wir haben intern diskutiert ob wir unsere Analyse-Prozesse automatisieren sollen.\n[01:15] rep: Welche Prozesse konkret? Geht es mehr um Reporting oder um operative Entscheidungen?\n[02:00] prospect: Hauptsächlich Reporting, aber wenn das gut funktioniert, auch Entscheidungen.\n[02:20] rep: Wie lange dauert ein typischer Reporting-Zyklus bei Ihnen heute?\n[03:10] prospect: Ungefähr drei Tage manuell.\n[03:15] rep: Drei Tage — und wie oft kommt es vor, dass eine Entscheidung auf diesen Report wartet?\n[04:00] prospect: Öfter als mir lieb ist. Letzte Woche zweimal.`
  },
  {
    id: "c002", rep: "Ben Richter", repId: "ben", date: "2026-06-04", duration: "18 min",
    numiScore: 5.4, status: "analyzed",
    transcript: `[00:01] rep: Hallo! Super dass wir uns sprechen können, ich freue mich wirklich darauf.\n[00:20] prospect: Mhm. Was genau wollten Sie mir zeigen?\n[00:28] rep: Also wir haben ein tolles Produkt das wirklich vielen Unternehmen geholfen hat...\n[01:45] prospect: Ja aber was kostet das?\n[01:50] rep: Das ist sehr flexibel, wir finden sicher etwas Passendes für Sie.\n[02:10] prospect: Können Sie mir eine Zahl nennen?\n[02:15] rep: Das hängt sehr von Ihren Anforderungen ab. Was ist denn Ihr Budget?\n[03:00] prospect: Ich frage Sie.\n[03:05] rep: Wir starten bei etwa 800€ monatlich, aber da gibt es viele Möglichkeiten nach oben und unten.`
  },
  {
    id: "c003", rep: "Clara Bauer", repId: "clara", date: "2026-06-03", duration: "41 min",
    numiScore: 7.3, status: "analyzed",
    transcript: `[00:01] rep: Frau Hoffmann, ich habe mir Ihre letzten Quartalszahlen angesehen — Ihr Wachstum ist beeindruckend.\n[00:30] prospect: Danke. Wir wachsen schnell, das bringt aber auch Probleme mit sich.\n[00:38] rep: Welche Probleme sehen Sie konkret?\n[01:10] prospect: Die Onboarding-Zeit für neue Reps. Aktuell sechs Monate bis zur vollen Produktivität.\n[01:20] rep: Sechs Monate — was ist der teuerste Teil davon?\n[02:00] prospect: Wahrscheinlich die ersten drei, wenn sie noch nichts abschließen aber trotzdem kosten.\n[02:15] rep: Wenn Sie diese drei Monate auf sechs Wochen verkürzen könnten, was wäre das wert?\n[03:00] prospect: Das würde uns pro Rep etwa 40.000€ sparen.\n[03:10] rep: Dann sollten wir genau dort anfangen.`
  },
  {
    id: "c004", rep: "Demo Rep", repId: "demo", date: "2026-06-02", duration: "27 min",
    numiScore: null, status: "pending",
    transcript: ""
  },
  {
    id: "c005", rep: "Anna Müller", repId: "anna", date: "2026-06-01", duration: "14 min",
    numiScore: 6.2, status: "analyzed",
    transcript: `[00:01] rep: Guten Tag, haben Sie kurz Zeit?\n[00:10] prospect: Was geht es um?\n[00:12] rep: Wir bieten eine Lösung für Ihr Vertriebsteam an.\n[00:45] prospect: Was genau?\n[00:50] rep: Call-Analyse und Coaching-Unterstützung für Sales-Teams.\n[01:20] prospect: Wir haben schon etwas ähnliches.\n[01:25] rep: Ah, was nutzen Sie aktuell?\n[02:00] prospect: Gong.\n[02:05] rep: Okay, und was fehlt Ihnen bei Gong?\n[02:30] prospect: Eigentlich nichts Gravierendes.`
  },
  {
    id: "c006", rep: "Ben Richter", repId: "ben", date: "2026-05-31", duration: "22 min",
    numiScore: null, status: "failed",
    transcript: ""
  },
];

type Analysis = {
  numiScore: number;
  genericLlmScore: number;
  verdict: string;
  verdictLabel: string;
  genericLabel: string;
  rationale: string;
  genericRationale: string;
  findings: Finding[];
  transcript: string;
  languageCode: string;
  shareAsset: SalesRecapExportPayload;
  source: {
    transcription: string;
    scoring: string;
  };
};

type DashboardRole = "manager" | "rep";

type Team = {
  id: number;
  name: string;
  reps: number;
  target: number;
  score: number;
  calls: number;
  trend: number[];
};

const analyzeLogs = [
  "[input]       audio or transcript .......................... done",
  "[anchor]      verbatim quotes .............................. found",
  "[critic]      adversarial review ........................... done",
  "[score]       compute anti-sycophant index ................. done"
];

const repTrend = [5.8, 6.2, 6.4, 6.9, 7.3, 7.1, 7.8, 8.1];

const initialTeams: Team[] = [
  { id: 1, name: "DACH Mid-Market", reps: 6, target: 78, score: 7.6, calls: 84, trend: [6.2, 6.6, 6.9, 7.1, 7.4, 7.6] },
  { id: 2, name: "Enterprise West", reps: 4, target: 65, score: 8.2, calls: 57, trend: [7.5, 7.4, 7.8, 8.0, 8.1, 8.2] },
  { id: 3, name: "SMB Growth", reps: 8, target: 92, score: 6.9, calls: 126, trend: [6.8, 6.5, 6.7, 6.8, 7.0, 6.9] }
];

function formatBytes(bytes: number) {
  if (!bytes) return "0 MB";
  const mb = bytes / 1024 / 1024;
  return `${mb.toFixed(mb >= 10 ? 0 : 1)} MB`;
}

function verdictColor(score: number) {
  if (score >= 7.5) return "text-emerald-700 bg-emerald-50 ring-emerald-200";
  if (score >= 5) return "text-amber-700 bg-amber-50 ring-amber-200";
  return "text-red-700 bg-red-50 ring-red-200";
}

function average(values: number[]) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function currentPeriodLabel() {
  return new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(new Date());
}

function MetricChart({ values, tone = "blue" }: { values: number[]; tone?: "blue" | "emerald" | "amber" }) {
  const width = 520;
  const height = 190;
  const min = Math.min(...values) - 0.4;
  const max = Math.max(...values) + 0.4;
  const range = Math.max(max - min, 1);
  const stroke = tone === "emerald" ? "#059669" : tone === "amber" ? "#d97706" : "#2563eb";
  const fill = tone === "emerald" ? "#ecfdf5" : tone === "amber" ? "#fffbeb" : "#eff6ff";
  const points = values.map((value, index) => {
    const x = (index / Math.max(values.length - 1, 1)) * width;
    const y = height - ((value - min) / range) * height;
    return { x, y, value };
  });
  const line = points.map((point) => `${point.x},${point.y}`).join(" ");
  const area = `0,${height} ${line} ${width},${height}`;

  return (
    <div className="h-56 w-full rounded-lg border border-gray-200 bg-white p-4">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full overflow-visible" role="img" aria-label="Performance graph">
        <polygon points={area} fill={fill} />
        {[0, 1, 2].map((lineIndex) => (
          <line
            key={lineIndex}
            x1="0"
            x2={width}
            y1={(height / 2) * lineIndex}
            y2={(height / 2) * lineIndex}
            stroke="#e5e7eb"
            strokeWidth="1"
          />
        ))}
        <polyline points={line} fill="none" stroke={stroke} strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />
        {points.map((point, index) => (
          <circle key={index} cx={point.x} cy={point.y} r="5" fill="#ffffff" stroke={stroke} strokeWidth="3" />
        ))}
      </svg>
    </div>
  );
}

const SKILL_LINES = [
  { key: "objection", label: "Objection control", color: "#059669", data: [58, 62, 65, 68, 71, 71] },
  { key: "pricing",   label: "Pricing discipline", color: "#2563eb", data: [55, 57, 60, 61, 63, 64] },
  { key: "signals",   label: "Buying signals",    color: "#7c3aed", data: [72, 74, 77, 80, 81, 82] },
  { key: "nextstep",  label: "Next-step quality", color: "#d97706", data: [66, 68, 70, 74, 77, 78] },
];

function MultiLineChart() {
  const width = 520;
  const height = 200;
  const allValues = SKILL_LINES.flatMap((l) => l.data);
  const min = Math.min(...allValues) - 5;
  const max = Math.max(...allValues) + 5;
  const range = max - min;
  const steps = SKILL_LINES[0].data.length;

  function toPoint(value: number, index: number) {
    const x = (index / (steps - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return { x, y };
  }

  return (
    <div className="h-56 w-full rounded-lg border border-gray-200 bg-white p-4">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full overflow-visible">
        {[0, 1, 2, 3].map((i) => (
          <line key={i} x1="0" x2={width} y1={(height / 3) * i} y2={(height / 3) * i} stroke="#f3f4f6" strokeWidth="1" />
        ))}
        {SKILL_LINES.map((line) => {
          const pts = line.data.map((v, i) => toPoint(v, i));
          const d = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
          return (
            <g key={line.key}>
              <path d={d} fill="none" stroke={line.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              {pts.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="#fff" stroke={line.color} strokeWidth="2" />
              ))}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function BarGraph({ teams }: { teams: Team[] }) {
  const maxCalls = Math.max(...teams.map((team) => team.calls), 1);

  return (
    <div className="space-y-4">
      {teams.map((team) => (
        <div key={team.id}>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="font-medium text-gray-700">{team.name}</span>
            <span className="font-mono text-gray-500">{team.calls} calls</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-gray-100">
            <div className="h-full rounded-full bg-blue-600" style={{ width: `${(team.calls / maxCalls) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function ScorePanel({
  label,
  score,
  badge,
  rationale,
  selected
}: {
  label: string;
  score: number;
  badge: string;
  rationale: string;
  selected?: boolean;
}) {
  return (
    <div className={`rounded-xl border bg-white p-5 ${selected ? "border-blue-200 ring-1 ring-blue-100" : "border-gray-200"}`}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">{label}</p>
          <p className="mt-1 text-sm text-gray-500">{selected ? "Engine verdict" : "Baseline verdict"}</p>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${verdictColor(score)}`}>{badge}</span>
      </div>
      <div className="flex items-end gap-2">
        <p className="font-mono text-5xl font-semibold leading-none tracking-tight text-gray-900 tabular">
          {score.toFixed(score % 1 ? 1 : 0)}
        </p>
        <p className="pb-1 font-mono text-xl font-medium text-gray-400">/10</p>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-gray-600">{rationale}</p>
    </div>
  );
}

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string; description?: string }) {
  return (
    <div className="mb-6">
      <p className="text-xs font-medium uppercase tracking-wider text-gray-400">{eyebrow}</p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight text-gray-900">{title}</h1>
    </div>
  );
}

export default function Home() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [role, setRole] = useState<DashboardRole>("manager");
  const [activeNav, setActiveNav] = useState<NavView>("dashboard");
  const [teams, setTeams] = useState<Team[]>(initialTeams);
  const [teamName, setTeamName] = useState("");
  const [teamReps, setTeamReps] = useState("5");
  const [teamTarget, setTeamTarget] = useState("70");
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showWrapped, setShowWrapped] = useState(false);
  const [transcriptCall, setTranscriptCall] = useState<CallRecord | null>(null);

  const fileMeta = useMemo(() => {
    if (!file) return "";
    return `${formatBytes(file.size)} - ${file.type || "audio file"}`;
  }, [file]);

  const isTranscript = useMemo(() => {
    if (!file) return false;
    const name = file.name.toLowerCase();
    return [".txt", ".md", ".json", ".vtt", ".srt"].some((extension) => name.endsWith(extension)) || file.type.startsWith("text/");
  }, [file]);

  const teamAverage = average(teams.map((team) => team.score));
  const totalCalls = teams.reduce((sum, team) => sum + team.calls, 0);
  const totalReps = teams.reduce((sum, team) => sum + team.reps, 0);
  const activeSubjectName = role === "manager" ? teams[0]?.name || "Team" : "Sales Rep";
  const dashboardShareAsset = useMemo<SalesRecapExportPayload>(() => {
    const periodLabel = currentPeriodLabel();
    const weakestTeam = [...teams].sort((a, b) => a.score - b.score)[0] || teams[0];
    const strongestVolumeTeam = [...teams].sort((a, b) => b.calls - a.calls)[0] || teams[0];
    const targetGap = weakestTeam ? Math.max(0, 100 - Math.round((weakestTeam.calls / weakestTeam.target) * 100)) : 0;
    const subjectName = weakestTeam?.name || "Team";

    return {
      projectName: "Numi Sales Recap",
      periodLabel,
      subjectName,
      metaLeft: `Numi Sales Recap / ${periodLabel}`,
      metaRight: subjectName,
      statement: `${targetGap}% target gap on the lowest-scoring team this period.`,
      rows: [
        {
          label: "Weakest team",
          value: `${subjectName} is at ${weakestTeam?.score.toFixed(1) || "0.0"}/10 across ${weakestTeam?.calls || 0} reviewed calls.`
        },
        {
          label: "Hardest critique",
          value: `The team score is below the workspace average of ${teamAverage.toFixed(1)}/10 and needs tighter coaching focus.`
        },
        {
          label: "Top pressure",
          value: `${strongestVolumeTeam?.name || "Team"} carries the highest reviewed-call volume with ${strongestVolumeTeam?.calls || 0} calls.`
        }
      ],
      footer: `Generated from dashboard team payload / ${teams.length} teams`,
      filenameSubject: subjectName.toLowerCase().replace(/[^a-z0-9]+/g, "_")
    };
  }, [teamAverage, teams]);

  function changeRole(nextRole: DashboardRole) {
    setRole(nextRole);
    setActiveNav(nextRole === "manager" ? "dashboard" : "calls");
  }

  function chooseFile(nextFile?: File) {
    if (!nextFile) return;
    setFile(nextFile);
    setAnalysis(null);
    setError(null);
  }

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    chooseFile(event.target.files?.[0]);
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    chooseFile(event.dataTransfer.files?.[0]);
  }

  function resetFile() {
    setFile(null);
    setError(null);
    setAnalysis(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  function addTeam() {
    const cleanName = teamName.trim();
    if (!cleanName) return;

    setTeams((current) => [
      ...current,
      {
        id: Date.now(),
        name: cleanName,
        reps: Math.max(Number(teamReps) || 1, 1),
        target: Math.max(Number(teamTarget) || 1, 1),
        score: 6.5,
        calls: 0,
        trend: [5.9, 6.0, 6.2, 6.4, 6.5, 6.5]
      }
    ]);
    setTeamName("");
  }

  async function analyze() {
    if (!file) return;

    setLoading(true);
    setAnalysisProgress(8);
    setError(null);
    setAnalysis(null);

    const progressTimer = window.setInterval(() => {
      setAnalysisProgress((current) => {
        if (current >= 88) return current;
        return Math.min(88, current + (current < 45 ? 9 : 4));
      });
    }, 450);

    const form = new FormData();
    form.append("file", file);
    form.append("projectName", "Numi Sales Recap");
    form.append("subjectName", activeSubjectName);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: form
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Analysis failed.");
      }

      setAnalysisProgress(100);
      setAnalysis(payload as Analysis);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Analysis failed.");
    } finally {
      window.clearInterval(progressTimer);
      window.setTimeout(() => {
        setLoading(false);
        setAnalysisProgress(0);
      }, 350);
    }
  }

  function renderUploadCard() {
    const manager = role === "manager";

    return (
      <BentoCard colSpan={8} className="min-h-[360px]">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Call analysis</p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight text-gray-900">
              {manager ? "Analyze a team sales call" : "Analyze my sales call"}
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              {manager ? "Manager view ranks risk and coaching moments across the call." : "Rep view focuses on specific moments to fix before the next call."}
            </p>
          </div>
          <ScoreBadge score={file ? 1 : 0} size="sm" />
        </div>

        <div
          className={`flex min-h-[230px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-6 py-10 text-center transition-colors ${
            dragging
              ? "border-blue-400 bg-blue-50"
              : file
                ? "border-gray-200 bg-gray-50"
                : "border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-white"
          }`}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => {
            if (!file) inputRef.current?.click();
          }}
          onKeyDown={(event) => {
            if ((event.key === "Enter" || event.key === " ") && !file) {
              event.preventDefault();
              inputRef.current?.click();
            }
          }}
          role="button"
          tabIndex={0}
        >
          {!file ? (
            <>
              <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white text-gray-400 ring-1 ring-gray-200">
                <Mic size={20} strokeWidth={1.7} />
              </span>
              <p className="text-sm font-medium text-gray-900">Drop audio or transcript here</p>
              <p className="mt-1 text-xs text-gray-500">MP3, WAV, M4A, TXT, MD, JSON, VTT, or SRT</p>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  inputRef.current?.click();
                }}
                className="mt-5 inline-flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700"
              >
                <Upload size={15} />
                Choose file
              </button>
            </>
          ) : (
            <span className="flex w-full items-center justify-between gap-4 rounded-lg border border-gray-200 bg-white p-4 text-left">
              <span className="flex min-w-0 items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                  {isTranscript ? <FileText size={18} /> : <FileAudio size={18} />}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-gray-900">{file.name}</span>
                  <span className="text-xs text-gray-500">{fileMeta}</span>
                </span>
              </span>
              <button
                className="flex shrink-0 items-center gap-1.5 text-xs text-gray-400 transition-colors hover:text-gray-900"
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  resetFile();
                }}
              >
                <X size={13} />
                Remove
              </button>
            </span>
          )}
          <input
            ref={inputRef}
            className="hidden"
            type="file"
            accept="audio/*,.mp3,.wav,.m4a,.mp4,.aac,.ogg,.oga,.webm,.flac,.txt,.md,.json,.vtt,.srt,text/plain,text/markdown,application/json"
            onChange={onFileChange}
          />
        </div>

        <div className="mt-5 flex items-center justify-end gap-4">
          <button
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
            type="button"
            disabled={!file || loading}
            onClick={analyze}
          >
            <Sparkles size={15} />
            {loading ? "Analyzing" : "Analyze call"}
          </button>
        </div>
      </BentoCard>
    );
  }

  function renderAnalysis() {
    if (!analysis) return null;

    return (
      <div className="space-y-4">
        <BentoGrid>
          <KpiCard title="Numi score" value={`${analysis.numiScore}/10`} subtitle={analysis.verdictLabel} colSpan={4} />
          <KpiCard title="Generic LLM" value={`${analysis.genericLlmScore}/10`} subtitle={analysis.genericLabel} colSpan={4} />
          <KpiCard title="Flags" value={analysis.findings.length} subtitle={role === "manager" ? "Coaching moments" : "Fix before next call"} colSpan={4} />
        </BentoGrid>

        <BentoCard colSpan={12}>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400">A/B comparison</p>
              <h2 className="mt-1 text-lg font-semibold tracking-tight text-gray-900">Baseline vs Numi</h2>
            </div>
            <button
              className="inline-flex items-center gap-2 rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:text-gray-900"
              type="button"
              onClick={() => setAnalysis(null)}
            >
              <RefreshCcw size={13} />
              New call
            </button>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <ScorePanel label="Generic LLM" score={analysis.genericLlmScore} badge={analysis.genericLabel} rationale={analysis.genericRationale} />
            <ScorePanel label="Numi" score={analysis.numiScore} badge={analysis.verdictLabel} rationale={analysis.rationale} selected />
          </div>
        </BentoCard>

        <BentoGrid>
          <BentoCard colSpan={8}>
            <div className="mb-4">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Findings</p>
              <h2 className="mt-1 text-lg font-semibold tracking-tight text-gray-900">What our engine caught</h2>
            </div>
            <div className="space-y-2">
              {analysis.findings.map((finding, index) => (
                <article key={`${finding.timestamp}-${index}`} className="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3.5">
                  <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${finding.severity === "moderate" ? "bg-amber-100" : "bg-red-100"}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${finding.severity === "moderate" ? "bg-amber-500" : "bg-red-500"}`} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">{finding.title}</p>
                    <p className="mt-1 font-mono text-[13px] italic leading-relaxed text-gray-600">&quot;{finding.quote}&quot;</p>
                    <p className="mt-1.5 text-xs font-medium text-gray-400 tabular">
                      {finding.timestamp} - {finding.duration}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </BentoCard>

          <BentoCard colSpan={4}>
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">{role === "manager" ? "Team source" : "My source"}</p>
            <dl className="mt-4 space-y-3">
              <div>
                <dt className="text-xs text-gray-400">Transcription</dt>
                <dd className="mt-1 text-sm font-medium text-gray-800">{analysis.source.transcription}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Scoring</dt>
                <dd className="mt-1 text-sm font-medium text-gray-800">{analysis.source.scoring}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Language</dt>
                <dd className="mt-1 text-sm font-medium text-gray-800">{analysis.languageCode}</dd>
              </div>
            </dl>
          </BentoCard>
        </BentoGrid>

      </div>
    );
  }

  function renderManagerDashboard() {
    return (
      <>
        <SectionHeader eyebrow="Manager dashboard" title="Team performance" description="Track team quality, call volume, and coaching pressure from one view." />
        <BentoGrid>
          <KpiCard title="Avg Numi score" value={teamAverage.toFixed(1)} subtitle="Across all active teams" colSpan={3} />
          <KpiCard title="Teams" value={teams.length} subtitle={`${totalReps} active reps`} colSpan={3} />
          <KpiCard title="Reviewed calls" value={totalCalls} subtitle="This month" colSpan={3} />
          <KpiCard title="Target attainment" value={`${Math.round(average(teams.map((team) => (team.calls / team.target) * 100)))}%`} subtitle="Blended call target" colSpan={3} />
        </BentoGrid>
        <BentoGrid className="mt-4">
          <BentoCard colSpan={8}>
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Score graph</p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight text-gray-900">Average team score trend</h2>
            <div className="mt-4">
              <MetricChart values={[6.8, 7.0, 7.1, 7.2, 7.5, teamAverage]} tone="blue" />
            </div>
          </BentoCard>
          <BentoCard colSpan={4}>
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Volume graph</p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight text-gray-900">Calls by team</h2>
            <div className="mt-6">
              <BarGraph teams={teams} />
            </div>
          </BentoCard>
        </BentoGrid>
      </>
    );
  }

  function renderTeamView() {
    return (
      <>
        <SectionHeader eyebrow="Team management" title="Create and monitor teams" description="Managers can add teams and compare performance in numbers and charts." />
        <BentoGrid>
          <BentoCard colSpan={4}>
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">New team</p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight text-gray-900">Add sales team</h2>
            <div className="mt-5 space-y-3">
              <label className="block">
                <span className="text-xs font-medium text-gray-500">Team name</span>
                <input
                  value={teamName}
                  onChange={(event) => setTeamName(event.target.value)}
                  className="mt-1 h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-900"
                  placeholder="e.g. Enterprise North"
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-gray-500">Reps</span>
                <input
                  value={teamReps}
                  onChange={(event) => setTeamReps(event.target.value)}
                  type="number"
                  min="1"
                  className="mt-1 h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-900"
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-gray-500">Monthly call target</span>
                <input
                  value={teamTarget}
                  onChange={(event) => setTeamTarget(event.target.value)}
                  type="number"
                  min="1"
                  className="mt-1 h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-900"
                />
              </label>
              <button
                type="button"
                onClick={addTeam}
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-gray-900 px-4 text-sm font-medium text-white transition-colors hover:bg-gray-700"
              >
                <Plus size={15} />
                Create team
              </button>
            </div>
          </BentoCard>

          <BentoCard colSpan={8}>
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Teams</p>
            <div className="mt-4 overflow-hidden rounded-lg border border-gray-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-400">
                  <tr>
                    <th className="px-4 py-3 font-medium">Team</th>
                    <th className="px-4 py-3 font-medium">Reps</th>
                    <th className="px-4 py-3 font-medium">Calls</th>
                    <th className="px-4 py-3 font-medium">Score</th>
                    <th className="px-4 py-3 font-medium">Target</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {teams.map((team) => (
                    <tr key={team.id} className="bg-white">
                      <td className="px-4 py-3 font-medium text-gray-900">{team.name}</td>
                      <td className="px-4 py-3 font-mono text-gray-600">{team.reps}</td>
                      <td className="px-4 py-3 font-mono text-gray-600">{team.calls}</td>
                      <td className="px-4 py-3 font-mono text-gray-900">{team.score.toFixed(1)}</td>
                      <td className="px-4 py-3 text-gray-600">{Math.round((team.calls / team.target) * 100)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </BentoCard>
        </BentoGrid>
        <BentoGrid className="mt-4">
          {teams.map((team) => (
            <BentoCard key={team.id} colSpan={4}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-400">{team.reps} reps</p>
                  <h3 className="mt-1 text-base font-semibold text-gray-900">{team.name}</h3>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${verdictColor(team.score)}`}>
                  {team.score.toFixed(1)}/10
                </span>
              </div>
              <div className="mt-4">
                <MetricChart values={team.trend} tone={team.score >= 7.5 ? "emerald" : "amber"} />
              </div>
            </BentoCard>
          ))}
        </BentoGrid>
      </>
    );
  }

  function renderCallsView() {
    if (analysis) return renderAnalysis();

    const isManager = role === "manager";
    const visibleCalls = isManager
      ? mockCalls
      : mockCalls.filter((c) => c.repId === "demo");

    function statusBadge(call: CallRecord) {
      if (call.status === "analyzed" && call.numiScore !== null) {
        const color = call.numiScore >= 7.5
          ? "text-emerald-700 bg-emerald-50 ring-emerald-200"
          : call.numiScore >= 5
            ? "text-amber-700 bg-amber-50 ring-amber-200"
            : "text-red-700 bg-red-50 ring-red-200";
        return (
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${color}`}>
            {call.numiScore.toFixed(1)}
          </span>
        );
      }
      if (call.status === "pending") {
        return <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500 ring-1 ring-gray-200">Pending</span>;
      }
      return <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-500 ring-1 ring-red-200">Failed</span>;
    }

    return (
      <>
        <SectionHeader
          eyebrow={isManager ? "All calls" : "My calls"}
          title={isManager ? "All team calls" : "My calls"}
        />

        {/* Call list */}
        <BentoCard colSpan={12}>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
              {visibleCalls.length} calls
            </p>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-gray-700"
            >
              <Upload size={12} />
              Analyze new call
            </button>
          </div>
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-400">
                <tr>
                  {isManager && <th className="px-4 py-3 font-medium">Rep</th>}
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Duration</th>
                  <th className="px-4 py-3 font-medium">Score</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {visibleCalls.map((call) => (
                  <tr key={call.id} className="bg-white hover:bg-gray-50">
                    {isManager && (
                      <td className="px-4 py-3 font-medium text-gray-900">{call.rep}</td>
                    )}
                    <td className="px-4 py-3 text-gray-600">{call.date}</td>
                    <td className="px-4 py-3 font-mono text-gray-600">{call.duration}</td>
                    <td className="px-4 py-3">{statusBadge(call)}</td>
                    <td className="px-4 py-3 text-right">
                      {call.transcript ? (
                        <button
                          type="button"
                          onClick={() => setTranscriptCall(call)}
                          className="text-xs font-medium text-blue-600 hover:text-blue-800"
                        >
                          Transcript
                        </button>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </BentoCard>

        {/* Hidden upload + pipeline for "Analyze new call" flow */}
        <div className="mt-4">
          <BentoGrid>
            {renderUploadCard()}
            <BentoCard colSpan={4}>
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Pipeline</p>
              {loading ? (
                <div className="mt-4" aria-label="Analysis progress">
                  <div className="mb-2 flex items-center justify-between font-mono text-[11px] uppercase text-gray-500">
                    <span>Analyzing call</span>
                    <span>{analysisProgress}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                    <div className="h-full rounded-full bg-blue-600 transition-all duration-500 ease-out" style={{ width: `${analysisProgress}%` }} />
                  </div>
                </div>
              ) : null}
              <div className="mt-4 space-y-3">
                {["Read file", "Extract cited evidence", "Critic review", "Compute score"].map((step, index) => (
                  <div key={step} className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-gray-500 ring-1 ring-gray-200">
                      {loading && index === 3 ? <RefreshCcw size={12} /> : <Check size={12} />}
                    </span>
                    <span className="text-sm text-gray-700">{step}</span>
                  </div>
                ))}
              </div>
              {loading ? (
                <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-3 font-mono text-[12px] leading-relaxed text-gray-500" role="log" aria-live="polite">
                  {analyzeLogs.map((line) => <p key={line}>{line}</p>)}
                </div>
              ) : null}
              {error ? (
                <div className="mt-6 flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <p>{error}</p>
                </div>
              ) : null}
            </BentoCard>
          </BentoGrid>
        </div>

</>
    );
  }

  function renderRepPerformance() {
    const weaknesses = SKILL_LINES.filter((l) => l.data[l.data.length - 1] < 70);

    return (
      <>
        <SectionHeader eyebrow="My performance" title="Your sales scorecard" />
        <BentoGrid>
          <KpiCard title="Total calls" value="23" subtitle="All time" colSpan={4} />
          <KpiCard title="Calls this week" value="5" subtitle="↑ 2 vs last week" colSpan={4} />
          <KpiCard title="Avg score" value="74" subtitle="out of 100" colSpan={4} />
        </BentoGrid>

        <BentoGrid className="mt-4">
          <BentoCard colSpan={8}>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Score trend</p>
                <h2 className="mt-1 text-lg font-semibold tracking-tight text-gray-900">Skill development over time</h2>
              </div>
              <div className="flex flex-wrap gap-3">
                {SKILL_LINES.map((l) => (
                  <span key={l.key} className="flex items-center gap-1.5 text-xs text-gray-500">
                    <span className="h-2 w-2 rounded-full" style={{ background: l.color }} />
                    {l.label}
                  </span>
                ))}
              </div>
            </div>
            <MultiLineChart />
          </BentoCard>

          <BentoCard colSpan={4}>
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Skill breakdown</p>
            <div className="mt-5 space-y-4">
              {SKILL_LINES.map((l) => {
                const value = l.data[l.data.length - 1];
                return (
                  <div key={l.key}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-medium text-gray-700">{l.label}</span>
                      <span className="font-mono text-gray-500">{value}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                      <div className="h-full rounded-full transition-all" style={{ width: `${value}%`, background: l.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </BentoCard>
        </BentoGrid>

        {weaknesses.length > 0 && (
          <BentoGrid className="mt-4">
            <BentoCard colSpan={12}>
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Weaknesses</p>
              <h2 className="mt-1 text-lg font-semibold tracking-tight text-gray-900">Focus areas</h2>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {weaknesses.map((l) => {
                  const value = l.data[l.data.length - 1];
                  const delta = value - l.data[0];
                  return (
                    <div key={l.key} className="rounded-xl border border-red-100 bg-red-50 p-4">
                      <p className="text-sm font-semibold text-gray-900">{l.label}</p>
                      <p className="mt-1 font-mono text-3xl font-semibold text-red-600">{value}%</p>
                      <p className="mt-1 text-xs text-gray-500">
                        {delta >= 0 ? `+${delta}` : delta} pts over 6 months · below 70% threshold
                      </p>
                    </div>
                  );
                })}
              </div>
            </BentoCard>
          </BentoGrid>
        )}
      </>
    );
  }

  function renderSimpleView(title: string, description: string, items: string[]) {
    return (
      <>
        <SectionHeader eyebrow={title} title={title} description={description} />
        <BentoGrid>
          {items.map((item, index) => (
            <BentoCard key={item} colSpan={4}>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                {index % 2 === 0 ? <Target size={17} /> : <Save size={17} />}
              </div>
              <h2 className="mt-4 text-base font-semibold text-gray-900">{item}</h2>
              <p className="mt-2 text-sm leading-6 text-gray-500">Ready for the next iteration of this prototype.</p>
            </BentoCard>
          ))}
        </BentoGrid>
      </>
    );
  }

  function renderView() {
    if (role === "manager") {
      if (activeNav === "dashboard") return renderManagerDashboard();
      if (activeNav === "team") return renderTeamView();
      if (activeNav === "calls") return renderCallsView();
      if (activeNav === "scoring") return renderSimpleView("Scoring", "Tune thresholds and review what Numi flags as weak, moderate, or strong.", ["Score thresholds", "Evidence rules", "Coaching flags"]);
      return renderSimpleView("Settings", "Manage workspace preferences, integrations, and role defaults.", ["Workspace", "Integrations", "Access"]);
    }

    if (activeNav === "performance") return renderRepPerformance();
    if (activeNav === "practice") return renderSimpleView("Practice", "Run focused drills based on the weakest moments from recent calls.", ["Objection drill", "Pricing drill", "Closing drill"]);
    if (activeNav === "training") return renderSimpleView("Training", "Review short lessons connected to your own call evidence.", ["Talk tracks", "Discovery patterns", "Follow-up quality"]);
    if (activeNav === "settings") return renderSimpleView("Settings", "Manage your personal dashboard and notification preferences.", ["Profile", "Notifications", "Data"]);
    return renderCallsView();
  }

  const wrappedPayload = analysis ? analysis.shareAsset : dashboardShareAsset;

  return (
    <DashboardShell role={role} onRoleChange={changeRole} activeNav={activeNav} onNavChange={setActiveNav}>
      <div className="mx-auto max-w-6xl">
        {/* Wrapped button — always visible top-right */}
        <div className="mb-5 flex justify-end">
          <button
            type="button"
            onClick={() => setShowWrapped(true)}
            className="inline-flex items-center gap-2 rounded-md bg-gray-950 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-gray-700"
          >
            ↓ Wrapped
          </button>
        </div>

        {renderView()}
      </div>

      {/* Transcript Modal */}
      {transcriptCall && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setTranscriptCall(null)}
        >
          <div
            className="relative flex w-full max-w-xl flex-col rounded-2xl bg-white shadow-2xl"
            style={{ maxHeight: "80vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div>
                <p className="text-sm font-semibold text-gray-900">{transcriptCall.rep}</p>
                <p className="text-xs text-gray-400">{transcriptCall.date} · {transcriptCall.duration}</p>
              </div>
              <button
                type="button"
                onClick={() => setTranscriptCall(null)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200"
              >
                <X size={14} />
              </button>
            </div>
            <div className="overflow-y-auto px-5 py-4">
              <pre className="whitespace-pre-wrap font-mono text-[13px] leading-relaxed text-gray-700">
                {transcriptCall.transcript}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Wrapped Modal */}
      {showWrapped && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setShowWrapped(false)}
        >
          <div
            className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowWrapped(false)}
              className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200"
            >
              <X size={14} />
            </button>

            <p className="mb-4 text-sm font-semibold text-gray-900">Share your Wrapped</p>

            <SalesRecapExportAsset payload={wrappedPayload} />

            <div className="mt-5 grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  window.open("https://www.linkedin.com/feed/", "_blank");
                }}
                className="flex flex-col items-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50 py-3 text-xs font-medium text-gray-700 transition-colors hover:border-[#0077b5] hover:bg-[#0077b5]/5 hover:text-[#0077b5]"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                LinkedIn
              </button>

              <button
                type="button"
                onClick={() => {
                  // Export PNG for Instagram (no web API)
                  const exportBtn = document.querySelector<HTMLButtonElement>("[data-wrapped-export]");
                  exportBtn?.click();
                }}
                className="flex flex-col items-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50 py-3 text-xs font-medium text-gray-700 transition-colors hover:border-[#e1306c] hover:bg-[#e1306c]/5 hover:text-[#e1306c]"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
                Instagram
              </button>

              <button
                type="button"
                onClick={() => {
                  const text = `Numi Sales Recap — ${wrappedPayload.periodLabel}\n${wrappedPayload.subjectName}\n\n${wrappedPayload.statement}\n\n${wrappedPayload.rows.map((r) => `${r.label}: ${r.value}`).join("\n")}\n\n${wrappedPayload.footer}`;
                  navigator.clipboard.writeText(text).catch(() => {});
                  window.open("https://app.hubspot.com/", "_blank");
                }}
                className="flex flex-col items-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50 py-3 text-xs font-medium text-gray-700 transition-colors hover:border-[#ff7a59] hover:bg-[#ff7a59]/5 hover:text-[#ff7a59]"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current"><path d="M22.162 5.656a8.384 8.384 0 0 0-3.75-2.975 8.32 8.32 0 0 0-4.764-.261 8.357 8.357 0 0 0-4.065 2.26 8.31 8.31 0 0 0-2.2 4.1 8.33 8.33 0 0 0 .33 4.757 8.363 8.363 0 0 0 3.012 3.697 8.29 8.29 0 0 0 4.528 1.338c.707 0 1.41-.082 2.095-.244v3.376l-1.687-.596v2.054l3.47 1.225 3.47-1.225v-2.054l-1.686.596v-3.467a8.307 8.307 0 0 0 3.516-3.668 8.366 8.366 0 0 0 .607-4.686 8.35 8.35 0 0 0-2.876-5.227zm-8.51 12.004a5.547 5.547 0 0 1-3.063-.924 5.574 5.574 0 0 1-2.024-2.487 5.596 5.596 0 0 1-.219-3.196 5.578 5.578 0 0 1 1.484-2.752 5.548 5.548 0 0 1 2.74-1.518 5.528 5.528 0 0 1 3.198.21 5.567 5.567 0 0 1 2.494 2.014 5.598 5.598 0 0 1 .93 3.073 5.59 5.59 0 0 1-1.637 3.957 5.548 5.548 0 0 1-3.903 1.623z"/></svg>
                HubSpot
              </button>
            </div>
            <p className="mt-3 text-center text-[11px] text-gray-400">
              LinkedIn & HubSpot: Text in die Zwischenablage + Tab öffnen · Instagram: PNG Export
            </p>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
