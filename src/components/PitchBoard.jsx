import { useState } from "react";
import Draggable from "react-draggable";

// --- FULL SQUAD LIST ---
const squad = [
  "John", "Lucas", "Alex", "Ronan", "Ruairi", "Jules", "Robbie",
  "Fionn", "Josh", "Sam", "Mason", "Marcel", "Alan", "Darragh",
  "Sonny", "Charlie", "Cian"
];

// --- MODERN BLACK & WHITE STRIPED JERSEY SVG ---
const JerseyIcon = () => (
  <svg width="38" height="38" viewBox="0 0 64 64">
    <path d="M16 8 L24 4 L40 4 L48 8 L56 20 L48 28 L48 56 L16 56 L16 28 L8 20 Z"
      fill="#ffffff" stroke="#000" strokeWidth="3" />
    <rect x="22" y="4" width="6" height="52" fill="#000" />
    <rect x="36" y="4" width="6" height="52" fill="#000" />
  </svg>
);

// --- 7‑PLAYER FORMATION (portrait, GK bottom, STR top) ---
const formation = [
  { id: "GK", label: "Goalkeeper", x: 180, y: 700 },
  { id: "DEF1", label: "Defender 1", x: 100, y: 560 },
  { id: "DEF2", label: "Defender 2", x: 260, y: 560 },
  { id: "MID1", label: "Midfielder 1", x: 80, y: 420 },
  { id: "MID2", label: "Midfielder 2", x: 180, y: 420 },
  { id: "MID3", label: "Midfielder 3", x: 280, y: 420 },
  { id: "STR", label: "Striker", x: 180, y: 260 }
];

export default function PitchBoard() {
  const [assigned, setAssigned] = useState({});
  const [selectedPos, setSelectedPos] = useState(null);
  const [lines, setLines] = useState([]);
  const [current, setCurrent] = useState(null);

  const assignPlayer = (player) => {
    if (!selectedPos) return;
    setAssigned({ ...assigned, [selectedPos]: player });
    setSelectedPos(null);
  };

  const start = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    setCurrent({
      x1: e.clientX - r.left,
      y1: e.clientY - r.top,
      x2: e.clientX - r.left,
      y2: e.clientY - r.top
    });
  };

  const move = (e) => {
    if (!current) return;
    const r = e.currentTarget.getBoundingClientRect();
    setCurrent({
      ...current,
      x2: e.clientX - r.left,
      y2: e.clientY - r.top
    });
  };

  const end = () => {
    if (current) setLines([...lines, current]);
    setCurrent(null);
  };

  const undoArrow = () => setLines(lines.slice(0, -1));
  const clearArrows = () => setLines([]);

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      width: "100%",
      height: "100vh",
      fontFamily: "Inter, sans-serif",
      overflow: "hidden"
    }}>
      {/* LEFT PANEL */}
      <div style={{
        width: "230px",
        background: "#1e293b",
        color: "white",
        padding: "12px",
        overflowY: "auto",
        borderRight: "3px solid #0f172a"
      }}>
        <h2 style={{ marginBottom: "10px", fontSize: "18px" }}>Squad List</h2>

        {selectedPos && (
          <div style={{
            background: "#facc15",
            color: "#000",
            padding: "8px",
            borderRadius: "8px",
            marginBottom: "10px",
            fontWeight: 700,
            textAlign: "center",
            fontSize: "14px"
          }}>
            Assigning to: {selectedPos}
          </div>
        )}

        <h3 style={{ marginBottom: "6px", fontSize: "15px" }}>Players</h3>

        {squad.map((player) => (
          <div key={player} onClick={() => assignPlayer(player)} style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px",
            marginBottom: "6px",
            background: "#334155",
            borderRadius: "10px",
            cursor: "pointer"
          }}>
            <JerseyIcon />
            <span style={{ fontSize: "14px", fontWeight: 500 }}>{player}</span>
          </div>
        ))}
      </div>

      {/* RIGHT SIDE */}
      <div style={{
        flex: 1,
        padding: "10px",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}>
        <h2 style={{ marginBottom: "8px", fontSize: "18px" }}>7‑Player Formation</h2>

        <div style={{
          display: "flex",
          gap: "8px",
          marginBottom: "8px",
          width: "100%",
          justifyContent: "center"
        }}>
          <button onClick={undoArrow} style={{
            padding: "6px 10px",
            background: "#334155",
            color: "white",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            fontSize: "13px"
          }}>Undo Arrow</button>

          <button onClick={clearArrows} style={{
            padding: "6px 10px",
            background: "#b91c1c",
            color: "white",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            fontSize: "13px"
          }}>Clear All Arrows</button>
        </div>

        {/* PORTRAIT PITCH */}
        <div
          onMouseDown={start}
          onMouseMove={move}
          onMouseUp={end}
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: "9/16",
            background: "#14532d",
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 12px 30px rgba(0,0,0,0.45)",
            margin: "0 auto",
            maxHeight: "100vh"
          }}
        >
          {/* Grass stripes */}
          {[...Array(16)].map((_, i) => (
            <div key={i} style={{
              position: "absolute",
              top: `${i * 6.25}%`,
              width: "100%",
              height: "6.25%",
              background: i % 2 === 0 ? "#166534" : "#15803d"
            }} />
          ))}

          {/* Pitch lines + GOAL BOXES */}
          <svg width="100%" height="100%" style={{ position: "absolute" }}>
            <rect x="5%" y="5%" width="90%" height="90%" fill="none" stroke="white" strokeWidth="3" />
            <line x1="5%" y1="50%" x2="95%" y2="50%" stroke="white" strokeWidth="3" />
            <circle cx="50%" cy="50%" r="8%" stroke="white" strokeWidth="3" fill="none" />
            <rect x="30%" y="5%" width="40%" height="10%" fill="none" stroke="white" strokeWidth="3" />
            <rect x="40%" y="3%" width="20%" height="2%" fill="none" stroke="white" strokeWidth="3" />
            <rect x="30%" y="85%" width="40%" height="10%" fill="none" stroke="white" strokeWidth="3" />
            <rect x="40%" y="95%" width="20%" height="2%" fill="none" stroke="white" strokeWidth="3" />
          </svg>

          {/* Arrows */}
          <svg width="100%" height="100%" style={{ position: "absolute", pointerEvents: "none" }}>
            <defs>
              <marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
                <polygon points="0 0, 10 3, 0 6" fill="#f43f5e" />
              </marker>
            </defs>

            {lines.map((l, i) => (
              <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke="#f43f5e" strokeWidth="4" markerEnd="url(#arrow)" />
            ))}

            {current && (
              <line x1={current.x1} y1={current.y1} x2={current.x2} y2={current.y2} stroke="orange" strokeWidth="4" markerEnd="url(#arrow)" />
            )}
          </svg>

          {/* Player positions */}
          {formation.map((pos) => (
            <Draggable key={pos.id} defaultPosition={{ x: pos.x, y: pos.y }} bounds="parent">
              <div onClick={() => setSelectedPos(pos.id)} style={{
                position: "absolute",
                textAlign: "center",
                cursor: "pointer",
                padding: "4px"
              }}>
                <JerseyIcon />
                <div style={{
                  fontWeight: 700,
                  color: "white",
                  fontSize: "12px",
                  marginTop: "2px"
                }}>
                  {assigned[pos.id] || pos.label}
                </div>
              </div>
            </Draggable>
          ))}
        </div>
      </div>
    </div>
  );
}