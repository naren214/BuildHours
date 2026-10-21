import { midiToFrequency } from "../utils/music.js";
import { envelope, sustainedEnvelope, voiceDuration } from "./envelopes.js";
// Each voice returns its nodes so the engine can cancel and disconnect it.
export function synthesize(
  ctx,
  destination,
  preset,
  event,
  when,
  duration,
  noiseBuffer,
) {
  if (event.instrument && event.instrument !== preset.id)
    throw new Error("Instrument routing mismatch");
  const nodes = [],
    sources = [];
  const track = (node) => {
    nodes.push(node);
    return node;
  };
  const source = (node) => {
    track(node);
    sources.push(node);
    return node;
  };
  const output = track(ctx.createGain());
  output.connect(destination);
  const freq = midiToFrequency(event.pitch);
  const s = preset.synthesis;
  if (
    !["drum", "breath", "keys", "synth", "guitar", "plucked"].includes(s.type)
  )
    throw new Error(`Unknown synthesis type: ${s.type}`);
  duration = voiceDuration(preset, duration);
  const tone = (
    type,
    frequency,
    weight,
    bend = 0,
    end = duration,
    target = output,
    sustain = false,
  ) => {
    const osc = source(ctx.createOscillator()),
      gain = track(ctx.createGain());
    osc.type = type;
    osc.frequency.setValueAtTime(frequency * (1 + bend), when);
    if (bend)
      osc.frequency.exponentialRampToValueAtTime(frequency, when + 0.07);
    (sustain ? sustainedEnvelope : envelope)(
      gain.gain,
      when,
      end,
      s.attack,
      weight * event.intensity,
    );
    osc.connect(gain).connect(target);
    osc.start(when);
    osc.stop(when + end + 0.05);
    return osc;
  };
  const noise = (weight, end, frequency, type = "bandpass") => {
    const buffer = source(ctx.createBufferSource()),
      filter = track(ctx.createBiquadFilter()),
      gain = track(ctx.createGain());
    buffer.buffer = noiseBuffer;
    buffer.loop = true;
    filter.type = type;
    filter.frequency.value = frequency;
    (s.type === "breath" ? sustainedEnvelope : envelope)(
      gain.gain,
      when,
      end,
      s.type === "breath" ? s.attack : 0.006,
      weight * event.intensity,
    );
    buffer.connect(filter).connect(gain).connect(output);
    buffer.start(when);
    buffer.stop(when + end + 0.05);
  };
  if (s.type === "drum") {
    const low = event.voice === "bayan",
      rim = event.voice === "rim";
    const osc = source(ctx.createOscillator()),
      gain = track(ctx.createGain());
    const f = midiToFrequency(
      preset.tuning.drums[event.voice] || preset.tuning.drums.dayan,
    );
    osc.frequency.setValueAtTime(f * 1.5, when);
    osc.frequency.exponentialRampToValueAtTime(f, when + 0.035);
    envelope(gain.gain, when, low ? 0.6 : 0.22, 0.003, 0.7 * event.intensity);
    osc.connect(gain).connect(output);
    osc.start(when);
    osc.stop(when + 0.7);
    noise(rim ? 0.65 : 0.18, rim ? 0.09 : 0.12, rim ? 4500 : 1800);
    duration = 0.7;
  } else if (s.type === "breath") {
    const osc = tone("sine", freq, 0.65, 0, duration, output, true),
      lfo = source(ctx.createOscillator()),
      depth = track(ctx.createGain());
    tone("sine", freq * 2, 0.065, 0, duration, output, true);
    tone("sine", freq * 3, 0.018, 0, duration, output, true);
    noise(0.035, duration, Math.min(freq * 3, 4500));
    lfo.frequency.value = 5;
    depth.gain.setValueAtTime(0, when);
    depth.gain.linearRampToValueAtTime(
      freq * 0.002,
      when + Math.min(0.35, duration * 0.6),
    );
    lfo.connect(depth).connect(osc.frequency);
    lfo.start(when);
    lfo.stop(when + duration + 0.05);
  } else if (s.type === "keys") {
    [1, 2, 3, 4].forEach((partial, i) =>
      tone(
        "sine",
        freq * partial,
        [0.65, 0.22, 0.08, 0.035][i],
        0,
        duration / (1 + i * 0.3),
      ),
    );
  } else if (s.type === "synth" || s.type === "guitar") {
    const filter = track(ctx.createBiquadFilter());
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(600 + event.intensity * 6500, when);
    filter.frequency.exponentialRampToValueAtTime(
      Math.max(300, freq * 1.5),
      when + duration,
    );
    filter.Q.value = s.type === "synth" ? 2 : 0.6;
    if (s.type === "guitar") {
      const shaper = track(ctx.createWaveShaper());
      shaper.curve = Float32Array.from(
        { length: 256 },
        (_, i) => Math.tanh((i / 127.5 - 1) * 1.6) / 1.6,
      );
      filter.connect(shaper).connect(output);
      // Tuned string partials: higher harmonics damp sooner after the pick.
      [1, 2, 3, 4, 5, 6].forEach((n, i) =>
        tone(
          "sine",
          freq * n,
          [0.65, 0.25, 0.15, 0.08, 0.05, 0.03][i],
          0,
          duration / (1 + i * 0.32),
          filter,
        ),
      );
      noise(0.055, 0.035, 2400, "highpass");
    } else {
      filter.connect(output);
      tone("sawtooth", freq * 0.997, 0.28, 0, duration, filter);
      tone("triangle", freq * 1.003, 0.4, 0, duration, filter);
    }
  } else {
    tone("sine", freq, 0.55, 0.006);
    [2, 3, 4, 5, 6, 8].forEach((n, i) =>
      tone("sine", freq * n, 0.25 / (i + 1), 0.003, duration / (1 + i * 0.15)),
    );
  }
  // A short, non-feedback echo gives plucked voices a conservative resonant tail.
  const tail = s.resonance > 0.15 ? 0.25 : 0;
  if (tail) {
    const delay = track(ctx.createDelay(0.5)),
      echo = track(ctx.createGain());
    delay.delayTime.value = 0.14;
    echo.gain.value = s.resonance;
    output.connect(delay).connect(echo).connect(destination);
  }
  return { nodes, sources, end: when + duration + tail + 0.1 };
}
