import { useState, useRef, useEffect, useCallback } from "react";
import Draggable from "react-draggable";

const squad = [
  "John", "Lucas", "Alex", "Ronan", "Ruairi", "Jules", "Robbie",
  "Fionn", "Josh", "Sam", "Mason", "Marcel", "Alan", "Darragh",
  "Sonny", "Charlie", "Cian"
];

const JerseyIcon = ({ size = 52, color = "white" }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 8 L24 4 L40 4 L48 8 L56 20 L48 28 L48 56 L16 56 L16 28 L8 20 Z" fill={color} stroke="#111" strokeWidth="4"/>
    <rect x="22" y="4" width="6" height="52" fill="#111"/>
    <rect x="36" y="4" width="6" height="52" fill="#111"/>
  </svg>
);

const FORMATION = [
  { id: "GK", label: "Goalkeeper", xPct: 0.50, yPct: 0.88 },   // Bottom
  { id: "DEF1", label: "Defender 1", xPct: 0.27, yPct: 0.68 },
  { id: "DEF2", label: "Defender 2", xPct: 0.73, yPct: 0.68 },
  { id: "CM", label: "Central Mid", xPct: 0.50, yPct: 0.48 },
  { id: "WM1", label: "Wide Mid 1", xPct: 0.14, yPct: 0.36 },
  { id: "WM2", label: "Wide Mid 2", xPct: 0.86, yPct: 0.36 },
  { id: "STR", label: "Striker", xPct: 0.50, yPct: 0.16 },     // Top
];

const DRAG_THRESHOLD = 8;

export default function TacticalBoard() {
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

    if (aw / ah < 0.72) {
      w = Math.min(aw * 0.96, 620);
      h = w * 1.42;
    } else {
      h = ah * 0.94;
      w = h * 0.71;
    }

    setDims({ w, h });

    setPlayers(
      FORMATION.map((p) => ({
        ...p,
        x: p.xPct * w,
        y: p.yPct * h,
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
    if (Math.sqrt(dx * dx + dy * dy) > 18) {
      setLines((l) => [...l, drawing]);
    }
    setDrawing(null);
  };

  const dragStartRef = useRef({});
  const didDragRef = useRef({});

  const onPlayerPointerDown = (posId, e) => {
    const src = e.touches ? e.touches[0] : e;
    dragStartRef.current[posId] = { x: src.clientX, y: src.clientY };
    didDragRef.current[posId] = false;
  };

  const onDragMove = (posId, e) => {
    const start = dragStartRef.current[posId];
    if (!start) return;
    const src = e.touches ? e.touches[0] : e;
    if (src) {
      const moved = Math.hypot(src.clientX - start.x, src.clientY - start.y);
      if (moved > DRAG_THRESHOLD) didDragRef.current[posId] = true;
    }
  };

  const onDragStop = (posId, e, data) => {
    const wasDrag = didDragRef.current[posId];
    const jerseyHalf = jerseySize / 2;

    if (wasDrag) {
      setPlayers((ps) =>
        ps.map((p) =>
          p.id === posId ? { ...p, x: data.x + jerseyHalf, y: data.y + jerseyHalf } : p
        )
      );
    } else {
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

  const resetFormation = () => {
    setAssigned({});
    setLines([]);
    measure();
  };

  const { w, h } = dims;
  const jerseySize = Math.max(64, Math.min(94, w * 0.162));
  const fontSize = Math.max(13, Math.min(16.5, w * 0.042));
  const tokenWidth = jerseySize + 26;

  return (
    <div style={{
      width: "100vw", height: "100dvh", background: "#020617",
      overflow: "hidden", position: "fixed", inset: 0,
      display: "flex", justifyContent: "center", alignItems: "center",
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      <div style={{
        width: "100%", height: "100%", maxWidth: "640px", minWidth: "340px",
        background: "#0f172a", display: "flex", flexDirection: "column",
        overflow: "hidden", position: "relative", boxShadow: "0 0 40px rgba(0,0,0,0.7)",
      }}>
        {/* HEADER */}
        <div style={{
          height: "88px", padding: "16px 20px 12px", background: "#1e2937",
          borderBottom: "1px solid #334155", display: "flex",
          alignItems: "center", justifyContent: "space-between", zIndex: 30,
        }}>
          <div>
            <div style={{ color: "#f1f5f9", fontSize: "27px", fontWeight: "900", letterSpacing: "-0.5px" }}>
              Tactical Board
            </div>
            <div style={{ color: "#94a3b8", fontSize: "14px" }}>7-a-side • Academy Planner</div>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={() => setLines(l => l.slice(0, -1))} style={{
              width: "48px", height: "48px", borderRadius: "14px", background: "#334155",
              color: "white", fontSize: "22px", border: "none"
            }}>↩</button>
            <button onClick={resetFormation} style={{
              width: "48px", height: "48px", borderRadius: "14px", background: "#7f1d1d",
              color: "white", fontSize: "20px", border: "none"
            }}>⟳</button>
          </div>
        </div>

        {/* PITCH */}
        <div ref={wrapperRef} style={{
          flex: 1, display: "flex", justifyContent: "center", alignItems: "center",
          padding: "12px", background: "#020617", position: "relative",
        }}>
          {ready && w > 0 && (
            <div 
              ref={pitchRef}
              style={{
                width: `${w}px`, height: `${h}px`, borderRadius: "20px",
                overflow: "hidden", boxShadow: "0 25px 70px rgba(0,0,0,0.65)",
                position: "relative", border: "3px solid #e2e8f0",
                touchAction: "none",
              }}
              onMouseDown={onDrawStart}
              onMouseMove={onDrawMove}
              onMouseUp={onDrawEnd}
              onMouseLeave={onDrawEnd}
              onTouchStart={onDrawStart}
              onTouchMove={onDrawMove}
              onTouchEnd={onDrawEnd}
            >
              {/* Grass */}
              {[...Array(16)].map((_, i) => (
                <div key={i} style={{
                  position: "absolute", top: `${i * (100 / 16)}%`, left: 0, right: 0,
                  height: `${100 / 16}%`,
                  background: i % 2 === 0 ? "#16a34a" : "#15803d",
                }} />
              ))}

              <svg style={{ position: "absolute", inset: 0 }} width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
                <defs>
                  <marker id="arrow" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto">
                    <polygon points="0 0, 9 4.5, 0 9" fill="#fde047" />
                  </marker>
                </defs>

                <rect x={w*0.035} y={h*0.025} width={w*0.93} height={h*0.95}
                  fill="none" stroke="#f8fafc" strokeWidth="4" />

                <line x1={w*0.035} y1={h*0.5} x2={w*0.965} y2={h*0.5}
                  stroke="#f8fafc" strokeWidth="4" />

                <circle cx={w*0.5} cy={h*0.5} r={w*0.135} fill="none" stroke="#f8fafc" strokeWidth="4" />

                {/* Penalty Areas */}
                <rect x={w*0.035} y={h*0.26} width={w*0.28} height={h*0.48}
                  fill="none" stroke="#f8fafc" strokeWidth="3.5" />
                <rect x={w*0.685} y={h*0.26} width={w*0.28} height={h*0.48}
                  fill="none" stroke="#f8fafc" strokeWidth="3.5" />

                {/* Goal Areas */}
                <rect x={w*0.035} y={h*0.37} width={w*0.16} height={h*0.26}
                  fill="none" stroke="#f8fafc" strokeWidth="3.5" />
                <rect x={w*0.805} y={h*0.37} width={w*0.16} height={h*0.26}
                  fill="none" stroke="#f8fafc" strokeWidth="3.5" />

                {/* Goals */}
                <line x1={w*0.035} y1={h*0.41} x2={w*0.035} y2={h*0.59}
                  stroke="#f8fafc" strokeWidth="9" strokeLinecap="round" />
                <line x1={w*0.965} y1={h*0.41} x2={w*0.965} y2={h*0.59}
                  stroke="#f8fafc" strokeWidth="9" strokeLinecap="round" />

                {lines.map((l, i) => (
                  <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
                    stroke="#fde047" strokeWidth="5.5" strokeLinecap="round" markerEnd="url(#arrow)" />
                ))}

                {drawing && (
                  <line x1={drawing.x1} y1={drawing.y1} x2={drawing.x2} y2={drawing.y2}
                    stroke="#fde047" strokeWidth="5.5" strokeLinecap="round"
                    strokeDasharray="8 5" markerEnd="url(#arrow)" />
                )}
              </svg>

              {players.map((pos) => (
                <Draggable
                  key={pos.id}
                  position={{ x: pos.x - jerseySize / 2, y: pos.y - jerseySize / 2 }}
                  bounds="parent"
                  onStart={(e) => onPlayerPointerDown(pos.id, e)}
                  onDrag={(e) => onDragMove(pos.id, e)}
                  onStop={(e, data) => onDragStop(pos.id, e, data)}
                >
                  <div className="player-token" style={{
                    position: "absolute", width: `${tokenWidth}px`, textAlign: "center",
                    cursor: "grab", zIndex: 20,
                    transform: selectedPos === pos.id ? "scale(1.15)" : "scale(1)",
                    transition: "transform 0.2s ease, filter 0.2s ease",
                    filter: selectedPos === pos.id ? "drop-shadow(0 0 18px #fde047)" : "drop-shadow(0 10px 20px rgba(0,0,0,0.5))",
                  }}>
                    <JerseyIcon size={jerseySize} color={assigned[pos.id] ? "#fde047" : "#f8fafc"} />
                    <div style={{
                      color: "#f8fafc", fontWeight: "800", fontSize: `${fontSize}px`,
                      marginTop: "6px", textShadow: "0 2px 8px rgba(0,0,0,0.85)",
                      whiteSpace: "nowrap", lineHeight: 1.05,
                    }}>
                      {assigned[pos.id] || pos.label}
                    </div>
                  </div>
                </Draggable>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Sheet (unchanged) */}
        {sheetOpen && <div onClick={() => { setSheetOpen(false); setSelectedPos(null); }}
          style={{ position: "absolute", inset: 0, background: "rgba(2,6,23,0.75)", zIndex: 40 }} />}

        <div style={{
          position: "absolute", left: 0, right: 0, bottom: 0, zIndex: 50,
          background: "#1e2937", borderRadius: "28px 28px 0 0",
          transform: sheetOpen ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)",
          maxHeight: "68vh", overflow: "hidden", boxShadow: "0 -20px 50px rgba(0,0,0,0.7)",
        }}>
          <div style={{ padding: "14px 0", display: "flex", justifyContent: "center" }}>
            <div style={{ width: "50px", height: "5px", background: "#475569", borderRadius: "999px" }} />
          </div>

          <div style={{ padding: "0 20px 20px" }}>
            <div style={{ color: "#f1f5f9", fontSize: "23px", fontWeight: "800", marginBottom: "16px" }}>
              Select Player
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px", maxHeight: "55vh", overflowY: "auto" }}>
              {squad.map((player) => {
                const isAssigned = Object.values(assigned).includes(player);
                const isHere = selectedPos && assigned[selectedPos] === player;

                return (
                  <div
                    key={player}
                    onClick={() => (!isAssigned || isHere) && assignPlayer(player)}
                    style={{
                      background: isHere ? "#fde047" : isAssigned ? "#334155" : "#475569",
                      borderRadius: "16px", padding: "18px 12px", textAlign: "center",
                      opacity: isAssigned && !isHere ? 0.5 : 1,
                    }}
                  >
                    <JerseyIcon size={52} color={isHere ? "#0f172a" : "#f8fafc"} />
                    <div style={{
                      marginTop: "10px", fontWeight: "700", fontSize: "16.5px",
                      color: isHere ? "#0f172a" : "#f8fafc"
                    }}>
                      {player}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
