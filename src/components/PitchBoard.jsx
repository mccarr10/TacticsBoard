import { useState, useRef, useEffect, useCallback } from "react";
import Draggable from "react-draggable";

const squad = [
  "John","Lucas","Alex","Ronan","Ruairi","Jules","Robbie",
  "Fionn","Josh","Sam","Mason","Marcel","Alan","Darragh",
  "Sonny","Charlie","Cian"
];

const JerseyIcon = ({ size = 52, color = "white" }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <path
      d="M16 8 L24 4 L40 4 L48 8 L56 20 L48 28 L48 56 L16 56 L16 28 L8 20 Z"
      fill={color}
      stroke="#111"
      strokeWidth="4"
    />
  </svg>
);

const FORMATION = [
  { id: "GK", label: "Goalkeeper", xPct: 0.5, yPct: 0.92 },
  { id: "DEF1", label: "Defender 1", xPct: 0.27, yPct: 0.7 },
  { id: "DEF2", label: "Defender 2", xPct: 0.73, yPct: 0.7 },
  { id: "CM", label: "Central Mid", xPct: 0.5, yPct: 0.5 },
  { id: "WM1", label: "Wide Mid 1", xPct: 0.14, yPct: 0.35 },
  { id: "WM2", label: "Wide Mid 2", xPct: 0.86, yPct: 0.35 },
  { id: "STR", label: "Striker", xPct: 0.5, yPct: 0.12 },
];

export default function TacticalBoard() {
  const pitchRef = useRef(null);
  const wrapperRef = useRef(null);

  const [dims, setDims] = useState({ w: 0, h: 0 });
  const [players, setPlayers] = useState([]);
  const [oppositionPlayers, setOppositionPlayers] = useState([]);
  const [assigned, setAssigned] = useState({});
  const [selectedPos, setSelectedPos] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const [lines, setLines] = useState([]);
  const [drawing, setDrawing] = useState(null);

  const [showOpposition, setShowOpposition] = useState(true);

  const measure = useCallback(() => {
    if (!wrapperRef.current) return;

    const w = wrapperRef.current.clientWidth * 0.98;
    const h = w * 1.6;

    setDims({ w, h });

    setPlayers(
      FORMATION.map(p => ({
        ...p,
        x: p.xPct * w,
        y: p.yPct * h
      }))
    );

    setOppositionPlayers(
      FORMATION.map(p => ({
        ...p,
        id: `OPP_${p.id}`,
        x: (1 - p.xPct) * w,
        y: (1 - p.yPct) * h
      }))
    );
  }, []);

  useEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (wrapperRef.current) ro.observe(wrapperRef.current);
    return () => ro.disconnect();
  }, [measure]);

  const getCoords = (e) => {
    const rect = pitchRef.current.getBoundingClientRect();
    const src = e.touches ? e.touches[0] : e;

    return {
      x: src.clientX - rect.left,
      y: src.clientY - rect.top
    };
  };

  // DRAW ARROWS
  const onDrawStart = (e) => {
    if (e.target.closest(".player-token")) return;
    const { x, y } = getCoords(e);
    setDrawing({ x1: x, y1: y, x2: x, y2: y });
  };

  const onDrawMove = (e) => {
    if (!drawing) return;
    const { x, y } = getCoords(e);
    setDrawing(d => ({ ...d, x2: x, y2: y }));
  };

  const onDrawEnd = () => {
    if (!drawing) return;

    const dx = drawing.x2 - drawing.x1;
    const dy = drawing.y2 - drawing.y1;

    if (Math.hypot(dx, dy) > 20) {
      setLines(l => [...l, drawing]);
    }

    setDrawing(null);
  };

  // NEW: CLEAR ARROWS ONLY
  const clearArrows = () => {
    setLines([]);
  };

  // FIXED RESET: does NOT touch names or arrows
  const resetPositionsOnly = () => {
    measure();
  };

  const jerseySize = Math.max(100, Math.min(150, dims.w * 0.3));
  const fontSize = Math.max(16, Math.min(22, dims.w * 0.06));

  return (
    <div style={{
      width: "100vw",
      height: "100dvh",
      background: "#020617",
      display: "flex",
      flexDirection: "column"
    }}>

      {/* HEADER */}
      <div style={{
        height: "110px",
        padding: "16px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "linear-gradient(135deg,#1e2937,#0f172a)"
      }}>
        <div style={{ color: "#fff", fontSize: "32px", fontWeight: "900" }}>
          Tactical Board
        </div>

        <div style={{ display: "flex", gap: "12px" }}>

          <button
            onClick={() => setShowOpposition(v => !v)}
            style={{
              padding: "14px 18px",
              borderRadius: "12px",
              background: "#7c3aed",
              color: "#fff",
              fontSize: "18px",
              fontWeight: "800"
            }}
          >
            Opp
          </button>

          {/* NEW BUTTON */}
          <button
            onClick={clearArrows}
            style={{
              padding: "14px 18px",
              borderRadius: "12px",
              background: "#334155",
              color: "#fff",
              fontSize: "18px",
              fontWeight: "800"
            }}
          >
            Clear Arrows
          </button>

          <button
            onClick={resetPositionsOnly}
            style={{
              padding: "14px 18px",
              borderRadius: "12px",
              background: "#dc2626",
              color: "#fff",
              fontSize: "18px",
              fontWeight: "800"
            }}
          >
            Reset
          </button>
        </div>
      </div>

      {/* PITCH */}
      <div ref={wrapperRef} style={{
        flex: 1,
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}>
        {dims.w > 0 && (
          <div
            ref={pitchRef}
            style={{
              width: dims.w,
              height: dims.h,
              background: "#166534",
              position: "relative",
              borderRadius: "16px",
              overflow: "hidden"
            }}
            onMouseDown={onDrawStart}
            onMouseMove={onDrawMove}
            onMouseUp={onDrawEnd}
            onMouseLeave={onDrawEnd}
          >

            {/* ARROWS */}
            {lines.map((l,i)=>(
              <svg key={i} style={{ position:"absolute", inset:0 }}>
                <line
                  x1={l.x1}
                  y1={l.y1}
                  x2={l.x2}
                  y2={l.y2}
                  stroke="#fde047"
                  strokeWidth="4"
                />
              </svg>
            ))}

            {drawing && (
              <svg style={{ position:"absolute", inset:0 }}>
                <line
                  x1={drawing.x1}
                  y1={drawing.y1}
                  x2={drawing.x2}
                  y2={drawing.y2}
                  stroke="#fde047"
                  strokeWidth="4"
                  strokeDasharray="6 4"
                />
              </svg>
            )}

            {/* PLAYERS */}
            {players.map(p => (
              <div
                key={p.id}
                className="player-token"
                style={{
                  position:"absolute",
                  left:p.x,
                  top:p.y,
                  textAlign:"center",
                  color:"#fff",
                  fontWeight:"800",
                  fontSize
                }}
              >
                <JerseyIcon size={jerseySize} color="#f8fafc" />
                <div>{p.label.split(" ")[0]}</div>
              </div>
            ))}

            {/* OPPOSITION */}
            {showOpposition && oppositionPlayers.map(p => (
              <div
                key={p.id}
                style={{
                  position:"absolute",
                  left:p.x,
                  top:p.y,
                  textAlign:"center",
                  color:"#fff",
                  fontWeight:"800",
                  fontSize,
                  opacity:0.85
                }}
              >
                <JerseyIcon size={jerseySize} color="#ef4444" />
                <div>Opp</div>
              </div>
            ))}

          </div>
        )}
      </div>
    </div>
  );
}