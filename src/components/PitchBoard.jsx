import { useState } from "react";
import Draggable from "react-draggable";

// --- FULL SQUAD LIST ---
const squad = [
  "John", "Lucas", "Alex", "Ronan", "Ruairi", "Jules", "Robbie",
  "Fionn", "Josh", "Sam", "Mason", "Marcel", "Alan", "Darragh",
  "Sonny", "Charlie", "Cian"
];

// --- FIXED 7‑PLAYER FORMATION (upright layout, rotated visually) ---
const formation = [
  { id: "GK", label: "Goalkeeper", x: 450, y: 80 },
  { id: "DEF1", label: "Defender 1", x: 300, y: 180 },
  { id: "DEF2", label: "Defender 2", x: 600, y: 180 },
  { id: "MID1", label: "Midfielder 1", x: 250, y: 300 },
  { id: "MID2", label: "Midfielder 2", x: 450, y: 300 },
  { id: "MID3", label: "Midfielder 3", x: 650, y: 300 },
  { id: "STR", label: "Striker", x: 450, y: 420 }
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
    <div style={{ display: "flex", height: "100vh", fontFamily: "Inter, sans-serif" }}>

      {/* LEFT PANEL */}
      <div
        style={{
          width: "260px",
          background: "#1e293b",
          color: "white",
          padding: "16px",
          overflowY: "auto",
          borderRight: "4px solid #0f172a"
        }}
      >
        <h2 style={{ marginBottom: "12px" }}>Squad List</h2>

        {selectedPos && (
          <div
            style={{
              background: "#facc15",
              color: "#000",
              padding: "10px",
              borderRadius: "8px",
              marginBottom: "12px",
              fontWeight: 700,
              textAlign: "center"
            }}
          >
            Assigning to: {selectedPos}
          </div>
        )}

        <h3 style={{ marginBottom: "8px" }}>Players</h3>

        {squad.map((player) => (
          <div
            key={player}
            onClick={() => assignPlayer(player)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px",
              marginBottom: "8px",
              background: "#334155",
              borderRadius: "10px",
              cursor: "pointer"
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="#fff">
              <circle cx="12" cy="6" r="4" />
              <path d="M12 10c-4 0-7 3-7 7v3h14v-3c0-4-3-7-7-7z" />
            </svg>

            <span style={{ fontSize: "15px", fontWeight: 500 }}>{player}</span>
          </div>
        ))}
      </div>

      {/* RIGHT SIDE */}
      <div style={{ flex: 1, padding: "20px" }}>
        <h2 style={{ marginBottom: "10px" }}>7‑Player Formation</h2>

        <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
          <button
            onClick={undoArrow}
            style={{
              padding: "8px 14px",
              background: "#334155",
              color: "white",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer"
            }}
          >
            Undo Arrow
          </button>

          <button
            onClick={clearArrows}
            style={{
              padding: "8px 14px",
              background: "#b91c1c",
              color: "white",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer"
            }}
          >
            Clear All Arrows
          </button>
        </div>

        {/* ROTATED PITCH */}
        <div
          onMouseDown={start}
          onMouseMove={move}
          onMouseUp={end}
          style={{
            position: "relative",
            width: "100%",
            maxWidth: "900px",
            aspectRatio: "16/9",
            background: "#14532d",
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 18px 45px rgba(0,0,0,0.45)",
            transform: "rotate(180deg)"
          }}
        >
          {/* Grass stripes */}
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                top: `${i * 10}%`,
                width: "100%",
                height: "10%",
                background: i % 2 === 0 ? "#166534" : "#15803d"
              }}
            />
          ))}

          {/* Pitch lines + GOALS */}
          <svg width="100%" height="100%" style={{ position: "absolute" }}>
            <rect x="2%" y="2%" width="96%" height="96%" fill="none" stroke="white" strokeWidth="3" />
            <line x1="50%" y1="2%" x2="50%" y2="98%" stroke="white" strokeWidth="3" />
            <circle cx="50%" cy="50%" r="6%" stroke="white" strokeWidth="3" fill="none" />

            {/* TOP GOAL (rotated) */}
            <rect x="0.5%" y="40%" width="1.5%" height="20%" fill="none" stroke="white" strokeWidth="3" />
            <line x1="0.5%" y1="40%" x2="2%" y2="40%" stroke="white" strokeWidth="3" />

            {/* BOTTOM GOAL (rotated) */}
            <rect x="98%" y="40%" width="1.5%" height="20%" fill="none" stroke="white" strokeWidth="3" />
            <line x1="98%" y1="40%" x2="96.5%" y2="40%" stroke="white" strokeWidth="3" />
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
              <div
                onClick={() => setSelectedPos(pos.id)}
                style={{
                  position: "absolute",
                  textAlign: "center",
                  cursor: "pointer",
                  padding: "6px"
                }}
              >
                <svg width="40" height="40" viewBox="0 0 24 24" fill="#fff">
                  <circle cx="12" cy="6" r="4" />
                  <path d="M12 10c-4 0-7 3-7 7v3h14v-3c0-4-3-7-7-7z" />
                </svg>

                <div style={{ fontWeight: 700, color: "white" }}>
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
