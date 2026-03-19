# Tech Debt — StoryLive

Tracked decisions, deferred migrations, and known improvements.

---

## TD-001: Consider migrating image generation from Replicate to fal.ai

**Priority:** Medium
**Added:** 2026-03-19

### Context

Research (March 2026) shows fal.ai has pulled significantly ahead of Replicate for image generation:

- **30-50% cheaper** across the board, up to 80% cheaper for video
- **600+ models** vs Replicate's ~200
- **Faster inference**: Flux models run up to 4x faster on fal. Flux 2 Pro: 3-5s on fal vs 5-8s on Replicate
- **Minimal cold starts** (5-10s) vs Replicate (20-60s+)
- **Exclusive models** like Sora 2, Kling O1, Recraft V3

### Why we chose Replicate anyway

- Consolidates to fewer API keys (Replicate handles image gen)
- User already has Replicate account
- FLUX Kontext Pro is available on both platforms
- For a prototype, the speed difference is acceptable

### What a migration would involve

- The codebase already has a fal.ai adapter (`src/services/image-generation/fal.adapter.ts`) — it just needs to be swapped in as the active adapter
- Update `.env` from `REPLICATE_API_TOKEN` to `FAL_API_KEY`
- Update `next.config.ts` image remote patterns (already configured for `*.fal.ai`)
- May need to adjust the fal.ai adapter for Flux Kontext Pro (currently targets Flux Schnell)

### When to revisit

- If cold-start latency on Replicate becomes a problem during live testing
- If we need models exclusive to fal.ai
- Before scaling beyond prototype

### Sources

- [fal.ai vs Replicate Comparison (TeamDay, 2026)](https://www.teamday.ai/blog/fal-ai-vs-replicate-comparison)
- [Best AI Inference Platform 2026 (WaveSpeed)](https://wavespeed.ai/blog/posts/best-ai-inference-platform-2026/)

---

## TD-002: Evaluate Nano Banana 2 (Google Gemini Image) for character consistency

**Priority:** Low
**Added:** 2026-03-19

### Context

Google's Nano Banana 2 (Gemini 3.1 Flash Image) supports up to 14 reference images (10 objects + 4 characters) for maintaining character consistency. Speed-optimized Flash variant available.

### Why we didn't choose it

- Only available via Google's Gemini API — NOT on Replicate or fal.ai
- Would add another API key (though user already has Google AI Studio access)
- FLUX Kontext Pro benchmarks higher on character preservation

### When to revisit

- If FLUX Kontext Pro character consistency proves insufficient in live testing
- If Google makes Nano Banana available on third-party platforms
