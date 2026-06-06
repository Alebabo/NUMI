# Numi Hackathon Dashboard

Dark, one-screen upload dashboard for the AI BEAVERS founder hackathon prototype.

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Set `ELEVENLABS_API_KEY` for transcription and `FEATHERLESS_API_KEY` for Qwen scoring through Featherless.

## Flow

1. Upload an MP3, WAV, or M4A file.
2. The server transcribes it with ElevenLabs Scribe v2.
3. The transcript is scored with Qwen via Featherless's OpenAI-compatible chat endpoint.
4. The UI shows a Numi scorecard with flagged moments and an A/B verdict.
