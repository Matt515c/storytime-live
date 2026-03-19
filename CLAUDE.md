# StoryLive

Real-time interactive storytelling platform — narrator speaks, AI generates scene images live during video calls with kids. Next.js 15 App Router, TypeScript strict mode, Tailwind CSS.

@STATUS.md
@MEMORY.md
@docs/architecture.md

## Commands

- `pnpm dev`: Dev server on port 3000
- `pnpm build`: Production build (must pass before any PR)
- `pnpm test`: Run Vitest test suite
- `pnpm test:coverage`: Run tests with coverage report (target: 100%)
- `pnpm lint`: ESLint + Prettier check
- `pnpm type-check`: TypeScript strict compilation check

## Code Style

- Named exports only — NEVER use default exports (except Next.js page/layout files which require them)
- All components: `ComponentName.tsx` with colocated `ComponentName.test.tsx`
- All hooks: `use-hook-name.ts` in `src/hooks/` with colocated test
- All server actions and API routes: handler per file in `src/app/api/`
- Barrel exports via `index.ts` in each module directory
- Zod for ALL runtime validation — API inputs, environment variables, WebSocket messages
- Explicit return types on all exported functions
- Prefer `interface` over `type` for object shapes; use `type` for unions/intersections

## Architecture Rules

- The AI pipeline has 3 phases: CHARACTER_CREATION → SETTING_ESTABLISHMENT → ACTIVE_STORYTELLING. All pipeline code must be phase-aware.
- Audio capture is mic-only via getUserMedia. NEVER capture system/speaker audio. The narrator is the deliberate human filter.
- Template pre-fabrication is the critical latency optimization. During QUESTION_TO_AUDIENCE, pre-build the image prompt with a [PLACEHOLDER]. On AUDIENCE_RESPONSE_RELAY, do text replacement and fire immediately — no additional LLM call.
- Every image generation passes the previous scene image as reference for visual continuity.
- Session state is in-memory only. No database, no persistence for the prototype.
- All LLM calls use the fastest available model. Interpretation and prompt construction prioritize speed over depth.
- Real-time transcription must be streaming (partial results), never batch.
- WebSocket or Server-Sent Events for server→client image push. No polling.

## Naming Conventions

- Files: `kebab-case.ts` for modules, `PascalCase.tsx` for components
- Directories: `kebab-case/`
- Types/Interfaces: `PascalCase` — e.g., `SessionState`, `PipelinePhase`
- Enums: `PascalCase` with `SCREAMING_SNAKE_CASE` members — e.g., `Phase.CHARACTER_CREATION`
- Environment variables: `SCREAMING_SNAKE_CASE` prefixed by service — e.g., `DEEPGRAM_API_KEY`, `FAL_API_KEY`
- Event handlers: `handle` prefix — e.g., `handleSessionStart`, `handleTranscript`
- Server actions: verb-noun — e.g., `generateImage`, `classifyIntent`

## Workflow

- Branch from `master` directly until stable 1.0, then switch to `dev`/`master` model
- Commits: Conventional commits — `feat:`, `fix:`, `test:`, `docs:`, `chore:`, `refactor:`
- Every commit must pass `pnpm type-check && pnpm lint && pnpm test`
- PR descriptions must include what changed, why, and how to test it

## Safety Rules

- NEVER commit `.env.local` or any file containing API keys
- NEVER capture system audio or speaker output — mic input only
- NEVER store children's voice data or any PII — the app only processes narrator audio
- NEVER make the debug overlay visible by default — it must require a keyboard shortcut (Ctrl+Shift+D)
- NEVER skip writing tests — 100% coverage target, every PR must maintain or increase coverage
- NEVER use `any` type — use `unknown` with type guards if the type is truly unknown

## Key References

- @docs/product-spec.md (full product specification — READ THIS FIRST)
- @docs/task-scaffold.md (build task sequence and dependencies)
- @docs/architecture.md (system architecture and data flow)
