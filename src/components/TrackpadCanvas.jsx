import { useEffect, useRef, useState } from "react";
import { usePointerGesture } from "../hooks/usePointerGesture";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { getInstrument } from "../data/instrumentPresets";
import { drawStroke } from "../utils/canvas";
export default function TrackpadCanvas({
  gestures,
  instrument,
  activeId,
  onGesture,
  onDrawStart,
  enabled,
  dismissed,
  onDismiss,
}) {
  const canvasRef = useRef(null),
    live = useRef([]),
    [drawing, setDrawing] = useState(false),
    reduced = useReducedMotion();
  const state = useRef({});
  state.current = { gestures, instrument, activeId, reduced };
  const pointer = usePointerGesture({
    onStart: (points) => {
      live.current = points;
      setDrawing(true);
      onDismiss();
      onDrawStart();
    },
    onMove: (points) => {
      live.current = points;
    },
    onEnd: (points, canceled) => {
      live.current = [];
      setDrawing(false);
      if (!canceled) onGesture(points);
    },
  });
  useEffect(() => {
    const canvas = canvasRef.current,
      ctx = canvas.getContext("2d");
    let frame;
    const resize = () => {
      const rect = canvas.getBoundingClientRect(),
        dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();
    const render = (clock) => {
      const { gestures, instrument, activeId, reduced } = state.current;
      const w = canvas.clientWidth,
        h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = "rgba(247,240,228,.055)";
      ctx.lineWidth = 1;
      for (let x = 30; x < w; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 30; y < h; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
      gestures.forEach((g) => {
        const preset = getInstrument(g.instrument);
        drawStroke(
          ctx,
          g.points,
          w,
          h,
          preset.accent,
          preset.visuals.trailWidth,
          activeId === g.id,
          preset.visuals.type,
          reduced ? 0 : clock,
        );
      });
      drawStroke(
        ctx,
        live.current,
        w,
        h,
        instrument.accent,
        instrument.visuals.trailWidth,
        true,
        instrument.visuals.type,
        reduced ? 0 : clock,
      );
      frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);
  const keyboardGesture = (e) => {
    if (e.key !== " " && e.key !== "Enter") return;
    e.preventDefault();
    onDrawStart();
    onDismiss();
    const now = performance.now();
    onGesture([
      { x: 0.5, y: 0.5, time: now, velocity: 0 },
      { x: 0.65, y: 0.5, time: now + 200, velocity: 0.75 },
    ]);
  };
  return (
    <div
      className={`trackpad-wrap ${drawing ? "is-drawing" : ""} ${instrument.id === "tabla" ? "tabla-canvas" : ""}`}
      style={{ "--accent": instrument.accent }}
    >
      <div className="canvas-topline">
        <span>GESTURE FIELD / {instrument.name.toUpperCase()}</span>
        <span>
          {drawing
            ? "● CAPTURING"
            : activeId
              ? "● PLAYING"
              : "READY TO EXPLORE"}
        </span>
      </div>
      {instrument.id === "tabla" && (
        <div className="tabla-regions" aria-hidden="true">
          <span>
            BAYAN <small>Low</small>
          </span>
          <span>
            DAYAN <small>High</small>
          </span>
          <span>
            RIM <small>Accent</small>
          </span>
        </div>
      )}
      <canvas
        {...pointer}
        onKeyDown={keyboardGesture}
        tabIndex="0"
        ref={canvasRef}
        aria-label={`${instrument.name} gesture canvas. Draw with a mouse or touch. Press Enter or Space for a center note.`}
        aria-describedby="canvas-guidance"
      />
      {!gestures.length && !drawing && (
        <div className="canvas-empty">
          <span className="empty-cross" aria-hidden="true">
            ＋
          </span>
          <h3>
            A little movement.
            <br />A new possibility.
          </h3>
          <p>
            {instrument.id === "tabla"
              ? "Tap a region. Build a rhythm."
              : "Draw a line and hear where it takes you."}
          </p>
          {!enabled && (
            <span className="empty-audio">
              Enable Audio to hear your gestures
            </span>
          )}
        </div>
      )}
      {!dismissed && (
        <div className="first-use">
          <span>YOUR TRACKPAD IS THE INSTRUMENT.</span>
          <p>
            Click and drag to draw. On touch screens, use one finger. Every
            stroke becomes a sound.
          </p>
          <button onClick={onDismiss}>Got it, let’s play ↗</button>
        </div>
      )}
      <div className="canvas-bottomline">
        <span>↑ HIGH PITCH · ↓ LOW PITCH</span>
        <span>CLICK + DRAG · OR TOUCH + DRAW</span>
      </div>
    </div>
  );
}
