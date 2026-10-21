import { getInstrument } from "../data/instrumentPresets.js";
import { synthesize } from "./instruments.js";
import { clamp } from "../utils/music.js";
import { gestureBeatSeconds } from "../utils/gestureMapping.js";
export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.voices = new Set();
    this.timers = new Set();
    this.session = 0;
    this.listeners = new Set();
    this.playback = null;
  }
  async enable() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext)
      throw new Error(
        "This browser does not support Web Audio. Try a recent Chrome, Edge, Firefox, or Safari.",
      );
    if (!this.ctx || this.ctx.state === "closed") {
      this.stop();
      this.ctx = new AudioContext();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.18;
      this.compressor = this.ctx.createDynamicsCompressor();
      this.master.connect(this.compressor);
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 128;
      this.compressor.connect(this.analyser).connect(this.ctx.destination);
      this.ctx.onstatechange = () => this.notify();
      this.noise = this.ctx.createBuffer(
        1,
        this.ctx.sampleRate * 2,
        this.ctx.sampleRate,
      );
      const data = this.noise.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    }
    if (this.ctx.state !== "running") await this.ctx.resume();
    if (this.ctx.state !== "running")
      throw new Error(
        "Audio is paused by your browser. Try Enable Audio again.",
      );
  }
  subscribe(listener) {
    this.listeners.add(listener);
    listener();
    return () => this.listeners.delete(listener);
  }
  notify() {
    this.listeners.forEach((listener) => listener());
  }
  get enabled() {
    return this.ctx?.state === "running";
  }
  later(fn, ms) {
    const timer = setTimeout(() => {
      this.timers.delete(timer);
      fn();
    }, ms);
    this.timers.add(timer);
    return timer;
  }
  sound(event, when = this.ctx?.currentTime, duration = event.duration) {
    if (!this.enabled) return false;
    // Bound live polyphony even during rapid input.
    if (this.voices.size >= 24) this.release(this.voices.values().next().value);
    const pan = this.ctx.createStereoPanner();
    pan.pan.value = event.pan || 0;
    pan.connect(this.master);
    const voice = synthesize(
      this.ctx,
      pan,
      getInstrument(event.instrument),
      event,
      when,
      duration,
      this.noise,
    );
    voice.nodes.push(pan);
    this.voices.add(voice);
    this.later(
      () => this.release(voice, false),
      Math.max(0, voice.end - this.ctx.currentTime) * 1000,
    );
  }
  release(voice, stop = true) {
    if (!voice || !this.voices.has(voice)) return;
    this.voices.delete(voice);
    if (stop) {
      // Fade the voice's final panner before disconnecting it.
      const output = voice.nodes.at(-1),
        fade = this.ctx.createGain();
      output.disconnect();
      output.connect(fade).connect(this.master);
      fade.gain.setValueAtTime(1, this.ctx.currentTime);
      fade.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.02);
      setTimeout(() => {
        voice.sources.forEach((n) => {
          try {
            n.stop();
          } catch {
            /* Already ended. */
          }
        });
        voice.nodes.forEach((n) => n.disconnect());
        fade.disconnect();
      }, 30);
    } else voice.nodes.forEach((n) => n.disconnect());
  }
  play(events, bpm, onActive, onDone) {
    this.stop();
    if (!this.enabled || !events.length) return false;
    const session = this.session;
    this.playback = { onActive, onDone };
    let offset = 0.03,
      end = 0;
    for (const event of events) {
      const duration = gestureBeatSeconds(event, bpm);
      this.later(() => {
        if (session !== this.session) return;
        onActive(event.id);
        const when = this.ctx.currentTime + 0.01;
        if (event.instrument === "tabla" && event.roll) {
          for (let n = 0; n < 3; n++)
            this.sound(event, when + (n * duration) / 3, 0.3);
        } else this.sound(event, when, duration);
      }, offset * 1000);
      const preset = getInstrument(event.instrument);
      const tail = preset.synthesis.resonance > 0.15 ? 0.25 : 0;
      const voiceLength =
        event.instrument === "tabla"
          ? 0.8 + (event.roll ? (duration * 2) / 3 : 0)
          : clamp(duration * preset.synthesis.decay, 0.18, 4) + tail + 0.1;
      end = Math.max(end, offset + voiceLength + 0.02);
      offset += Math.max(0.18, duration);
    }
    this.later(() => {
      if (session === this.session) {
        this.playback = null;
        onActive(null);
        onDone();
      }
    }, end * 1000);
    return true;
  }
  stop() {
    this.session++;
    this.timers.forEach(clearTimeout);
    this.timers.clear();
    [...this.voices].forEach((v) => this.release(v));
    const playback = this.playback;
    this.playback = null;
    if (playback) {
      playback.onActive(null);
      playback.onDone();
    }
  }
  preview(id) {
    if (!this.enabled)
      throw new Error("Enable Audio before playing a preview.");
    this.stop();
    [0, 4, 7].forEach((n, i) =>
      this.sound(
        {
          instrument: id,
          pitch: 60 + n,
          duration: 0.65,
          intensity: 0.65,
          pan: 0,
          voice: ["bayan", "dayan", "rim"][i],
        },
        this.ctx.currentTime + i * 0.24,
      ),
    );
  }
  dispose() {
    this.stop();
    const context = this.ctx;
    if (context) context.onstatechange = null;
    this.ctx = null;
    this.analyser = null;
    this.master = null;
    this.compressor = null;
    this.noise = null;
    if (context && context.state !== "closed")
      void context.close().catch(() => {});
    this.notify();
  }
}
