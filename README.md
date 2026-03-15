# VibeKid

A web platform where kids create games, animations, and music by chatting with AI — no coding knowledge needed.

## What is VibeKid?

VibeKid lets kids describe what they want to build in plain language (text or voice), and an AI assistant (XiaoV) brings it to life — generating playable games, interactive animations, and music right in the browser. Kids never see code, compilers, or technical details. They just talk, play, and iterate.

## Core Principles

- **Create first** — Kids focus on *what* to build, AI handles the *how*
- **Always playable** — Every AI response produces a runnable version
- **Kid decides** — All product decisions (colors, rules, speed) are made by the kid
- **Zero tech exposure** — Code, compilation, and technical concepts are completely hidden
- **Self-healing** — If generated code has bugs, AI auto-fixes silently (kids see a cute animation)
- **Learns from mistakes** — Past errors are remembered and prevented in future generations

## Key Features

- Chat with AI via text or voice input
- Live preview of generated games/animations in a sandboxed iframe
- Auto-fix: AI retries up to 3 times if code errors (kids see "🔧 fixing..." animation)
- Error memory: past mistakes are injected into prompts to prevent repeats
- 💡 Idea button: AI suggests creative improvements
- Version history: switch between any previous version
- Project persistence: auto-saved per user, resumable anytime
- Multi-language: Simplified Chinese, Traditional Chinese, English
- Touch + keyboard: all generated games support both iPad and desktop by default
- Debug panel (`?debug=1`): token usage, costs, API logs (draggable)

## Tech Stack

- **Next.js 15** (App Router) + TypeScript + Tailwind CSS v4
- **OpenAI SDK** → Azure OpenAI (GPT-5.4 Responses API, gpt-4o-mini-tts, gpt-4o-mini-transcribe)
- **Zustand** for state management
- **Sandboxed iframe** runtime with pre-loaded p5.js and Tone.js
- **File-system storage** for projects and error memory

## Getting Started

1. Clone the repo
2. `npm install`
3. Copy `.env.local.example` to `.env.local` and fill in your Azure OpenAI credentials
4. `npm run dev`
5. Open `http://localhost:3000`, log in with `test` / `14421`

## License

MIT
