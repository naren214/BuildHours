import { getInstrument } from "../data/instrumentPresets.js";
import { scales } from "../data/scales.js";
import { clamp } from "./music.js";
// These are workshop registers, not limits for every real-world instrument.
export function instrumentNotes(id, scaleId) {
  const preset = getInstrument(id);
  const { root = 48, min = 48, max = 72 } = preset.tuning || {};
  const scale = Object.hasOwn(scales, scaleId)
    ? scales[scaleId]
    : scales[preset.scale];
  const notes = [];
  for (let pitch = min; pitch <= max; pitch++) {
    if (scale.notes.includes((((pitch - root) % 12) + 12) % 12))
      notes.push(pitch);
  }
  return notes;
}
export function pitchAtHeight(id, scaleId, y) {
  const notes = instrumentNotes(id, scaleId);
  return notes[Math.round(clamp(1 - y, 0, 1) * (notes.length - 1))];
}
export function previewNotes(id, scaleId) {
  const preset = getInstrument(id);
  if (id === "tabla") return Object.values(preset.tuning.drums);
  const notes = instrumentNotes(id, scaleId);
  // A scale-derived phrase in the instrument's own register, never a fixed chord.
  const start = Math.min(2, Math.max(0, notes.length - 5));
  return [0, 2, 4].map(
    (step) => notes[Math.min(start + step, notes.length - 1)],
  );
}
export const instrumentGestures = (gestures, id) =>
  gestures.filter((g) => g.instrument === id);
