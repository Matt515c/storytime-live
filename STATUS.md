# Project Status — StoryLive

**Last updated:** [DATE]
**Branch:** `master`
**Deployment:** Not yet deployed

---

## Current Phase

**Phase: Project Bootstrap** — Setting up repo, tooling, CI/CD, and deploying skeleton to Vercel.

## Build Task Progress

| Task                                | Status      | Notes                                                                    |
| ----------------------------------- | ----------- | ------------------------------------------------------------------------ |
| Task 1: Project Scaffold & Base UI  | Not Started | Next.js 15 App Router, fullscreen image display, session controls        |
| Task 2: Mic Capture & Transcription | Not Started | getUserMedia mic-only, streaming STT via Deepgram                        |
| Task 3: AI Interpretation Layer     | Not Started | Phase detection, intent classification, fast LLM                         |
| Task 4: Image Generation Pipeline   | Not Started | fal.ai Flux Schnell, reference image support                             |
| Task 5: Template Pre-Fabrication    | Not Started | Critical latency optimization — pre-build prompts during audience pauses |
| Task 6: Session State Management    | Not Started | In-memory state for phase, character, setting, templates                 |
| Task 7: End-to-End Integration      | Not Started | Wire all components, debug overlay                                       |
| Task 8: Latency Optimization        | Not Started | Parallelize, stream LLM, pre-warm connections, metrics                   |

## Infrastructure Status

| Component             | Status         | Notes                                          |
| --------------------- | -------------- | ---------------------------------------------- |
| GitHub repo           | Not Created    |                                                |
| Vercel project        | Not Created    |                                                |
| Domain                | Not Configured |                                                |
| Environment variables | Not Set        | Deepgram, Anthropic/OpenAI, fal.ai keys needed |
| CI/CD pipeline        | Not Set        | GitHub Actions → Vercel                        |

## Known Issues

_None yet — project not started._

## Recent Changes

_None yet — project not started._

## Blocked / Needs Action

- [ ] Choose speech-to-text provider (Deepgram recommended for streaming)
- [ ] Choose image generation provider (fal.ai Flux Schnell recommended for speed)
- [ ] Choose LLM for interpretation (Claude Haiku or GPT-4o-mini for speed)
- [ ] Obtain API keys for all services
