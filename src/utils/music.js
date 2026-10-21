export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
export const midiToFrequency = (midi) => 440 * 2 ** ((midi - 69) / 12);
export function noteName(midi) {
  return (
    ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"][
      midi % 12
    ] +
    (Math.floor(midi / 12) - 1)
  );
}
