import { useState, useRef } from "react";
import Draggable from "react-draggable";

const squad = [
  "John","Lucas","Alex","Ronan","Ruairi","Jules","Robbie",
  "Fionn","Josh","Sam","Mason","Marcel","Alan","Darragh","Sonny","Charlie","Cian"
];

const JerseyIcon = ({ isOpposition }) => (
  <svg width="34" height="34" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M16 8 L24 4 L40 4 L48 8 L56 20 L48 28 L48 56 L16 56 L16 28 L8 20 Z"
      fill={isOpposition ? "#e11d48" : "#ffffff"}
      stroke={isOpposition ? "#9f1239" : "#000"}
      strokeWidth="3"
    />
    <rect x="22" y="4" width="6" height="52" fill={isOpposition ? "#9f1239" : "#000"} />
    <rect x="36" y="4" width="6" height="52" fill={isOpposition ? "#9f1239" : "#000"} />
  </svg>
);

// Formation positions — will be recalculated based on actual pitch size
// Stored as percentages of pitch width/height
const FORMATION_PCT = [
  { id: "GK",   label: "Goalkeeper",          xPct: 0.50, yPct: 0.85 },
  { id: "DEF1", label: "Defender 1",          xPct: 0.28, yPct: 0.68 },
  { id: "DEF2", label: "Defender 2",          xPct: 0.72, yPct: 0.68 },
  { id: "CM",   label: "Central Midfielder",  xPct: 0.50, yPct: 0.50 },
  { id: "WM1",  label: "Wide Mid 1",          xPct: 0.15, yPct: 0.35 },
  { id: "WM2",  label: "Wide Mid 2",          xPct: 0.85, yPct: 0.35 },
  { id: "STR",  label: "Striker",             xPct: 0.50, yPct: 0.18 },
];

export default function PitchBoard() {
  const [assigned, setAssigned] = useState({});
  const [selectedPos, setSelectedPos] = useState(null);
  const [lines, setLines] = useState([]);
  const [drawing, setDrawing] = useState(null);
  const [formation, setFormation] = useState(null); // null until pitch measured
  const pitchRef = useRef(null);
  const [pitchRect, setPitchRect] = useState(null);

  // Measure pitch on mount and resize
  const measurePitch = (el) => {
    if (!el) return;
    pitchRef.current = el;
    const rect = el.getBoundingClientRect();
    setPitchRect({ w: rect.width, h: rect.height });
    // Init formation using actual pixel size
    setFormation(
      FORMATION_PCT.map((p) => ({
        ...p,
        x: p.xPct * rect.width,
        y: p.yPct * rect.height,
      }))
    );
  };

  const assignPlayer = (player) => {
    if (!selectedPos) return;
    setAssigned((prev) => ({ ...prev, [selectedPos]: player }));
    setSelectedPos(null);
  };

  const getCoords = (e) => {
    const rect = pitchRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const onDrawStart = (e) => {
    // Only start drawing if not clicking a player
    if (e.target.closest(".player-token")) return;
    e.preventDefault();
    const { x, y } = getCoords(e);
    setDrawing({ x1: x, y1: y, x2: x, y2: y });
  };

  const onDrawMove = (e) => {
    if (!drawing) return;
    e.preventDefault();
    const { x, y } = getCoords(e);
    setDrawing((d) => ({ ...d, x2: x, y2: y }));
  };

  const onDrawEnd = (e) => {
    if (!drawing) return;
    const dx = drawing.x2 - drawing.x1;
    const dy = drawing.y2 - drawing.y1;
    // Only save if line is long enough to be intentional
    if (Math.sqrt(dx * dx + dy * dy) > 20) {
      setLines((l) => [...l, drawing]);
    }
    setDrawing(null);
  };

  const handleDrag = (posId, data) => {
    setFormation((f) =>
      f.map((pos) =>
        pos.id === posId ? { ...pos, x: data.x + 17, y: data.y + 17 } : pos
      )
    );
  };

  const W = pitchRect?.w || 1;
  const H = pitchRect?.h || 1;

  return (
    <div style={{
      display: "flex",
      height: "100vh",
      fontFamily: "'Segoe UI', sans-serif",
      background: "#0f172a",
      overflow: "hidden"
    }}>

      {/* ── Sidebar ── */}
      <div style={{
        width: "160px",
        flexShrink: 0,
        background: "#1e293b",
        color: "white",
        padding: "10px",
        overflowY: "auto",
        borderRight: "2px solid #0f172a"
      }}>
        <div style={{
          fontSize: "11px", color: "#94a3b8",
          textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px"
        }}>
          Squad List
        </div>

        {selectedPos && (
          <div style={{
            background: "#facc15", color: "#000", padding: "6px",
            borderRadius: "6px", marginBottom: "8px",
            fontWeight: "bold", textAlign: "center", fontSize: "11px"
          }}>
            Tap player to assign to {selectedPos}
          </div>
        )}

        {squad.map((player) => (
          <div
            key={player}
            onClick={() => assignPlayer(player)}
            style={{
              background: "#334155", borderRadius: "6px", marginBottom: "5px",
              padding: "5px 7px", cursor: "pointer", display: "flex",
              alignItems: "center", gap: "6px", fontSize: "13px",
              border: "1px solid #475569"
            }}
            onMouseEnter={e => e.currentTarget.style.background = "#475569"}
            onMouseLeave={e => e.currentTarget.style.background = "#334155"}
          >
            <JerseyIcon />
            {player}
          </div>
        ))}
      </div>

      {/* ── Main ── */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "10px 8px",
        minWidth: 0
      }}>
        <div style={{ color: "white", fontSize: "16px", fontWeight: "bold", marginBottom: "8px" }}>
          7-Player Formation
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
          <button
            onClick={() => setLines((l) => l.slice(0, -1))}
            style={{
              padding: "6px 14px", background: "#334155", color: "white",
              borderRadius: "7px", border: "none", cursor: "pointer", fontSize: "13px"
            }}
          >
            Undo Arrow
          </button>
          <button
            onClick={() => setLines([])}
            style={{
              padding: "6px 14px", background: "#b91c1c", color: "white",
              borderRadius: "7px", border: "none", cursor: "pointer", fontSize: "13px"
            }}
          >
            Clear Arrows
          </button>
        </div>

        {/* Pitch — fills remaining space */}
        <div style={{
          flex: 1,
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "stretch",
          minHeight: 0
        }}>
          <div style={{
            /* Keep 3:4 portrait ratio, as tall as available */
            aspectRatio: "3 / 4",
            maxHeight: "100%",
            position: "relative"
          }}>
            <div
              ref={measurePitch}
              onMouseDown={onDrawStart}
              onMouseMove={onDrawMove}
              onMouseUp={onDrawEnd}
              onTouchStart={onDrawStart}
              onTouchMove={onDrawMove}
              onTouchEnd={onDrawEnd}
              style={{
                width: "100%",
                height: "100%",
                position: "relative",
                borderRadius: "10px",
                overflow: "hidden",
                boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
                cursor: "crosshair"
              }}
            >
              {/* Grass stripes */}
              {[...Array(14)].map((_, i) => (
                <div key={i} style={{
                  position: "absolute",
                  top: `${i * (100 / 14)}%`,
                  width: "100%",
                  height: `${100 / 14}%`,
                  background: i % 2 === 0 ? "#3a8a3a" : "#2d7a2d"
                }} />
              ))}

              {/* ── SVG Pitch Markings + Arrows ── */}
              <svg
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
                viewBox={`0 0 ${W} ${H}`}
              >
                <defs>
                  <marker id="arrowhead" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
                    <polygon points="0 0, 7 3.5, 0 7" fill="#facc15" />
                  </marker>
                </defs>

                {/* Outer border */}
                <rect
                  x={W * 0.04} y={H * 0.02}
                  width={W * 0.92} height={H * 0.96}
                  fill="none" stroke="white" strokeWidth="2.5"
                />

                {/* Halfway line */}
                <line
                  x1={W * 0.04} y1={H * 0.5}
                  x2={W * 0.96} y2={H * 0.5}
                  stroke="white" strokeWidth="2"
                />

                {/* Centre circle */}
                <circle cx={W * 0.5} cy={H * 0.5} r={W * 0.14}
                  fill="none" stroke="white" strokeWidth="2" />
                <circle cx={W * 0.5} cy={H * 0.5} r="3" fill="white" />

                {/* ── TOP penalty area ── */}
                {/* Large box */}
                <rect
                  x={W * 0.22} y={H * 0.02}
                  width={W * 0.56} height={H * 0.16}
                  fill="none" stroke="white" strokeWidth="2"
                />
                {/* Small box */}
                <rect
                  x={W * 0.34} y={H * 0.02}
                  width={W * 0.32} height={H * 0.07}
                  fill="none" stroke="white" strokeWidth="2"
                />
                {/* Goal */}
                <rect
                  x={W * 0.40} y={H * 0.005}
                  width={W * 0.20} height={H * 0.025}
                  fill="none" stroke="white" strokeWidth="2"
                />
                {/* Penalty spot */}
                <circle cx={W * 0.5} cy={H * 0.13} r="2.5" fill="white" />
                {/* Penalty arc — curves DOWN (away from top edge) */}
                <path
                  d={`M ${W*0.30} ${H*0.18} A ${W*0.22} ${W*0.22} 0 0 1 ${W*0.70} ${H*0.18}`}
                  fill="none" stroke="white" strokeWidth="2"
                />

                {/* ── BOTTOM penalty area ── */}
                {/* Large box */}
                <rect
                  x={W * 0.22} y={H * 0.82}
                  width={W * 0.56} height={H * 0.16}
                  fill="none" stroke="white" strokeWidth="2"
                />
                {/* Small box */}
                <rect
                  x={W * 0.34} y={H * 0.91}
                  width={W * 0.32} height={H * 0.07}
                  fill="none" stroke="white" strokeWidth="2"
                />
                {/* Goal */}
                <rect
                  x={W * 0.40} y={H * 0.975}
                  width={W * 0.20} height={H * 0.025}
                  fill="none" stroke="white" strokeWidth="2"
                />
                {/* Penalty spot */}
                <circle cx={W * 0.5} cy={H * 0.87} r="2.5" fill="white" />
                {/* Penalty arc — curves UP (away from bottom edge) */}
                <path
                  d={`M ${W*0.30} ${H*0.82} A ${W*0.22} ${W*0.22} 0 0 0 ${W*0.70} ${H*0.82}`}
                  fill="none" stroke="white" strokeWidth="2"
                />

                {/* ── Saved arrows ── */}
                {lines.map((l, i) => (
                  <line
                    key={i}
                    x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
                    stroke="#facc15" strokeWidth="3"
                    markerEnd="url(#arrowhead)"
                    strokeLinecap="round"
                  />
                ))}

                {/* ── Arrow being drawn ── */}
                {drawing && (
                  <line
                    x1={drawing.x1} y1={drawing.y1}
                    x2={drawing.x2} y2={drawing.y2}
                    stroke="#facc15" strokeWidth="3"
                    strokeDasharray="8 4"
                    markerEnd="url(#arrowhead)"
                    strokeLinecap="round"
                  />
                )}
              </svg>

              {/* ── Players ── */}
              {formation && formation.map((pos) => (
                <Draggable
                  key={pos.id}
                  position={{ x: pos.x - 17, y: pos.y - 17 }}
                  bounds="parent"
                  onStop={(e, data) => handleDrag(pos.id, data)}
                >
                  <div
                    className="player-token"
                    onClick={() => setSelectedPos(pos.id)}
                    style={{
                      position: "absolute",
                      textAlign: "center",
                      cursor: "grab",
                      width: "52px",
                      zIndex: 10,
                      transform: selectedPos === pos.id ? "scale(1.2)" : "scale(1)",
                      transition: "transform 0.15s",
                      filter: selectedPos === pos.id
                        ? "drop-shadow(0 0 7px #facc15)"
                        : "drop-shadow(0 2px 3px rgba(0,0,0,0.6))"
                    }}
                  >
                    <JerseyIcon />
                    <div style={{
                      color: "white",
                      fontWeight: "bold",
                      fontSize: "9px",
                      marginTop: "1px",
                      textShadow: "1px 1px 4px #000, 0 0 6px #000",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: "52px"
                    }}>
                      {assigned[pos.id] || pos.label}
                    </div>
                  </div>
                </Draggable>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
