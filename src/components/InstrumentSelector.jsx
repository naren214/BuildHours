import { instruments } from "../data/instrumentPresets";
export default function InstrumentSelector({ value, onChange }) {
  return (
    <div
      className="instrument-selector"
      role="group"
      aria-label="Choose an instrument"
    >
      {instruments.map((i, index) => (
        <button
          key={i.id}
          className={value === i.id ? "selected" : ""}
          style={{ "--item-accent": i.accent }}
          onClick={() => onChange(i.id)}
          aria-pressed={value === i.id}
        >
          <span className="instrument-number">0{index + 1}</span>
          <span>{i.name}</span>
          <span className="instrument-dot" />
        </button>
      ))}
    </div>
  );
}
