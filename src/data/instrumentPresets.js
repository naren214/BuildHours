// Start here: duplicate a preset, give it a unique id, and choose a synthesis type.
export const instruments = [
  {
    id: "sitar",
    tuning: { root: 48, min: 48, max: 72 },
    name: "Sitar",
    category: "melodic",
    character: "Pluck a little sunlight.",
    description:
      "A bright attack, a delicate bend, a lingering harmonic shimmer.",
    gesture: "Sweep a line to pluck. Draw higher to lift the pitch.",
    accent: "#f2aa18",
    secondary: "#e6533f",
    scale: "indianPentatonic",
    synthesis: { type: "plucked", attack: 0.008, decay: 1.15, resonance: 0.28 },
    visuals: { type: "strings", trailWidth: 3 },
  },
  {
    id: "bansuri",
    tuning: { root: 60, min: 60, max: 84 },
    name: "Bansuri",
    category: "melodic",
    character: "Give the air a melody.",
    description: "A soft, breathy voice that blooms into gentle vibrato.",
    gesture: "Draw a flowing curve. Let slow movements breathe.",
    accent: "#35b6a9",
    secondary: "#a8e5d6",
    scale: "majorPentatonic",
    synthesis: { type: "breath", attack: 0.12, decay: 1.3, resonance: 0.1 },
    visuals: { type: "ribbons", trailWidth: 5 },
  },
  {
    id: "tabla",
    tuning: {
      root: 48,
      min: 48,
      max: 72,
      drums: { bayan: 48, dayan: 60, rim: 72 },
    },
    name: "Tabla",
    category: "rhythmic",
    character: "Find your own heartbeat.",
    description: "Deep bass, crisp high tones, and a sharp rim accent.",
    gesture: "Tap left for low, middle for high, right for rim.",
    accent: "#ec73a6",
    secondary: "#f49849",
    scale: "minorPentatonic",
    synthesis: { type: "drum", attack: 0.003, decay: 0.4, resonance: 0.05 },
    visuals: { type: "rings", trailWidth: 3 },
  },
  {
    id: "piano",
    tuning: { root: 48, min: 48, max: 84 },
    name: "Piano",
    category: "melodic",
    character: "A familiar kind of magic.",
    description: "Clean layered partials with a rounded, unhurried decay.",
    gesture: "Sketch short marks for notes, long lines for sustain.",
    accent: "#c6c0f3",
    secondary: "#f7f0e4",
    scale: "major",
    synthesis: { type: "keys", attack: 0.006, decay: 1.1, resonance: 0.12 },
    visuals: { type: "bars", trailWidth: 3 },
  },
  {
    id: "guitar",
    tuning: { root: 48, min: 40, max: 76 },
    name: "Electric Guitar",
    category: "melodic",
    character: "Put a little edge on it.",
    description:
      "A tuned string pluck with decaying harmonics and soft overdrive.",
    gesture: "Flick for a bright attack. Sweep for a longer ring.",
    accent: "#ff8d7c",
    secondary: "#678dff",
    scale: "minorPentatonic",
    synthesis: { type: "guitar", attack: 0.008, decay: 1, resonance: 0.22 },
    visuals: { type: "arcs", trailWidth: 3 },
  },
  {
    id: "synth",
    tuning: { root: 48, min: 36, max: 84 },
    name: "Synthesizer",
    category: "electronic",
    character: "Make something otherworldly.",
    description: "Detuned waves and a glowing, speed-sensitive filter.",
    gesture: "Move faster to open the filter and brighten the sound.",
    accent: "#8e9dff",
    secondary: "#d64288",
    scale: "minor",
    synthesis: { type: "synth", attack: 0.035, decay: 0.8, resonance: 0.2 },
    visuals: { type: "geometry", trailWidth: 4 },
  },
];
export const getInstrument = (id) =>
  instruments.find((i) => i.id === id) || instruments[0];

export function requireInstrument(id) {
  const preset = instruments.find((i) => i.id === id);
  if (!preset) throw new Error(`Unknown instrument: ${id}`);
  return preset;
}
