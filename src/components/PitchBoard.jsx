import { useState, useRef, useEffect, useCallback } from "react";
import Draggable from "react-draggable";

const squad = [
  "John","Lucas","Alex","Ronan","Ruairi","Jules","Robbie",
  "Fionn","Josh","Sam","Mason","Marcel","Alan","Darragh","Sonny","Charlie","Cian"
];

const JerseyIcon = ({ size = 44, color = "white" }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <path d="M16 8 L24 4 L40 4 L48 8 L56 20 L48 28 L48 56 L16 56 L16 28 L8 20 Z"
      fill={color} stroke="#000" strokeWidth="3" />
    <rect x="22" y="4" width="6" height="52" fill="#000" />
    <rect x="36" y="4" width="6" height="52" fill="#000" />
  </svg>
);

const FORMATION_PCT = [
  { id: "GK",   label: "Goalkeeper",  xPct: 0.50, yPct: 0.85 },
  { id: "DEF1", label: "Defender 1",  xPct: 0.28, yPct: 0.68 },
  { id: "DEF2", label: "Defender 2",  xPct: 0.72, yPct: 0.68 },
  { id: "CM",   label: "Central Mid", xPct: 0.50, yPct: 0.50 },
  { id: "WM1",  label: "Wide Mid 1",  xPct: 0.15, yPct: 0.34 },
  { id: "WM2",  label: "Wide Mid 2",  xPct: 0.85, yPct: 0.34 },
  { id: "STR",  label: "Striker",     xPct: 0.50, yPct: 0.17 },
];

export default function PitchBoard() {
  const wrapperRef = useRef(null);
  const pitchRef = useRef(null);
  const [dims, setDims] = useState({ w: 0, h: 0 });
  const [assigned, setAssigned] = useState({});
  const [selectedPos, setSelectedPos] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [lines, setLines] = useState([]);
  const [drawing, setDrawing] = useState(null);
  const [players, setPlayers] = useState([]);
  const [ready, setReady] = useState(false);

  const measure = useCallback(() => {
    if (!wrapperRef.current) return;
    const aw = wrapperRef.current.clientWidth;
    const ah = wrapperRef.current.clientHeight;
    let w, h;
    if (aw / ah < 3 / 4) { w = aw; h = aw * (4 / 3); }
    else { h = ah; w = ah * (3 / 4); }
    setDims({ w, h });
    setPlayers(FORMATION_PCT.map((p) => ({
      ...p, x: p.xPct * w, y: p.yPct * h,
    })));
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
      x: Math.max(0, Math.min(dims.w, src.clientX - rect.left)),
      y: Math.max(0, Math.min(dims.h, src.clientY - rect.top)),
    };
  };

  const onDrawStart = (e) => {
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
  const onDrawEnd = () => {
    if (!drawing) return;
    const dx = drawing.x2 - drawing.x1;
    const dy = drawing.y2 - drawing.y1;
    if (Math.sqrt(dx * dx + dy * dy) > 15) setLines((l) => [...l, drawing]);
    setDrawing(null);
  };

  const handleDrag = (id, data) => {
    const half = jerseySize / 2;
    setPlayers((ps) =>
      ps.map((p) => (p.id === id ? { ...p, x: data.x + half, y: data.y + half } : p))
    );
  };

  const openSheet = (posId) => {
    setSelectedPos(posId);
    setSheetOpen(true);
  };

  const assignPlayer = (player) => {
    if (!selectedPos) return;
    setAssigned((a) => ({ ...a, [selectedPos]: player }));
    setSelectedPos(null);
    setSheetOpen(false);
  };

  const clearAssignment = () => {
    if (!selectedPos) return;
    setAssigned((a) => { const n = { ...a }; delete n[selectedPos]; return n; });
    setSelectedPos(null);
    setSheetOpen(false);
  };

  const { w, h } = dims;
  const jerseySize = Math.max(36, Math.min(56, w * 0.14));
  const fontSize = Math.max(9, Math.min(14, w * 0.038));
  const tokenHalf = jerseySize / 2;

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      width: "100vw", height: "100vh",
      background: "#0f172a",
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      overflow: "hidden", userSelect: "none",
    }}>

      {/* Top bar */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "8px 12px", background: "#1e293b",
        borderBottom: "2px solid #0f172a", flexShrink: 0, gap: "8px",
      }}>
        <div style={{ color: "white", fontWeight: "bold", fontSize: "15px" }}>
          ⚽ 7-Player Formation
        </div>
        <div style={{ display: "flex", gap: "6px" }}>
          <button onClick={() => setLines((l) => l.slice(0, -1))} style={{
            padding: "6px 12px", background: "#334155", color: "white",
            borderRadius: "7px", border: "none", cursor: "pointer", fontSize: "13px"
          }}>↩ Undo</button>
          <button onClick={() => setLines([])} style={{
            padding: "6px 12px", background: "#b91c1c", color: "white",
            borderRadius: "7px", border: "none", cursor: "pointer", fontSize: "13px"
          }}>🗑 Clear</button>
        </div>
      </div>

      {/* Pitch area */}
      <div ref={wrapperRef} style={{
        flex: 1, display: "flex",
        alignItems: "center", justifyContent: "center",
        padding: "10px", overflow: "hidden",
      }}>
        {ready && w > 0 && (
          <div
            ref={pitchRef}
            onMouseDown={onDrawStart}
            onMouseMove={onDrawMove}
            onMouseUp={onDrawEnd}
            onMouseLeave={onDrawEnd}
            onTouchStart={onDrawStart}
            onTouchMove={onDrawMove}
            onTouchEnd={onDrawEnd}
            style={{
              position: "relative",
              width: `${w}px`, height: `${h}px`,
              borderRadius: "10px", overflow: "hidden",
              boxShadow: "0 8px 40px rgba(0,0,0,0.7)",
              cursor: "crosshair", touchAction: "none", flexShrink: 0,
            }}
          >
            {/* Grass stripes */}
            {[...Array(14)].map((_, i) => (
              <div key={i} style={{
                position: "absolute", top: `${i * (100 / 14)}%`,
                width: "100%", height: `${100 / 14}%`,
                background: i % 2 === 0 ? "#3a8a3a" : "#2d7a2d",
              }} />
            ))}

            {/* SVG markings */}
            <svg style={{ position: "absolute", inset: 0 }}
              width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
              <defs>
                <marker id="arr" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                  <polygon points="0 0, 8 4, 0 8" fill="#facc15" />
                </marker>
              </defs>

              <rect x={w*0.04} y={h*0.02} width={w*0.92} height={h*0.96}
                fill="none" stroke="white" strokeWidth="2.5" />
              <line x1={w*0.04} y1={h*0.5} x2={w*0.96} y2={h*0.5}
                stroke="white" strokeWidth="2" />
              <circle cx={w*0.5} cy={h*0.5} r={w*0.14}
                fill="none" stroke="white" strokeWidth="2" />
              <circle cx={w*0.5} cy={h*0.5} r="3" fill="white" />

              {/* TOP goal */}
              <rect x={w*0.22} y={h*0.02} width={w*0.56} height={h*0.16}
                fill="none" stroke="white" strokeWidth="2" />
              <rect x={w*0.34} y={h*0.02} width={w*0.32} height={h*0.07}
                fill="none" stroke="white" strokeWidth="2" />
              <rect x={w*0.40} y={h*0.005} width={w*0.20} height={h*0.02}
                fill="none" stroke="white" strokeWidth="2" />
              <circle cx={w*0.5} cy={h*0.13} r="3" fill="white" />
              <path d={`M ${w*0.28} ${h*0.18} A ${w*0.20} ${h*0.09} 0 0 0 ${w*0.72} ${h*0.18}`}
                fill="none" stroke="white" strokeWidth="2" />

              {/* BOTTOM goal */}
              <rect x={w*0.22} y={h*0.82} width={w*0.56} height={h*0.16}
                fill="none" stroke="white" strokeWidth="2" />
              <rect x={w*0.34} y={h*0.91} width={w*0.32} height={h*0.07}
                fill="none" stroke="white" strokeWidth="2" />
              <rect x={w*0.40} y={h*0.975} width={w*0.20} height={h*0.02}
                fill="none" stroke="white" strokeWidth="2" />
              <circle cx={w*0.5} cy={h*0.87} r="3" fill="white" />
              <path d={`M ${w*0.28} ${h*0.82} A ${w*0.20} ${h*0.09} 0 0 1 ${w*0.72} ${h*0.82}`}
                fill="none" stroke="white" strokeWidth="2" />

              {lines.map((l, i) => (
                <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
                  stroke="#facc15" strokeWidth="3" strokeLinecap="round" markerEnd="url(#arr)" />
              ))}
              {drawing && (
                <line x1={drawing.x1} y1={drawing.y1} x2={drawing.x2} y2={drawing.y2}
                  stroke="#facc15" strokeWidth="3" strokeDasharray="10 5"
                  strokeLinecap="round" markerEnd="url(#arr)" />
              )}
            </svg>

            {/* Players */}
            {players.map((pos) => (
              <Draggable
                key={pos.id}
                position={{ x: pos.x - tokenHalf, y: pos.y - tokenHalf }}
                bounds="parent"
                onStop={(e, data) => handleDrag(pos.id, data)}
              >
                <div
                  className="player-token"
                  onClick={() => openSheet(pos.id)}
                  style={{
                    position: "absolute",
                    width: `${jerseySize + 20}px`,
                    textAlign: "center",
                    cursor: "grab",
                    zIndex: 10,
                    transform: selectedPos === pos.id ? "scale(1.2)" : "scale(1)",
                    transition: "transform 0.15s",
                    filter: selectedPos === pos.id
                      ? "drop-shadow(0 0 8px #facc15)"
                      : "drop-shadow(0 2px 4px rgba(0,0,0,0.7))",
                  }}
                >
                  <JerseyIcon size={jerseySize} color={assigned[pos.id] ? "#facc15" : "white"} />
                  <div style={{
                    color: "white", fontWeight: "bold",
                    fontSize: `${fontSize}px`, marginTop: "2px",
                    textShadow: "1px 1px 4px #000",
                    whiteSpace: "nowrap", overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: `${jerseySize + 20}px`,
                  }}>
                    {assigned[pos.id] || pos.label}
                  </div>
                </div>
              </Draggable>
            ))}
          </div>
        )}
      </div>

      {/* ── Bottom Sheet Backdrop ── */}
      {sheetOpen && (
        <div
          onClick={() => { setSheetOpen(false); setSelectedPos(null); }}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 40,
          }}
        />
      )}

      {/* ── Bottom Sheet ── */}
      <div style={{
        position: "fixed",
        left: 0, right: 0, bottom: 0,
        zIndex: 50,
        background: "#1e293b",
        borderRadius: "20px 20px 0 0",
        padding: "0 16px 32px",
        boxShadow: "0 -8px 40px rgba(0,0,0,0.6)",
        transform: sheetOpen ? "translateY(0)" : "translateY(100%)",
        transition: "transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)",
        maxHeight: "60vh",
        display: "flex",
        flexDirection: "column",
      }}>
        {/* Handle bar */}
        <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 8px" }}>
          <div style={{ width: "40px", height: "4px", borderRadius: "2px", background: "#475569" }} />
        </div>

        {/* Sheet header */}
        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "center", marginBottom: "14px"
        }}>
          <div>
            <div style={{ color: "#94a3b8", fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px" }}>
              Select Player
            </div>
            <div style={{ color: "#facc15", fontWeight: "bold", fontSize: "15px", marginTop: "2px" }}>
              {selectedPos && players.find(p => p.id === selectedPos)?.label}
            </div>
          </div>
          {/* Clear assignment button */}
          {selectedPos && assigned[selectedPos] && (
            <button onClick={clearAssignment} style={{
              padding: "6px 12px", background: "#7f1d1d", color: "#fca5a5",
              borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "12px"
            }}>
              Remove Player
            </button>
          )}
        </div>

        {/* Player grid */}
        <div style={{
          overflowY: "auto",
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "8px",
        }}>
          {squad.map((player) => {
            const isAssigned = Object.values(assigned).includes(player);
            const isCurrentlyHere = selectedPos && assigned[selectedPos] === player;
            return (
              <div
                key={player}
                onClick={() => !isAssigned || isCurrentlyHere ? assignPlayer(player) : null}
                style={{
                  background: isCurrentlyHere ? "#facc15" : isAssigned ? "#1e293b" : "#334155",
                  border: isCurrentlyHere ? "2px solid #f59e0b" : isAssigned ? "2px solid #334155" : "2px solid #475569",
                  borderRadius: "10px",
                  padding: "10px 6px",
                  textAlign: "center",
                  cursor: isAssigned && !isCurrentlyHere ? "not-allowed" : "pointer",
                  opacity: isAssigned && !isCurrentlyHere ? 0.4 : 1,
                  transition: "all 0.15s",
                }}
                onMouseEnter={e => {
                  if (!isAssigned || isCurrentlyHere) e.currentTarget.style.background = isCurrentlyHere ? "#fde68a" : "#475569";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = isCurrentlyHere ? "#facc15" : isAssigned ? "#1e293b" : "#334155";
                }}
              >
                <JerseyIcon size={32} color={isCurrentlyHere ? "#000" : isAssigned ? "#555" : "white"} />
                <div style={{
                  color: isCurrentlyHere ? "#000" : isAssigned ? "#555" : "white",
                  fontSize: "12px", fontWeight: "bold", marginTop: "4px"
                }}>
                  {player}
                </div>
                {isCurrentlyHere && (
                  <div style={{ fontSize: "10px", color: "#000", marginTop: "2px" }}>✓ Selected</div>
                )}
                {isAssigned && !isCurrentlyHere && (
                  <div style={{ fontSize: "10px", color: "#555", marginTop: "2px" }}>In use</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
