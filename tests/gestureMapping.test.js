import test from "node:test";
import assert from "node:assert/strict";
import { mapGesture, gestureBeatSeconds } from "../src/utils/gestureMapping.js";
import { scales } from "../src/data/scales.js";
import { instruments } from "../src/data/instrumentPresets.js";
const points = (x = 0.4, y = 0.5, length = 0.2, time = 300) => [
  { x, y, time: 0, velocity: 0 },
  { x: x + length, y, time, velocity: length / (time / 1000) },
];
test("higher gestures produce higher notes in every scale", () => {
  for (const scale of Object.keys(scales)) {
    const low = mapGesture(points(0.2, 0.9), "sitar", scale),
      high = mapGesture(points(0.2, 0.1), "sitar", scale);
    assert.ok(high.pitch > low.pitch);
    assert.ok(scales[scale].notes.includes((high.pitch - 48) % 12));
  }
});
test("path length controls duration and speed controls expression independently", () => {
  const short = mapGesture(points(0.1, 0.5, 0.1), "piano", "major");
  const long = mapGesture(points(0.1, 0.5, 0.7), "piano", "major");
  const slow = mapGesture(points(0.1, 0.5, 0.2, 1200), "synth", "minor");
  const fast = mapGesture(points(0.1, 0.5, 0.2, 100), "synth", "minor");
  assert.ok(long.duration > short.duration);
  assert.ok(fast.intensity > slow.intensity);
  assert.equal(fast.duration, slow.duration);
});
test("taps are valid, outputs are bounded, and empty gestures are rejected", () => {
  assert.equal(mapGesture([], "sitar", "major"), null);
  const tap = mapGesture(
    [{ x: 0.5, y: 0.5, time: 0, velocity: 0 }],
    "piano",
    "major",
  );
  assert.equal(tap.duration, 0.2);
  assert.ok(tap.intensity >= 0.3);
  const edge = mapGesture(points(20, -20, 100, 0), "synth", "minor");
  assert.ok(edge.duration <= 3);
  assert.ok(edge.intensity <= 0.95);
  assert.ok(edge.pan <= 0.75);
  assert.ok(edge.pitch <= instruments.find((i) => i.id === "synth").tuning.max);
});
test("Tabla has three distinct regions and swipe rolls", () => {
  for (const [x, voice] of [
    [0.1, "bayan"],
    [0.5, "dayan"],
    [0.9, "rim"],
  ]) {
    assert.equal(
      mapGesture([{ x, y: 0.5, time: 0 }], "tabla", "major").voice,
      voice,
    );
  }
  assert.equal(mapGesture(points(0.1), "tabla", "major").roll, true);
  assert.equal(
    mapGesture([{ x: 0.1, y: 0.1, time: 0 }], "tabla", "major").roll,
    false,
  );
});
test("tempo scales playback time and presets keep six unique synthesis identities", () => {
  const event = mapGesture(points(), "sitar", "major");
  assert.equal(
    gestureBeatSeconds(event, 60),
    gestureBeatSeconds(event, 120) * 2,
  );
  assert.equal(new Set(instruments.map((i) => i.synthesis.type)).size, 6);
  assert.equal(new Set(instruments.map((i) => i.id)).size, 6);
});
test("gesture captures immutable musical settings and input metadata", () => {
  const event = mapGesture(
    points(),
    "bansuri",
    "minorPentatonic",
    "test-gesture",
  );
  assert.equal(event.id, "test-gesture");
  assert.equal(event.instrument, "bansuri");
  assert.equal(event.scale, "minorPentatonic");
  assert.ok(event.createdAt > 0);
  assert.equal(event.points.length, 2);
});
