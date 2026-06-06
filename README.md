# Numi — AI Sales Call Intelligence

**Numi** turns every sales call into a coaching moment. It listens, scores, and delivers rep-level insights that managers can act on and reps can actually learn from — automatically, with zero manual CRM entry.

---

## The Problem

Sales teams lose deals not because they lack leads, but because they lack feedback. Call recordings pile up unreviewed. Managers guess at coaching priorities. Reps repeat the same mistakes quarter after quarter. Price discipline breaks down under pressure. Nobody knows why deals stall until it's too late.

Numi solves this by automatically analyzing every call, surfacing the exact moments where objections were mishandled, price was conceded too early, or follow-through broke down — and packaging it in a format that motivates reps instead of demoralizing them.

---

## How It Works

1. **Voice intake via ElevenLabs** — Reps talk to the Numi voice agent (powered by [ElevenLabs Conversational AI](https://elevenlabs.io)) directly in the browser. No app install, no upload friction. The agent captures the call audio in real time.

2. **Transcription via ElevenLabs Scribe v2** — Audio is sent to ElevenLabs' Scribe v2 endpoint and returned as a clean, speaker-separated transcript within seconds.

3. **Scoring via Alibaba Qwen (DashScope MaaS)** — The transcript is analyzed by [Qwen](https://www.alibabacloud.com/product/dashscope) through the DashScope MaaS OpenAI-compatible API. Qwen evaluates 8 behavioral dimensions: objection handling, price discipline, value anchoring, discovery depth, follow-up clarity, energy, structure, and next-step confirmation.

4. **Scorecard delivery** — The UI renders a full call scorecard with flagged transcript moments, a rep-vs-team benchmark, and an A/B verdict. Managers see all reps. Reps see only their own data.

5. **Automated HubSpot sync** — Call outcomes and scores are pushed directly into HubSpot CRM, eliminating manual data entry and keeping the pipeline current after every call.

6. **Viral sharing via Sales Wrapped** — Monthly recap slides are generated per rep and per team — LinkedIn-carousel style. Reps share their wins. The brand spreads.

---

## Key Features

| Feature | Description |
|---|---|
| Voice agent intake | ElevenLabs Conversational AI widget, no upload needed |
| Automatic transcription | ElevenLabs Scribe v2, speaker-separated |
| AI call scoring | Qwen via DashScope MaaS, 8 behavioral dimensions |
| Role-based views | Managers see all calls + transcripts; reps see only their own |
| HubSpot integration | Automated call outcome sync to CRM |
| Sales Wrapped export | LinkedIn carousel PNG + editable PPTX per rep/team |
| Team management | Create teams, set targets, track performance inline |

---

## Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Voice AI**: ElevenLabs Conversational AI + Scribe v2
- **LLM scoring**: Alibaba Qwen (qwen-plus) via DashScope MaaS OpenAI-compatible endpoint
- **CRM**: HubSpot (direct integration)
- **Export**: html2canvas (PNG), pptxgenjs (PPTX)

---

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

### Required environment variables

```env
ELEVENLABS_API_KEY=           # ElevenLabs API key for transcription
DASHSCOPE_API_KEY=            # Alibaba DashScope MaaS key for Qwen
QWEN_BASE_URL=                # DashScope MaaS endpoint (OpenAI-compatible)
QWEN_MODEL=qwen-plus          # Model ID
NEXT_PUBLIC_ELEVENLABS_AGENT_ID=  # ElevenLabs Conversational AI agent ID
```

---

## Jury Evaluation Criteria

### Hackathon rubric alignment
Numi is built to read as a real startup wedge, not a generic AI wrapper:

| Rubric criterion | Numi signal |
|---|---|
| Problem and customer clarity | Specific buyer: DACH B2B sales leaders, enablement managers, and frontline sales managers who cannot review enough calls to coach reps consistently. Specific pain: missed objections, weak price discipline, vague next steps, and delayed feedback after sales calls. |
| Market and business potential | Sales coaching and conversation intelligence are established budget categories, but Numi enters with a narrow wedge: honest, evidence-anchored call scoring for teams that already run sales calls but do not trust generic AI summaries. The buyer path is CRM-connected pilots for sales teams using HubSpot. |
| Product execution and demo | The prototype has live voice intake, transcript analysis, a dashboard, role-based manager/rep views, team tracking, HubSpot sync signaling, and shareable Sales Wrapped exports. It demonstrates the core workflow end to end. |
| AI-native leverage and technical approach | AI is the core product capability: ElevenLabs captures/transcribes calls, Qwen evaluates behavioral sales dimensions, and the Anti-Sycophant Engine uses adversarial critique to reduce polite but useless feedback. |
| Evidence, insight, and founder edge | The product is grounded in a concrete insight: generic LLMs often reward friendly calls even when no qualified pipeline was created. Numi flags cited transcript evidence instead of giving motivational summaries. |
| Pitch clarity | One-sentence pitch: Numi helps DACH sales managers turn every call into honest, evidence-backed coaching because today managers review too few calls and reps repeat the same mistakes. |

### ElevenLabs integration
Numi uses ElevenLabs in two ways: the Conversational AI agent handles live voice intake (the primary call capture interface), and Scribe v2 handles transcription. The voice agent is embedded directly in the product as a persistent widget — reps interact with it the same way they'd interact with a customer. No friction, no file uploads. ElevenLabs is not a demo feature here; it is the core input layer.

### Qwen / DashScope integration
Every transcript is scored by Qwen via the DashScope MaaS OpenAI-compatible endpoint. The model evaluates 8 structured sales-behavior dimensions and returns a JSON scorecard with flagged transcript moments and an A/B verdict. Qwen handles the intelligence layer — the part that turns a raw conversation into actionable coaching data.

### Problem–solution fit
Sales coaching is broken because feedback is delayed, generic, and doesn't reach reps when they can still act on it. Numi closes that loop: every call is scored within seconds, every rep gets personalized feedback, and managers get team-level patterns without reviewing a single recording manually.

### Product completeness
The app has a landing page, a voice intake experience, a scored call dashboard, role-based access (manager vs. rep), team management, HubSpot integration signaling, and a viral distribution mechanic (Sales Wrapped). It is demo-ready end to end.

---

## Project Structure

```
app/
  page.tsx          # Landing page
  dashboard/        # Sales call dashboard (role-based)
  try/              # Voice agent intake page
  api/
    analyze/        # Transcription + Qwen scoring endpoint
    test-apis/      # API health check endpoint
components/
  SalesRecapShareAsset.tsx   # Sales Wrapped carousel + PNG/PPTX export
  NumiWordmark.tsx           # Logo + wordmark component
public/assets/               # Logos and images
```
