import { synthesize } from "../src/audio/instruments.js";
import { instruments } from "../src/data/instrumentPresets.js";
import { midiToFrequency } from "../src/utils/music.js";
function assert(condition, message) {
  if (!condition) throw new Error(message);
}
function rms(samples, start, end, rate) {
  let sum = 0;
  const a = Math.floor(start * rate),
    b = Math.floor(end * rate);
  for (let i = a; i < b; i++) sum += samples[i] ** 2;
  return Math.sqrt(sum / (b - a));
}
function fundamental(samples, frequency, rate) {
  const start = Math.floor(0.2 * rate),
    length = Math.floor(0.2 * rate);
  const min = Math.floor(rate / (frequency * 1.08)),
    max = Math.ceil(rate / (frequency * 0.92));
  const errors = [];
  for (let lag = min; lag <= max; lag++) {
    let error = 0,
      energy = 0;
    for (let i = start; i < start + length; i++) {
      const a = samples[i],
        b = samples[i + lag];
      error += (a - b) ** 2;
      energy += a * a + b * b;
    }
    errors.push(error / Math.max(1e-12, energy));
  }
  let best = 1;
  for (let i = 2; i < errors.length - 1; i++)
    if (errors[i] < errors[best]) best = i;
  const left = errors[best - 1],
    mid = errors[best],
    right = errors[best + 1];
  const offset = (0.5 * (left - right)) / (left - 2 * mid + right);
  return rate / (min + best + offset);
}
export async function verifyInstrumentSignals(OfflineContext) {
  const results = [],
    signals = {};
  for (const preset of instruments.filter((i) => i.id !== "tabla")) {
    const rate = 44100,
      ctx = new OfflineContext(1, rate * 3, rate);
    const master = ctx.createGain();
    master.gain.value = 0.18;
    master.connect(ctx.destination);
    const noise = ctx.createBuffer(1, rate, rate),
      data = noise.getChannelData(0);
    let seed = 42;
    for (let i = 0; i < data.length; i++) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      data[i] = seed / 2 ** 31 - 1;
    }
    synthesize(
      ctx,
      master,
      preset,
      { instrument: preset.id, pitch: 69, intensity: 0.7, voice: "dayan" },
      0.01,
      1.3,
      noise,
    );
    const rendered = await ctx.startRendering(),
      samples = rendered.getChannelData(0);
    assert(
      samples.every(Number.isFinite),
      `${preset.name} has invalid samples`,
    );
    const pitch = fundamental(samples, 440, rate),
      cents = 1200 * Math.log2(pitch / midiToFrequency(69));
    assert(
      Math.abs(cents) < 12,
      `${preset.name} is ${cents.toFixed(1)} cents off A4`,
    );
    assert(
      samples.slice(-1000).every((v) => Math.abs(v) < 0.001),
      `${preset.name} tail did not finish`,
    );
    const sustain =
      rms(samples, 0.4, 0.65, rate) / rms(samples, 0.05, 0.15, rate);
    signals[preset.id] = { sustain, samples };
    results.push(
      `${preset.name}: A4 ${pitch.toFixed(2)} Hz (${cents.toFixed(2)} cents), clean tail`,
    );
  }
  assert(
    signals.bansuri.sustain > 0.75,
    "Bansuri decays like a plucked string instead of sustaining breath",
  );
  assert(
    signals.guitar.sustain < 0.4,
    "Guitar does not have a distinct plucked decay",
  );
  assert(
    signals.bansuri.sustain > signals.guitar.sustain * 3,
    "Flute and guitar envelopes are not sufficiently distinct",
  );
  results.push(
    `Bansuri sustained / early RMS ${signals.bansuri.sustain.toFixed(2)}; Guitar ${signals.guitar.sustain.toFixed(2)}: distinct wind vs pluck`,
  );
  return results;
}
