import { scales } from "../data/scales";
export default function ScaleSelector({ value, onChange }) {
  return (
    <label className="control-field">
      Scale
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {Object.entries(scales).map(([id, scale]) => (
          <option key={id} value={id}>
            {scale.name}
          </option>
        ))}
      </select>
    </label>
  );
}
