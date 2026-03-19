# StoryLive

Real-time interactive storytelling platform — AI generates scene images live as a narrator tells stories to children.

## Getting Started

```bash
# Clone the repo
git clone https://github.com/Matt515c/storytime-live.git
cd storytime-live

# Install dependencies
pnpm install

# Configure environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Start development server
pnpm dev
```

## Required API Keys

| Service | Key | Where to get it |
|---------|-----|-----------------|
| Deepgram | `DEEPGRAM_API_KEY` | [deepgram.com](https://deepgram.com) — Streaming speech-to-text |
| Anthropic | `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) — LLM for interpretation |
| fal.ai | `FAL_API_KEY` | [fal.ai](https://fal.ai) — Fast image generation (Flux Schnell) |

## Architecture

The app is a real-time pipeline: **Narrator Speech → Transcription → AI Interpretation → Image Generation → Display**.

See [docs/architecture.md](docs/architecture.md) for the full system architecture and data flow.

## How It Works

1. Narrator shares the StoryLive browser tab via video conferencing software
2. StoryLive captures only the narrator's microphone (never system audio)
3. Speech is transcribed in real-time and classified by an AI interpretation layer
4. Based on the classification, images are generated showing the evolving story
5. Children see the images update live as the narrator tells the story

See [docs/product-spec.md](docs/product-spec.md) for the complete product specification.

## Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Production build |
| `pnpm test` | Run tests |
| `pnpm test:coverage` | Run tests with coverage |
| `pnpm lint` | ESLint check |
| `pnpm type-check` | TypeScript check |
| `pnpm format` | Format code with Prettier |

## Deployment

Production: https://storytime-live-5qsdlel8t-mac-technologies.vercel.app

Auto-deploys from `master` branch via Vercel.
