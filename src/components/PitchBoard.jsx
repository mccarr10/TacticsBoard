import { useState } from "react";
import Draggable from "react-draggable";

// --- FULL SQUAD LIST ---
const squad = [
  "John", "Lucas", "Alex", "Ronan", "Ruairi", "Jules", "Robbie",
  "Fionn", "Josh", "Sam", "Mason", "Marcel", "Alan", "Darragh",
  "Sonny", "Charlie", "Cian"
];

// --- PLAYER FORMATION DETAILS ---
const initialFormation = [
  { id: "GK", label: "Goalkeeper", xPct: 50, yPct: 82 },
  { id: "DEF1", label: "Defender 1", xPct: 30, yPct: 66 },
  { id: "DEF2", label: "Defender 2", xPct: 60, yPct: 66 },
  { id: "CM", label: "Central Midfielder", xPct: 50, yPct: 50 },
  { id: "WM1", label: "Wide Midfielder 1", xPct: 18, yPct: 36 },
  { id: "WM2", label: "Wide Midfielder 2", xPct: 72, yPct: 36 },
  { id: "STR", label: "Striker", xPct: 45, yPct: 20 }
];

// --- ICON COMPONENT ---
const JerseyIcon = ({ isOpposition }) => (
  <svg width="36" height="36" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
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

// --- MAIN COMPONENT ---
export default function PitchBoard() {
  const [assigned, setAssigned] = useState({});
  const [selectedPos, setSelectedPos] = useState(null);
  const [lines, setLines] = useState([]);
  const [current, setCurrent] = useState(null);
  const [formation, setFormation] = useState(initialFormation);
  const [pitchSize, setPitchSize] = useState({ w: 360, h: 560 }); // Default fallback size

  // --- REF TO GET PITCH DIMENSIONS ---
  const pitchRef = (el) => {
    if (el) {
      const rect = el.getBoundingClientRect();
      console.log("Pitch dimensions:", rect.width, rect.height); // Debug dimensions
      if (rect.width > 0) setPitchSize({ w: rect.width, h: rect.height });
    }
  };

  // --- ASSIGN PLAYER ---
  const assignPlayer = (player) => {
    if (!selectedPos) return;
    setAssigned({ ...assigned, [selectedPos]: player });
    setSelectedPos(null);
  };

  // --- START LINE DRAW ---
  const start = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    setCurrent({
      x1: e.clientX - r.left,
      y1: e.clientY - r.top,
      x2: e.clientX - r.left,
      y2: e.clientY - r.top
    });
  };

  // --- MOVE LINE ---
  const move = (e) => {
    if (!current) return;
    const r = e.currentTarget.getBoundingClientRect();
    setCurrent({ ...current, x2: e.clientX - r.left, y2: e.clientY - r.top });
  };

  // --- FINISH LINE DRAW ---
  const end = () => {
    if (current) setLines([...lines, current]);
    setCurrent(null);
  };

  const undoArrow = () => setLines(lines.slice(0, -1));
  const clearArrows = () => setLines([]);

  // --- HANDLE PLAYER DRAG ---
  const handleDrag = (posId, data) => {
    setFormation(formation.map((pos) =>
      pos.id === posId
        ? { ...pos, xPct: (data.x / pitchSize.w) * 100, yPct: (data.y / pitchSize.h) * 100 }
        : pos
    ));
    console.log("Updated Formation:", formation); // Debugging player positions
  };

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Segoe UI', sans-serif", background: "#0f172a" }}>
      {/* --- SIDEBAR --- */}
      <div style={{
        width: "200px", background: "#1e293b", color: "white",
        padding: "12px", overflowY: "auto", borderRight: "3px solid #0f172a",
        flexShrink: 0
      }}>
        <h2 style={{ marginBottom: "10px", fontSize: "16px", color: "#94a3b8" }}>Squad List</h2>
        {selectedPos && (
          <div style={{
            background: "#facc15", color: "black", padding: "8px",
            borderRadius: "8px", marginBottom: "10px", fontWeight: "bold", textAlign: "center"
          }}>
            Assigning: {selectedPos}
          </div>
        )}
        {squad.map((player) => (
          <div
            key={player}
            onClick={() => assignPlayer(player)}
            style={{
              background: "#334155", borderRadius: "8px", marginBottom: "6px",
              padding: "6px 8px", cursor: "pointer", display: "flex", alignItems: "center"
            }}
          >
            <JerseyIcon />
            <span>{player}</span>
          </div>
        ))}
      </div>

      {/* --- MAIN PITCH --- */}
      <div style={{
        flex: 1, padding: "12px", display: "flex", flexDirection: "column", alignItems: "center"
      }}>
        <h2 style={{ marginBottom: "12px", fontSize: "18px", color: "white" }}>7-Player Formation</h2>
        <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
          <button onClick={undoArrow} style={{
            padding: "8px 12px", borderRadius: "8px", border: "none",
            background: "#334155", color: "white", cursor: "pointer"
          }}>Undo Arrow</button>
          <button onClick={clearArrows} style={{
            padding: "8px 12px", borderRadius: "8px", border: "none",
            background: "#b91c1c", color: "white", cursor: "pointer"
          }}>Clear All Arrows</button>
        </div>

        {/* --- PITCH CANVAS --- */}
        <div ref={pitchRef} style={{
          position: "relative", width: "min(100%, 420px)", aspectRatio: 3 / 4,
          background: "#14532d", borderRadius: "12px", boxShadow: "0 8px 20px rgba(0,0,0,0.5)"
        }} onMouseDown={start} onMouseMove={move} onMouseUp={end}>
          {/* --- PITCH BACKGROUND --- */}
          {[...Array(14)].map((_, i) => (
            <div key={i} style={{
              position: "absolute", top: `${i * (100 / 14)}%`,
              width: "100%", height: `${100 / 14}%`, background: i % 2 === 0 ? "#1f833f" : "#17a548"
            }} />
          ))}
          <svg style={{ position: "absolute", inset: 0 }} viewBox="0 0 100 150" preserveAspectRatio="none">
            <rect x="2" y="2" width="96" height="146" stroke="white" fill="none" strokeWidth="0.5" />
            <line x1="2" y1="75" x2="98" y2="75" stroke="white" strokeWidth="0.5" />
          </svg>
          {/* --- PLAYERS --- */}
          {formation.map((pos) => {
            const xPx = (pos.xPct / 100) * pitchSize.w - 20; // Adjusted for centering
            const yPx = (pos.yPct / 100) * pitchSize.h - 20;
            return (
              <Draggable key={pos.id} position={{ x: xPx, y: yPx }} bounds="parent" onStop={(e, data) => handleDrag(pos.id, data)}>
                <div onClick={() => setSelectedPos(pos.id)} style={{
                  position: "absolute", transform: selectedPos === pos.id ? "scale(1.1)" : "scale(1)",
                  cursor: "pointer", textAlign: "center", transition: "transform 0.2s"
                }}>
                  <JerseyIcon />
                  <p style={{ marginTop: "2px", color: "white", fontSize: "12px" }}>{assigned[pos.id] || pos.label}</p>
                </div>
              </Draggable>
            );
          })}
        </div>
      </div>
    </div>
  );
}