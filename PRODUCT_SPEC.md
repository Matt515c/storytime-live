# StoryLive — Product Specification

## What This Document Is

This is the authoritative reference for building StoryLive, a live interactive storytelling platform. Every design decision, nuance, and behavioral expectation described here must be preserved in implementation. Do not simplify, skip, or reinterpret any section — each reflects a deliberate choice made to solve a specific problem in the live storytelling experience.

---

## 1. Product Overview

StoryLive is a web application used by a **narrator** who tells live, interactive stories to children over video conferencing software (e.g., Google Meet, Zoom). The narrator shares their browser screen during the meeting. The browser displays AI-generated images that evolve in real-time as the story is told.

The children participate by shouting out ideas — character traits, plot points, settings — and the narrator verbally relays those ideas back into the application via their microphone. The AI listens, interprets, and generates images that reflect the evolving story.

**The single most important engineering constraint is latency.** Every architectural decision must prioritize making image generation feel nearly instantaneous during a live performance. A child's attention span is the clock.

---

## 2. Platform & UI

### 2.1 The Web App

- A Next.js application.
- The UI is intentionally "dumb simple." In its most basic form, it displays **one large image** that fills the screen.
- The app must be designed to be **maximized in a browser window** so that any screen-sharing or screen-recording software captures it cleanly.
- The narrator will likely appear in a small video bubble in the corner of their meeting software — this is handled by the meeting software, not by StoryLive.
- There is a **session model**: the narrator logs in, creates a session, and has start/stop controls. "Start" tells the AI to begin listening. "Stop" ends the session.
- **No persistent storage is required for the prototype.** Images can be ephemeral. Sessions do not need to be saved. If images are lost after the session ends, that is acceptable.
- The app does **not** need to record the session. The meeting software (Meet, Zoom, Loom, etc.) handles recording. StoryLive's only job is listening and displaying images.

### 2.2 What the UI Does NOT Do

- It does not display text, transcripts, or chat.
- It does not have complex controls visible during a session (those should be minimal/hidden).
- It does not play audio or video.
- It is not responsible for any meeting/conferencing functionality.

---

## 3. Audio Architecture

### 3.1 The Core Constraint

The narrator is simultaneously:

1. On a video meeting (Google Meet, Zoom, etc.) with children.
2. Running StoryLive in a browser tab that is being screen-shared.

**StoryLive must listen ONLY to the narrator's microphone input.** It must NOT capture or process:

- Audio coming through the computer's speakers (i.e., the children's voices from the meeting).
- System audio of any kind.
- Any audio from the meeting software.

This is critical. If the app picks up children's voices directly, it may hear things out of context, misinterpret partial statements, or generate inappropriate content. The narrator is the **human filter** — this is a deliberate design choice, not a limitation.

### 3.2 The Narrator as Human Filter

Because the app only hears the narrator, the narrator's role is to **re-iterate** what the children say. This is intentional and serves multiple purposes:

1. **Content filtering** — The narrator controls what the AI hears and acts on.
2. **Clarity** — Children shout over each other; the narrator distills consensus.
3. **Pacing** — The narrator controls when the AI receives actionable input.
4. **Audio isolation** — No risk of meeting audio bleeding into the AI's input.

The narrator understands this role. They know that if they don't say it, the AI doesn't hear it. This is a feature, not a bug.

### 3.3 Technical Implication

The browser should request access to the user's **microphone only** (via `getUserMedia` with audio-only constraints). It should explicitly NOT request or capture system audio, display audio, or any audio output device. The Web Audio API or MediaStream API should be configured to capture only the selected microphone input device.

---

## 4. The AI Pipeline — Overview

The AI operates in three sequential phases during a storytelling session:

1. **Character Creation** — Building the story's hero/protagonist.
2. **Setting Establishment** — Placing the character into a world.
3. **Active Storytelling** — Narrating the story with audience participation, generating sequential scene images.

Each phase has distinct AI behaviors, prompt strategies, and image generation patterns. The AI must understand which phase it is in and behave accordingly.

---

## 5. Phase 1: Character Creation

### 5.1 How It Works

The narrator begins the session by asking the audience to help create a character. Example flow:

> **Narrator:** "Okay, let's create the hero of our story! Who should our hero be?"
>
> **Children (heard only by narrator via meeting):** "A dragon!" "A unicorn!" "A rainbow cat!"
>
> **Narrator (re-iterating to the app):** "Great! So our hero is going to be a dragon-unicorn — a big red dragon with a unicorn horn!"

### 5.2 What the AI Must Do

1. **Detect that character creation is happening.** The AI must recognize from the narrator's speech that they are in the character creation phase. Signals include phrases like "let's create our hero," "what should our character look like," "who's going to be in our story," etc.

2. **Identify the creation moment.** When the narrator re-iterates the children's choice (e.g., "our hero is going to be a dragon-unicorn"), the AI must recognize this as an actionable description and immediately begin generating.

3. **Distill the description into an image generation prompt.** The AI must take the narrator's verbal description and convert it into a concise, high-quality image generation prompt as fast as possible. This is an LLM call — it should use a fast model (not a large/slow one) to translate natural speech into an optimized prompt for the image generator.

4. **Generate the image immediately.** Fire the prompt to the image generation API. Speed is paramount. Use the fastest available model/service. Target: image visible on screen within 1-3 seconds of the narrator finishing their description.

5. **Display the image.** Replace whatever is currently on screen with the new character image.

### 5.3 Iterative Refinement

After the initial character image appears, the narrator will ask for feedback:

> **Narrator:** "How does our hero look? Do you want to change anything?"
>
> **Children:** "Make the horn rainbow!" "Bigger scales!" "Blue tail!"
>
> **Narrator:** "Okay! Let's give our dragon-unicorn a rainbow horn, bigger red scales, and a blue tail!"

The AI must:

1. **Recognize this as a modification, NOT a new generation.** The AI must understand the difference between "create something new" and "change what exists." This is critical — it should not regenerate from scratch; it should modify.

2. **Generate a modification prompt** that references the existing image/description and applies the requested changes.

3. **Maintain character consistency** across iterations. The dragon-unicorn after changes should still be recognizably the same dragon-unicorn.

### 5.4 Distinguishing Action from Conversation

The AI must differentiate between:

- **Actionable narration** (things that should trigger image generation or modification): "Our hero is a dragon-unicorn with red scales."
- **Conversational narration** (things that should NOT trigger generation): "How does that look to you guys?" or "What do you think?" or "That's awesome!"
- **Transition cues** (signals that we're moving to the next phase): "Great, now we have our hero! Let's figure out where our story takes place."

The AI should NOT be changing the image every time the narrator speaks. It should only act when it detects a clear creative directive.

---

## 6. Phase 2: Setting Establishment

### 6.1 How It Works

After the character is finalized, the narrator moves to establishing the setting:

> **Narrator:** "Now, where is our dragon-unicorn going to live? What kind of world are they in?"
>
> **Children:** "A cloud kingdom!" "A candy forest!"
>
> **Narrator:** "Our dragon-unicorn lives in a magical cloud kingdom, high above the world, with floating islands and rainbow bridges!"

### 6.2 What the AI Must Do

1. **Detect the transition to setting creation.** Recognize cues like "where does our character live," "what kind of world," "where is our story going to take place."

2. **Generate the setting image WITH the character in it.** This is critical — the setting image is NOT just a background. It must include the character. The previously generated character image must be passed as a **reference image** to the image generation API so that the character is composited into the new setting.

3. **The prompt must instruct the image generator** to place the established character into the described setting. The prompt combines: the setting description + instruction to include the character + the reference image of the character.

4. **Support iterative changes** to the setting, same as character creation. If the narrator says "let's add a waterfall" or "make the clouds pink," the AI modifies the setting while keeping the character present.

### 6.3 Reference Image Chain

From this point forward, every image generation must maintain visual continuity:

- The character image becomes a reference for the setting image.
- The setting image (with character) becomes the baseline for storytelling images.
- Each subsequent scene passes the previous scene's image as reference for continuity.

---

## 7. Phase 3: Active Storytelling

This is the most complex and latency-sensitive phase. This is where the **template pre-fabrication pattern** is essential.

### 7.1 How It Works

The narrator tells the story, pausing periodically to ask the audience for input:

> **Narrator:** "Our dragon-unicorn hero sets out on a quest through the magical cloud kingdom, seeking a golden chest. High above the clouds, our hero is soaring through the sky when suddenly, they look down and see... what does our hero see?"
>
> **Children:** "A castle!" "A pink one!" "In the clouds!"
>
> **Narrator:** "Our hero sees a big pink castle nestled deep in a billowing cloud mountain!"

### 7.2 The Template Pre-Fabrication Pattern (Critical for Latency)

This is the key architectural innovation for reducing perceived latency during active storytelling. Here is exactly how it works:

#### Step 1: AI Listens to Narration

As the narrator tells the story, the AI is streaming the transcribed speech to an LLM in real-time.

#### Step 2: AI Detects a "Waiting for Input" Moment

When the narrator asks the audience a question (e.g., "what does our hero see?"), the AI recognizes this as a **pause point** — a moment where:

- The narrator is waiting for the audience to respond.
- The AI already has enough context about the current scene to begin preparing.

#### Step 3: AI Pre-Fabricates a Template Prompt (WHILE WAITING)

During the pause — while the narrator is listening to the children's responses — the AI makes an LLM call to generate a **nearly-complete image generation prompt** with a **placeholder slot** for the missing piece.

Example of what the AI generates internally during the pause:

```
"A majestic scene in a magical cloud kingdom with floating islands and rainbow bridges. A dragon-unicorn hero with red scales, a rainbow horn, and a blue tail is soaring high above billowing white clouds, looking down at [PLACEHOLDER: what the hero sees below]. The scene is vibrant, fantastical, and rendered in a storybook illustration style."
```

The `[PLACEHOLDER]` is the only thing missing — the audience's answer.

#### Step 4: Narrator Relays the Answer

When the narrator says "Our hero sees a big pink castle nestled deep in a billowing cloud mountain," the AI:

1. Extracts the key visual description: "a big pink castle nestled deep in a billowing cloud mountain"
2. Performs a **simple text replacement** — swaps the placeholder with the extracted description.
3. **Immediately fires the completed prompt** to the image generator. No additional LLM call needed.

#### Step 5: Image Generates While Story Continues

The narrator continues telling the story. The image generates in the background and displays on screen as soon as it's ready.

### 7.3 Why This Pattern Matters

Without pre-fabrication:

1. Narrator asks question → waits for kids → relays answer
2. AI receives answer → calls LLM to generate full prompt (1-3 seconds)
3. LLM prompt → sent to image generator (2-5+ seconds)
4. **Total latency: 3-8+ seconds of dead air after the narrator speaks**

With pre-fabrication:

1. Narrator asks question → AI immediately starts building template prompt
2. Kids answer → narrator relays → AI does text swap (milliseconds)
3. Completed prompt → immediately sent to image generator (2-5+ seconds)
4. **LLM latency is eliminated.** Only image generation latency remains.

### 7.4 Sequential Scene Generation

Throughout the storytelling phase:

- Each new scene generation must pass the **previous scene's image as a reference** for visual continuity.
- The character should remain recognizable across all scenes.
- The style should remain consistent (storybook illustration style, or whatever is established in the first generation).
- The AI must maintain a running understanding of the story context to generate appropriate prompts.

### 7.5 Pacing and Trigger Discipline

The AI must NOT generate a new image every time the narrator speaks. It should only trigger generation when:

1. The narrator has provided enough new visual information to warrant a scene change.
2. The narrator has explicitly described something that should be visualized.
3. A template has been completed with audience input.

Conversational narration, questions to the audience, reactions ("That's amazing!"), and transitional phrases ("And then...") should NOT trigger generation.

---

## 8. Streaming & Real-Time Transcription

### 8.1 Speech-to-Text

The narrator's microphone audio must be streamed in real-time to a speech-to-text service. Requirements:

- **Streaming/real-time transcription** — not batch. The AI needs to process speech as it happens, not after long pauses.
- Low latency — partial transcripts should be available as the narrator speaks.
- The transcription feeds directly into the AI pipeline for interpretation.

### 8.2 AI Interpretation Stream

The transcribed text streams into an LLM that is responsible for:

1. **Phase detection** — Understanding whether we're in character creation, setting, or storytelling.
2. **Intent classification** — Is this an actionable creative directive, a question, a transition, or conversation?
3. **Prompt generation** — When action is needed, generating or completing image prompts.
4. **Template management** — In storytelling phase, detecting pause points and pre-fabricating templates.

This LLM should be **fast** — use a small, quick model for interpretation. The goal is real-time responsiveness, not deep reasoning.

### 8.3 Image Generation

When a prompt is ready (either freshly generated or completed from a template):

1. Send to the fastest available image generation API.
2. Target generation time: 1-3 seconds ideal, under 5 seconds acceptable.
3. When the image is ready, immediately display it on the UI, replacing the previous image.
4. If reference images are needed (character in setting, scene continuity), pass them with the prompt.

---

## 9. State Management

The AI must maintain session state including:

- **Current phase** (character creation / setting / storytelling)
- **Character description** (accumulated, refined description of the protagonist)
- **Character reference image** (the most recent approved character image)
- **Setting description** (accumulated description of the world/environment)
- **Current scene image** (the most recently displayed image — used as reference for next generation)
- **Story context** (running summary of what has happened in the story so far)
- **Active template** (if in storytelling phase and a template has been pre-fabricated, store it here)
- **Template placeholder context** (what the placeholder is waiting for — e.g., "what the hero sees")

This state exists only in memory for the duration of the session. No persistence required for the prototype.

---

## 10. Image Generation API Notes

- "Nano Banana" is referenced as the image generation service. The implementation should use whatever fast image generation API is available and produces good storybook-style illustrations quickly.
- The primary selection criterion for the image gen model is **speed**. A model that generates in 1-2 seconds is preferred over one that produces slightly better quality in 8-10 seconds.
- The API must support **reference/input images** for character consistency and scene continuity.
- Prompts should be crafted specifically for the chosen image generation API's prompt format and best practices.

---

## 11. Summary of Key Design Principles

1. **Latency is the enemy.** Every decision optimizes for speed.
2. **The narrator is the human filter.** The app only listens to the narrator's mic.
3. **The UI is dumb.** It displays one image. That's it.
4. **The AI is smart about timing.** It knows when to generate and when to wait.
5. **Template pre-fabrication eliminates LLM latency** during the most latency-sensitive phase.
6. **Visual continuity is maintained** by passing reference images forward through the chain.
7. **The prototype is ephemeral.** No storage, no recordings, no persistence. Just a working demo.
