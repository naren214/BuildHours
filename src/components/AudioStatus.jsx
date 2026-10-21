import { useLocation } from "react-router-dom";
import { getInstrument } from "../data/instrumentPresets";
import { useAudioEngine } from "../hooks/useAudioEngine";
export default function AudioStatus() {
  const location = useLocation();
  const selected = getInstrument(
    new URLSearchParams(location.search).get("instrument"),
  );
  const { engine, enabled, enable, reportError } = useAudioEngine();
  return (
    <button
      className={`audio-status ${enabled ? "is-on" : ""}`}
      onClick={async () => {
        if (await enable()) {
          try {
            engine.preview(
              location.pathname === "/studio" ? selected.id : "sitar",
              location.pathname === "/studio"
                ? new URLSearchParams(location.search).get("scale")
                : undefined,
            );
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
