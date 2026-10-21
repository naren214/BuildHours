export function drawStroke(
  ctx,
  points,
  width,
  height,
  color,
  lineWidth,
  active,
  motif,
  clock = 0,
) {
  if (!points.length) return;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = active ? lineWidth + 2 : lineWidth;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.shadowColor = color;
  ctx.shadowBlur = active ? 18 : 5;
  ctx.globalAlpha = active ? 1 : 0.8;
  ctx.beginPath();
  points.forEach((p, i) => {
    if (i === 0) ctx.moveTo(p.x * width, p.y * height);
    else ctx.lineTo(p.x * width, p.y * height);
  });
  ctx.stroke();
  const last = points.at(-1),
    x = last.x * width,
    y = last.y * height;
  ctx.beginPath();
  ctx.arc(x, y, active ? 5 : 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.globalAlpha = active ? 0.5 : 0.18;
  ctx.lineWidth = 1;
  // Extend the canvas's visual vocabulary here; points are normalized to 0–1.
  if (motif === "rings") {
    for (let i = 1; i <= 3; i++) {
      ctx.beginPath();
      ctx.arc(
        x,
        y,
        i * 15 + (active ? Math.sin(clock / 180) * 4 : 0),
        0,
        Math.PI * 2,
      );
      ctx.stroke();
    }
  } else if (motif === "bars") {
    points
      .filter((_, i) => i % 12 === 0)
      .forEach((p) => ctx.fillRect(p.x * width - 1, p.y * height - 18, 2, 36));
  } else if (motif === "geometry") {
    ctx.translate(x, y);
    ctx.rotate(Math.PI / 4);
    ctx.strokeRect(-14, -14, 28, 28);
  } else if (motif === "arcs") {
    ctx.beginPath();
    ctx.ellipse(x, y, 28, 12, -0.5, Math.PI, Math.PI * 2);
    ctx.stroke();
  } else {
    [-7, 7].forEach((offset) => {
      ctx.beginPath();
      points.forEach((p, i) => {
        const py =
          p.y * height +
          offset +
          (active ? Math.sin(i / 6 + clock / 120) * 2 : 0);
        if (!i) ctx.moveTo(p.x * width, py);
        else ctx.lineTo(p.x * width, py);
      });
      ctx.stroke();
    });
  }
  ctx.restore();
}
