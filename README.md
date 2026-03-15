# VibeKid

> A web platform where kids create games, animations, and music by chatting with AI — no coding knowledge needed.

## What is VibeKid?

VibeKid lets kids describe what they want to build in plain language (text or voice), and an AI assistant (XiaoV) brings it to life — generating playable games, interactive animations, and music right in the browser. Kids never see code, compilers, or technical details. They just talk, play, and iterate.

## Core Principles

- **Create first** — Kids focus on *what* to build, AI handles the *how*
- **Always playable** — Every AI response produces a runnable version
- **Kid decides** — All product decisions (colors, rules, speed) are made by the kid
- **Zero tech exposure** — Code, compilation, and technical concepts are completely hidden

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) + TypeScript |
| Styling | Tailwind CSS v4 |
| State | Zustand |
| AI | OpenAI SDK → Azure OpenAI (GPT-5.4 via Responses API) |
| TTS | gpt-4o-mini-tts (with browser fallback) |
| STT | gpt-4o-mini-transcribe |
| Runtime | Sandboxed iframe (HTML/CSS/JS + p5.js, Tone.js) |
| Storage | File-system based (projects, error memory) |
| Auth | Cookie-based (simple) |

## Features

- **Chat with AI** — Text or voice input, AI responds with playable code
- **Live preview** — Sandboxed iframe runs the generated code instantly
- **Auto-fix** — If code errors, AI automatically retries up to 3 times (kids see a cute "fixing" animation)
- **Error memory** — Past errors are recorded and injected into prompts to prevent repeat mistakes
- **Idea suggestions** — 💡 button asks AI to propose creative improvements
- **Version history** — Every generated version is saved, switchable via dropdown
- **Project persistence** — Auto-saved to server filesystem per user
- **Multi-language** — UI and generated content language selectable (Chinese, English, Japanese)
- **Debug panel** — `?debug=1` shows token usage, costs, and API call logs (draggable)
- **Touch + keyboard** — All generated games support both iPad touch and desktop keyboard by default

## Getting Started

```bash
# Install dependencies
npm install

# Copy environment config
cp .env.local.example .env.local
# Edit .env.local with your Azure OpenAI credentials

# Start dev server
npm run dev

# Build
npm run build
```

## Environment Variables

```env
AZURE_OPENAI_API_KEY=your-key
AZURE_OPENAI_ENDPOINT=https://your-resource.cognitiveservices.azure.com/openai/v1/
AZURE_OPENAI_DEPLOYMENT=gpt-5.4
AZURE_OPENAI_TTS_DEPLOYMENT=gpt-4o-mini-tts
AZURE_OPENAI_STT_DEPLOYMENT=gpt-4o-mini-transcribe
```

## Project Structure

```
src/
├── app/
│   ├── api/            # API routes (chat, tts, stt, auth, projects, errors)
│   ├── login/          # Login page
│   ├── workspace/      # Main workspace (chat + preview)
│   └── page.tsx        # Home page (project gallery + inspiration)
├── components/
│   ├── chat/           # Chat panel with voice + idea button
│   ├── preview/        # Sandboxed iframe preview
│   └── debug/          # Debug panel (tokens, costs, logs)
├── lib/
│   ├── ai/             # Centralized OpenAI client + prompts
│   ├── data/           # File-based persistence (projects, error memory)
│   ├── runtime/        # iframe engine (code injection, error reporting)
│   └── voice/          # Voice hooks (recording, TTS playback)
├── stores/             # Zustand stores (project, debug, language)
├── middleware.ts        # Auth middleware
└── types/              # TypeScript types
```

## License

MIT
