import { useState, useRef, useEffect, useCallback } from "react";
import Draggable from "react-draggable";

const squad = [
  "John","Lucas","Alex","Ronan","Ruairi","Jules","Robbie",
  "Fionn","Josh","Sam","Mason","Marcel","Alan","Darragh","Sonny","Charlie","Cian"
];

const JerseyIcon = ({ size = 34 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <path d="M16 8 L24 4 L40 4 L48 8 L56 20 L48 28 L48 56 L16 56 L16 28 L8 20 Z"
      fill="#ffffff" stroke="#000" strokeWidth="3" />
    <rect x="22" y="4" width="6" height="52" fill="#000" />
    <rect x="36" y="4" width="6" height="52" fill="#000" />
  </svg>
);

const FORMATION_PCT = [
  { id: "GK",   label: "Goalkeeper",    xPct: 0.50, yPct: 0.85 },
  { id: "DEF1", label: "Defender 1",    xPct: 0.28, yPct: 0.68 },
  { id: "DEF2", label: "Defender 2",    xPct: 0.72, yPct: 0.68 },
  { id: "CM",   label: "Central Mid",   xPct: 0.50, yPct: 0.50 },
  { id: "WM1",  label: "Wide Mid 1",    xPct: 0.15, yPct: 0.34 },
  { id: "WM2",  label: "Wide Mid 2",    xPct: 0.85, yPct: 0.34 },
  { id: "STR",  label: "Striker",       xPct: 0.50, yPct: 0.17 },
];

export default function PitchBoard() {
  const wrapperRef = useRef(null);
  const pitchRef = useRef(null);
  const [dims, setDims] = useState({ w: 0, h: 0 });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [assigned, setAssigned] = useState({});
  const [selectedPos, setSelectedPos] = useState(null);
  const [lines, setLines] = useState([]);
  const [drawing, setDrawing] = useState(null);
  const [players, setPlayers] = useState([]);
  const [ready, setReady] = useState(false);

  // ── Measure available space and compute pitch dimensions ──
  const measure = useCallback(() => {
    if (!wrapperRef.current) return;
    const el = wrapperRef.current;
    const aw = el.clientWidth;
    const ah = el.clientHeight;
    // Pitch is portrait 3:4. Fit inside available space.
    let w, h;
    if (aw / ah < 3 / 4) {
      w = aw;
      h = aw * (4 / 3);
    } else {
      h = ah;
      w = ah * (3 / 4);
    }
    setDims({ w, h });
    setPlayers(
      FORMATION_PCT.map((p) => ({
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

  // ── Pitch coordinate helper ──
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
    if (Math.sqrt(dx * dx + dy * dy) > 15) {
      setLines((l) => [...l, drawing]);
    }
    setDrawing(null);
  };

  const handleDrag = (id, data) => {
    const half = dims.w * 0.08;
    setPlayers((ps) =>
      ps.map((p) => (p.id === id ? { ...p, x: data.x + half, y: data.y + half } : p))
    );
  };

  const assignPlayer = (player) => {
    if (!selectedPos) return;
    setAssigned((a) => ({ ...a, [selectedPos]: player }));
    setSelectedPos(null);
    setSidebarOpen(false);
  };

  const { w, h } = dims;
  // Scale jersey and font to pitch size
  const jerseySize = Math.max(24, Math.min(44, w * 0.11));
  const fontSize = Math.max(8, Math.min(13, w * 0.032));
  const tokenHalf = jerseySize / 2;

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      width: "100vw",
      height: "100vh",
      background: "#0f172a",
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      overflow: "hidden",
      userSelect: "none",
    }}>

      {/* ── Top bar ── */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "8px 12px",
        background: "#1e293b",
        borderBottom: "2px solid #0f172a",
        flexShrink: 0,
        gap: "8px",
        flexWrap: "wrap",
      }}>
        <div style={{ color: "white", fontWeight: "bold", fontSize: "15px" }}>
          ⚽ 7-Player Formation
        </div>

        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          <button
            onClick={() => setSidebarOpen((o) => !o)}
            style={{
              padding: "6px 12px", background: "#334155", color: "white",
              borderRadius: "7px", border: "none", cursor: "pointer", fontSize: "13px"
            }}
          >
            👥 Squad
          </button>
          <button
            onClick={() => setLines((l) => l.slice(0, -1))}
            style={{
              padding: "6px 12px", background: "#334155", color: "white",
              borderRadius: "7px", border: "none", cursor: "pointer", fontSize: "13px"
            }}
          >
            ↩ Undo
          </button>
          <button
            onClick={() => setLines([])}
            style={{
              padding: "6px 12px", background: "#b91c1c", color: "white",
              borderRadius: "7px", border: "none", cursor: "pointer", fontSize: "13px"
            }}
          >
            🗑 Clear
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden", position: "relative" }}>

        {/* ── Sidebar overlay (mobile) / permanent (desktop) ── */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            style={{
              position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)",
              zIndex: 20, display: "block"
            }}
          />
        )}

        <div style={{
          position: "absolute",
          top: 0, left: 0, bottom: 0,
          width: "200px",
          background: "#1e293b",
          color: "white",
          padding: "10px",
          overflowY: "auto",
          zIndex: 30,
          transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.25s ease",
          borderRight: "2px solid #0f172a",
        }}>
          <div style={{
            display: "flex", justifyContent: "space-between",
            alignItems: "center", marginBottom: "10px"
          }}>
            <div style={{ fontSize: "12px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px" }}>
              Squad List
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              style={{ background: "none", border: "none", color: "white", fontSize: "18px", cursor: "pointer" }}
            >×</button>
          </div>

          {selectedPos && (
            <div style={{
              background: "#facc15", color: "#000", padding: "7px",
              borderRadius: "6px", marginBottom: "10px",
              fontWeight: "bold", textAlign: "center", fontSize: "12px"
            }}>
              Assigning to: {selectedPos}
            </div>
          )}

          {squad.map((player) => (
            <div
              key={player}
              onClick={() => assignPlayer(player)}
              style={{
                background: "#334155", borderRadius: "6px", marginBottom: "5px",
                padding: "7px 8px", cursor: "pointer", display: "flex",
                alignItems: "center", gap: "8px", fontSize: "14px",
                border: "1px solid #475569",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "#475569"}
              onMouseLeave={e => e.currentTarget.style.background = "#334155"}
            >
              <JerseyIcon size={28} />
              {player}
            </div>
          ))}
        </div>

        {/* ── Pitch area ── */}
        <div
          ref={wrapperRef}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "10px",
            overflow: "hidden",
          }}
        >
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
                width: `${w}px`,
                height: `${h}px`,
                borderRadius: "10px",
                overflow: "hidden",
                boxShadow: "0 8px 40px rgba(0,0,0,0.7)",
                cursor: "crosshair",
                touchAction: "none",
                flexShrink: 0,
              }}
            >
              {/* Grass stripes */}
              {[...Array(14)].map((_, i) => (
                <div key={i} style={{
                  position: "absolute",
                  top: `${i * (100 / 14)}%`,
                  width: "100%",
                  height: `${100 / 14}%`,
                  background: i % 2 === 0 ? "#3a8a3a" : "#2d7a2d",
                }} />
              ))}

              {/* ── SVG markings + arrows ── */}
              <svg
                style={{ position: "absolute", inset: 0 }}
                width={w} height={h}
                viewBox={`0 0 ${w} ${h}`}
              >
                <defs>
                  <marker id="arr" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                    <polygon points="0 0, 8 4, 0 8" fill="#facc15" />
                  </marker>
                </defs>

                {/* Border */}
                <rect x={w*0.04} y={h*0.02} width={w*0.92} height={h*0.96}
                  fill="none" stroke="white" strokeWidth="2.5" />

                {/* Halfway */}
                <line x1={w*0.04} y1={h*0.5} x2={w*0.96} y2={h*0.5}
                  stroke="white" strokeWidth="2" />

                {/* Centre circle + spot */}
                <circle cx={w*0.5} cy={h*0.5} r={w*0.14}
                  fill="none" stroke="white" strokeWidth="2" />
                <circle cx={w*0.5} cy={h*0.5} r="3" fill="white" />

                {/* TOP — large box */}
                <rect x={w*0.22} y={h*0.02} width={w*0.56} height={h*0.16}
                  fill="none" stroke="white" strokeWidth="2" />
                {/* TOP — small box */}
                <rect x={w*0.34} y={h*0.02} width={w*0.32} height={h*0.07}
                  fill="none" stroke="white" strokeWidth="2" />
                {/* TOP — goal */}
                <rect x={w*0.40} y={h*0.005} width={w*0.20} height={h*0.02}
                  fill="none" stroke="white" strokeWidth="2" />
                {/* TOP — penalty spot */}
                <circle cx={w*0.5} cy={h*0.13} r="3" fill="white" />
                {/* TOP — arc (curves INTO pitch = downward) */}
                <path d={`M ${w*0.30} ${h*0.18} A ${w*0.22} ${w*0.22} 0 0 1 ${w*0.70} ${h*0.18}`}
                  fill="none" stroke="white" strokeWidth="2" />

                {/* BOTTOM — large box */}
                <rect x={w*0.22} y={h*0.82} width={w*0.56} height={h*0.16}
                  fill="none" stroke="white" strokeWidth="2" />
                {/* BOTTOM — small box */}
                <rect x={w*0.34} y={h*0.91} width={w*0.32} height={h*0.07}
                  fill="none" stroke="white" strokeWidth="2" />
                {/* BOTTOM — goal */}
                <rect x={w*0.40} y={h*0.975} width={w*0.20} height={h*0.02}
                  fill="none" stroke="white" strokeWidth="2" />
                {/* BOTTOM — penalty spot */}
                <circle cx={w*0.5} cy={h*0.87} r="3" fill="white" />
                {/* BOTTOM — arc (curves INTO pitch = upward) */}
                <path d={`M ${w*0.30} ${h*0.82} A ${w*0.22} ${w*0.22} 0 0 0 ${w*0.70} ${h*0.82}`}
                  fill="none" stroke="white" strokeWidth="2" />

                {/* Saved arrows */}
                {lines.map((l, i) => (
                  <line key={i}
                    x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
                    stroke="#facc15" strokeWidth="3"
                    strokeLinecap="round"
                    markerEnd="url(#arr)"
                  />
                ))}

                {/* Live arrow */}
                {drawing && (
                  <line
                    x1={drawing.x1} y1={drawing.y1}
                    x2={drawing.x2} y2={drawing.y2}
                    stroke="#facc15" strokeWidth="3"
                    strokeDasharray="10 5"
                    strokeLinecap="round"
                    markerEnd="url(#arr)"
                  />
                )}
              </svg>

              {/* ── Players ── */}
              {players.map((pos) => (
                <Draggable
                  key={pos.id}
                  position={{ x: pos.x - tokenHalf, y: pos.y - tokenHalf }}
                  bounds="parent"
                  onStop={(e, data) => handleDrag(pos.id, data)}
                >
                  <div
                    className="player-token"
                    onClick={() => {
                      setSelectedPos(pos.id);
                      setSidebarOpen(true);
                    }}
                    style={{
                      position: "absolute",
                      width: `${jerseySize + 16}px`,
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
                    <JerseyIcon size={jerseySize} />
                    <div style={{
                      color: "white",
                      fontWeight: "bold",
                      fontSize: `${fontSize}px`,
                      marginTop: "1px",
                      textShadow: "1px 1px 4px #000",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: `${jerseySize + 16}px`,
                    }}>
                      {assigned[pos.id] || pos.label}
                    </div>
                  </div>
                </Draggable>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
