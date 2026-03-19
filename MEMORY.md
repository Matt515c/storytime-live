# Memory — StoryLive

Persistent learnings, patterns, and corrections. Claude updates this file after discovering non-obvious behavior, making mistakes, or learning project-specific patterns. This file prevents the same mistake from happening twice.

**Rule: After ANY correction or non-obvious discovery, add an entry here immediately.**

---

## Architecture Decisions

- **Image gen provider:** [Not yet chosen — evaluate fal.ai Flux Schnell first for speed]
- **STT provider:** [Not yet chosen — evaluate Deepgram streaming first]
- **Interpretation LLM:** [Not yet chosen — evaluate Claude Haiku for speed + quality balance]
- **Art style prompt suffix:** [TBD — establish consistent storybook illustration style string]

## Patterns Learned

_Updated as development progresses. Format: date — lesson._

## API Quirks & Gotchas

_Updated when API-specific behaviors are discovered. Format: service — behavior — workaround._

## Prompt Engineering Notes

_Updated as system prompts are refined. Track what works and what doesn't for the interpretation LLM and prompt construction LLM._

## Performance Benchmarks

_Track latency measurements as the pipeline is built. Format: stage — measured latency — target._

| Stage                          | Measured | Target  | Notes                              |
| ------------------------------ | -------- | ------- | ---------------------------------- |
| Speech → transcript            | —        | <500ms  | Streaming partial results          |
| Transcript → classification    | —        | <300ms  | Fast LLM, streaming response       |
| Classification → prompt ready  | —        | <500ms  | Template path: ~0ms (text replace) |
| Prompt → image request sent    | —        | <100ms  | Network overhead only              |
| Image request → image returned | —        | 1-3s    | Provider-dependent                 |
| Image returned → displayed     | —        | <100ms  | Client-side swap                   |
| **End-to-end**                 | —        | **<5s** | Narrator speaks → image appears    |
