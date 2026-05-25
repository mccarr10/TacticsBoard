import { useState, useRef, useEffect, useCallback } from "react";
import Draggable from "react-draggable";

const squad = [
  "John","Lucas","Alex","Ronan","Ruairi","Jules","Robbie",
  "Fionn","Josh","Sam","Mason","Marcel","Alan","Darragh",
  "Sonny","Charlie","Cian"
];

const oppositionLabels = ["GK","LB","RB","CM","LW","RW","ST"];

const formations = {
  "2-3-1": [
    { id: "GK", label: "Goalkeeper", xPct: 0.5, yPct: 0.92 },
    { id: "DEF1", label: "Defender 1", xPct: 0.27, yPct: 0.7 },
    { id: "DEF2", label: "Defender 2", xPct: 0.73, yPct: 0.7 },
    { id: "CM", label: "Central Mid", xPct: 0.5, yPct: 0.5 },
    { id: "WM1", label: "Wide Mid 1", xPct: 0.14, yPct: 0.35 },
    { id: "WM2", label: "Wide Mid 2", xPct: 0.86, yPct: 0.35 },
    { id: "STR", label: "Striker", xPct: 0.5, yPct: 0.12 },
  ],
};

export default function TacticalBoard() {
  const pitchRef = useRef(null);
  const wrapperRef = useRef(null);

  const [dims, setDims] = useState({ w: 0, h: 0 });
  const [formationKey] = useState("2-3-1");
  const FORMATION = formations[formationKey];

  const [players, setPlayers] = useState([]);
  const [oppositionPlayers, setOppositionPlayers] = useState([]);

  const [assigned, setAssigned] = useState({});
  const [selectedPos, setSelectedPos] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const [lines, setLines] = useState([]);
  const [drawing, setDrawing] = useState(null);

  const [showOpposition, setShowOpposition] = useState(true);
  const [oppositionOpacity, setOppositionOpacity] = useState(0.85);

  const [ready, setReady] = useState(false);

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

    setReady(true);
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
      y: src.clientY - rect.top,
    };
  };

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

  const clearArrows = () => {
    setLines([]);
  };

  const resetPositionsOnly = () => {
    measure(); // ONLY resets positions, NOT names or arrows
  };

const jerseySize = Math.max(70, Math.min(110, dims.w * 0.20));
const fontSize = Math.max(16, Math.min(24, dims.w * 0.045));
const tokenWidth = jerseySize + 20;

  return (
    <div style={{ width: "100vw", height: "100dvh", background: "#020617", display: "flex", flexDirection: "column" }}>

      {/* HEADER */}
      <div style={{
        height: "150px",
        padding: "20px",
        background: "linear-gradient(135deg,#1e2937,#0f172a)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <div>
          <div style={{ fontSize: "42px", fontWeight: "900", color: "#fff" }}>
            Tactical Board
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>

          <button
            onClick={() => setShowOpposition(v => !v)}
            style={{ padding: "18px 22px", fontSize: "20px", borderRadius: "14px", background: "#7c3aed", color: "#fff" }}
          >
            {showOpposition ? "Hide Opp" : "Show Opp"}
          </button>

          <button
            onClick={clearArrows}
            style={{ padding: "18px 22px", fontSize: "20px", borderRadius: "14px", background: "#334155", color: "#fff" }}
          >
            Clear Arrows
          </button>

          <button
            onClick={resetPositionsOnly}
            style={{ padding: "18px 22px", fontSize: "20px", borderRadius: "14px", background: "#dc2626", color: "#fff" }}
          >
            Reset Positions
          </button>
        </div>
      </div>

      {/* PITCH */}
      <div ref={wrapperRef} style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
        {ready && (
          <div
            ref={pitchRef}
            style={{
              width: dims.w,
              height: dims.h,
              position: "relative",
              background: "#166534",
              borderRadius: "20px",
              overflow: "hidden",
              touchAction: "none"
            }}
            onMouseDown={onDrawStart}
            onMouseMove={onDrawMove}
            onMouseUp={onDrawEnd}
            onMouseLeave={onDrawEnd}
          >

            {/* LINES */}
            {lines.map((l,i)=>(
              <svg key={i} style={{ position:"absolute", inset:0 }}>
                <line
                  x1={l.x1} y1={l.y1}
                  x2={l.x2} y2={l.y2}
                  stroke="#fde047"
                  strokeWidth="5"
                />
              </svg>
            ))}

            {/* MAIN PLAYERS */}
            {players.map(p => (
              <div
                key={p.id}
                style={{
                  position:"absolute",
                  left:p.x,
                  top:p.y,
                  width:tokenWidth,
                  textAlign:"center",
                  color:"#fff",
                  fontWeight:"800",
                  fontSize
                }}
              >
                🟡 {p.label.split(" ")[0]}
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
                  width:tokenWidth,
                  textAlign:"center",
                  color:"#fff",
                  opacity:oppositionOpacity,
                  fontWeight:"800",
                  fontSize
                }}
              >
                🔴 {oppositionLabels[0]}
              </div>
            ))}

          </div>
        )}
      </div>

      {/* OPACITY SLIDER */}
      {showOpposition && (
        <div style={{
          position:"fixed",
          bottom:20,
          right:20,
          background:"#1e2937",
          padding:20,
          borderRadius:16,
          color:"#fff"
        }}>
          <div>Opposition Opacity</div>
          <input
            type="range"
            min="0.2"
            max="1"
            step="0.05"
            value={oppositionOpacity}
            onChange={e=>setOppositionOpacity(Number(e.target.value))}
          />
        </div>
      )}

    </div>
  );
}
