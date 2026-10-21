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

// Wind instruments hold their air column instead of fading like a plucked string.
export function sustainedEnvelope(param, time, duration, attack, level) {
  const peak = Math.max(0.001, level);
  const a = Math.min(clamp(attack, 0.03, 0.25), duration * 0.3);
  param.setValueAtTime(0.0001, time);
  param.linearRampToValueAtTime(peak, time + a);
  param.linearRampToValueAtTime(peak * 0.85, time + duration * 0.72);
  param.exponentialRampToValueAtTime(0.0001, time + duration);
}
export function voiceDuration(preset, duration) {
  return clamp(
    duration * preset.synthesis.decay,
    preset.synthesis.type === "breath" ? 0.55 : 0.18,
    4,
  );
}
