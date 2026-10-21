# UNHEARD — Build a Musical Instrument with Your Trackpad

A free, browser-only buildHours workshop by the **OpenAI Student Collective**, conducted with the **Microsoft Innovation Club × VIT Chennai Office of Student Welfare**. Draw a gesture, hear a sound, and change the code to build your own instrument.

## Run locally

Requires Node.js **20.19+ or 22.12+** and npm (Vite 7 requirement).

```bash
npm install
npm run dev
```

Open the Local URL printed by Vite, normally `http://localhost:5173`. Click **Enable Audio** and listen for three confirmation notes; browsers require explicit user activation. The Studio and header also provide **Test sound** to check the output. Start at a comfortable device volume.

```bash
npm run build     # Production files in dist/
npm run preview   # Preview that production build
npm test          # Unit, audio lifecycle, mapping, and Studio state checks
```

No API keys, accounts, backend, database, remote fonts, recordings, or paid services. After installing the packages, the app works without internet access. Nothing is uploaded. The current composition and tempo save automatically in this browser and restore when Studio opens again. Clearing site data removes the local copy; compositions are not shared across browsers or devices.

## Routes

| Route                      | Experience                                                    |
| -------------------------- | ------------------------------------------------------------- |
| `/`                        | Pointer-reactive introduction and workshop attribution        |
| `/instruments`             | Six synthesized previews and links to preset-specific studios |
| `/studio?instrument=sitar` | Drawing field, settings, visualization, ordered playback      |
| `/extend`                  | Four customization paths and three challenge levels           |

Technology: React 19, Vite 7, JavaScript, React Router, Canvas 2D, Pointer Events, and Web Audio. React/React DOM/React Router are the only runtime packages. The artwork is CSS, SVG, and canvas; no asset downloads.

## Playing

1. Enable Audio in the header. The green status confirms the audio context is running.
2. Select an instrument. Draw with a primary mouse button or trackpad click-and-drag; touch users draw with one finger. A completed stroke plays once and remains visible.
3. Draw higher for a higher note, longer for a longer sound, faster for more intensity. Synth speed also opens its filter.
4. For Tabla, tap the left **Bayan / Low**, center **Dayan / High**, or right **Rim / Accent** region. A swipe longer than the threshold creates a three-hit roll.
5. Press **Play** to hear gestures in drawing order at the chosen tempo. The active stroke glows. **Stop** cancels playback; **Undo** and **Redo** edit up to 64 recent changes for the selected instrument; **Clear** removes that instrument’s strokes and restores the first-use guidance.

Keyboard: all links and controls work with Tab. Focus the gesture canvas and press Enter or Space to add a center note. The scale select and tempo slider support native keyboard interaction. Drawing remains pointer-based; keyboard entry is intentionally a simple center-note alternative.

A stroke stores normalized `points: [{ x, y, time, velocity }]`, a unique `id`, `instrument`, `scale`, MIDI `pitch`, `duration`, `intensity`, stereo `pan`, Tabla `voice`/`roll`, and `createdAt`.

## Gesture mapping

`src/utils/gestureMapping.js` is the workshop's central interaction rulebook:

- Average vertical position quantizes into the selected scale within the preset’s own workshop register: Sitar C3–C5, Bansuri C4–C6, Piano C3–C6, Guitar E2–E5, Synth C2–C6. All use A4 = 440 Hz. These configurable registers are not claims about every acoustic instrument’s physical limits. Tabla uses fixed low/high/rim voices.
- Path length sets duration, clamped to **0.2–3** base units. At 60 BPM these are seconds; tempo scales playback duration and event spacing.
- Path length divided by elapsed time determines intensity, clamped to **0.3–0.95**.
- Average horizontal position sets stereo pan, clamped to **−0.75–0.75**. This is also an easy extension point for effects.
- Drawing order determines playback order; drawing pauses any active playback.
- Each instrument has a separate stroke bank. Switching to Bansuri never replays Guitar strokes; switch back to restore Guitar. Clear affects only the selected bank. Scale changes affect new strokes; previews use that scale too. Tempo affects replay within the selected bank.

Scales are in `src/data/scales.js`: major pentatonic, minor pentatonic, major, minor, and Indian-inspired pentatonic. The last is a **simplified workshop-friendly note arrangement, not a complete or authentic raga system**. It intentionally shares the major pentatonic offsets as an approachable starting point.

## Instrument presets

All voices are **instrument-inspired synthesized presets**, not authentic acoustic emulations.

| Voice           | Sound                                                                                     | Visual identity                                         |
| --------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Sitar           | Sine fundamental, bright string harmonics, subtle ornament, resonant echo                 | Marigold/vermilion strings and parallel harmonic trails |
| Bansuri         | Sustained sine-dominant flute tone, quiet air noise, slow attack/release, delayed vibrato | Peacock/aqua ribbons                                    |
| Tabla           | Three sine pitch drops and noise bursts; swipes create rolls                              | Pink/orange rhythm rings and three labeled regions      |
| Piano           | Four weighted, decaying sine partials                                                     | Ivory/lavender vertical bars                            |
| Electric Guitar | Tuned plucked-string partials with faster damping of upper harmonics, soft overdrive      | Coral/blue arcs                                         |
| Synthesizer     | Detuned sawtooth/triangle, speed-sensitive low-pass envelope                              | Blue/violet geometric pulses                            |

The flute/guitar envelope distinction follows the acoustic distinction between air-driven sustained tones and decaying string harmonics; see [UNSW flute acoustics](https://www.phys.unsw.edu.au/jw/fluteacoustics.html) and [UNSW strings and harmonics](https://www.phys.unsw.edu.au/jw/strings.html). These remain lightweight synthesized approximations.

## Audio architecture and lifecycle

- `src/audio/AudioEngine.js` owns the lazily created AudioContext, a **0.18 master gain**, conservative compression, an analyser, the shared generated noise buffer, playback timers, and bounded polyphony (24 voices).
- `src/audio/instruments.js` creates a voice from a preset, returning all sources and nodes for cleanup. Attack comes from the preset; decay multiplies mapped duration (bounded to 0.18–4 seconds, with a 0.55-second minimum for the Bansuri breath envelope). Resonance adds a short echo without a feedback loop.
- `src/audio/envelopes.js` ramps gain from/to a small positive value to avoid clicks. Stop fades output briefly before stopping/disconnecting sources. Finished voices are disconnected; playback timers cancel on Stop, Clear, route changes, and unmount.
- `src/hooks/useAudioEngine.jsx` shares audio state and handles unsupported/blocked audio messages. The app does not create a live AudioContext on load. Closed contexts are rebuilt on enablement; audio state events keep status current, including after development refreshes. Preview buttons enable audio through their explicit click.
- Playback schedules one gesture at a time using browser timers and Web Audio start times. Starting another session cancels the old one. New input also stops playback. Timer precision is sufficient for a starter; this is not a sample-accurate sequencer.

The canvas uses requestAnimationFrame, ResizeObserver, capped device pixel ratio, and normalized coordinates. Frames and observers clean up on unmount. Reduced motion disables decorative animation and moving stroke oscillation; drawn strokes and playback highlights remain useful.

## Workshop flow (45–60 minutes)

1. **Explore (5 min):** preview the six voices, enable audio, and try the Studio.
2. **Understand (10 min):** inspect the preset and mapping files. Draw the same line at two heights or speeds.
3. **Build (20 min):** choose a path on `/extend` and change one behavior.
4. **Test (10 min):** run `npm test`, `npm run build`, and the relevant manual checks in `TESTING.md`.
5. **Share (5 min):** play a short composition and explain the rule you changed.

Use ChatGPT to clarify an idea or explain a function; use Codex to implement, test, and repair a small change. No integration or API key is required.

## Exact extension points

| Change                                       | Edit                                                                                                                                                                   |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Add a seventh instrument                     | `src/data/instrumentPresets.js`: duplicate an entry with a unique id; selectors/cards populate automatically. Reuse an existing synthesis/visual type first.           |
| Design a new sound                           | `src/audio/instruments.js`: add a synthesis type; return and track every source/node.                                                                                  |
| Change instrument colours                    | `accent` and `secondary` in `src/data/instrumentPresets.js`; shared palette in `src/styles/tokens.css`.                                                                |
| Add a scale                                  | `src/data/scales.js`: name and semitone offsets; the dropdown updates automatically.                                                                                   |
| Change pitch root, duration, or gesture rule | `tuning` in `src/data/instrumentPresets.js`, note selection in `src/utils/instrumentMusic.js`, and gesture rules in `src/utils/gestureMapping.js`. Keep output clamps. |
| Map horizontal movement to an effect         | Compute a bounded value from `avgX` in `gestureMapping.js`, then read it in `audio/instruments.js` (for example, a low-pass frequency).                                |
| Add a canvas animation                       | `src/utils/canvas.js` (`drawStroke`), then connect its `visuals.type` in the preset. Canvas coordinates are normalized.                                                |
| Add its collection-card motif                | `src/components/InstrumentMotif.jsx` and `src/styles/animations.css`.                                                                                                  |
| Tune envelopes safely                        | `synthesis.attack` and `synthesis.decay` in the preset; common clamps in `src/audio/envelopes.js`. Keep nonzero ramps, finite stop times, and conservative gains.      |
| Change input capture                         | `src/hooks/usePointerGesture.js`; preserve pointer capture, cancellation, normalized positions, and touch-action behavior.                                             |

## Browser requirements

Recent Chrome or Edge is recommended for the workshop. Modern Firefox and Safari should support the required APIs but need separate device testing. Web Audio, Canvas 2D, Pointer Events, ResizeObserver, and modern ES modules are required. iOS/Safari may suspend audio after tab/device changes; click Enable Audio again. No microphone access is requested.

## Known limitations

- Sound starts on stroke release; this is gesture-based synthesis rather than continuous pitch tracing.
- Each stroke uses average height; curves do not produce continuous melodies.
- Compositions are capped at 64 gestures / 3,000 points per stroke to keep workshop laptops responsive.
- Input is single-pointer; multi-touch expression and pressure are not implemented.
- Playback uses browser timers and may drift or pause in background tabs. Keep the Studio foregrounded.
- Presets are intentionally lightweight approximations. The final timbre depends on browser/device output.
- Offline buffer checks validate signal generation and bounds, not subjective sound quality or safe physical speaker loudness.
- No named compositions, file export, recording, or deployment is included. Undo history resets when Studio is closed or refreshed; the composition and tempo remain saved locally.
- Chrome desktop has been exercised; real touch hardware, Edge, Safari, and Firefox still need the checklist.

## Next Build

- WAV export or recording without external services.
- Continuous pitch tracing and expressive horizontal filter control.
- Beat quantization and a Web Audio lookahead scheduler.
- Richer keyboard performance and real-device multi-touch testing.
