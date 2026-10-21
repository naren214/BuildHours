export default function TransportControls({
  playing,
  onPlay,
  onStop,
  onClear,
  hasGestures,
  enabled,
}) {
  return (
    <div className="transport">
      <button
        className="button button-accent"
        onClick={onPlay}
        disabled={!hasGestures || !enabled || playing}
      >
        <span aria-hidden="true">▶</span> {playing ? "Playing" : "Play"}
      </button>
      <button className="button button-outline" onClick={onStop}>
        <span aria-hidden="true">■</span> Stop
      </button>
      <button className="clear-button" onClick={onClear}>
        Clear <span aria-hidden="true">↺</span>
      </button>
    </div>
  );
}
