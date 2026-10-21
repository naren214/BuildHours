import { verifyInstrumentSignals } from "./audioSignalChecks.js";
import { synthesize } from "../src/audio/instruments.js";
import { instruments } from "../src/data/instrumentPresets.js";
import { AudioEngine } from "../src/audio/AudioEngine.js";
const result = document.querySelector("#results");
function report(message, passed = true) {
  const row = document.createElement("li");
  row.textContent = `${passed ? "PASS" : "FAIL"} — ${message}`;
  result.append(row);
}
function assert(value, message) {
  if (!value) throw new Error(message);
}
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
document.querySelector("#run").onclick = async () => {
  result.replaceChildren();
  const engine = new AudioEngine();
  document.querySelector("#run").disabled = true;
  try {
    assert(!engine.ctx, "AudioContext created before enablement");
    report("No live AudioContext before user enablement");
    // Run enable directly inside the button's activation handler.
    await engine.enable();
    assert(engine.enabled, "Audio failed to resume");
    report("AudioContext resumes after explicit user activation");
    const originalContext = engine.ctx;
    engine.dispose();
    await engine.enable();
    assert(
      engine.enabled && engine.ctx !== originalContext,
      "Audio cannot restart after cleanup",
    );
    report("Real AudioContext recovers after cleanup / development refresh");
    await engine.ctx.close();
    await engine.enable();
    assert(engine.enabled, "Closed context cannot recover");
    report("Real AudioContext recovers after the browser closes it");
    for (const message of await verifyInstrumentSignals(OfflineAudioContext))
      report(message);
    for (const preset of instruments) {
      const context = new OfflineAudioContext(1, 44100 * 2, 44100);
      const master = context.createGain();
      master.gain.value = 0.18;
      master.connect(context.destination);
      const noise = context.createBuffer(1, 44100, 44100);
      const data = noise.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      const voice = synthesize(
        context,
        master,
        preset,
        { pitch: 60, intensity: 0.7, voice: "bayan" },
        0.01,
        0.7,
        noise,
      );
      const rendered = await context.startRendering();
      const samples = rendered.getChannelData(0);
      let peak = 0,
        sum = 0;
      for (const value of samples) {
        assert(Number.isFinite(value), "Nonfinite audio sample");
        peak = Math.max(peak, Math.abs(value));
        sum += value * value;
      }
      assert(
        peak > 0.001 && peak < 0.5,
        `${preset.name} silent or excessive level: ${peak}`,
      );
      assert(
        samples.slice(-1000).every((v) => Math.abs(v) < 0.001),
        `${preset.name} has an unexpected tail`,
      );
      voice.nodes.forEach((n) => n.disconnect());
      report(
        `${preset.name}: non-silent buffer, bounded output, clean tail (peak ${peak.toFixed(3)}, RMS ${Math.sqrt(sum / samples.length).toFixed(3)})`,
      );
    }
    for (const preset of instruments) {
      engine.preview(preset.id);
      let peak = 0;
      const samples = new Float32Array(engine.analyser.fftSize);
      const before = engine.ctx.currentTime;
      for (let frame = 0; frame < 45; frame++) {
        await pause(20);
        engine.analyser.getFloatTimeDomainData(samples);
        for (const sample of samples) peak = Math.max(peak, Math.abs(sample));
      }
      assert(
        engine.ctx.currentTime > before + 0.3,
        "Audio output clock is not advancing",
      );
      assert(
        peak > 0.001,
        `${preset.name} preview has no signal at the final output`,
      );
      report(
        `${preset.name} live preview: signal reaches the final output analyser (peak ${peak.toFixed(3)})`,
      );
    }
    engine.stop();
    for (const voice of ["bayan", "dayan", "rim"]) {
      engine.sound({
        instrument: "tabla",
        pitch: 60,
        intensity: 0.5,
        duration: 0.2,
        voice,
      });
    }
    assert(engine.voices.size === 3, "Tabla voices not allocated");
    engine.stop();
    assert(
      engine.voices.size === 0 && engine.timers.size === 0,
      "Stop failed to release resources",
    );
    report("All three Tabla voices allocate and Stop releases them");
    const events = Array.from({ length: 30 }, (_, i) => ({
      id: `g${i}`,
      instrument: "piano",
      pitch: 60,
      duration: 0.25,
      intensity: 0.3,
    }));
    const seen = [];
    let done = false;
    engine.play(
      events,
      180,
      (id) => {
        if (id) seen.push(id);
      },
      () => {
        done = true;
      },
    );
    await pause(850);
    assert(seen.length >= 2, "No playback callbacks");
    assert(seen[0] === "g0" && seen[1] === "g1", "Playback order incorrect");
    report(
      "Playback follows drawing order in a composition longer than the polyphony limit",
    );
    engine.play(
      events.slice(0, 1),
      180,
      () => {},
      () => {
        done = true;
      },
    );
    await pause(900);
    assert(done, "Playback never completed");
    assert(engine.voices.size === 0, "Completed voices leaked");
    report(
      "Replacing playback cancels the prior session; completion releases nodes",
    );
    engine.stop();
    const count = seen.length;
    await pause(220);
    assert(
      seen.length === count && engine.timers.size === 0,
      "Timers survive Stop",
    );
    report("Stop cancels all remaining playback timers");
  } catch (error) {
    report(error.message, false);
  } finally {
    engine.dispose();
    document.querySelector("#run").disabled = false;
  }
};
