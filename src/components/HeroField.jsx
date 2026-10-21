import { useEffect, useRef } from "react";
import { useReducedMotion } from "../hooks/useReducedMotion";
export default function HeroField() {
  const ref = useRef(null),
    pointer = useRef({ x: 0.5, y: 0.5 }),
    reduced = useReducedMotion();
  useEffect(() => {
    const canvas = ref.current,
      ctx = canvas.getContext("2d");
    let frame;
    const resize = () => {
      const r = canvas.getBoundingClientRect(),
        dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = r.width * dpr;
      canvas.height = r.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();
    const draw = (time) => {
      const w = canvas.clientWidth,
        h = canvas.clientHeight,
        p = pointer.current;
      ctx.clearRect(0, 0, w, h);
      const t = reduced ? 0 : time / 1800;
      for (let row = 0; row < 22; row++) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(192,184,245,${0.13 + row / 150})`;
        ctx.lineWidth = 0.8;
        for (let x = 0; x <= w; x += 4) {
          const u = x / w;
          const wave =
            Math.sin(u * 7 + t * 0.35 + row * 0.13) *
            Math.sin(u * Math.PI) *
            (55 + p.y * 40);
          const y = h * 0.31 + row * 9 + wave + (p.x - 0.5) * (u - 0.5) * 50;
          if (!x) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      if (!reduced) frame = requestAnimationFrame(draw);
    };
    draw(0);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [reduced]);
  return (
    <div
      className="hero-art"
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        pointer.current = {
          x: (e.clientX - r.left) / r.width,
          y: (e.clientY - r.top) / r.height,
        };
      }}
    >
      <span className="art-coordinate coordinate-top">
        01 — MOVEMENT AS A MEDIUM
      </span>
      <div className="art-orbit orbit-one" />
      <div className="art-orbit orbit-two" />
      <div className="hero-trackpad">
        <div className="trackpad-grid" />
        <canvas ref={ref} aria-hidden="true" />
        <span className="gesture-dot" />
        <div className="trackpad-corner top-left" />
        <div className="trackpad-corner bottom-right" />
        <span className="trackpad-caption">
          EVERY MOVEMENT HAS A FREQUENCY.
        </span>
      </div>
      <div className="art-sound-label">
        <span className="status-dot" />
        NO KEYS. NO STRINGS.
        <br />
        <span>JUST YOU.</span>
      </div>
      <span className="art-coordinate coordinate-bottom">
        X: EXPRESSION <span>Y: POSSIBILITY</span>
      </span>
      <span className="art-plus plus-one">+</span>
      <span className="art-plus plus-two">+</span>
    </div>
  );
}
