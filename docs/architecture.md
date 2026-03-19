# StoryLive — Architecture

## System Overview

StoryLive is a real-time pipeline: narrator speech → transcription → AI interpretation → image generation → display. The single engineering constraint driving all decisions is **latency**. A child's attention span is the clock.

## Data Flow

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐     ┌────────────────┐     ┌─────────┐
│  Narrator's  │────▶│  Streaming   │────▶│  AI Interpret.  │────▶│  Image Gen     │────▶│  UI     │
│  Microphone  │     │  STT (Deepgram)│   │  Layer (LLM)   │     │  (fal.ai)      │     │  Display│
└─────────────┘     └──────────────┘     └─────────────────┘     └────────────────┘     └─────────┘
                                                │                        ▲
                                                │   Template Pre-fab     │
                                                ▼                        │
                                         ┌──────────────┐    ┌──────────┴───────┐
                                         │ Session State │    │ Prompt           │
                                         │ (in-memory)   │    │ Construction LLM │
                                         └──────────────┘    └──────────────────┘
```

## Component Architecture

### Client (Next.js App Router)

- `src/app/page.tsx` — Session page: fullscreen image display + minimal controls
- `src/components/` — SessionDisplay, ControlOverlay, DebugOverlay, StatusIndicator
- `src/hooks/use-microphone.ts` — getUserMedia mic-only capture
- `src/hooks/use-session.ts` — Session lifecycle (start/stop, state sync)
- `src/hooks/use-transcription.ts` — WebSocket connection to streaming STT
- `src/lib/audio/` — Audio capture and streaming utilities

### Server (API Routes / Server Actions)

- `src/app/api/session/` — Session start/stop endpoints
- `src/app/api/interpret/` — Receives transcript chunks, returns classifications
- `src/app/api/generate/` — Image generation endpoint (prompt → image URL)
- `src/services/transcription/` — STT provider adapter (Deepgram)
- `src/services/interpretation/` — LLM-based phase detection and intent classification
- `src/services/image-generation/` — Image gen provider adapter (fal.ai)
- `src/services/prompt-construction/` — Converts narration to optimized image prompts
- `src/services/template-manager/` — Template pre-fabrication and completion
- `src/services/session-state/` — In-memory session state management

### Shared

- `src/types/` — All TypeScript types and Zod schemas
- `src/types/session.ts` — SessionState, Phase, IntentClassification
- `src/types/pipeline.ts` — TemplatePrompt, ImageGenerationRequest, etc.
- `src/lib/constants/` — System prompts, configuration constants
- `src/lib/prompts/` — LLM system prompts for interpretation and prompt construction

## Pipeline Phases

### Phase 1: CHARACTER_CREATION

- Trigger: Session start (default phase)
- Behavior: Detect character descriptions → generate character image
- Supports: Iterative refinement (modifications, not regenerations)
- Output: Character reference image stored in session state

### Phase 2: SETTING_ESTABLISHMENT

- Trigger: Narrator transition cue ("where does our hero live...")
- Behavior: Generate setting image WITH character composited in
- Input: Character reference image + setting description
- Output: Setting image (with character) becomes new scene reference

### Phase 3: ACTIVE_STORYTELLING

- Trigger: Narrator transition cue ("let's begin our story...")
- Behavior: Template pre-fabrication on QUESTION_TO_AUDIENCE, immediate generation on AUDIENCE_RESPONSE_RELAY
- Critical: Each scene passes previous scene image as reference
- The template pre-fab pattern eliminates one full LLM round-trip from the latency chain

## Intent Classifications

| Intent                  | Triggers Generation?                   | Template Action          | Phase Transition? |
| ----------------------- | -------------------------------------- | ------------------------ | ----------------- |
| CREATIVE_DIRECTIVE      | Yes — full pipeline                    | None                     | No                |
| MODIFICATION_REQUEST    | Yes — with reference image             | None                     | No                |
| QUESTION_TO_AUDIENCE    | No                                     | Pre-fabricate template   | No                |
| AUDIENCE_RESPONSE_RELAY | Yes — template path (fast) or fallback | Complete & fire template | No                |
| TRANSITION              | No                                     | None                     | Yes               |
| CONVERSATION            | No                                     | None                     | No                |

## Environment Variables

```
# Speech-to-Text
DEEPGRAM_API_KEY=

# LLM (Interpretation + Prompt Construction)
ANTHROPIC_API_KEY=     # or OPENAI_API_KEY=

# Image Generation
FAL_API_KEY=

# App
NEXT_PUBLIC_APP_URL=
NODE_ENV=
```

## Key Design Constraints

1. Mic-only audio capture — never system/speaker audio
2. No persistent storage — all session state in memory
3. No PII storage — narrator audio is processed and discarded
4. Speed over quality for prototype — fastest models at every stage
5. Visual continuity via reference image chain through all generations
