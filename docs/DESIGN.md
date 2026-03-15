# VibeKid — Design Document

## 1. Vision

VibeKid lets kids create playable games, animations, and music by having a conversation with an AI assistant — without ever seeing code, terminals, or technical concepts.

The goal is not to produce industrial software, but to let kids experience the creative loop of "imagine → describe → see it come alive → refine" as early as possible, building fluency in collaborating with AI.

## 2. Design Principles

**Create first, not learn first.** Traditional coding education requires kids to learn syntax before they can create. VibeKid inverts this — kids create immediately, and understanding comes through iteration.

**Always playable.** Every AI response produces a complete, runnable version. There is never a "wait until it's done" moment. The kid can play the current version at any point.

**Kid has sovereignty.** AI is the builder, kid is the product manager. All decisions about what the product looks like, how it behaves, and what to add next come from the kid. AI only asks product questions (colors, speeds, rules), never technical ones.

**Zero tech exposure.** The kid never sees HTML, JavaScript, error messages, or console output. When code breaks, the system fixes it silently behind a cute animation.

**Self-improving.** The system remembers its mistakes. Errors encountered during code generation are recorded and fed back into future prompts, reducing repeat failures over time.

## 3. User Experience

### 3.1 The Core Loop

```
Kid says what they want
  → AI generates a playable version (instantly visible in preview)
  → Kid plays it
  → Kid gives feedback ("make the snake faster", "add sound effects")
  → AI generates an updated version
  → Repeat
```

### 3.2 Starting a Project

The kid types or speaks a simple idea: "I want to make a snake game." AI immediately generates the simplest working version — a moving snake on a dark background. No planning phase, no step-by-step walkthrough. Just instant creation.

### 3.3 Iterating

The kid and AI have a natural conversation. The kid says things like:
- "Make the snake blue"
- "Add food"
- "It's too slow"
- "Add a score"

Each message produces a new complete version. The kid sees the result immediately.

### 3.4 Getting Stuck

If the kid doesn't know what to do next, they press the 💡 button. AI suggests one creative improvement (e.g., "How about adding a rainbow trail behind the snake?") and asks if the kid wants to do it. The kid can accept, modify the idea, or say something completely different.

### 3.5 When Things Break

If the generated code has a runtime error:
1. The kid sees a cute 🔧 animation: "XiaoV is fixing things up..."
2. AI automatically receives the error and generates a fixed version
3. Up to 3 retries before gracefully giving up
4. The error is recorded to prevent the same mistake next time

The kid never sees an error message, stack trace, or blank screen.

### 3.6 Language

The UI language and the language of generated content (game text, button labels, AI responses) are controlled by a dropdown. Changing language only affects future generations — existing content stays as-is.

Supported: Simplified Chinese, Traditional Chinese, English.

## 4. Architecture Decisions

### 4.1 Browser Runtime: Sandboxed iframe

Generated code runs in an `<iframe sandbox="allow-scripts">`. This was chosen because:
- HTML/CSS/JS is native to the browser — zero compilation needed
- Iframe sandbox provides security isolation (no access to parent page, no network requests, no popups)
- Instant feedback — inject code, it runs immediately
- Pre-loaded libraries (p5.js for graphics, Tone.js for sound) cover the most common creative scenarios

### 4.2 AI: OpenAI Responses API with Multi-turn Chaining

We use the Responses API (not Chat Completions) because:
- `previous_response_id` lets the server manage conversation history — the client only sends the current message, not the entire history
- Built-in reasoning support via `reasoning.effort`
- Server-side state storage (`store: true`) enables conversation resumption

Each AI call returns a JSON object with two parts:
- `message`: the friendly text shown to the kid
- `code`: complete standalone HTML (optional, only when the preview needs updating)

The kid never sees the `code` field.

### 4.3 Centralized API Client

All OpenAI calls (chat, TTS, STT) go through a single centralized module. No other code is allowed to import the OpenAI SDK directly. This ensures:
- Every call's token usage and cost is tracked
- Consistent credential management
- Single place to add rate limiting, caching, or model switching

### 4.4 Error Memory

A file-based system records runtime errors encountered during code generation. The top errors (by frequency) are injected into every AI prompt as "known pitfalls to avoid." This creates a feedback loop: the more the system is used, the fewer errors it makes.

### 4.5 Input: Touch + Keyboard by Default

All generated games must support both iPad touch and desktop keyboard/mouse. The prompt explicitly instructs the AI to add on-screen controls alongside keyboard listeners. This is only omitted if the kid explicitly asks for one input method.

### 4.6 Voice

- **Input (STT):** Browser MediaRecorder captures audio → sent to gpt-4o-mini-transcribe → transcript becomes the chat message
- **Output (TTS):** AI response text → sent to gpt-4o-mini-tts (with voice style instructions) → played as audio. Falls back to browser speechSynthesis if the TTS API is unavailable.

### 4.7 Persistence

Projects are auto-saved to the server filesystem after every AI response. The save includes the full conversation, all code versions, and the Responses API `previous_response_id` — so a project can be resumed with full multi-turn context.

### 4.8 Authentication

Simple cookie-based auth with hardcoded credentials (prototype stage). A middleware layer enforces auth on all routes except the login page.

## 5. Cost Tracking

A debug panel (enabled via `?debug=1` URL parameter) shows:
- Input / output / reasoning tokens per call and cumulative
- Audio costs (TTS per character, STT per minute)
- Total USD cost
- Chronological log of all API calls

This is essential during development and for understanding per-session economics.
The debug panel is draggable so it doesn't obstruct the workspace.

## 6. What This Is Not

- **Not a coding education tool.** Kids don't learn to code here. They learn to express ideas clearly, iterate on products, and collaborate with AI.
- **Not a production app builder.** The output is single-file HTML games, not deployable software.
- **Not Scratch.** There are no visual programming blocks. The interface is conversational, not diagrammatic.

## 7. Future Directions

- **Sharing:** Generate a link to let friends play the kid's creation
- **Gallery:** Browse and remix other kids' projects
- **Parent dashboard:** View what the kid has been building, conversation history, costs
- **Context compaction:** Use the Responses API `compact()` to reduce token costs in long conversations
- **Multi-file projects:** For advanced users, support projects beyond a single HTML file
- **Collaborative creation:** Two kids working on the same project
