export default function TransportControls({
  playing,
  onPlay,
  onStop,
  onClear,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
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
      <button
        className="button button-outline history-button"
        onClick={onUndo}
        disabled={!canUndo}
        aria-label="Undo last change"
        title="Undo last change"
      >
        ↶ Undo
      </button>
      <button
        className="button button-outline history-button"
        onClick={onRedo}
        disabled={!canRedo}
        aria-label="Redo last change"
        title="Redo last change"
      >
        ↷ Redo
      </button>
      <button className="clear-button" onClick={onClear}>
        Clear <span aria-hidden="true">↺</span>
      </button>
    </div>
  );
}
