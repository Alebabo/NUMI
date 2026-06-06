import { POST as analyzePost } from "../../analyze/route";

export const runtime = "nodejs";

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    const transcript = String(body?.transcript || body?.text || "").trim();

    if (!transcript) {
      return jsonError("JSON webhook requests must include transcript or text.", 400);
    }

    const form = new FormData();
    form.append("file", new Blob([transcript], { type: "text/plain" }), "webhook-transcript.txt");
    form.append("projectName", String(body?.projectName || "Numi Sales Recap"));
    form.append("subjectName", String(body?.subjectName || "Webhook Call"));

    return analyzePost(
      new Request(request.url.replace("/api/webhook/call-score", "/api/analyze"), {
        method: "POST",
        body: form
      })
    );
  }

  if (contentType.includes("multipart/form-data")) {
    return analyzePost(request);
  }

  return jsonError("Send multipart/form-data with file, or application/json with transcript.", 415);
}

export async function GET() {
  return Response.json({
    name: "Numi Call Score Webhook",
    endpoint: "/api/webhook/call-score",
    method: "POST",
    accepts: [
      {
        contentType: "multipart/form-data",
        fields: {
          file: "Audio or transcript file. Examples: mp3, wav, txt, json, vtt, srt.",
          subjectName: "Optional rep, team, or call label.",
          projectName: "Optional recap/project label."
        }
      },
      {
        contentType: "application/json",
        body: {
          transcript: "[00:00] rep: ...",
          subjectName: "Demo Rep",
          projectName: "Numi Sales Recap"
        }
      }
    ],
    returns: ["numiScore", "verdictLabel", "findings", "transcript", "engine", "shareAsset"]
  });
}
