# Instrument identity and tuning repair — 21 October 2026

- Fixed three separate sources of confusion: Studio playback mixed previously drawn instruments, the header test sound was always Piano, and Bansuri used the same rapidly decaying envelope family as strings.
- Each instrument now has an isolated stroke bank, a configured workshop pitch register, and previews derived from its selected scale. Scale is reflected in the Studio URL so the header test and Studio test agree. Invalid audio instrument IDs fail explicitly instead of sounding like Sitar.
- Bansuri uses a sustained sine-dominant tone, subtle harmonics, quiet breath noise, and delayed gentle vibrato. Guitar uses tuned string partials with progressively shorter upper-harmonic decays and conservative overdrive. Large plucked pitch offsets were removed/reduced. Tabla settles onto its configured low/high drum pitches after the brief attack.
- `npm test`: **16/16 passing**. Includes per-instrument registers/scales, preview dispatch, stroke isolation, unknown-ID rejection, and the prior lifecycle/mapping checks.
- Native Web Audio offline rendering (temporary `node-web-audio-api` installation outside this project): **12/12 full-engine preview/gesture signal paths passed**, with finite output and clean tails.
- Quantitative timbre/tuning checks in `tests/audioSignalChecks.js`: all five melodic presets rendered at A4 within **3 cents** of 440 Hz (Sitar +0.04, Bansuri −0.23, Piano 0.00, Guitar −0.10, Synth −2.86 cents). The Bansuri middle-note/early-note RMS ratio is **1.24**, compared with Guitar **0.05**: sustained breath versus a decaying pluck. These measurements establish pitch and envelope differences, not subjective acoustic authenticity.
- Production build passes.
- Browser fixtures now include a Bansuri/Guitar bank-isolation check and the shared six quantitative audio checks. The current native browser connection still exposes Chrome's toolbar without page content, so the updated UI fixtures and real-device timbre comparison remain manual checks.

## Regression checklist for this repair

- [ ] In Guitar, draw a stroke. Switch to Bansuri: count is zero and the Guitar stroke/note is absent.
- [ ] Draw in Bansuri and play: hear only Bansuri. Switch back to Guitar: its stroke returns.
- [ ] Clear Bansuri, then return to Guitar: Guitar's saved stroke remains.
- [ ] In Bansuri, compare the header Test sound, Studio Test sound, and new strokes: all use Bansuri. Change the scale and verify both test buttons follow it.
- [ ] Compare Bansuri and Guitar previews: a held airy flute versus a plucked string with faster harmonic decay.
- [ ] Run the browser audio fixture: five pitch checks and the envelope comparison should pass in addition to lifecycle/output checks.

---

# Audio repair verification — 21 October 2026

A regression test reproduced two failures: re-enabling a disposed engine and re-enabling a context closed by the browser both threw “Cannot resume a closed AudioContext.” The engine now rebuilds closed output graphs, clears disposed references, and updates UI status through audio state events. Enable Audio plays a confirmation phrase; the Studio also has an explicit Test sound control. Stop now resets playback UI when a preview interrupts a sequence.

- `npm test`: **11/11 passing**, including both previously failing lifecycle cases, final output wiring, immediate state updates, playback interruption, and the original gesture/musical checks.
- Full-engine rendering using a temporary installation of `node-web-audio-api` outside the project: **all 12 preview and mapped-gesture signal chains passed** (synthesis → panner → master → compressor → analyser → destination). Finite, non-silent buffers with clean tails; final peaks ranged approximately **0.080–0.152**. No runtime dependency was added.
- The browser audio fixture now checks **20 conditions**, including real closed-context recovery and live final-output measurements for all six previews. These new browser checks still need a run in a working UI connection; the current computer-use connection exposes Chrome's toolbar but not its page content and returns blank screenshots. Earlier browser results below predate this audio repair.
- **User confirmed the three test notes are audible after refreshing the repaired Studio.** Rendered buffers alone cannot establish physical output; this confirmation separately verifies speaker/output audibility. Real trackpad drag, touch hardware, other browser checks, and the expanded live browser fixture remain on the manual checklist.

## Earlier verification and manual checklist

## Checks completed — 21 October 2026

- `npm install`: success; npm reported **0 vulnerabilities**.
- `npm test`: **6/6 passing** (pitch/scales, duration/speed, bounds/taps, Tabla voices/rolls, tempo/preset identities, captured metadata).
- `npm run build`: production build succeeds.
- `npm run dev`: Vite starts; the Home URL returns HTTP **200**.
- Desktop Chrome: Home and Studio visually reviewed; Enable Audio changes the status; native mouse tap saves a note; keyboard note entry works.
- `tests/browser-audio.html`: **12/12 passing** in Chrome using actual Web Audio and OfflineAudioContext. All six presets produce finite, non-silent output, conservative sample levels, and clean tails. Live enablement, Tabla voice allocation, sequencing, session replacement, completion, Stop, and timer/node cleanup pass. Sample checks are not a substitute for listening on workshop hardware.
- `tests/browser-ui.html`: **12/12 passing** in Chrome. Tests actual React app input handlers with synthetic mouse/touch Pointer Events, vertical pitch changes, cancellation, scale changes, Tabla regions, Clear, keyboard entry, audio-off Play, and direct navigation to all routes. Layout checks pass for all routes at **375, 768, and 1280 px** without horizontal overflow or clipped essential controls.
- The synthetic Pointer Event fixture stubs capture methods because the browser disallows capture of untrusted pointers. Native tap capture was verified separately. Native drag automation did not reliably complete a drag; physical click-and-drag, real trackpad/touch devices, OS reduced motion, and other browsers remain manual checks.

## Repeatable browser checks

With `npm run dev` running:

1. Open `http://localhost:5173/tests/browser-audio.html` and click **Run audio checks**.
2. Open `http://localhost:5173/tests/browser-ui.html` and click **Run interaction checks**.
3. Each page lists PASS/FAIL results. Wait for the Run button to become available again. These developer fixtures are not linked from the product and are excluded from the production build.

## Workshop manual checklist

Use a comfortable speaker/headphone volume. Run through this in **Chrome and Edge** on the actual workshop laptops; repeat touch checks on a phone/tablet.

- [ ] Load `/`: no sound and no live AudioContext before activation.
- [ ] Click **Enable Audio**: enabled status appears. Confirm it resumes after switching apps or locking/unlocking the device. If audio is blocked, a friendly error appears.
- [ ] In `/instruments`, click each **Play Preview**: Sitar, Bansuri, Tabla, Piano, Electric Guitar, Synthesizer. Listen for pluck, breath, drums, clean partials, overdrive, and bright detuned electronic tone respectively.
- [ ] Each **Open in Studio** link selects its instrument and default scale.
- [ ] Dismiss first-use guidance. Click-and-drag with mouse and trackpad. See trails while drawing and hear a sound on release.
- [ ] Drag outside the field and release: pointer capture completes the gesture. A canceled pointer discards its unfinished stroke.
- [ ] Draw the same horizontal stroke near the top and bottom: the top note is higher.
- [ ] Draw a short and long stroke at a similar speed: the longer stroke lasts longer.
- [ ] Draw equal-length strokes slowly and quickly: the fast one is stronger; Synth is also brighter.
- [ ] In Tabla, tap left, middle, and right: low Bayan, high Dayan, and rim. Short swipes create three-hit rolls. Repeated taps retain drawing order.
- [ ] Press **Play**: strokes highlight in order, notes update, and output ends. Play cannot start while already playing.
- [ ] Press **Stop** mid-sequence: sound fades and future notes/highlights do not continue. Draw during playback: playback stops and the new gesture is saved.
- [ ] Press **Clear**: stop playback, remove all strokes, reset count, and show guidance again.
- [ ] Switch among all five scales: future strokes use the new notes; existing strokes retain their scale.
- [ ] Change tempo from 60 to 120 BPM and replay: event spacing and mapped playback duration halve.
- [ ] Select another instrument: colour, guidance, canvas motif, and sound change; existing strokes keep their original identities.
- [ ] Resize through laptop, tablet, and mobile widths: no overlaps; all six instruments, audio, transport, scale, tempo, and canvas remain accessible. Check 320 px separately if needed for the audience's devices.
- [ ] Touch: one-finger drawing works without scrolling the canvas; the rest of the page still scrolls normally.
- [ ] Keyboard: Tab through navigation and controls, verify visible focus, operate selectors/sliders, focus canvas, and press Enter/Space.
- [ ] Enable OS/browser **prefers-reduced-motion**: decorative motion stops; capture and playback highlights still work.
- [ ] Navigate among `/`, `/instruments`, `/studio`, `/extend` and reload direct URLs. No stuck sound or timers after leaving the Studio.
- [ ] Leave the Studio in the foreground for rhythm evaluation; background tab timing is not guaranteed.

## Before accepting student changes

Run `npm test` and `npm run build`. Check the specific behavior they changed, listen to it, and verify that Stop still releases voices. Keep safe gain clamps, finite source lifetimes, and nonzero envelope ramps.
