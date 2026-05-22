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

// How many pixels of movement before we treat it as a drag not a tap
const DRAG_THRESHOLD = 6;

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
    if (aw / ah < 3 / 4) { w = aw * 0.96; h = w * (4 / 3); }
    else { h = ah * 0.96; w = h * (3 / 4); }
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

  // ── Pitch arrow drawing ──
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

  // ── Per-player drag tracking ──
  // We track where each touch/click started so we can tell tap from drag
  const dragStartRef = useRef({});   // { [posId]: { x, y } }
  const didDragRef = useRef({});     // { [posId]: boolean }

  const onPlayerPointerDown = (posId, e) => {
    const src = e.touches ? e.touches[0] : e;
    dragStartRef.current[posId] = { x: src.clientX, y: src.clientY };
    didDragRef.current[posId] = false;
  };

  const onDragMove = (posId, e, data) => {
    const start = dragStartRef.current[posId];
    if (!start) return;
    const dx = data.x - (players.find(p => p.id === posId)?.x ?? 0) + (dims.w * FORMATION_PCT.find(p => p.id === posId)?.xPct ?? 0);
    // Simpler: just check raw pointer movement
    const src = e.touches ? e.touches[0] : e;
    if (src) {
      const moved = Math.sqrt(
        Math.pow(src.clientX - start.x, 2) +
        Math.pow(src.clientY - start.y, 2)
      );
      if (moved > DRAG_THRESHOLD) didDragRef.current[posId] = true;
    }
  };

  const onDragStop = (posId, e, data) => {
    const half = jerseySize / 2;
    const wasDrag = didDragRef.current[posId];

    if (wasDrag) {
      // It was a real drag — update position
      setPlayers((ps) =>
        ps.map((p) => (p.id === posId ? { ...p, x: data.x + half, y: data.y + half } : p))
      );
    } else {
      // It was a tap — open the sheet
      setSelectedPos(posId);
      setSheetOpen(true);
    }

    dragStartRef.current[posId] = null;
    didDragRef.current[posId] = false;
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
  const jerseySize = Math.max(52, Math.min(72, w * 0.17));
  const fontSize = Math.max(11, Math.min(16, w * 0.045));
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
        padding: "12px 16px", background: "#1e293b",
        borderBottom: "2px solid #0f172a", flexShrink: 0,
      }}>
        <div style={{ color: "white", fontWeight: "bold", fontSize: "18px" }}>
          ⚽ 7-a-side Tactics
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={() => setLines((l) => l.slice(0, -1))} style={{
            padding: "8px 16px", background: "#334155", color: "white",
            borderRadius: "10px", border: "none", cursor: "pointer",
            fontSize: "15px", fontWeight: "600"
          }}>↩ Undo</button>
          <button onClick={() => setLines([])} style={{
            padding: "8px 16px", background: "#b91c1c", color: "white",
            borderRadius: "10px", border: "none", cursor: "pointer",
            fontSize: "15px", fontWeight: "600"
          }}>🗑 Clear</button>
        </div>
      </div>

      {/* Hint */}
      <div style={{
        background: "#0f172a", color: "#64748b",
        textAlign: "center", fontSize: "13px",
        padding: "6px", flexShrink: 0,
      }}>
        Tap a jersey to assign · Drag to move · Draw arrows on pitch
      </div>

      {/* Pitch */}
      <div ref={wrapperRef} style={{
        flex: 1, display: "flex",
        alignItems: "center", justifyContent: "center",
        padding: "8px", overflow: "hidden",
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
              borderRadius: "12px", overflow: "hidden",
              boxShadow: "0 8px 40px rgba(0,0,0,0.7)",
              cursor: "crosshair", touchAction: "none", flexShrink: 0,
            }}
          >
            {/* Grass */}
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
              {/* TOP */}
              <rect x={w*0.22} y={h*0.02} width={w*0.56} height={h*0.16}
                fill="none" stroke="white" strokeWidth="2" />
              <rect x={w*0.34} y={h*0.02} width={w*0.32} height={h*0.07}
                fill="none" stroke="white" strokeWidth="2" />
              <rect x={w*0.40} y={h*0.005} width={w*0.20} height={h*0.02}
                fill="none" stroke="white" strokeWidth="2" />
              <circle cx={w*0.5} cy={h*0.13} r="3" fill="white" />
              <path d={`M ${w*0.28} ${h*0.18} A ${w*0.20} ${h*0.09} 0 0 0 ${w*0.72} ${h*0.18}`}
                fill="none" stroke="white" strokeWidth="2" />
              {/* BOTTOM */}
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
                  stroke="#facc15" strokeWidth="3.5" strokeLinecap="round"
                  markerEnd="url(#arr)" />
              ))}
              {drawing && (
                <line x1={drawing.x1} y1={drawing.y1} x2={drawing.x2} y2={drawing.y2}
                  stroke="#facc15" strokeWidth="3.5" strokeDasharray="10 5"
                  strokeLinecap="round" markerEnd="url(#arr)" />
              )}
            </svg>

            {/* Players */}
            {players.map((pos) => (
              <Draggable
                key={pos.id}
                position={{ x: pos.x - tokenHalf, y: pos.y - tokenHalf }}
                bounds="parent"
                onStart={(e) => onPlayerPointerDown(pos.id, e)}
                onDrag={(e, data) => onDragMove(pos.id, e, data)}
                onStop={(e, data) => onDragStop(pos.id, e, data)}
              >
                <div
                  className="player-token"
                  style={{
                    position: "absolute",
                    width: `${jerseySize + 24}px`,
                    textAlign: "center",
                    cursor: "grab",
                    zIndex: 10,
                    transform: selectedPos === pos.id ? "scale(1.2)" : "scale(1)",
                    transition: "transform 0.15s",
                    filter: selectedPos === pos.id
                      ? "drop-shadow(0 0 10px #facc15)"
                      : "drop-shadow(0 2px 5px rgba(0,0,0,0.8))",
                  }}
                >
                  <JerseyIcon size={jerseySize} color={assigned[pos.id] ? "#facc15" : "white"} />
                  <div style={{
                    color: "white", fontWeight: "800",
                    fontSize: `${fontSize}px`, marginTop: "3px",
                    textShadow: "0 1px 6px #000, 0 0 10px #000",
                    whiteSpace: "nowrap", overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: `${jerseySize + 24}px`,
                    lineHeight: 1.2,
                  }}>
                    {assigned[pos.id] || pos.label}
                  </div>
                </div>
              </Draggable>
            ))}
          </div>
        )}
      </div>

      {/* Backdrop */}
      {sheetOpen && (
        <div
          onClick={() => { setSheetOpen(false); setSelectedPos(null); }}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.6)", zIndex: 40,
          }}
        />
      )}

      {/* Bottom sheet */}
      <div style={{
        position: "fixed", left: 0, right: 0, bottom: 0,
        zIndex: 50, background: "#1e293b",
        borderRadius: "24px 24px 0 0",
        padding: "0 16px 40px",
        boxShadow: "0 -8px 40px rgba(0,0,0,0.7)",
        transform: sheetOpen ? "translateY(0)" : "translateY(100%)",
        transition: "transform 0.32s cubic-bezier(0.32, 0.72, 0, 1)",
        maxHeight: "72vh", display: "flex", flexDirection: "column",
      }}>

        <div style={{ display: "flex", justifyContent: "center", padding: "14px 0 10px" }}>
          <div style={{ width: "44px", height: "5px", borderRadius: "3px", background: "#475569" }} />
        </div>

        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "center", marginBottom: "16px", paddingBottom: "14px",
          borderBottom: "1px solid #334155",
        }}>
          <div>
            <div style={{ color: "#94a3b8", fontSize: "13px", textTransform: "uppercase", letterSpacing: "1.5px" }}>
              Select Player for
            </div>
            <div style={{ color: "#facc15", fontWeight: "800", fontSize: "20px", marginTop: "3px" }}>
              {selectedPos && players.find(p => p.id === selectedPos)?.label}
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {selectedPos && assigned[selectedPos] && (
              <button onClick={clearAssignment} style={{
                padding: "10px 16px", background: "#7f1d1d", color: "#fca5a5",
                borderRadius: "10px", border: "none", cursor: "pointer",
                fontSize: "14px", fontWeight: "600"
              }}>Remove</button>
            )}
            <button
              onClick={() => { setSheetOpen(false); setSelectedPos(null); }}
              style={{
                width: "38px", height: "38px", borderRadius: "50%",
                background: "#334155", border: "none", color: "white",
                fontSize: "20px", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >×</button>
          </div>
        </div>

        <div style={{
          overflowY: "auto",
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "10px",
        }}>
          {squad.map((player) => {
            const isAssigned = Object.values(assigned).includes(player);
            const isHere = selectedPos && assigned[selectedPos] === player;
            return (
              <div
                key={player}
                onClick={() => (!isAssigned || isHere) && assignPlayer(player)}
                style={{
                  background: isHere ? "#facc15" : isAssigned ? "#1a2234" : "#2d3f55",
                  border: isHere ? "3px solid #f59e0b" : isAssigned ? "2px solid #253044" : "2px solid #3d5470",
                  borderRadius: "14px", padding: "14px 10px",
                  textAlign: "center",
                  cursor: isAssigned && !isHere ? "not-allowed" : "pointer",
                  opacity: isAssigned && !isHere ? 0.45 : 1,
                  display: "flex", flexDirection: "column",
                  alignItems: "center", gap: "6px",
                }}
              >
                <JerseyIcon size={42} color={isHere ? "#000" : isAssigned ? "#444" : "white"} />
                <div style={{
                  color: isHere ? "#000" : isAssigned ? "#556" : "white",
                  fontSize: "16px", fontWeight: "700",
                }}>{player}</div>
                {isHere && (
                  <div style={{
                    background: "#000", color: "#facc15",
                    fontSize: "11px", fontWeight: "700",
                    padding: "3px 10px", borderRadius: "20px",
                  }}>✓ ASSIGNED</div>
                )}
                {isAssigned && !isHere && (
                  <div style={{ color: "#475569", fontSize: "12px" }}>In use</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}