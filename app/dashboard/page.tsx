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
const repCalls = [
  { name: "Demo discovery", score: 8.1, objections: 4, nextStep: "Calendar invite sent" },
  { name: "Pricing follow-up", score: 7.4, objections: 3, nextStep: "Procurement loop" },
  { name: "Inbound qualification", score: 6.8, objections: 2, nextStep: "Needs sharper close" }
];

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

function SectionHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-gray-400">{eyebrow}</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-gray-900">{title}</h1>
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      </div>
      <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        ElevenLabs + Featherless Qwen
      </div>
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

        <div className="mt-5 flex items-center justify-between gap-4">
          <p className="text-xs text-gray-400">Audio goes through ElevenLabs. Transcripts go straight to the anti-sycophant scorer.</p>
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

        <BentoGrid>
          <BentoCard colSpan={12}>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.9fr_1.1fr]">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Viral Growth Asset</p>
                <h2 className="mt-1 text-lg font-semibold tracking-tight text-gray-900">LinkedIn-ready recap export</h2>
                <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
                  This preview is rendered from the Anti-Sycophant Engine payload attached to the selected analysis.
                </p>
                <dl className="mt-5 space-y-3 text-sm">
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wider text-gray-400">Subject</dt>
                    <dd className="mt-1 font-medium text-gray-900">{analysis.shareAsset.subjectName}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wider text-gray-400">Period</dt>
                    <dd className="mt-1 font-medium text-gray-900">{analysis.shareAsset.periodLabel}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wider text-gray-400">Primary failure</dt>
                    <dd className="mt-1 font-medium text-gray-900">{analysis.shareAsset.statement}</dd>
                  </div>
                </dl>
              </div>
              <div className="flex justify-start lg:justify-end">
                <SalesRecapExportAsset payload={analysis.shareAsset} pinExportButton />
              </div>
            </div>
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
        <BentoGrid className="mt-4">
          <BentoCard colSpan={12}>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.9fr_1.1fr]">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Viral Growth Asset</p>
                <h2 className="mt-1 text-lg font-semibold tracking-tight text-gray-900">Wrapped export preview</h2>
                <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
                  Dashboard-level recap generated from the current team performance payload.
                </p>
              </div>
              <div className="flex justify-start lg:justify-end">
                <SalesRecapExportAsset payload={dashboardShareAsset} pinExportButton />
              </div>
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

    return (
      <>
        <SectionHeader
          eyebrow={role === "manager" ? "All calls" : "My calls"}
          title={role === "manager" ? "Review team calls" : "Review my calls"}
          description={role === "manager" ? "Upload calls, inspect scoring, and route coaching moments." : "Upload your calls and track where your score is moving."}
        />
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
                  <div
                    className="h-full rounded-full bg-blue-600 transition-all duration-500 ease-out"
                    style={{ width: `${analysisProgress}%` }}
                  />
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
                {analyzeLogs.map((line) => (
                  <p key={line}>{line}</p>
                ))}
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
        {role === "rep" ? (
          <BentoGrid className="mt-4">
            {repCalls.map((call) => (
              <BentoCard key={call.name} colSpan={4}>
                <p className="text-sm font-semibold text-gray-900">{call.name}</p>
                <p className="mt-3 font-mono text-3xl font-semibold text-gray-900">{call.score.toFixed(1)}</p>
                <p className="mt-1 text-xs text-gray-500">{call.objections} objections handled - {call.nextStep}</p>
              </BentoCard>
            ))}
          </BentoGrid>
        ) : null}
      </>
    );
  }

  function renderRepPerformance() {
    return (
      <>
        <SectionHeader eyebrow="My performance" title="Your sales scorecard" description="See your performance as numbers and as a trend graph." />
        <BentoGrid>
          <KpiCard title="Current score" value="8.1" subtitle="+0.8 over last month" colSpan={3} />
          <KpiCard title="Calls reviewed" value="23" subtitle="This month" colSpan={3} />
          <KpiCard title="Objections handled" value="71%" subtitle="+9 points" colSpan={3} />
          <KpiCard title="Clear next steps" value="18" subtitle="Out of 23 calls" colSpan={3} />
        </BentoGrid>
        <BentoGrid className="mt-4">
          <BentoCard colSpan={8}>
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Score graph</p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight text-gray-900">Numi score trend</h2>
            <div className="mt-4">
              <MetricChart values={repTrend} tone="emerald" />
            </div>
          </BentoCard>
          <BentoCard colSpan={4}>
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Skill mix</p>
            <div className="mt-5 space-y-4">
              {[
                ["Objection control", 71],
                ["Pricing discipline", 64],
                ["Buying signal capture", 82],
                ["Next-step quality", 78]
              ].map(([label, value]) => (
                <div key={label}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-medium text-gray-700">{label}</span>
                    <span className="font-mono text-gray-500">{value}%</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
                    <div className="h-full rounded-full bg-emerald-600" style={{ width: `${value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </BentoCard>
        </BentoGrid>
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

  return (
    <DashboardShell role={role} onRoleChange={changeRole} activeNav={activeNav} onNavChange={setActiveNav}>
      <div className="mx-auto max-w-6xl">{renderView()}</div>
    </DashboardShell>
  );
}
