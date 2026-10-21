import { Link } from "react-router-dom";
import { useAudioEngine } from "../hooks/useAudioEngine";
import InstrumentMotif from "./InstrumentMotif";
export default function InstrumentCard({ instrument: i, index }) {
  const { engine, enable, reportError } = useAudioEngine();
  const preview = async () => {
    if (await enable()) {
      try {
        engine.preview(i.id);
      } catch (err) {
        reportError(err);
      }
    }
  };
  return (
    <article
      className="instrument-card"
      style={{ "--accent": i.accent, "--secondary": i.secondary }}
    >
      <div className="card-meta">
        <span>
          0{index + 1} / {i.category}
        </span>
        <span aria-hidden="true">↗</span>
      </div>
      <InstrumentMotif type={i.visuals.type} />
      <h2>{i.name}</h2>
      <p className="card-character">{i.character}</p>
      <p>{i.description}</p>
      <p className="gesture-copy">
        <span>THE GESTURE</span>
        {i.gesture}
      </p>
      <div className="card-actions">
        <button onClick={preview} aria-label={`Play ${i.name} preview`}>
          <span aria-hidden="true">▷</span> Play Preview
        </button>
        <Link to={`/studio?instrument=${i.id}`}>
          Open in Studio <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </article>
  );
}
