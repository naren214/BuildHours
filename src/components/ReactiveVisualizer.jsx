import { useEffect, useRef } from "react";
import { useAudioEngine } from "../hooks/useAudioEngine";
import { useReducedMotion } from "../hooks/useReducedMotion";
export default function ReactiveVisualizer() {
  const ref = useRef(null),
    { engine } = useAudioEngine(),
    reduced = useReducedMotion();
  useEffect(() => {
    const canvas = ref.current,
      ctx = canvas.getContext("2d");
    let frame;
    const data = new Uint8Array(64);
    const draw = () => {
      const width = canvas.width,
        height = canvas.height;
      ctx.clearRect(0, 0, width, height);
      if (engine.analyser) engine.analyser.getByteFrequencyData(data);
      ctx.fillStyle = getComputedStyle(canvas).color;
      for (let i = 0; i < 32; i++) {
        const h = reduced ? 3 : 3 + (data[i] / 255) * 35;
        ctx.fillRect(i * 6, (height - h) / 2, 2, h);
      }
      if (!reduced) frame = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(frame);
  }, [engine, reduced]);
  return (
    <canvas
      ref={ref}
      width="192"
      height="40"
      className="reactive-visualizer"
      aria-label="Audio frequency visualization"
      role="img"
    />
  );
}
