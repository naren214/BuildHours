import { instruments } from "../data/instrumentPresets";
import InstrumentCard from "../components/InstrumentCard";
export default function InstrumentsPage() {
  return (
    <div className="page instruments-page">
      <div className="page-heading instruments-heading">
        <div>
          <p className="eyebrow">
            THE SOUND COLLECTION <span>/</span> 01—06
          </p>
          <h1>
            Six voices.
            <br />
            <em>Your expression.</em>
          </h1>
        </div>
        <p>
          Rooted in familiar sounds.
          <br />
          Ready for unfamiliar ideas.
          <br />
          <span>Choose a voice. See what happens.</span>
        </p>
      </div>
      <div className="instruments-grid">
        {instruments.map((i, index) => (
          <InstrumentCard key={i.id} instrument={i} index={index} />
        ))}
      </div>
      <p className="collection-note">
        All sounds are synthesized in your browser. These are playful,
        instrument-inspired presets, not authentic acoustic emulations. Preview
        enables audio on your click.
      </p>
    </div>
  );
}
