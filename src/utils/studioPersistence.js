import { instruments } from "../data/instrumentPresets.js";
import { scales } from "../data/scales.js";

export const STUDIO_STORAGE_KEY = "unheard.studio.composition.v1";
const DEFAULT_TEMPO = 96;
const MAX_GESTURES_PER_INSTRUMENT = 64;
const MAX_POINTS_PER_GESTURE = 3000;
const instrumentIds = new Set(instruments.map(({ id }) => id));
const scaleIds = new Set(Object.keys(scales));
const presetsById = new Map(instruments.map((preset) => [preset.id, preset]));

const finite = (value) => typeof value === "number" && Number.isFinite(value);

function validPoint(point) {
  return (
    point &&
    finite(point.x) &&
    point.x >= 0 &&
    point.x <= 1 &&
    finite(point.y) &&
    point.y >= 0 &&
    point.y <= 1 &&
    finite(point.time) &&
    finite(point.velocity)
  );
}

function validGesture(gesture) {
  const preset = gesture && presetsById.get(gesture.instrument);
  const tablaPitchIsValid =
    gesture?.instrument !== "tabla" ||
    preset?.tuning?.drums?.[gesture.voice] === gesture.pitch;
  return (
    gesture &&
    typeof gesture.id === "string" &&
    gesture.id.length > 0 &&
    instrumentIds.has(gesture.instrument) &&
    scaleIds.has(gesture.scale) &&
    Number.isInteger(gesture.pitch) &&
    gesture.pitch >= preset.tuning.min &&
    gesture.pitch <= preset.tuning.max &&
    tablaPitchIsValid &&
    finite(gesture.duration) &&
    gesture.duration >= 0.2 &&
    gesture.duration <= 3 &&
    finite(gesture.intensity) &&
    gesture.intensity >= 0.3 &&
    gesture.intensity <= 0.95 &&
    finite(gesture.pan) &&
    gesture.pan >= -0.75 &&
    gesture.pan <= 0.75 &&
    ["bayan", "dayan", "rim"].includes(gesture.voice) &&
    typeof gesture.roll === "boolean" &&
    finite(gesture.createdAt) &&
    Array.isArray(gesture.points) &&
    gesture.points.length > 0 &&
    gesture.points.length <= MAX_POINTS_PER_GESTURE &&
    gesture.points.every(validPoint)
  );
}

function validComposition(value) {
  if (
    !value ||
    value.version !== 1 ||
    !Number.isInteger(value.tempo) ||
    value.tempo < 40 ||
    value.tempo > 180 ||
    !Array.isArray(value.gestures) ||
    value.gestures.length > instruments.length * MAX_GESTURES_PER_INSTRUMENT ||
    !value.gestures.every(validGesture)
  ) return false;

  const counts = new Map();
  for (const gesture of value.gestures) {
    const count = (counts.get(gesture.instrument) || 0) + 1;
    if (count > MAX_GESTURES_PER_INSTRUMENT) return false;
    counts.set(gesture.instrument, count);
  }
  return true;
}

function storageFrom(storage) {
  return storage === undefined ? globalThis.localStorage : storage;
}

export function loadStudioComposition(storage) {
  let raw;
  try {
    const target = storageFrom(storage);
    raw = target.getItem(STUDIO_STORAGE_KEY);
  } catch {
    return { gestures: [], tempo: DEFAULT_TEMPO, status: "unavailable" };
  }
  if (raw === null)
    return { gestures: [], tempo: DEFAULT_TEMPO, status: "empty" };
  try {
    const parsed = JSON.parse(raw);
    if (!validComposition(parsed))
      return { gestures: [], tempo: DEFAULT_TEMPO, status: "invalid" };
    return {
      gestures: parsed.gestures,
      tempo: parsed.tempo,
      status: "restored",
    };
  } catch {
    return { gestures: [], tempo: DEFAULT_TEMPO, status: "invalid" };
  }
}

export function saveStudioComposition(composition, storage) {
  try {
    const target = storageFrom(storage);
    const value = {
      version: 1,
      tempo: composition.tempo,
      gestures: composition.gestures,
    };
    if (!validComposition(value)) return false;
    target.setItem(STUDIO_STORAGE_KEY, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
