# StoryLive — Build Task Scaffold

## How to Use This Document

This is a sequential task list for building the StoryLive prototype. Each task builds on the previous one. Read `PRODUCT_SPEC.md` in full before starting — it contains critical behavioral nuance that must not be lost in implementation.

This is a **Next.js** application. The prototype does not require persistent storage, authentication, or database. Everything lives in memory for the duration of a session.

---

## Task 1: Project Scaffold & Base UI

**What to build:**

- Initialize a Next.js project (App Router).
- Create the main session page with a fullscreen image display area.
- The image area should fill the entire viewport. No chrome, no toolbars, no sidebars visible during an active session.
- Add a minimal control overlay (semi-transparent, auto-hiding or tucked to the edge) with:
  - A "Start Session" button
  - A "Stop Session" button
  - A small status indicator (listening / processing / idle)
- When no image has been generated yet, display a simple placeholder or dark background.
- When an image is generated, it replaces whatever is currently displayed, filling the viewport.

**Why it matters:**
This screen will be shared via meeting software. It must look clean, with nothing distracting. The narrator may have their face in a small meeting bubble overlaid by the meeting software — that's not our concern. Our screen must be visually clean.

**Acceptance criteria:**

- Fullscreen image display works.
- Start/Stop controls exist and are minimal.
- Responsive to at least standard laptop/desktop resolutions.

---

## Task 2: Microphone Capture & Real-Time Transcription

**What to build:**

- On "Start Session," request microphone access via the browser (`getUserMedia`, audio only).
- Capture ONLY the microphone input. Do NOT capture system audio, display audio, or any output device. This is critical — the app must never hear the meeting participants directly.
- Stream the microphone audio to a real-time speech-to-text service.
- Use a streaming/real-time transcription API (e.g., Deepgram, AssemblyAI real-time, or OpenAI Whisper with streaming). The transcription must be streaming — not "record a chunk then transcribe." Partial results should arrive as the narrator speaks.
- Surface the transcribed text internally (not displayed to the user in the final UI, but available for debugging — consider a hidden debug panel toggled with a keyboard shortcut).

**Why it matters:**
The narrator speaks continuously. The AI pipeline needs a live feed of what's being said. Batch transcription would introduce unacceptable latency. The mic-only constraint ensures the app only hears the narrator and never the children directly — the narrator is the deliberate human filter for all audience input.

**Acceptance criteria:**

- Browser requests mic-only permission.
- Audio streams to transcription service.
- Transcribed text appears in real-time (streaming partial results).
- System/speaker audio is never captured.

---

## Task 3: AI Interpretation Layer — Phase Detection & Intent Classification

**What to build:**

- Create a server-side AI interpretation service that receives the streaming transcription.
- This service sends the accumulated transcript (with rolling context) to a fast LLM (e.g., Claude Haiku, GPT-4o-mini, or equivalent — prioritize speed over depth).
- The LLM must maintain awareness of the **current phase**:
  - `CHARACTER_CREATION` — Building the protagonist.
  - `SETTING_ESTABLISHMENT` — Creating the world/environment.
  - `ACTIVE_STORYTELLING` — Telling the story with audience interaction.
- The LLM must classify each segment of narration as one of:
  - `CREATIVE_DIRECTIVE` — Actionable description that should trigger image generation or modification (e.g., "Our hero is a red dragon-unicorn with a rainbow horn").
  - `MODIFICATION_REQUEST` — A change to the current image (e.g., "Let's make the tail blue instead").
  - `QUESTION_TO_AUDIENCE` — The narrator is asking the kids for input; this is a pause point (e.g., "What does our hero see?").
  - `AUDIENCE_RESPONSE_RELAY` — The narrator is relaying what the kids said (e.g., "Great, you want a pink castle!").
  - `TRANSITION` — Moving to the next phase (e.g., "Now let's figure out where our hero lives").
  - `CONVERSATION` — Not actionable; narration, reactions, filler (e.g., "That's awesome!" or "Are you guys ready?").

**Key behavior:**

- The AI should NOT trigger image generation on every utterance. Only `CREATIVE_DIRECTIVE`, `MODIFICATION_REQUEST`, and `AUDIENCE_RESPONSE_RELAY` (when a template is active) should trigger visual changes.
- `QUESTION_TO_AUDIENCE` should trigger **template pre-fabrication** (see Task 5).
- `TRANSITION` should update the current phase.
- `CONVERSATION` should be ignored for generation purposes.

**System prompt guidance for the interpretation LLM:**
The LLM needs a carefully crafted system prompt that explains the storytelling context — that a narrator is telling a live story to children, that the narrator is the only voice being heard, that the narrator re-iterates what children say, and that the LLM's job is to classify intent and extract visual descriptions. The system prompt should include examples of each classification type. Provide this system prompt in the codebase as a clearly documented, easily editable constant or config file.

**Acceptance criteria:**

- Streaming transcript feeds into the interpretation LLM.
- LLM correctly identifies phases and intents.
- Classification results are available to downstream systems in real-time.
- System prompt is documented and editable.

---

## Task 4: Image Generation Pipeline — Basic Generation

**What to build:**

- Integrate with a fast image generation API. Prioritize speed over quality for the prototype. Options to evaluate (pick the fastest that supports reference images):
  - SDXL Turbo / SDXL Lightning via Replicate or fal.ai
  - Flux Schnell via Replicate or fal.ai
  - Any API that can return an image in 1-3 seconds
- Create a prompt construction module that takes the AI interpretation layer's output and builds image generation prompts optimized for the chosen API.
- Implement the generation flow:
  1. Receive a creative directive or completed template from the interpretation layer.
  2. Call the fast LLM to convert the natural language description into an optimized image generation prompt (concise, specific to the chosen model's prompt format). This is a separate, focused LLM call — "take this narrative description and turn it into an optimal image prompt for [model]."
  3. Send the prompt to the image generation API.
  4. When the image is returned, push it to the frontend for display.
- Implement reference image support: the API call must support passing a previous image as a reference/input for character and scene continuity.

**Image generation prompt construction notes:**

- The LLM that converts narration into image prompts should be fast (small model).
- Prompts should specify a consistent art style (e.g., "storybook illustration," "children's book art style," "vibrant fantasy illustration for children").
- Prompts must be concise — image gen models perform better with focused prompts, not novels.

**Acceptance criteria:**

- Image generation API is integrated and functional.
- Natural language descriptions are converted to optimized prompts.
- Images generate and display on the frontend.
- Reference image passing works.

---

## Task 5: Template Pre-Fabrication System (Critical Latency Optimization)

**What to build:**
This is the most important latency optimization in the system. Read PRODUCT_SPEC.md Section 7.2 carefully.

- When the interpretation layer detects `QUESTION_TO_AUDIENCE`, immediately trigger the template pre-fabrication flow:
  1. The AI has accumulated story context up to this point — it knows the characters, setting, recent events, and the trajectory of the narration.
  2. Make an LLM call to generate a **nearly complete image generation prompt** with a clearly marked `[PLACEHOLDER]` for the missing audience input.
  3. The LLM also generates a brief description of **what the placeholder is waiting for** (e.g., "what the hero sees below them," "what creature appears," "what color the door is"). Store this as placeholder context.
  4. Store this template in session state as the **active template**.

- When the interpretation layer subsequently detects `AUDIENCE_RESPONSE_RELAY`:
  1. Extract the key visual description from the narrator's relay.
  2. Replace the `[PLACEHOLDER]` in the active template with the extracted description.
  3. **Immediately** send the completed prompt to the image generation API. No additional LLM call for prompt construction is needed — the template is already a fully formed image prompt.
  4. Clear the active template from state.

- **Fallback:** If no template is active when an `AUDIENCE_RESPONSE_RELAY` arrives (e.g., the narrator didn't ask a question first, or the system missed the question), fall back to the standard generation flow from Task 4 (LLM call to build prompt, then image gen).

**System prompt for template generation:**
The LLM generating the template needs to understand:

- It is creating an image generation prompt, not a story summary.
- The prompt should be complete and ready to fire except for one specific visual element.
- The placeholder should be clearly delineated.
- The prompt must include: current art style, character descriptions, setting context, and the current scene's action/composition.
- It should include instruction to reference the previous scene image for continuity.

**Acceptance criteria:**

- When narrator asks a question, a template prompt is generated during the pause.
- When narrator relays the answer, text replacement happens and prompt fires immediately.
- Latency from narrator speaking the answer to image generation request firing is under 500ms (excluding image gen time itself).
- Fallback to standard generation works when no template is active.

---

## Task 6: Session State Management

**What to build:**

- In-memory session state that tracks:
  - `currentPhase`: CHARACTER_CREATION | SETTING_ESTABLISHMENT | ACTIVE_STORYTELLING
  - `characterDescription`: Accumulated text description of the protagonist, updated with each refinement.
  - `characterReferenceImage`: URL or base64 of the most recent character image.
  - `settingDescription`: Accumulated text description of the world.
  - `currentSceneImage`: The most recently displayed image (used as reference for next generation).
  - `storyContext`: A running summary of the story so far (kept concise — periodically summarized to avoid context window bloat).
  - `activeTemplate`: The pre-fabricated prompt template, if one exists. Null otherwise.
  - `placeholderContext`: Description of what the active template's placeholder is waiting for.
  - `generationHistory`: Array of prompt/image pairs for the session (for debugging, not displayed).

- State updates occur as the AI pipeline processes narration:
  - Phase transitions update `currentPhase`.
  - Character creation/modification updates `characterDescription` and `characterReferenceImage`.
  - Setting creation updates `settingDescription` and `currentSceneImage`.
  - Each new image generation updates `currentSceneImage`.
  - Template creation populates `activeTemplate` and `placeholderContext`.
  - Template completion clears `activeTemplate` and `placeholderContext`.

**Acceptance criteria:**

- All state fields are maintained throughout a session.
- State is accessible to all pipeline components.
- No persistence layer needed — in-memory only.

---

## Task 7: End-to-End Pipeline Integration

**What to build:**

- Wire together all components into the complete flow:
  1. Narrator clicks "Start Session" → mic capture begins → transcription starts streaming.
  2. Transcription feeds to interpretation layer → phase and intent are classified.
  3. Based on classification:
     - `CREATIVE_DIRECTIVE` → Prompt construction → Image generation → Display.
     - `MODIFICATION_REQUEST` → Modification prompt (referencing current image) → Image generation → Display.
     - `QUESTION_TO_AUDIENCE` → Template pre-fabrication begins in background.
     - `AUDIENCE_RESPONSE_RELAY` → If template active: text replace + immediate image gen. If no template: standard generation flow.
     - `TRANSITION` → Phase update. No image generation.
     - `CONVERSATION` → No action.
  4. Every image generation passes the previous scene image as reference for continuity.
  5. Narrator clicks "Stop Session" → mic capture stops → transcription stops → session ends.

- Add a **debug overlay** (toggled via keyboard shortcut, e.g., Ctrl+Shift+D) that shows:
  - Current phase
  - Last classification result
  - Active template status
  - Last generated prompt
  - Transcription feed (rolling last ~30 seconds)

**Acceptance criteria:**

- Complete flow works end-to-end: narrator speaks → AI interprets → images generate and display.
- Phase transitions work correctly across all three phases.
- Template pre-fabrication activates and completes correctly.
- Visual continuity is maintained via reference images.
- Debug overlay is functional.

---

## Task 8: Latency Optimization Pass

**What to build:**
After the pipeline is functional, do an optimization pass focused on latency:

- **Parallelize where possible:** Template pre-fabrication should happen concurrently with other processing, not block anything.
- **Stream LLM responses:** Don't wait for complete LLM responses before acting. If the interpretation layer can classify intent from a partial response, act on it.
- **Pre-warm connections:** Keep API connections warm to avoid cold-start latency on image generation calls.
- **Optimize prompt length:** Shorter prompts generally generate faster. Ensure the prompt construction LLM is producing concise prompts.
- **Consider image generation queuing:** If a new generation is triggered while one is in progress, decide on behavior — queue it, cancel the in-progress one, or let both complete and display the most recent.
- **Measure and log latency** at each stage:
  - Speech → transcript available
  - Transcript → classification complete
  - Classification → prompt ready
  - Prompt → image generation request sent
  - Image generation request → image returned
  - Image returned → displayed on screen
  - **End-to-end: narrator finishes speaking → image displayed**

**Acceptance criteria:**

- Latency metrics are logged and visible in debug overlay.
- End-to-end latency (narrator speaks → image displayed) is minimized.
- No unnecessary sequential bottlenecks remain.

---

## Build Order & Dependencies

```
Task 1 (UI) ─────────────────────────────────────────────────┐
Task 2 (Mic + Transcription) ────────────────────────────────┤
Task 3 (AI Interpretation) ──── depends on Task 2 ──────────┤
Task 4 (Image Generation) ──────────────────────────────────┤
Task 5 (Template Pre-fab) ──── depends on Tasks 3 & 4 ──────┤
Task 6 (State Management) ──── depends on Tasks 3, 4, 5 ────┤
Task 7 (Integration) ────────── depends on ALL above ────────┤
Task 8 (Optimization) ────────── depends on Task 7 ──────────┘
```

Tasks 1, 2, and 4 can be built in parallel. Task 3 needs Task 2's output. Task 5 needs Tasks 3 and 4. Task 6 ties state across 3, 4, and 5. Task 7 is the integration pass. Task 8 is polish.

---

## API Keys & Services Needed

The following external services will be needed. Configure via environment variables:

- **Speech-to-text (streaming):** Deepgram / AssemblyAI / equivalent
- **LLM (fast, for interpretation + prompt construction):** Anthropic Claude Haiku / OpenAI GPT-4o-mini / equivalent
- **Image generation (fast, supports reference images):** fal.ai (Flux Schnell) / Replicate (SDXL Turbo/Lightning) / equivalent

All API keys should be in `.env.local` and never committed to version control.
