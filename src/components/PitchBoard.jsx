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

// --- TEAM FORMATIONS ---
const formation = [
  { id: "GK", label: "Goalkeeper", x: 180, y: 700 },
  { id: "DEF1", label: "Defender 1", x: 100, y: 560 },
  { id: "DEF2", label: "Defender 2", x: 260, y: 560 },
  { id: "MID1", label: "Midfielder 1", x: 80, y: 420 },
  { id: "MID2", label: "Midfielder 2", x: 180, y: 420 },
  { id: "MID3", label: "Midfielder 3", x: 280, y: 420 },
  { id: "STR", label: "Striker", x: 180, y: 260 }
];

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
      height: "100vh",
      fontFamily: "Inter, sans-serif",
    }}>
      {/* LEFT SIDEBAR */}
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

      {/* PITCH */}
      <div style={{
        flex: 1,
        padding: "10px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}>
        <h2 style={{ marginBottom: "8px", fontSize: "18px" }}>7‑Player Formation</h2>

        {/* FIELD */}
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

          {/* Players */}
          {formation.map((pos) => (
            <Draggable
              key={pos.id}
              defaultPosition={{ x: pos.x, y: pos.y }}
              bounds="parent"
            >
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

          {/* Opposition Players */}
          {formationOpposition.map((pos) => (
            <div key={pos.id} style={{
              position: "absolute",
              left: `${pos.x}px`,
              top: `${pos.y}px`,
              textAlign: "center"
            }}>
              <JerseyIcon isOpposition />
              <div style={{
                fontWeight: 700,
                color: "#f87171",
                fontSize: "12px",
                marginTop: "2px"
              }}>
                {pos.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}