export default function InstrumentMotif({ type = "strings", className = "" }) {
  return (
    <svg
      className={`instrument-motif motif-${type} ${className}`}
      viewBox="0 0 300 180"
      fill="none"
      aria-hidden="true"
    >
      {type === "strings" &&
        Array.from({ length: 9 }, (_, i) => (
          <path
            key={i}
            d={`M${35 + i * 27} 20 Q ${80 + i * 17} 90 ${35 + i * 27} 160`}
          />
        ))}
      {type === "ribbons" &&
        Array.from({ length: 7 }, (_, i) => (
          <path
            key={i}
            d={`M20 ${45 + i * 14} C90 ${-35 + i * 14} 180 ${215 - i * 14} 280 ${55 + i * 10}`}
          />
        ))}
      {type === "rings" && (
        <>
          {[25, 43, 62, 80].map((r) => (
            <circle key={r} cx="130" cy="90" r={r} />
          ))}
          <circle cx="222" cy="112" r="32" />
          <circle cx="222" cy="112" r="16" />
        </>
      )}
      {type === "bars" &&
        Array.from({ length: 12 }, (_, i) => (
          <rect
            key={i}
            x={35 + i * 20}
            y={40 + (i % 4) * 10}
            width="11"
            height={100 - (i % 4) * 20}
            rx="5"
          />
        ))}
      {type === "arcs" &&
        Array.from({ length: 8 }, (_, i) => (
          <path
            key={i}
            d={`M${25 + i * 7} 140 Q150 ${-90 + i * 24} ${275 - i * 7} 140`}
          />
        ))}
      {type === "geometry" && (
        <>
          {[0, 1, 2, 3, 4].map((i) => (
            <rect
              key={i}
              x={85 + i * 12}
              y={25 + i * 12}
              width={130 - i * 24}
              height={130 - i * 24}
              transform="rotate(45 150 90)"
            />
          ))}
          <path d="M20 90H280M150 5V175" />
        </>
      )}
    </svg>
  );
}
