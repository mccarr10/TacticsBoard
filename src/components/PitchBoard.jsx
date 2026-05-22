import { useState } from "react";
import Draggable from "react-draggable";

// --- FULL SQUAD LIST ---
const squad = [
  "John", "Lucas", "Alex", "Ronan", "Ruairi", "Jules", "Robbie",
  "Fionn", "Josh", "Sam", "Mason", "Marcel", "Alan", "Darragh",
  "Sonny", "Charlie", "Cian"
];

// --- OPPOSITION SQUAD LIST ---
const oppositionSquad = [
  "Opponent 1", "Opponent 2", "Opponent 3", "Opponent 4",
  "Opponent 5", "Opponent 6", "Opponent 7"
];

// --- MODERN BLACK & WHITE STRIPED JERSEY SVG ---
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

// --- 7‑PLAYER FORMATION (our team) ---
const formation = [
  { id: "GK", label: "Goalkeeper", x: 180, y: 700 },
  { id: "DEF1", label: "Defender 1", x: 100, y: 560 },
  { id: "DEF2", label: "Defender 2", x: 260, y: 560 },
  { id: "MID1", label: "Midfielder 1", x: 80, y: 420 },
  { id: "MID2", label: "Midfielder 2", x: 180, y: 420 },
  { id: "MID3", label: "Midfielder 3", x: 280, y: 420 },
  { id: "STR", label: "Striker", x: 180, y: 260 }
];

// --- OPPOSITION TEAM FORMATION ---
const formationOpposition = [
  { id: "OPP1", label: "Opposition 1", x: 180, y: 100 },
  { id: "OPP2", label: "Opposition 2", x: 100, y: 240 },
  { id: "OPP3", label: "Opposition 3", x: 260, y: 240 },
  { id: "OPP4", label: "Opposition 4", x: 80, y: 380 },
  { id: "OPP5", label: "Opposition 5", x: 280, y: 380 },
  { id: "OPP6", label: "Opposition 6", x: 100, y: 500 },
  { id: "OPP7", label: "Opposition 7", x: 260, y: 500 }
];

export default function PitchBoard() {
  const [assigned, setAssigned] = useState({});
  const [lines, setLines] = useState([]);
  const [current, setCurrent] = useState(null);

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
      {/* Right Side */}
      <div style={{
        flex: 1,
        padding: "10px",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}>
        <h2 style={{ margin: 8, fontSize: "18px" }}>7‑Player Formation</h2>

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
            borderRadius: "8px",
            border: "none",
            color: "white",
            cursor: "pointer"
          }}>Undo Arrow</button>
          <button onClick={clearArrows} style={{
            padding: "6px 10px",
            background: "#b91c1c",
            borderRadius: "8px",
            border: "none",
            color: "white",
            cursor: "pointer"
          }}>Clear All Arrows</button>
        </div>

        {/* Pitch */}
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
          {/* Grass */}
          {[...Array(16)].map((_, i) => (
            <div key={i} style={{
              position: "absolute",
              top: `${i * 6.25}%`,
              width: "100%",
              height: "6.25%",
              background: i % 2 === 0 ? "#166534" : "#15803d"
            }} />
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
                stroke="#f43f5e"
                strokeWidth="4"
              />
            ))}
          </svg>

          {/* Players */}
          {formation.map((pos) => (
            <Draggable
              key={pos.id}
              defaultPosition={{ x: pos.x, y: pos.y }}
              bounds="parent"
              position={{ x: pos.x, y: pos.y }}
            >
              <div style={{ position: "absolute" }}>
                <JerseyIcon />
                <div style={{ color: "white" }}>{pos.label}</div>
              </div>
            </Draggable>
          ))}

          {/* Opposition Players */}
          {formationOpposition.map((pos) => (
            <div
              key={pos.id}
              style={{
                position: "absolute",
                left: `${pos.x}px`,
                top: `${pos.y}px`,
                textAlign: "center"
              }}
            >
              <JerseyIcon isOpposition />
              <div style={{ color: "#f87171" }}>{pos.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}