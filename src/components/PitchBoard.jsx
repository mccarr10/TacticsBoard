import { useState, useRef, useEffect, useCallback } from "react";
import Draggable from "react-draggable";

const squad = [
  "John","Lucas","Alex","Ronan","Ruairi","Jules","Robbie",
  "Fionn","Josh","Sam","Mason","Marcel","Alan","Darragh",
  "Sonny","Charlie","Cian"
];

const JerseyIcon = ({ size = 52, color = "white" }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <path
      d="M16 8 L24 4 L40 4 L48 8 L56 20 L48 28 L48 56 L16 56 L16 28 L8 20 Z"
      fill={color}
      stroke="#000"
      strokeWidth="3"
    />
    <rect x="22" y="4" width="6" height="52" fill="#000" />
    <rect x="36" y="4" width="6" height="52" fill="#000" />
  </svg>
);

const FORMATION_PCT = [
  { id: "GK", label: "Goalkeeper", xPct: 0.50, yPct: 0.85 },
  { id: "DEF1", label: "Defender 1", xPct: 0.28, yPct: 0.68 },
  { id: "DEF2", label: "Defender 2", xPct: 0.72, yPct: 0.68 },
  { id: "CM", label: "Central Mid", xPct: 0.50, yPct: 0.50 },
  { id: "WM1", label: "Wide Mid 1", xPct: 0.15, yPct: 0.34 },
  { id: "WM2", label: "Wide Mid 2", xPct: 0.85, yPct: 0.34 },
  { id: "STR", label: "Striker", xPct: 0.50, yPct: 0.17 },
];

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

    // Improved responsive logic
    if (aw / ah < 0.73) {
      w = Math.min(aw * 0.96, 680);   // better max width
      h = w * 1.37;
    } else {
      h = ah * 0.96;
      w = h * 0.73;
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

  const getCoords = (e) => {
    const rect = pitchRef.current.getBoundingClientRect();
    const src = e.touches ? e.touches[0] : e;

    return {
      x: Math.max(0, Math.min(dims.w, src.clientX - rect.left)),
      y: Math.max(0, Math.min(dims.h, src.clientY - rect.top)),
    };
  };

  // ... (drawing handlers unchanged)
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
      const moved = Math.sqrt(
        Math.pow(src.clientX - start.x, 2) + Math.pow(src.clientY - start.y, 2)
      );
      if (moved > DRAG_THRESHOLD) didDragRef.current[posId] = true;
    }
  };

  const onDragStop = (posId, e, data) => {
    const wasDrag = didDragRef.current[posId];
    const jerseyHalf = jerseySize / 2;

    if (wasDrag) {
      setPlayers((ps) =>
        ps.map((p) =>
          p.id === posId
            ? { ...p, x: data.x + jerseyHalf, y: data.y + jerseyHalf }
            : p
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

  const clearAssignment = () => {
    if (!selectedPos) return;
    setAssigned((a) => {
      const n = { ...a };
      delete n[selectedPos];
      return n;
    });
    setSelectedPos(null);
    setSheetOpen(false);
  };

  const { w, h } = dims;

  // Improved sizing
  const jerseySize = Math.max(68, Math.min(98, w * 0.168));
  const fontSize = Math.max(13.5, Math.min(17.5, w * 0.044));
  const tokenWidth = jerseySize + 32; // extra room for names

  return (
    <div
      style={{
        width: "100vw",
        height: "100dvh",
        background: "#020617",
        overflow: "hidden",
        position: "fixed",
        inset: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          maxWidth: "640px",        // ← Much better on desktop
          minWidth: "340px",
          background: "#0f172a",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          position: "relative",
          boxShadow: "0 0 0 1px rgba(255,255,255,0.08)",
        }}
      >
        {/* HEADER - unchanged */}
        <div
          style={{
            height: "92px",
            minHeight: "92px",
            padding: "18px 18px 12px",
            background: "rgba(15,23,42,0.96)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            zIndex: 20,
          }}
        >
          <div>
            <div style={{ color: "white", fontSize: "26px", fontWeight: "900", lineHeight: 1 }}>
              Tactical Board
            </div>
            <div style={{ color: "#94a3b8", fontSize: "14px", marginTop: "6px" }}>
              7-a-side planner
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() => setLines((l) => l.slice(0, -1))}
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "16px",
                border: "none",
                background: "#1e293b",
                color: "white",
                fontSize: "20px",
                fontWeight: "700",
              }}
            >
              ↩
            </button>
            <button
              onClick={() => setLines([])}
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "16px",
                border: "none",
                background: "#7f1d1d",
                color: "white",
                fontSize: "18px",
                fontWeight: "700",
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* PITCH AREA */}
        <div
          ref={wrapperRef}
          style={{
            flex: 1,
            position: "relative",
            overflow: "hidden",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "12px",
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
                borderRadius: "28px",
                overflow: "hidden",
                boxShadow: "0 20px 60px rgba(0,0,0,0.55)",
                border: "2px solid rgba(255,255,255,0.08)",
                touchAction: "none",
              }}
            >
              {/* Grass, markings, lines, etc. remain the same */}
              {[...Array(14)].map((_, i) => (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    top: `${i * (100 / 14)}%`,
                    width: "100%",
                    height: `${100 / 14}%`,
                    background: i % 2 === 0 ? "#3f9b45" : "#2f7d32",
                  }}
                />
              ))}

              <svg
                style={{ position: "absolute", inset: 0 }}
                width={w}
                height={h}
                viewBox={`0 0 ${w} ${h}`}
              >
                {/* ... existing SVG markings and drawn lines ... */}
                <defs>
                  <marker id="arr" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                    <polygon points="0 0, 8 4, 0 8" fill="#facc15" />
                  </marker>
                </defs>

                <rect
                  x={w * 0.04}
                  y={h * 0.02}
                  width={w * 0.92}
                  height={h * 0.96}
                  fill="none"
                  stroke="white"
                  strokeWidth="3"
                />
                <line
                  x1={w * 0.04} y1={h * 0.5}
                  x2={w * 0.96} y2={h * 0.5}
                  stroke="white" strokeWidth="3"
                />
                <circle
                  cx={w * 0.5} cy={h * 0.5}
                  r={w * 0.14}
                  fill="none"
                  stroke="white"
                  strokeWidth="3"
                />

                {lines.map((l, i) => (
                  <line
                    key={i}
                    x1={l.x1} y1={l.y1}
                    x2={l.x2} y2={l.y2}
                    stroke="#facc15"
                    strokeWidth="5"
                    strokeLinecap="round"
                    markerEnd="url(#arr)"
                  />
                ))}

                {drawing && (
                  <line
                    x1={drawing.x1} y1={drawing.y1}
                    x2={drawing.x2} y2={drawing.y2}
                    stroke="#facc15"
                    strokeWidth="5"
                    strokeDasharray="10 6"
                    strokeLinecap="round"
                    markerEnd="url(#arr)"
                  />
                )}
              </svg>

              {/* PLAYERS */}
              {players.map((pos) => (
                <Draggable
                  key={pos.id}
                  position={{
                    x: pos.x - jerseySize / 2,
                    y: pos.y - jerseySize / 2,
                  }}
                  bounds="parent"
                  onStart={(e) => onPlayerPointerDown(pos.id, e)}
                  onDrag={(e) => onDragMove(pos.id, e)}
                  onStop={(e, data) => onDragStop(pos.id, e, data)}
                >
                  <div
                    className="player-token"
                    style={{
                      position: "absolute",
                      width: `${tokenWidth}px`,
                      textAlign: "center",
                      cursor: "grab",
                      zIndex: 10,
                      transform: selectedPos === pos.id ? "scale(1.12)" : "scale(1)",
                      transition: "all 0.2s ease",
                      filter: selectedPos === pos.id
                        ? "drop-shadow(0 0 14px #facc15)"
                        : "drop-shadow(0 12px 18px rgba(0,0,0,0.45))",
                    }}
                  >
                    <JerseyIcon
                      size={jerseySize}
                      color={assigned[pos.id] ? "#facc15" : "white"}
                    />
                    <div
                      style={{
                        color: "white",
                        fontWeight: "900",
                        fontSize: `${fontSize}px`,
                        marginTop: "8px",
                        textShadow: "0 2px 10px rgba(0,0,0,0.9)",
                        whiteSpace: "nowrap",
                        lineHeight: 1.1,
                      }}
                    >
                      {assigned[pos.id] || pos.label}
                    </div>
                  </div>
                </Draggable>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Sheet - unchanged */}
        {sheetOpen && (
          <div
            onClick={() => {
              setSheetOpen(false);
              setSelectedPos(null);
            }}
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.55)",
              zIndex: 40,
            }}
          />
        )}

        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 50,
            background: "#1e293b",
            borderRadius: "28px 28px 0 0",
            padding: "0 16px 32px",
            boxShadow: "0 -12px 40px rgba(0,0,0,0.65)",
            transform: sheetOpen ? "translateY(0)" : "translateY(100%)",
            transition: "transform 0.28s cubic-bezier(0.32,0.72,0,1)",
            maxHeight: "70vh",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* ... rest of your bottom sheet code (unchanged) ... */}
          <div style={{ display: "flex", justifyContent: "center", padding: "14px 0" }}>
            <div style={{ width: "52px", height: "6px", borderRadius: "999px", background: "#475569" }} />
          </div>

          <div style={{ color: "white", fontWeight: "800", fontSize: "22px", marginBottom: "18px" }}>
            Select Player
          </div>

          <div
            style={{
              overflowY: "auto",
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "12px",
            }}
          >
            {squad.map((player) => {
              const isAssigned = Object.values(assigned).includes(player);
              const isHere = selectedPos && assigned[selectedPos] === player;

              return (
                <div
                  key={player}
                  onClick={() => (!isAssigned || isHere) && assignPlayer(player)}
                  style={{
                    background: isHere ? "#facc15" : isAssigned ? "#162032" : "#334155",
                    borderRadius: "18px",
                    padding: "16px 12px",
                    textAlign: "center",
                    opacity: isAssigned && !isHere ? 0.45 : 1,
                  }}
                >
                  <JerseyIcon size={48} color={isHere ? "#000" : "white"} />
                  <div
                    style={{
                      marginTop: "8px",
                      fontSize: "17px",
                      fontWeight: "800",
                      color: isHere ? "#000" : "white",
                    }}
                  >
                    {player}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}