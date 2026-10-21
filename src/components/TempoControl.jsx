export default function TempoControl({ value, onChange }) {
  return (
    <label className="control-field tempo-field">
      <span>
        Tempo{" "}
        <b>
          {value} <small>BPM</small>
        </b>
      </span>
      <input
        type="range"
        min="40"
        max="180"
        step="1"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label="Tempo in beats per minute"
      />
    </label>
  );
}
