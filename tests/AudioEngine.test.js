import test from "node:test";
import assert from "node:assert/strict";
import { AudioEngine } from "../src/audio/AudioEngine.js";
class FakeNode {
  constructor() {
    this.gain = { value: 1 };
    this.connections = [];
  }
  connect(target) {
    this.connections.push(target);
    return target;
  }
  disconnect() {
    this.connections = [];
  }
}
class FakeAudioContext {
  constructor() {
    this.state = "suspended";
    this.sampleRate = 8000;
    this.currentTime = 0;
    this.destination = new FakeNode();
  }
  createGain() {
    return new FakeNode();
  }
  createDynamicsCompressor() {
    return new FakeNode();
  }
  createAnalyser() {
    const n = new FakeNode();
    n.getFloatTimeDomainData = (a) => a.fill(0);
    return n;
  }
  createBuffer() {
    return { getChannelData: () => new Float32Array(32) };
  }
  async resume() {
    if (this.state === "closed")
      throw new Error("Cannot resume a closed AudioContext");
    this.state = "running";
    this.onstatechange?.();
  }
  async close() {
    this.state = "closed";
    this.onstatechange?.();
  }
}
globalThis.window = { AudioContext: FakeAudioContext };
test("re-enabling recovers after provider cleanup / development refresh", async () => {
  const engine = new AudioEngine();
  await engine.enable();
  const previous = engine.ctx;
  engine.dispose();
  await engine.enable();
  assert.notEqual(engine.ctx, previous);
  assert.equal(engine.enabled, true);
  engine.dispose();
});
test("re-enabling recovers when the browser closed the context", async () => {
  const engine = new AudioEngine();
  await engine.enable();
  const previous = engine.ctx;
  await previous.close();
  await engine.enable();
  assert.notEqual(engine.ctx, previous);
  assert.equal(engine.enabled, true);
  engine.dispose();
});
test("master output is connected to actual destination through compressor", async () => {
  const engine = new AudioEngine();
  await engine.enable();
  assert.ok(engine.master.connections.includes(engine.compressor));
  assert.ok(
    engine.compressor.connections.includes(engine.analyser) &&
      engine.analyser.connections.includes(engine.ctx.destination),
  );
  assert.ok(engine.master.gain.value > 0 && engine.master.gain.value <= 0.3);
  engine.dispose();
});

test("audio state subscriptions update immediately and unsubscribe cleanly", async () => {
  const engine = new AudioEngine();
  const states = [];
  const unsubscribe = engine.subscribe(() => states.push(engine.enabled));
  await engine.enable();
  await engine.ctx.close();
  assert.deepEqual(states, [false, true, false]);
  unsubscribe();
  await engine.enable();
  assert.equal(states.length, 3);
  engine.dispose();
});
test("Stop releases the playback UI even when a test sound interrupts a sequence", () => {
  const engine = new AudioEngine();
  let finished = 0;
  const highlights = [];
  engine.playback = {
    onActive: (id) => highlights.push(id),
    onDone: () => finished++,
  };
  engine.stop();
  engine.stop();
  assert.equal(finished, 1);
  assert.deepEqual(highlights, [null]);
  assert.equal(engine.playback, null);
});
