import { useMemo, type CSSProperties, type ReactNode } from "react";

const COLORS = ["#34d399", "#fbbf24", "#f472b6", "#60a5fa", "#a78bfa", "#fb7185", "#86efac"];

/** Firework-style burst points: [x %, y %, delay s, particle count, reach px] */
const SHOTS: [number, number, number, number, number][] = [
  [14, 34, 0, 18, 58],
  [86, 30, 0.3, 18, 58],
];

/** Wraps content (the mascot) with a one-time firework / confetti burst behind it. */
export function Burst({ children }: { children: ReactNode }) {
  const parts = useMemo(
    () =>
      SHOTS.flatMap(([x, y, delay, n, reach], s) =>
        Array.from({ length: n }, (_, i) => {
          const ang = (i / n) * Math.PI * 2 + (Math.random() - 0.5) * 0.35;
          const dist = reach * (0.7 + Math.random() * 0.4);
          return {
            key: `${s}-${i}`,
            dot: i % 3 !== 0,
            style: {
              left: `${x}%`,
              top: `${y}%`,
              "--dx": `${Math.cos(ang) * dist}px`,
              "--dy": `${Math.sin(ang) * dist}px`,
              "--rot": `${Math.round((Math.random() - 0.5) * 540)}deg`,
              "--c": COLORS[(i + s * 2) % COLORS.length],
              "--d": `${delay + Math.random() * 0.08}s`,
            } as CSSProperties,
          };
        })
      ),
    []
  );
  return (
    <div className="burst">
      <div className="burst-layer" aria-hidden>
        {SHOTS.map(([x, y, delay], s) => (
          <i key={`f${s}`} className="burst-flash" style={{ left: `${x}%`, top: `${y}%`, "--d": `${delay}s` } as CSSProperties} />
        ))}
        {parts.map((p) => (
          <i key={p.key} className={p.dot ? "burst-p dot" : "burst-p bar"} style={p.style} />
        ))}
      </div>
      {children}
    </div>
  );
}
