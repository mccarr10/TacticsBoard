import { useState } from "react";
import Draggable from "react-draggable";

// --- FULL SQUAD LIST ---
const squad = [
  "John", "Lucas", "Alex", "Ronan", "Ruairi", "Jules", "Robbie",
  "Fionn", "Josh", "Sam", "Mason", "Marcel", "Alan", "Darragh",
  "Sonny", "Charlie", "Cian"
];

// --- PLAYER AND FORMATION DETAILS ---
const initialFormation = [
  { id: "GK", label: "Goalkeeper", x: 200, y: 560 },
  { id: "DEF1", label: "Defender 1", x: 100, y: 420 },
  { id: "DEF2", label: "Defender 2", x: 200, y: 420 },
  { id: "DEF3", label: "Defender 3", x: 300, y: 420 },
  { id: "MID1", label: "Midfielder 1", x: 100, y: 300 },
  { id: "MID2", label: "Midfielder 2", x: 300, y: 300 },
  { id: "STR", label: "Striker", x: 200, y: 160 }
];

const initialOppositionFormation = [
  { id: "OPP1", label: "Opposition 1", x: 200, y: 40 },
  { id: "OPP2", label: "Opposition 2", x: 100, y: 180 },
  { id: "OPP3", label: "Opposition 3", x: 300, y: 180 },
  { id: "OPP4", label: "Opposition 4", x: 100, y: 300 },
  { id: "OPP5", label: "Opposition 5", x: 300, y: 300 },
  { id: "OPP6", label: "Opposition 6", x: 100, y: 420 },
  { id: "OPP7", label: "Opposition 7", x: 300, y: 420 }
];

// --- MODERN BLACK & WHITE JERSEY SVG ---
const JerseyIcon = ({ isOpposition }) => (
  <svg width="38" height="38" viewBox="0 0 64 64">
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

export default function PitchBoard() {
  const [assigned, setAssigned] = useState({});
  const [selectedPos, setSelectedPos] = useState(null);

  const [lines, setLines] = useState([]);
  const [current, setCurrent] = useState(null);

  const [formation, setFormation] = useState(initialFormation);
  const [oppositionFormation] = useState(initialOppositionFormation);

  const assignPlayer = (player) => {
    if (!selectedPos) return;
    const updatedFormation = formation.map((pos) =>
      pos.id === selectedPos ? { ...pos, label: player } : pos
    );
    setFormation(updatedFormation);
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
      {/* Sidebar */}
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
            color: "black",
            padding: "8px",
            borderRadius: "8px",
            marginBottom: "10px",
            fontWeight: "bold",
            textAlign: "center"
          }}>
            Assigning to: {selectedPos}
          </div>
        )}

        {squad.map((player) => (
          <div key={player} onClick={() => assignPlayer(player)} style={{
            background: "#334155",
            borderRadius: "8px",
            marginBottom: "8px",
            padding: "8px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "12px"
          }}>
            <JerseyIcon />
            {player}
          </div>
        ))}
      </div>

      {/* Pitch */}
      <div style={{
        flex: 1,
        padding: "10px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}>
        <h2 style={{ marginBottom: "8px", fontSize: "18px" }}>7‑Player Formation</h2>

        <div style={{
          display: "flex",
          gap: "10px",
          marginBottom: "16px"
        }}>
          <button onClick={undoArrow} style={{
            padding: "8px 12px",
            background: "#334155",
            color: "white",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer"
          }}>Undo Arrow</button>

          <button onClick={clearArrows} style={{
            padding: "8px 12px",
            background: "#b91c1c",
            color: "white",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer"
          }}>Clear All Arrows</button>
        </div>

        <div
          onMouseDown={start}
          onMouseMove={move}
          onMouseUp={end}
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: "9 / 16",
            background: "#14532d",
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 12px 28px rgba(0,0,0,0.4)"
          }}
        >
          {/* Grass Stripes */}
          {[...Array(16)].map((_, i) => (
            <div key={i} style={{
              position: "absolute",
              top: `${i * 6.25}%`,
              width: "100%",
              height: "6.25%",
              background: i % 2 === 0 ? "#166534" : "#15803d"
            }} />
          ))}

          {/* Pitch Markings */}
          <svg width="100%" height="100%" style={{ position: "absolute" }}>
            <rect x="5%" y="5%" width="90%" height="90%" fill="none" stroke="white" strokeWidth="3" />
            <line x1="5%" y1="50%" x2="95%" y2="50%" stroke="white" strokeWidth="3" />
            <circle cx="50%" cy="50%" r="8%" stroke="white" strokeWidth="3" fill="none" />
          </svg>

          {/* Player Formation */}
          {formation.map((pos) => (
            <div
              key={pos.id}
              onClick={() => setSelectedPos(pos.id)}
              style={{
                position: "absolute",
                left: `${pos.x}px`,
                top: `${pos.y}px`,
                textAlign: "center",
                cursor: "pointer"
              }}
            >
              <JerseyIcon />
              <div style={{
                color: "white",
                fontWeight: "bold",
                marginTop: "4px"
              }}>{assigned[pos.id] || pos.label}</div>
            </div>
          ))}

          {/* Opposition Formation */}
          {oppositionFormation.map((pos) => (
            <div key={pos.id} style={{
              position: "absolute",
              left: `${pos.x}px`,
              top: `${pos.y}px`,
              textAlign: "center"
            }}>
              <JerseyIcon isOpposition />
              <div style={{
                color: "#f87171",
                fontWeight: "bold",
                marginTop: "4px"
              }}>{pos.label}</div>
            </div>
          ))}

          {/* Arrows */}
          <svg width="100%" height="100%" style={{ position: "absolute" }}>
            {lines.map((line, index) => (
              <line
                key={index}
                x1={line.x1}
                y1={line.y1}
                x2={line.x2}
                y2={line.y2}
                stroke="orange"
                strokeWidth="3"
                markerEnd="url(#arrow)"
              />
            ))}
          </svg>
        </div>
      </div>
    </div>
  );
}