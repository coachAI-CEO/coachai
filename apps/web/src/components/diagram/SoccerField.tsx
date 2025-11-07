import * as React from "react";

type Zone = "DEFENSIVE_THIRD" | "MIDDLE_THIRD" | "ATTACKING_THIRD";

export default function SoccerField({
  width,
  height,
  zone = "MIDDLE_THIRD",
  invert = false,
}: {
  width: number;
  height: number;
  zone?: Zone;
  invert?: boolean;
}) {
  const W = width;
  const H = height;
  const line = "#0f172a"; // slate-900
  const grass = "#f8fafc"; // very light
  const mark = "#e5e7eb"; // grid/light lines

  const thirdH = H / 3;
  const zIndex =
    zone === "DEFENSIVE_THIRD" ? (invert ? 0 : 2) :
    zone === "ATTACKING_THIRD" ? (invert ? 2 : 0) : 1;
  const zoneY = thirdH * zIndex;

  const arc = (x: number, y: number, r: number, sweep = 0) =>
    `M ${x - r} ${y} A ${r} ${r} 0 0 ${sweep} ${x + r} ${y}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
      {/* grass + border */}
      <rect x={0} y={0} width={W} height={H} fill={grass} rx={18} />
      <rect x={8} y={8} width={W-16} height={H-16} fill="#fff" rx={14} stroke={line} strokeWidth={3} />

      {/* thirds */}
      <line x1={16} x2={W-16} y1={H/3} y2={H/3} stroke={mark} strokeWidth={2} />
      <line x1={16} x2={W-16} y1={(2*H)/3} y2={(2*H)/3} stroke={mark} strokeWidth={2} />
      <rect
        x={16} y={zoneY+8} width={W-32} height={thirdH-16}
        fill="#64748b20" stroke="#64748b55" strokeDasharray="8 8" strokeWidth={2} rx={8}
      />

      {/* halfway + center */}
      <line x1={W/2} y1={16} x2={W/2} y2={H-16} stroke={line} strokeWidth={2} strokeDasharray="6 6" />
      <circle cx={W/2} cy={H/2} r={36} fill="none" stroke="#94a3b8" />
      <circle cx={W/2} cy={H/2} r={4} fill={line} />

      {/* penalty boxes, arcs, goals */}
      {(() => {
        const boxW = 140, sixW = 80, penR = 46;
        const top = 16, bot = H - 16;
        const topArcSweep = invert ? 1 : 0;
        const botArcSweep = invert ? 0 : 1;
        return (
          <>
            <rect x={(W-boxW)/2} y={top} width={boxW} height={64} fill="none" stroke={line} />
            <rect x={(W-sixW)/2} y={top} width={sixW} height={28} fill="none" stroke={line} />
            <path d={arc(W/2, top+64, penR, topArcSweep)} fill="none" stroke="#94a3b8" />

            <rect x={(W-boxW)/2} y={bot-64} width={boxW} height={64} fill="none" stroke={line} />
            <rect x={(W-sixW)/2} y={bot-28} width={sixW} height={28} fill="none" stroke={line} />
            <path d={arc(W/2, bot-64, penR, botArcSweep)} fill="none" stroke="#94a3b8" />

            <rect x={(W-44)/2} y={top-10} width={44} height={10} fill="#e5e7eb" stroke={line} />
            <rect x={(W-44)/2} y={bot} width={44} height={10} fill="#e5e7eb" stroke={line} />

            <circle cx={16} y={16} r={2} fill={line} />
            <circle cx={W-16} cy={16} r={2} fill={line} />
            <circle cx={16} cy={H-16} r={2} fill={line} />
            <circle cx={W-16} cy={H-16} r={2} fill={line} />
          </>
        );
      })()}
    </svg>
  );
}
