import { useState, useRef, useEffect, useCallback } from "react";
import Draggable from "react-draggable";

const squad = [
  "John", "Lucas", "Alex", "Ronan", "Ruairi", "Jules", "Robbie",
  "Fionn", "Josh", "Sam", "Mason", "Marcel", "Alan", "Darragh",
  "Sonny", "Charlie", "Cian"
];

const JerseyIcon = ({ size = 52, color = "white" }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 8 L24 4 L40 4 L48 8 L56 20 L48 28 L48 56 L16 56 L16 28 L8 20 Z" fill={color} stroke="#111" strokeWidth="4" />
    <rect x="22" y="4" width="6" height="52" fill="#111" />
    <rect x="36" y="4" width="6" height="52" fill="#111" />
  </svg>
);

const FORMATION = [
  { id: "GK", label: "Goalkeeper", xPct: 0.50, yPct: 0.92 },
  { id: "DEF1", label: "Defender 1", xPct: 0.27, yPct: 0.70 },
  { id: "DEF2", label: "Defender 2", xPct: 0.73, yPct: 0.70 },
  { id: "CM", label: "Central Mid", xPct: 0.50, yPct: 0.50 },
  { id: "WM1", label: "Wide Mid 1", xPct: 0.14, yPct: 0.35 },
  { id: "WM2", label: "Wide Mid 2", xPct: 0.86, yPct: 0.35 },
  { id: "STR", label: "Striker", xPct: 0.50, yPct: 0.12 },
];

export default function TacticalBoard() {
  const pitchRef = useRef(null);
  const wrapperRef = useRef(null);

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
    const container = wrapperRef.current;
    const aw = container.clientWidth;
    const ah = container.clientHeight;

    const w = aw * 0.98;
    const h = w * 1.6;

    setDims({ w, h });
    setPlayers(FORMATION.map(p => ({ ...p, x: p.xPct * w, y: p.yPct * h })));
    setReady(true);
  }, []);

  useEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (wrapperRef.current) ro.observe(wrapperRef.current);
    return () => ro.disconnect();
  }, [measure]);

  const getCoords = (e) => {
    if (!pitchRef.current) return { x: 0, y: 0 };
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
    setDrawing(d => ({ ...d, x2: x, y2: y }));
  };

  const onDrawEnd = () => {
    if (!drawing) return;
    const dx = drawing.x2 - drawing.x1;
    const dy = drawing.y2 - drawing.y1;
    if (Math.sqrt(dx * dx + dy * dy) > 20) setLines(l => [...l, drawing]);
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
      if (moved > 8) didDragRef.current[posId] = true;
    }
  };

  const onDragStop = (posId, _, data) => {
    const wasDrag = didDragRef.current[posId];
    const jerseyHalf = jerseySize / 2;
    if (wasDrag) {
      setPlayers(ps => ps.map(p => p.id === posId ? { ...p, x: data.x + jerseyHalf, y: data.y + jerseyHalf } : p));
    } else {
      setSelectedPos(posId);
      setSheetOpen(true);
    }
    dragStartRef.current[posId] = null;
    didDragRef.current[posId] = false;
  };

  const assignPlayer = (player) => {
    if (!selectedPos) return;
    setAssigned(a => ({ ...a, [selectedPos]: player }));
    setSelectedPos(null);
    setSheetOpen(false);
  };

  const resetFormation = () => {
    setAssigned({});
    setLines([]);
    measure();
  };

  const { w, h } = dims;
  const jerseySize = Math.max(52, Math.min(90, w * 0.16));
  const fontSize = Math.max(12, Math.min(16, w * 0.042));
  const tokenWidth = jerseySize + 28;

  return (
    <div style={{ width: "100vw", height: "100dvh", background: "#020617", position: "fixed", inset: 0, display: "flex", flexDirection: "column" }}>
      
      <div style={{ height: "76px", padding: "12px 16px", background: "#1e2937", borderBottom: "1px solid #334155", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, zIndex: 100 }}>
        <div>
          <div style={{ color: "#f1f5f9", fontSize: "24px", fontWeight: "900", letterSpacing: "-0.5px" }}>Tactical Board</div>
          <div style={{ color: "#94a3b8", fontSize: "13px", marginTop: "2px" }}>7-a-side • Academy Planner</div>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button 
            onClick={() => setLines(l => l.slice(0, -1))} 
            style={{ width: "44px", height: "44px", borderRadius: "12px", background: "#334155", color: "white", fontSize: "20px", border: "none", cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center" }}
            onMouseOver={(e) => e.target.style.background = "#475569"}
            onMouseOut={(e) => e.target.style.background = "#334155"}
          >↩</button>
          <button 
            onClick={resetFormation} 
            style={{ width: "44px", height: "44px", borderRadius: "12px", background: "#991b1b", color: "white", fontSize: "18px", border: "none", cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center" }}
            onMouseOver={(e) => e.target.style.background = "#b91c1c"}
            onMouseOut={(e) => e.target.style.background = "#991b1b"}
          >⟳</button>
        </div>
      </div>

      <div ref={wrapperRef} style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", padding: "12px", background: "#0f172a", overflow: "hidden" }}>
        {ready && w > 0 && (
          <div 
            ref={pitchRef} 
            style={{ 
              width: `${w}px`, 
              height: `${h}px`, 
              borderRadius: "16px", 
              overflow: "hidden", 
              position: "relative", 
              border: "3px solid #e2e8f0", 
              boxShadow: "0 20px 60px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.1)", 
              touchAction: "none",
              background: "#1a3a1a"
            }}
            onMouseDown={onDrawStart} 
            onMouseMove={onDrawMove} 
            onMouseUp={onDrawEnd} 
            onMouseLeave={onDrawEnd}
            onTouchStart={onDrawStart} 
            onTouchMove={onDrawMove} 
            onTouchEnd={onDrawEnd}
          >
            {[...Array(20)].map((_, i) => (
              <div key={i} style={{ position: "absolute", top: `${i * (100 / 20)}%`, width: "100%", height: `${100 / 20}%`, background: i % 2 === 0 ? "#166534" : "#15803d" }} />
            ))}

            <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: "absolute", inset: 0 }}>
              <defs>
                <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
                  <path d="M0,0 L0,6 L9,3 z" fill="#fde047" />
                </marker>
              </defs>

              <rect x={w * 0.04} y={h * 0.04} width={w * 0.92} height={h * 0.92} fill="none" stroke="#f8fafc" strokeWidth="5" rx="8" />

              <line x1={w * 0.04} y1={h * 0.5} x2={w * 0.96} y2={h * 0.5} stroke="#f8fafc" strokeWidth="3" />

              <circle cx={w * 0.5} cy={h * 0.5} r={w * 0.12} fill="none" stroke="#f8fafc" strokeWidth="3" />
              <circle cx={w * 0.5} cy={h * 0.5} r="3" fill="#f8fafc" />

              <rect x={w * 0.08} y={h * 0.04} width={w * 0.84} height={h * 0.22} fill="none" stroke="#f8fafc" strokeWidth="3.5" />
              <rect x={w * 0.24} y={h * 0.08} width={w * 0.52} height={h * 0.13} fill="none" stroke="#f8fafc" strokeWidth="3.5" />
              <line x1={w * 0.04} y1={h * 0.10} x2={w * 0.04} y2={h * 0.16} stroke="#f8fafc" strokeWidth="8" strokeLinecap="round" />
              <line x1={w * 0.96} y1={h * 0.10} x2={w * 0.96} y2={h * 0.16} stroke="#f8fafc" strokeWidth="8" strokeLinecap="round" />

              <rect x={w * 0.08} y={h * 0.74} width={w * 0.84} height={h * 0.22} fill="none" stroke="#f8fafc" strokeWidth="3.5" />
              <rect x={w * 0.24} y={h * 0.79} width={w * 0.52} height={h * 0.13} fill="none" stroke="#f8fafc" strokeWidth="3.5" />
              <line x1={w * 0.04} y1={h * 0.84} x2={w * 0.04} y2={h * 0.90} stroke="#f8fafc" strokeWidth="8" strokeLinecap="round" />
              <line x1={w * 0.96} y1={h * 0.84} x2={w * 0.96} y2={h * 0.90} stroke="#f8fafc" strokeWidth="8" strokeLinecap="round" />

              {lines.map((l, i) => (
                <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke="#fde047" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" markerEnd="url(#arrow)" />
              ))}

              {drawing && (
                <line x1={drawing.x1} y1={drawing.y1} x2={drawing.x2} y2={drawing.y2} stroke="#fde047" strokeWidth="4.5" strokeLinecap="round" strokeDasharray="6 4" opacity="0.7" />
              )}
            </svg>

            {players.map((pos) => (
              <Draggable 
                key={pos.id} 
                position={{ x: pos.x - jerseySize / 2, y: pos.y - jerseySize / 2 }} 
                bounds="parent" 
                onStart={e => onPlayerPointerDown(pos.id, e)} 
                onDrag={e => onDragMove(pos.id, e)} 
                onStop={(e, data) => onDragStop(pos.id, e, data)}
              >
                <div 
                  className="player-token" 
                  style={{ 
                    position: "absolute", 
                    width: `${tokenWidth}px`, 
                    textAlign: "center", 
                    cursor: "grab", 
                    zIndex: 20,
                    userSelect: "none"
                  }}
                >
                  <JerseyIcon size={jerseySize} color={assigned[pos.id] ? "#fde047" : "#f8fafc"} />
                  <div style={{ color: "#f8fafc", fontWeight: "700", fontSize: `${fontSize}px`, marginTop: "4px", textShadow: "0 1px 3px rgba(0,0,0,0.5)", lineHeight: "1.2", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%" }}>
                    {assigned[pos.id] || pos.label.split(" ")[0]}
                  </div>
                </div>
              </Draggable>
            ))}
          </div>
        )}
      </div>

      {sheetOpen && (
        <div 
          style={{ 
            position: "fixed", 
            inset: 0, 
            background: "rgba(0,0,0,0.6)", 
            zIndex: 200,
            animation: "fadeIn 0.2s ease-out"
          }}
          onClick={() => setSheetOpen(false)}
        >
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes slideUp {
              from { transform: translateY(100%); }
              to { transform: translateY(0); }
            }
          `}</style>
        </div>
      )}

      <div 
        style={{ 
          position: "fixed", 
          bottom: 0, 
          left: 0, 
          right: 0, 
          background: "#1e2937", 
          borderTopLeftRadius: "20px", 
          borderTopRightRadius: "20px", 
          maxHeight: "75vh", 
          overflowY: "auto", 
          zIndex: 210,
          borderTop: "1px solid #334155",
          transform: sheetOpen ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)",
          animation: sheetOpen ? "slideUp 0.3s cubic-bezier(0.32, 0.72, 0, 1)" : "none"
        }}
      >
        <div style={{ padding: "12px", display: "flex", justifyContent: "center" }}>
          <div style={{ width: "40px", height: "4px", background: "#475569", borderRadius: "2px" }} />
        </div>

        <div style={{ padding: "0 16px 24px" }}>
          <div style={{ marginBottom: "16px" }}>
            <div style={{ color: "#f1f5f9", fontSize: "18px", fontWeight: "800" }}>
              Assign Player to {selectedPos && FORMATION.find(f => f.id === selectedPos)?.label}
            </div>
            <div style={{ color: "#94a3b8", fontSize: "13px", marginTop: "4px" }}>
              Select a player from your squad
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: "10px" }}>
            {squad.map((player, idx) => {
              const isAssigned = Object.values(assigned).includes(player);
              return (
                <button
                  key={idx}
                  onClick={() => {
                    if (!isAssigned) assignPlayer(player);
                  }}
                  style={{
                    padding: "12px 8px",
                    background: isAssigned ? "#1f2937" : assigned[selectedPos] === player ? "#fde047" : "#334155",
                    color: assigned[selectedPos] === player ? "#111" : isAssigned ? "#64748b" : "#f1f5f9",
                    border: "2px solid " + (assigned[selectedPos] === player ? "#fde047" : "#475569"),
                    borderRadius: "10px",
                    fontWeight: "600",
                    fontSize: "13px",
                    cursor: isAssigned ? "not-allowed" : "pointer",
                    transition: "all 0.2s",
                    opacity: isAssigned ? 0.5 : 1,
                    textDecoration: isAssigned ? "line-through" : "none"
                  }}
                  onMouseOver={(e) => {
                    if (!isAssigned) {
                      e.target.style.background = "#475569";
                      e.target.style.transform = "scale(1.05)";
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!isAssigned) {
                      e.target.style.background = "#334155";
                      e.target.style.transform = "scale(1)";
                    }
                  }}
                >
                  {player}
                </button>
              );
            })}
          </div>

          <div style={{ marginTop: "24px", padding: "12px", background: "#0f172a", borderRadius: "10px", color: "#94a3b8", fontSize: "12px", lineHeight: "1.5" }}>
            💡 Players already assigned appear grayed out. Click outside to close.
          </div>
        </div>
      </div>

      <style>{`
        * {
          box-sizing: border-box;
        }
        body {
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
      `}</style>
    </div>
  );
}
