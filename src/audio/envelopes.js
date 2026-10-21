import { clamp } from "../utils/music.js";
// Always ramp to a small positive gain before stopping nodes: abrupt stops click.
export function envelope(param, time, duration, attack, level) {
  const a = clamp(attack, 0.003, 0.3);
  param.setValueAtTime(0.0001, time);
  param.exponentialRampToValueAtTime(Math.max(0.001, level), time + a);
  param.exponentialRampToValueAtTime(
    0.0001,
    time + Math.max(a + 0.06, duration),
  );
}
