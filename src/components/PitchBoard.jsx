import { useState, useRef, useEffect } from "react";
import Draggable from "react-draggable";

const squad = [
  "John","Lucas","Alex","Ronan","Ruairi","Jules","Robbie",
  "Fionn","Josh","Sam","Mason","Marcel","Alan","Darragh","Sonny","Charlie","Cian"
];

const PITCH_W = 320;
const PITCH_H = 480;

const JerseyIcon = ({ isOpposition }) => (
  <svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
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

// Positions scaled to PITCH_W=320, PITCH_H=480
// x/y is the centre of the player token
const initialFormation = [
  { id: "GK",   label: "Goalkeeper",         x: 160, y: 410 },
  { id: "DEF1", label: "Defender 1",         x: 90,  y: 330 },
  { id: "DEF2", label: "Defender 2",         x: 230, y: 330 },
  { id: "CM",   label: "Central Midfielder", x: 160, y: 240 },
  { id: "WM1",  label: "Wide Mid 1",         x: 60,  y: 175 },
  { id: "WM2",  label: "Wide Mid 2",         x: 260, y: 175 },
  { id: "STR",  label: "Striker",            x: 160, y: 100 },
];

export default function PitchBoard() {
  const [assigned, setAssigned] = useState({});
  const [selectedPos, setSelectedPos] = useState(null);
  const [lines, setLines] = useState([]);
  const [current, setCurrent] = useState(null);
  const [formation, setFormation] = useState(initialFormation);
  const pitchRef = useRef(null);

  const assignPlayer = (player) => {
    if (!selectedPos) return;
    setAssigned((prev) => ({ ...prev, [selectedPos]: player }));
    setSelectedPos(null);
  };

  const getPitchCoords = (e) => {
    const r = pitchRef.current.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const onMouseDown = (e) => {
    const { x, y } = getPitchCoords(e);
    setCurrent({ x1: x, y1: y, x2: x, y2: y });
  };

  const onMouseMove = (e) => {
    if (!current) return;
    const { x, y } = getPitchCoords(e);
    setCurrent((c) => ({ ...c, x2: x, y2: y }));
  };

  const onMouseUp = () => {
    if (current) setLines((l) => [...l, current]);
    setCurrent(null);
  };

  const handleDrag = (posId, data) => {
    setFormation((f) =>
      f.map((pos) => pos.id === posId ? { ...pos, x: data.x + 16, y: data.y + 16 } : pos)
    );
  };

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Segoe UI', sans-serif", background: "#0f172a" }}>

      {/* Sidebar */}
      <div style={{
        width: "180px", background: "#1e293b", color: "white",
        padding: "10px", overflowY: "auto", borderRight: "3px solid #0f172a", flexShrink: 0
      }}>
        <h2 style={{ marginBottom: "10px", fontSize: "13px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px" }}>
          Squad List
        </h2>

        {selectedPos && (
          <div style={{
            background: "#facc15", color: "black", padding: "6px",
            borderRadius: "6px", marginBottom: "10px", fontWeight: "bold",
            textAlign: "center", fontSize: "12px"
          }}>
            Assigning: {selectedPos}
          </div>
        )}

        {squad.map((player) => (
          <div
            key={player}
            onClick={() => assignPlayer(player)}
            style={{
              background: "#334155", borderRadius: "6px", marginBottom: "5px",
              padding: "5px 7px", cursor: "pointer", display: "flex",
              alignItems: "center", gap: "7px", fontSize: "13px",
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

      {/* Main */}
      <div style={{
        flex: 1, padding: "12px", display: "flex",
        flexDirection: "column", alignItems: "center"
      }}>
        <h2 style={{ marginBottom: "8px", fontSize: "17px", color: "white" }}>7-Player Formation</h2>

        <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
          <button
            onClick={() => setLines((l) => l.slice(0, -1))}
            style={{ padding: "6px 12px", background: "#334155", color: "white", borderRadius: "7px", border: "none", cursor: "pointer", fontSize: "13px" }}
          >Undo Arrow</button>
          <button
            onClick={() => setLines([])}
            style={{ padding: "6px 12px", background: "#b91c1c", color: "white", borderRadius: "7px", border: "none", cursor: "pointer", fontSize: "13px" }}
          >Clear Arrows</button>
        </div>

        {/* Pitch */}
        <div style={{ position: "relative", width: `${PITCH_W}px`, height: `${PITCH_H}px` }}>
          <div
            ref={pitchRef}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            style={{
              position: "absolute", inset: 0,
              borderRadius: "10px", overflow: "hidden",
              boxShadow: "0 12px 40px rgba(0,0,0,0.5)"
            }}
          >
            {/* Grass stripes */}
            {[...Array(14)].map((_, i) => (
              <div key={i} style={{
                position: "absolute",
                top: `${i * (100 / 14)}%`,
                width: "100%", height: `${100 / 14}%`,
                background: i % 2 === 0 ? "#3a8a3a" : "#2d7a2d"
              }} />
            ))}

            {/* Pitch markings + arrows */}
            <svg
              style={{ position: "absolute", inset: 0 }}
              width={PITCH_W} height={PITCH_H}
              viewBox={`0 0 ${PITCH_W} ${PITCH_H}`}
            >
              <defs>
                <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" fill="#facc15" />
                </marker>
              </defs>

              {/* Outer border */}
              <rect x="12" y="12" width={PITCH_W - 24} height={PITCH_H - 24} fill="none" stroke="white" strokeWidth="2.5" />

              {/* Halfway line */}
              <line x1="12" y1={PITCH_H / 2} x2={PITCH_W - 12} y2={PITCH_H / 2} stroke="white" strokeWidth="2" />

              {/* Centre circle */}
              <circle cx={PITCH_W / 2} cy={PITCH_H / 2} r="40" fill="none" stroke="white" strokeWidth="2" />
              <circle cx={PITCH_W / 2} cy={PITCH_H / 2} r="2.5" fill="white" />

              {/* TOP — large penalty box */}
              <rect x="72" y="12" width="176" height="68" fill="none" stroke="white" strokeWidth="2" />
              {/* TOP — small box */}
              <rect x="108" y="12" width="104" height="28" fill="none" stroke="white" strokeWidth="2" />
              {/* TOP — goal */}
              <rect x="126" y="6" width="68" height="10" fill="none" stroke="white" strokeWidth="2" />
              {/* TOP — penalty spot */}
              <circle cx={PITCH_W / 2} cy="58" r="2" fill="white" />
              {/* TOP — penalty arc */}
              <path d={`M 108 80 A 40 40 0 0 1 212 80`} fill="none" stroke="white" strokeWidth="2" />

              {/* BOTTOM — large penalty box */}
              <rect x="72" y={PITCH_H - 80} width="176" height="68" fill="none" stroke="white" strokeWidth="2" />
              {/* BOTTOM — small box */}
              <rect x="108" y={PITCH_H - 40} width="104" height="28" fill="none" stroke="white" strokeWidth="2" />
              {/* BOTTOM — goal */}
              <rect x="126" y={PITCH_H - 16} width="68" height="10" fill="none" stroke="white" strokeWidth="2" />
              {/* BOTTOM — penalty spot */}
              <circle cx={PITCH_W / 2} cy={PITCH_H - 58} r="2" fill="white" />
              {/* BOTTOM — penalty arc */}
              <path d={`M 108 ${PITCH_H - 80} A 40 40 0 0 0 212 ${PITCH_H - 80}`} fill="none" stroke="white" strokeWidth="2" />

              {/* Drawn arrows */}
              {lines.map((l, i) => (
                <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
                  stroke="#facc15" strokeWidth="2.5" markerEnd="url(#arrow)" />
              ))}
              {current && (
                <line x1={current.x1} y1={current.y1} x2={current.x2} y2={current.y2}
                  stroke="#facc15" strokeWidth="2.5" strokeDasharray="6 3" markerEnd="url(#arrow)" />
              )}
            </svg>

            {/* Players */}
            {formation.map((pos) => (
              <Draggable
                key={pos.id}
                position={{ x: pos.x - 16, y: pos.y - 16 }}
                bounds="parent"
                onStop={(e, data) => handleDrag(pos.id, data)}
              >
                <div
                  onClick={() => setSelectedPos(pos.id)}
                  style={{
                    position: "absolute", textAlign: "center", cursor: "pointer", width: "50px",
                    transform: selectedPos === pos.id ? "scale(1.15)" : "scale(1)",
                    transition: "transform 0.15s",
                    filter: selectedPos === pos.id ? "drop-shadow(0 0 6px #facc15)" : "none"
                  }}
                >
                  <JerseyIcon />
                  <div style={{
                    color: "white", fontWeight: "bold", fontSize: "9px",
                    marginTop: "2px", textShadow: "1px 1px 3px #000", whiteSpace: "nowrap"
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
  );
}
