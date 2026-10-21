import { scales } from "../data/scales.js";
import { clamp } from "./music.js";
export function mapGesture(
  points,
  instrument,
  scaleId,
  id = crypto.randomUUID(),
) {
  if (!points.length) return null;
  let length = 0;
  for (let i = 1; i < points.length; i++)
    length += Math.hypot(
      points[i].x - points[i - 1].x,
      points[i].y - points[i - 1].y,
    );
  const avgY = points.reduce((s, p) => s + p.y, 0) / points.length;
  const avgX = points.reduce((s, p) => s + p.x, 0) / points.length;
  const elapsed = Math.max(30, points.at(-1).time - points[0].time);
  const speed = length / (elapsed / 1000);
  const notes = (scales[scaleId] || scales.majorPentatonic).notes;
  const step = Math.round(clamp(1 - avgY, 0, 1) * (notes.length * 2 - 1));
  return {
    id,
    points,
    instrument,
    scale: scaleId,
    pitch:
      48 + notes[step % notes.length] + 12 * Math.floor(step / notes.length),
    duration: clamp(0.2 + length * 1.5, 0.2, 3),
    intensity: clamp(0.3 + speed * 0.35, 0.3, 0.95),
    pan: clamp(avgX * 2 - 1, -0.75, 0.75),
    voice: avgX < 1 / 3 ? "bayan" : avgX < 2 / 3 ? "dayan" : "rim",
    roll: instrument === "tabla" && length > 0.12,
    createdAt: Date.now(),
  };
}
export const gestureBeatSeconds = (gesture, bpm) =>
  (clamp(gesture.duration, 0.25, 3) * 60) / clamp(bpm, 40, 200);
