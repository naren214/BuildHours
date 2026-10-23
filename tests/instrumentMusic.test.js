import test from "node:test";
import assert from "node:assert/strict";
import {
  instruments,
  requireInstrument,
} from "../src/data/instrumentPresets.js";
import { scales } from "../src/data/scales.js";
import {
  instrumentNotes,
  previewNotes,
  instrumentGestures,
} from "../src/utils/instrumentMusic.js";
import { mapGesture } from "../src/utils/gestureMapping.js";
import { midiToFrequency } from "../src/utils/music.js";
test("each melodic instrument maps and previews only notes in its own register and chosen scale", () => {
  for (const preset of instruments.filter((i) => i.id !== "tabla"))
    for (const [scale, data] of Object.entries(scales)) {
      const allowed = instrumentNotes(preset.id, scale);
      for (const note of allowed) {
        assert.ok(note >= preset.tuning.min && note <= preset.tuning.max);
        assert.ok(
          data.notes.includes((((note - preset.tuning.root) % 12) + 12) % 12),
        );
      }
      for (const pitch of previewNotes(preset.id, scale))
        assert.ok(allowed.includes(pitch));
      for (let i = 0; i <= 20; i++) {
        const event = mapGesture(
          [{ x: 0.5, y: i / 20, time: 0 }],
          preset.id,
          scale,
        );
        assert.ok(allowed.includes(event.pitch));
      }
    }
});
test("Bansuri has a higher flute register and is isolated from guitar strokes", () => {
  assert.deepEqual(
    instrumentNotes("bansuri", "majorPentatonic").slice(0, 3),
    [60, 62, 64],
  );
  const guitar = mapGesture(
    [{ x: 0.5, y: 0.5, time: 0 }],
    "guitar",
    "minorPentatonic",
  );
  const flute = mapGesture(
    [{ x: 0.5, y: 0.5, time: 0 }],
    "bansuri",
    "majorPentatonic",
  );
  assert.deepEqual(instrumentGestures([guitar, flute], "bansuri"), [flute]);
  assert.equal(instrumentGestures([guitar], "bansuri").length, 0);
  assert.equal(requireInstrument("bansuri").synthesis.type, "breath");
  assert.throws(
    () => requireInstrument("missing-instrument"),
    /Unknown instrument/,
  );
});
test("reference tuning is A4=440Hz and Tabla previews use its fixed drum notes", () => {
  assert.equal(midiToFrequency(69), 440);
  assert.equal(midiToFrequency(81), 880);
  assert.deepEqual(
    previewNotes("tabla"),
    Object.values(requireInstrument("tabla").tuning.drums),
  );
});

test("inherited object keys use the instrument preset scale fallback", () => {
  for (const invalidScale of ["constructor", "__proto__", "toString"]) {
    assert.ok(instrumentNotes("sitar", invalidScale).length > 0, invalidScale);
  }
});

test("inherited object keys use the instrument preset scale fallback", () => {
  for (const invalidScale of ["constructor", "__proto__", "toString"]) {
    assert.ok(instrumentNotes("sitar", invalidScale).length > 0, invalidScale);
  }
});
