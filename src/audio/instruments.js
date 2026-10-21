import { clamp, midiToFrequency } from "../utils/music.js";
import { envelope } from "./envelopes.js";
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
  duration = clamp(duration * s.decay, 0.18, 4);
  const tone = (
    type,
    frequency,
    weight,
    bend = 0,
    end = duration,
    target = output,
  ) => {
    const osc = source(ctx.createOscillator()),
      gain = track(ctx.createGain());
    osc.type = type;
    osc.frequency.setValueAtTime(frequency * (1 + bend), when);
    if (bend)
      osc.frequency.exponentialRampToValueAtTime(frequency, when + 0.07);
    envelope(gain.gain, when, end, s.attack, weight * event.intensity);
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
    envelope(gain.gain, when, end, 0.006, weight * event.intensity);
    buffer.connect(filter).connect(gain).connect(output);
    buffer.start(when);
    buffer.stop(when + end + 0.05);
  };
  if (s.type === "drum") {
    const low = event.voice === "bayan",
      rim = event.voice === "rim";
    const osc = source(ctx.createOscillator()),
      gain = track(ctx.createGain());
    const f = low ? 110 : rim ? 580 : 280;
    osc.frequency.setValueAtTime(f * 2.2, when);
    osc.frequency.exponentialRampToValueAtTime(f * 0.65, when + 0.13);
    envelope(gain.gain, when, low ? 0.6 : 0.22, 0.003, 0.7 * event.intensity);
    osc.connect(gain).connect(output);
    osc.start(when);
    osc.stop(when + 0.7);
    noise(rim ? 0.65 : 0.18, rim ? 0.09 : 0.12, rim ? 4500 : 1800);
    duration = 0.7;
  } else if (s.type === "breath") {
    const osc = tone("sine", freq, 0.7),
      lfo = source(ctx.createOscillator()),
      depth = track(ctx.createGain());
    tone("triangle", freq, 0.12);
    noise(0.12, duration, 1400);
    lfo.frequency.value = 5;
    depth.gain.value = freq * 0.004;
    lfo.connect(depth).connect(osc.frequency);
    lfo.start(when);
    lfo.stop(when + duration + 0.05);
  } else if (s.type === "keys") {
    [1, 2, 3, 4.01].forEach((partial, i) =>
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
    filter.frequency.exponentialRampToValueAtTime(300, when + duration);
    filter.Q.value = s.type === "synth" ? 2 : 0.6;
    if (s.type === "guitar") {
      const shaper = track(ctx.createWaveShaper());
      shaper.curve = Float32Array.from(
        { length: 256 },
        (_, i) => Math.tanh((i / 127.5 - 1) * 1.6) / 1.6,
      );
      filter.connect(shaper).connect(output);
      tone("triangle", freq, 0.55, 0.025, duration, filter);
      tone("sawtooth", freq * 2, 0.1, 0.025, duration * 0.7, filter);
    } else {
      filter.connect(output);
      tone("sawtooth", freq * 0.997, 0.28, 0, duration, filter);
      tone("triangle", freq * 1.003, 0.4, 0, duration, filter);
    }
  } else {
    tone("triangle", freq, 0.48, 0.035);
    [2, 3, 4, 6].forEach((n, i) =>
      tone("sine", freq * n, 0.18 / (i + 1), 0.02, duration / (1 + i * 0.15)),
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
