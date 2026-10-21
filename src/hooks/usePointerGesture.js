import { useRef } from "react";
import { clamp } from "../utils/music";
export function usePointerGesture({ onStart, onMove, onEnd }) {
  const current = useRef(null);
  const point = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = clamp((e.clientX - rect.left) / rect.width, 0, 1),
      y = clamp((e.clientY - rect.top) / rect.height, 0, 1);
    const time = performance.now(),
      prev = current.current?.points.at(-1);
    return {
      x,
      y,
      time,
      velocity: prev
        ? Math.hypot(x - prev.x, y - prev.y) /
          Math.max(0.001, (time - prev.time) / 1000)
        : 0,
    };
  };
  const finish = (e, canceled = false) => {
    if (current.current?.pointerId !== e.pointerId) return;
    const points = current.current.points;
    current.current = null;
    onEnd(points, canceled);
    if (e.currentTarget.hasPointerCapture(e.pointerId))
      e.currentTarget.releasePointerCapture(e.pointerId);
  };
  return {
    onPointerDown: (e) => {
      if (current.current || (e.pointerType === "mouse" && e.button !== 0))
        return;
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      current.current = { pointerId: e.pointerId, points: [] };
      const p = point(e);
      current.current.points.push(p);
      onStart([p]);
    },
    onPointerMove: (e) => {
      if (current.current?.pointerId !== e.pointerId) return;
      const points = current.current.points;
      // Bound input size without changing the captured path appreciably.
      if (points.length < 3000) points.push(point(e));
      onMove([...points]);
    },
    onPointerUp: (e) => finish(e),
    onPointerCancel: (e) => finish(e, true),
    onLostPointerCapture: (e) => finish(e, true),
  };
}
