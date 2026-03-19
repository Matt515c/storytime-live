# StoryLive — Startup Task List

Complete sequential task list to build StoryLive from nothing. Each task includes the prompt/instruction to give Claude Code, prerequisites, and acceptance criteria.

---

## Phase 0: Infrastructure & Repo Setup

### Task 0.1: Create GitHub Repository

**Prerequisites:** GitHub CLI (`gh`) installed and authenticated.

**Prompt:**

```
Create a new GitHub repository called "storytime-live" under my account. Initialize it with:
- A .gitignore for Node.js/Next.js (include .env.local, .env*.local, node_modules, .next, out)
- An MIT license
- A README.md with: project name "StoryLive", one-line description "Real-time interactive storytelling platform — AI generates scene images live as a narrator tells stories to children", and a "Getting Started" section placeholder
- Set the default branch to "master"

Then clone it locally.
```

**Verification:** `gh repo view` shows the repo. Local clone exists.

---

### Task 0.2: Initialize Next.js Project

**Prerequisites:** Task 0.1 complete. Node.js 20+, pnpm installed.

**Prompt:**

```
Initialize a Next.js 15 project in the repo root using pnpm with these options:
- App Router (not Pages)
- TypeScript (strict mode)
- Tailwind CSS
- ESLint
- src/ directory
- Import alias: @/*

Then:
1. Add these dev dependencies: vitest, @testing-library/react, @testing-library/jest-dom, @testing-library/user-event, @vitejs/plugin-react, jsdom, @vitest/coverage-v8, prettier, prettier-plugin-tailwindcss
2. Add these dependencies: zod
3. Configure vitest in vitest.config.ts with jsdom environment, coverage provider v8, and 100% threshold for all coverage metrics (lines, branches, functions, statements)
4. Add prettier config (.prettierrc) with: singleQuote: true, trailingComma: 'all', semi: true, printWidth: 100
5. Update ESLint config to work with Prettier (eslint-config-prettier)
6. Add scripts to package.json:
   - "test": "vitest run"
   - "test:watch": "vitest"
   - "test:coverage": "vitest run --coverage"
   - "type-check": "tsc --noEmit"
   - "format": "prettier --write ."
   - "format:check": "prettier --check ."
7. Create a .env.example with placeholders for: DEEPGRAM_API_KEY, ANTHROPIC_API_KEY, FAL_API_KEY, NEXT_PUBLIC_APP_URL
8. Create .env.local from .env.example (gitignored)
9. Verify: pnpm type-check && pnpm lint && pnpm build all pass
10. Commit: "chore: initialize Next.js 15 project with TypeScript, Tailwind, Vitest"
```

**Verification:** `pnpm dev` serves the app. `pnpm type-check`, `pnpm lint`, `pnpm build` all pass.

---

### Task 0.3: Deploy to Vercel

**Prerequisites:** Task 0.2 complete. Vercel CLI installed (`pnpm add -g vercel`) and authenticated.

**Prompt:**

```
Set up Vercel deployment for this project:
1. Link the repo to a new Vercel project: vercel link
2. Configure the project for Next.js (should auto-detect)
3. Set up environment variables on Vercel (placeholders for now — we'll add real keys later):
   - DEEPGRAM_API_KEY
   - ANTHROPIC_API_KEY
   - FAL_API_KEY
   - NEXT_PUBLIC_APP_URL (set to the Vercel deployment URL)
4. Deploy: vercel --prod
5. Verify the deployment URL loads the default Next.js page
6. Enable automatic deployments from the master branch on GitHub
7. Update README.md with the deployment URL
8. Commit: "chore: configure Vercel deployment"
```

**Verification:** Production URL loads. GitHub push triggers auto-deploy.

---

### Task 0.4: Drop Claude Code Configuration

**Prerequisites:** Task 0.2 complete.

**Prompt:**

```
Copy all Claude Code configuration files into the repo:
- CLAUDE.md, STATUS.md, MEMORY.md to repo root
- docs/architecture.md, docs/claude-setup.md to docs/
- Copy PRODUCT_SPEC.md to docs/product-spec.md
- Copy TASK_SCAFFOLD.md to docs/task-scaffold.md
- .claude/rules/, .claude/commands/, .claude/agents/ directories with all files
- Add CLAUDE.local.md to .gitignore
- Commit: "chore: add Claude Code configuration files"
```

**Verification:** All files present. `/health-check` command is recognized by Claude Code.

---

### Task 0.5: Set Up CI Pipeline

**Prerequisites:** Task 0.3 complete.

**Prompt:**

```
Create a GitHub Actions workflow at .github/workflows/ci.yml that runs on every push and PR:

1. Checkout code
2. Setup pnpm (with caching)
3. Setup Node.js 20
4. Install dependencies: pnpm install --frozen-lockfile
5. Type check: pnpm type-check
6. Lint: pnpm lint
7. Format check: pnpm format:check
8. Test with coverage: pnpm test:coverage
9. Build: pnpm build

The workflow should fail if any step fails. Coverage must be 100% (enforced by vitest config).

Commit: "ci: add GitHub Actions CI pipeline"
```

**Verification:** Push triggers CI. Green check on the commit.

---

## Phase 1: Core UI (Product Spec Task 1)

### Task 1.1: Fullscreen Image Display

**Prompt:**

```
Build the core session page following docs/product-spec.md Section 2 and docs/task-scaffold.md Task 1.

Create:
1. src/app/page.tsx — The session page. Fullscreen layout: one large image fills the entire viewport. Dark background when no image. No visible chrome, toolbars, or sidebars.
2. src/components/SessionDisplay.tsx — The fullscreen image component. Uses next/image with fill and object-fit: contain. Handles: no-image state (dark bg), loading state (subtle fade), image-loaded state.
3. src/components/SessionDisplay.test.tsx — Tests for all three states.
4. src/types/session.ts — Define SessionPhase enum (CHARACTER_CREATION, SETTING_ESTABLISHMENT, ACTIVE_STORYTELLING), SessionStatus type (idle, listening, processing, generating), and SessionState interface per docs/architecture.md.

Follow all naming conventions from CLAUDE.md. Named exports only (except page.tsx which requires default export).

Commit: "feat: fullscreen session display with image states"
```

---

### Task 1.2: Session Controls Overlay

**Prompt:**

```
Build the minimal control overlay per docs/product-spec.md Section 2 and docs/task-scaffold.md Task 1.

Create:
1. src/components/ControlOverlay.tsx — Semi-transparent overlay tucked to bottom-right corner. Contains: Start Session button, Stop Session button (disabled when not in session), StatusIndicator. Auto-hides after 3 seconds of inactivity, reappears on mouse movement. Must not interfere with screen-sharing appearance.
2. src/components/StatusIndicator.tsx — Shows current status: idle (gray dot), listening (green pulsing dot), processing (yellow), generating (blue). Just a colored dot with label.
3. src/components/DebugOverlay.tsx — Hidden by default, toggled with Ctrl+Shift+D. Shows: current phase, last classification, active template status, last prompt, rolling transcript. Position: top-left, semi-transparent dark panel.
4. Colocated tests for all three components.
5. src/hooks/use-session.ts — Session lifecycle hook: startSession(), stopSession(), sessionStatus, currentPhase. In-memory state only. Include the hook test.

Commit: "feat: session controls overlay with debug panel"
```

---

## Phase 2: Audio & Transcription (Product Spec Task 2)

### Task 2.1: Microphone Capture

**Prompt:**

```
Build mic-only audio capture per docs/product-spec.md Section 3 and docs/task-scaffold.md Task 2.

Create:
1. src/hooks/use-microphone.ts — Hook that:
   - Requests mic-only access via navigator.mediaDevices.getUserMedia({ audio: true, video: false })
   - NEVER requests system audio, display audio, or any output device
   - Returns: stream (MediaStream | null), isActive (boolean), error (string | null), startCapture(), stopCapture()
   - Cleans up stream on unmount
2. src/lib/audio/audio-stream.ts — Utility to convert MediaStream to PCM chunks suitable for streaming to STT API. Uses AudioContext and ScriptProcessorNode (or AudioWorklet if supported).
3. Colocated tests for both. Mock navigator.mediaDevices in tests. CRITICAL: test must assert getUserMedia is called with audio:true ONLY.

Commit: "feat: mic-only audio capture with streaming chunks"
```

---

### Task 2.2: Streaming Transcription Integration

**Prompt:**

```
Integrate real-time streaming speech-to-text per docs/task-scaffold.md Task 2.

Create:
1. src/services/transcription/transcription.interface.ts — TranscriptionAdapter interface: connect(), disconnect(), onTranscript(callback), onPartialTranscript(callback)
2. src/services/transcription/deepgram.adapter.ts — Deepgram streaming WebSocket adapter. Sends audio chunks, receives partial and final transcripts. Includes latency logging.
3. src/services/transcription/mock.adapter.ts — Mock adapter for testing that simulates streaming transcripts with configurable delays.
4. src/services/transcription/types.ts — Zod schemas: TranscriptResult { text, isFinal, confidence, durationMs }
5. src/services/transcription/index.ts — Barrel export + factory function
6. src/hooks/use-transcription.ts — Hook that connects mic stream to transcription adapter and provides rolling transcript.
7. All colocated tests. Mock WebSocket in Deepgram adapter tests. Test partial results, final results, reconnection, and timeout.

Commit: "feat: streaming transcription via Deepgram adapter"
```

---

## Phase 3: AI Interpretation (Product Spec Task 3)

### Task 3.1: System Prompts

**Prompt:**

```
Create the LLM system prompts per docs/product-spec.md Sections 5-7 and docs/task-scaffold.md Task 3.

Create:
1. src/lib/prompts/interpretation.ts — System prompt for the interpretation LLM. Must explain: the storytelling context, the narrator-as-filter role, all 3 phases, all 6 intent types with examples of narrator speech for each, and how to detect phase transitions. Include at least 2 realistic examples per intent type drawn from the product spec.
2. src/lib/prompts/prompt-construction.ts — System prompt for the prompt construction LLM that converts narration to image generation prompts. Must specify: target art style (storybook illustration), prompt format for the chosen image gen model, conciseness requirements.
3. src/lib/prompts/template-fabrication.ts — System prompt for template pre-fabrication. Must explain: creating a near-complete image prompt with [PLACEHOLDER], including character/setting/style context, and what the placeholder is waiting for.
4. Tests that verify prompts are non-empty strings and contain key phrases.

Commit: "feat: LLM system prompts for interpretation, prompt construction, template fabrication"
```

---

### Task 3.2: Interpretation Service

**Prompt:**

```
Build the AI interpretation layer per docs/task-scaffold.md Task 3.

Create:
1. src/services/interpretation/interpretation.interface.ts — InterpretationAdapter interface: classify(transcript, sessionState) → IntentClassification
2. src/services/interpretation/types.ts — Zod schemas: IntentType enum (CREATIVE_DIRECTIVE, MODIFICATION_REQUEST, QUESTION_TO_AUDIENCE, AUDIENCE_RESPONSE_RELAY, TRANSITION, CONVERSATION), IntentClassification { intent, confidence, extractedDescription?, targetPhase?, reasoning }
3. src/services/interpretation/anthropic.adapter.ts — Uses Claude Haiku to classify intent. Streams response for speed. Uses the system prompt from src/lib/prompts/interpretation.ts. Logs latency.
4. src/services/interpretation/mock.adapter.ts — Configurable mock that maps input patterns to classifications.
5. All colocated tests with realistic narrator speech examples covering ALL 6 intent types and edge cases (ambiguous inputs, phase boundary speech).

Commit: "feat: AI interpretation service with intent classification"
```

---

## Phase 4: Image Generation (Product Spec Task 4)

### Task 4.1: Image Generation Service

**Prompt:**

```
Build the image generation pipeline per docs/task-scaffold.md Task 4.

Create:
1. src/services/image-generation/image-generation.interface.ts — ImageGenerationAdapter interface: generate(prompt, referenceImage?) → ImageResult
2. src/services/image-generation/types.ts — Zod schemas: ImageGenerationRequest { prompt, referenceImageUrl?, width, height }, ImageResult { url, durationMs }
3. src/services/image-generation/fal.adapter.ts — fal.ai adapter using Flux Schnell (fastest model). Supports reference images for character/scene continuity. Logs latency.
4. src/services/image-generation/mock.adapter.ts — Returns placeholder images with configurable delay.
5. src/services/prompt-construction/prompt-constructor.ts — Uses fast LLM to convert narrator descriptions to optimized image gen prompts. Uses system prompt from src/lib/prompts/prompt-construction.ts.
6. All colocated tests.

Commit: "feat: image generation pipeline with fal.ai adapter and prompt construction"
```

---

## Phase 5: Template Pre-Fabrication (Product Spec Task 5)

### Task 5.1: Template Manager

**Prompt:**

```
Build the template pre-fabrication system per docs/product-spec.md Section 7.2 and docs/task-scaffold.md Task 5. This is the CRITICAL latency optimization.

Create:
1. src/services/template-manager/template-manager.ts — Manages the pre-fabrication lifecycle:
   - preFabricate(sessionState) → creates a near-complete image prompt with [PLACEHOLDER] via LLM call
   - complete(audienceResponse) → does TEXT REPLACEMENT ONLY (no LLM call!) to swap [PLACEHOLDER] with the extracted description, returns completed prompt ready to fire
   - getActive() → returns current template or null
   - clear() → clears active template
2. src/services/template-manager/types.ts — Zod schemas: TemplatePrompt { prompt, placeholder, placeholderContext, createdAt }, CompletedPrompt { prompt, completedAt }
3. All colocated tests covering:
   - Template creation from QUESTION_TO_AUDIENCE
   - Template completion via text replacement (verify NO LLM call on completion)
   - Fallback when no template active
   - Template replacement (new question before previous was answered)
   - Latency: completion must be <10ms (it's just string replacement)

Commit: "feat: template pre-fabrication system for latency optimization"
```

---

## Phase 6: Session State (Product Spec Task 6)

### Task 6.1: Session State Manager

**Prompt:**

```
Build the session state manager per docs/task-scaffold.md Task 6.

Create:
1. src/services/session-state/session-state.ts — In-memory session state manager with all fields from docs/architecture.md:
   - currentPhase, characterDescription, characterReferenceImage, settingDescription, currentSceneImage, storyContext, activeTemplate, placeholderContext, generationHistory
   - Methods: updatePhase(), updateCharacter(), updateSetting(), updateScene(), setTemplate(), clearTemplate(), addToHistory(), getState(), reset()
2. src/services/session-state/types.ts — Full SessionState Zod schema
3. All colocated tests verifying state transitions, especially:
   - Phase transitions update correctly
   - Character refinement accumulates (doesn't replace) description
   - Template lifecycle (set → complete → clear)
   - Reference image chain is maintained

Commit: "feat: in-memory session state management"
```

---

## Phase 7: Integration (Product Spec Task 7)

### Task 7.1: Wire the Pipeline

**Prompt:**

```
Integrate all components into the end-to-end pipeline per docs/task-scaffold.md Task 7.

Create:
1. src/services/pipeline/story-pipeline.ts — The orchestrator that wires everything together:
   - Receives transcript from transcription service
   - Sends to interpretation service for classification
   - Based on classification:
     - CREATIVE_DIRECTIVE → prompt construction → image generation → display
     - MODIFICATION_REQUEST → modification prompt (with current scene reference) → image gen → display
     - QUESTION_TO_AUDIENCE → template pre-fabrication (non-blocking)
     - AUDIENCE_RESPONSE_RELAY → if template active: complete + fire. If not: fallback to standard flow
     - TRANSITION → update phase in session state
     - CONVERSATION → no action
   - Every generation passes previous scene image as reference
   - Updates session state at each step
2. src/app/api/session/route.ts — Session start/stop endpoints
3. Wire the client hooks to the pipeline via WebSocket or SSE for image push
4. Update the debug overlay to show live pipeline data
5. Integration tests that simulate a full narrator session across all 3 phases

Commit: "feat: end-to-end pipeline integration"
```

---

### Task 7.2: End-to-End Testing

**Prompt:**

```
Write comprehensive end-to-end tests for the full pipeline.

Create:
1. src/services/pipeline/story-pipeline.test.ts — Integration tests using mock adapters for all external services. Simulate a complete storytelling session:
   - Session starts → CHARACTER_CREATION phase
   - Narrator describes character → image generates
   - Narrator modifies character → modification image generates (same character, different details)
   - Narrator transitions to setting → SETTING_ESTABLISHMENT phase
   - Narrator describes setting → image generates WITH character
   - Narrator transitions to storytelling → ACTIVE_STORYTELLING phase
   - Narrator asks audience question → template pre-fabricates
   - Narrator relays answer → template completes and fires immediately
   - Verify: reference image chain maintained throughout
   - Verify: no generation on CONVERSATION intents
   - Verify: fallback works when no template active

Run /coverage-audit to verify we're at 100%.

Commit: "test: comprehensive end-to-end pipeline tests"
```

---

## Phase 8: Latency Optimization (Product Spec Task 8)

### Task 8.1: Optimization Pass

**Prompt:**

```
Perform the latency optimization pass per docs/task-scaffold.md Task 8.

1. Audit every sequential operation in the pipeline — parallelize where possible
2. Ensure template pre-fabrication runs concurrently (Promise.race or background task)
3. Stream LLM responses — act on partial classification if confidence is high enough
4. Pre-warm API connections on session start (Deepgram WebSocket, fal.ai)
5. Add latency measurement at every stage boundary:
   - Speech → transcript (STT latency)
   - Transcript → classification (interpretation latency)
   - Classification → prompt ready (prompt construction or template completion latency)
   - Prompt → image request (network overhead)
   - Image request → image returned (generation latency)
   - Image returned → displayed (client render latency)
   - End-to-end: narrator speaks → image displayed
6. Surface latency metrics in the debug overlay
7. Update MEMORY.md with actual measured latencies
8. Implement image generation queuing: if new generation triggers while one is in-flight, cancel the in-flight one (latest wins)

Run /health-check to verify everything still passes.

Commit: "perf: latency optimization pass with pipeline metrics"
```

---

## Phase 9: Polish & Release

### Task 9.1: Production Hardening

**Prompt:**

```
Production readiness pass:
1. Error boundaries on all client components
2. Graceful degradation: if STT disconnects mid-session, attempt reconnect. If image gen fails, keep the current image and retry.
3. Rate limiting awareness: handle 429s from all APIs with exponential backoff
4. Environment variable validation on startup via Zod (fail fast if missing)
5. Add structured logging (JSON format) for all server-side operations
6. Security headers in next.config.ts (CSP, X-Frame-Options, etc.)
7. Verify: no console.log statements outside debug overlay code
8. Final /health-check and /coverage-audit

Commit: "chore: production hardening pass"
```

---

### Task 9.2: Tag v0.1.0

**Prompt:**

```
Tag the first release:
1. Run /deploy --tag v0.1.0
2. Update STATUS.md with release info
3. Update README.md with:
   - Setup instructions (clone, pnpm install, configure .env.local, pnpm dev)
   - Required API keys and where to get them
   - Architecture overview (link to docs/architecture.md)
   - How it works (brief, link to docs/product-spec.md)

Commit: "docs: v0.1.0 release documentation"
```

---

## Quick Reference: Task Dependencies

```
Phase 0 (Infra)
  0.1 GitHub Repo
  0.2 Next.js Init ──── depends on 0.1
  0.3 Vercel Deploy ─── depends on 0.2
  0.4 Claude Config ─── depends on 0.2
  0.5 CI Pipeline ───── depends on 0.3

Phase 1 (UI) ─────────── depends on 0.2
  1.1 Fullscreen Display
  1.2 Controls ───────── depends on 1.1

Phase 2 (Audio) ──────── depends on 0.2
  2.1 Mic Capture
  2.2 Transcription ──── depends on 2.1

Phase 3 (AI) ─────────── depends on 2.2
  3.1 System Prompts
  3.2 Interpretation ─── depends on 3.1

Phase 4 (Images) ─────── depends on 0.2
  4.1 Image Gen ────────(can run parallel with Phases 2-3)

Phase 5 (Templates) ──── depends on 3.2, 4.1
  5.1 Template Manager

Phase 6 (State) ──────── depends on 3.2, 4.1, 5.1
  6.1 Session State

Phase 7 (Integration) ── depends on ALL above
  7.1 Wire Pipeline
  7.2 E2E Tests

Phase 8 (Optimization) ─ depends on 7.1
  8.1 Latency Pass

Phase 9 (Release) ────── depends on 8.1
  9.1 Production Hardening
  9.2 Tag v0.1.0
```

**Parallelizable:** Phases 1, 2, and 4 can all run in parallel after Phase 0 is complete.
