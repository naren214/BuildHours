import { useAudioEngine } from "../hooks/useAudioEngine";
export default function AudioStatus() {
  const { engine, enabled, enable, reportError } = useAudioEngine();
  return (
    <button
      className={`audio-status ${enabled ? "is-on" : ""}`}
      onClick={async () => {
        if (await enable()) {
          try {
            engine.preview("piano");
          } catch (err) {
            reportError(err);
          }
        }
      }}
      aria-label={
        enabled
          ? "Audio is enabled. Play test sound"
          : "Enable audio and play test sound"
      }
    >
      <span className="status-dot" />
      {enabled ? "Audio on · Test sound" : "Enable Audio"}
      <span aria-hidden="true">↗</span>
    </button>
  );
}
