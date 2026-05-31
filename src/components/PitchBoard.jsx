import { useState, useRef, useEffect, useCallback } from "react";
import Draggable from "react-draggable";

const squad = [
 "John", "Lucas", "Alex", "Ronan", "Ruairi", "Jules", "Robbie", "Fionn",
 "Josh", "Sam", "Mason", "Marcel", "Alan", "Darragh", "Sonny", "Charlie", "Cian",
];

const oppositionLabels = ["GK", "LB", "RB", "CM", "LW", "RW", "ST"];

const JerseyIcon = ({ size = 52, color = "white", striped = false, opacity = 1 }) => (
 <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity }}>
   <path d="M16 8 L24 4 L40 4 L48 8 L56 20 L48 28 L48 56 L16 56 L16 28 L8 20 Z" fill={color} stroke="#111" strokeWidth="4" />
   {striped ? (
     <>
       <rect x="20" y="4" width="5" height="52" fill="#111" />
       <rect x="30" y="4" width="5" height="52" fill="#111" />
       <rect x="40" y="4" width="5" height="52" fill="#111" />
     </>
   ) : (
     <>
       <rect x="22" y="4" width="6" height="52" fill="#111" />
       <rect x="36" y="4" width="6" height="52" fill="#111" />
     </>
   )}
 </svg>
);

const formations = {
 "2-3-1": [
   { id: "GK", label: "Goalkeeper", xPct: 0.5, yPct: 0.92 },
   { id: "DEF1", label: "Defender 1", xPct: 0.27, yPct: 0.7 },
   { id: "DEF2", label: "Defender 2", xPct: 0.73, yPct: 0.7 },
   { id: "CM", label: "Central Mid", xPct: 0.5, yPct: 0.5 },
   { id: "WM1", label: "Wide Mid 1", xPct: 0.14, yPct: 0.35 },
   { id: "WM2", label: "Wide Mid 2", xPct: 0.86, yPct: 0.35 },
   { id: "STR", label: "Striker", xPct: 0.5, yPct: 0.12 },
 ],
 "3-2-1": [
   { id: "GK", label: "Goalkeeper", xPct: 0.5, yPct: 0.92 },
   { id: "DEF1", label: "Left Defender", xPct: 0.2, yPct: 0.7 },
   { id: "DEF2", label: "Center Defender", xPct: 0.5, yPct: 0.74 },
   { id: "DEF3", label: "Right Defender", xPct: 0.8, yPct: 0.7 },
   { id: "MID1", label: "Midfielder 1", xPct: 0.35, yPct: 0.45 },
   { id: "MID2", label: "Midfielder 2", xPct: 0.65, yPct: 0.45 },
   { id: "STR", label: "Striker", xPct: 0.5, yPct: 0.18 },
 ],
};

function buildPlayers(formation, w, h) {
 return formation.map((p) => ({ ...p, x: p.xPct * w, y: p.yPct * h }));
}

function buildOpposition(formation, w, h) {
 return formation.map((p) => ({
   ...p,
   id: `OPP_${p.id}`,
   x: (1 - p.xPct) * w,
   y: (1 - p.yPct) * h,
 }));
}

function calcDims(container) {
 const aspectRatio = 1.6;
 let w = container.clientWidth * 0.95;
 let h = w * aspectRatio;
 if (h > container.clientHeight * 0.95) {
   h = container.clientHeight * 0.95;
   w = h / aspectRatio;
 }
 return { w, h };
}

export default function TacticalBoard() {
 const pitchRef = useRef(null);
 const wrapperRef = useRef(null);

 const [dims, setDims] = useState({ w: 0, h: 0 });
 const [formationKey, setFormationKey] = useState("2-3-1");
 const [assigned, setAssigned] = useState({});
 const [selectedPos, setSelectedPos] = useState(null);
 const [sheetOpen, setSheetOpen] = useState(false);
 const [lines, setLines] = useState([]);
 const [drawing, setDrawing] = useState(null);
 const [players, setPlayers] = useState([]);
 const [oppositionPlayers, setOppositionPlayers] = useState([]);
 const [ready, setReady] = useState(false);
 const [showOpposition, setShowOpposition] = useState(true);
 const [oppositionOpacity, setOppositionOpacity] = useState(0.85);

 const dimsRef = useRef({ w: 0, h: 0 });
 const formationKeyRef = useRef(formationKey);

 const initFormation = useCallback((fKey, w, h) => {
   const FORMATION = formations[fKey];
   setPlayers(buildPlayers(FORMATION, w, h));
   setOppositionPlayers(buildOpposition(FORMATION, w, h));
 }, []);

 const rescalePlayers = useCallback((oldW, oldH, newW, newH) => {
   if (oldW === 0 || oldH === 0) return;
   setPlayers((ps) =>
     ps.map((p) => ({ ...p, x: (p.x / oldW) * newW, y: (p.y / oldH) * newH }))
   );
   setOppositionPlayers((ps) =>
     ps.map((p) => ({ ...p, x: (p.x / oldW) * newW, y: (p.y / oldH) * newH }))
   );
 }, []);

 useEffect(() => {
   if (!wrapperRef.current) return;
   const { w, h } = calcDims(wrapperRef.current);
   dimsRef.current = { w, h };
   setDims({ w, h });
   initFormation(formationKey, w, h);
   setReady(true);
 }, []); // eslint-disable-line react-hooks/exhaustive-deps

 useEffect(() => {
   if (!ready) return;
   formationKeyRef.current = formationKey;
   const { w, h } = dimsRef.current;
   if (w > 0 && h > 0) {
     setAssigned({});
     setLines([]);
     initFormation(formationKey, w, h);
   }
 }, [formationKey]); // eslint-disable-line react-hooks/exhaustive-deps

 useEffect(() => {
   if (!wrapperRef.current) return;
   const ro = new ResizeObserver(() => {
     if (!wrapperRef.current) return;
     const { w: newW, h: newH } = calcDims(wrapperRef.current);
     const { w: oldW, h: oldH } = dimsRef.current;
     if (Math.abs(newW - oldW) < 1 && Math.abs(newH - oldH) < 1) return;
     rescalePlayers(oldW, oldH, newW, newH);
     dimsRef.current = { w: newW, h: newH };
     setDims({ w: newW, h: newH });
   });
   ro.observe(wrapperRef.current);
   return () => ro.disconnect();
 }, [rescalePlayers]);

 const getCoords = (e) => {
   if (!pitchRef.current) return { x: 0, y: 0 };
   const rect = pitchRef.current.getBoundingClientRect();
   const src = e.touches ? e.touches[0] : e;
   const { w, h } = dimsRef.current;
   return {
     x: Math.max(0, Math.min(w, src.clientX - rect.left)),
     y: Math.max(0, Math.min(h, src.clientY - rect.top)),
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
   if (Math.sqrt(dx * dx + dy * dy) > 20) {
     setLines((l) => [...l, drawing]);
   }
   setDrawing(null);
 };

 const dragStartRef = useRef({});
 const didDragRef = useRef({});

 const { w, h } = dims;
 const jerseySize = Math.max(44, Math.min(72, w * 0.085));
 const fontSize = Math.max(10, Math.min(16, w * 0.018));
 const tokenWidth = jerseySize + 12;
 const isMobile = w < 700;

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
     setPlayers((ps) =>
       ps.map((p) => p.id === posId ? { ...p, x: data.x + jerseyHalf, y: data.y + jerseyHalf } : p)
     );
   } else {
     setSelectedPos(posId);
     setSheetOpen(true);
   }
   dragStartRef.current[posId] = null;
   didDragRef.current[posId] = false;
 };

 const onOppositionDragStop = (posId, _, data) => {
   const jerseyHalf = jerseySize / 2;
   setOppositionPlayers((ps) =>
     ps.map((p) => p.id === posId ? { ...p, x: data.x + jerseyHalf, y: data.y + jerseyHalf } : p)
   );
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
   const { w, h } = dimsRef.current;
   initFormation(formationKeyRef.current, w, h);
 };

 return (
   <div style={{ width: "100vw", height: "100dvh", background: "#020617", position: "fixed", inset: 0, display: "flex", flexDirection: "column" }}>
     <div style={{ height: isMobile ? "120px" : "88px", padding: "20px 24px", background: "linear-gradient(135deg, #1e2937 0%, #0f172a 100%)", borderBottom: "2px solid #334155", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, zIndex: 100 }}>
       <div>
         <div style={{ color: "#f1f5f9", fontSize: isMobile ? "30px" : "22px", fontWeight: "950" }}>Tactical Board</div>
         <div style={{ color: "#cbd5e1", fontSize: isMobile ? "16px" : "13px", marginTop: "6px", fontWeight: "600" }}>7-a-side • Academy Planner</div>
       </div>
       <select value={formationKey} onChange={(e) => setFormationKey(e.target.value)} style={{ padding: "18px 24px", borderRadius: "18px", background: "#334155", color: "white", border: "2px solid #475569", fontWeight: "800", fontSize: isMobile ? "18px" : "14px", minHeight: isMobile ? "58px" : "42px", minWidth: "170px", appearance: "none", WebkitAppearance: "none" }}>
         {Object.keys(formations).map((f) => (<option key={f}>{f}</option>))}
       </select>
     </div>

     <div ref={wrapperRef} style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", padding: "12px", overflow: "hidden" }}>
       {ready && w > 0 && (
         <div ref={pitchRef} style={{ width: `${w}px`, height: `${h}px`, borderRadius: "20px", overflow: "hidden", position: "relative", border: "4px solid #e2e8f0", background: "#1a3a1a", touchAction: "none" }} onMouseDown={onDrawStart} onMouseMove={onDrawMove} onMouseUp={onDrawEnd} onMouseLeave={onDrawEnd} onTouchStart={onDrawStart} onTouchMove={onDrawMove} onTouchEnd={onDrawEnd}>
           {[...Array(20)].map((_, i) => (
             <div key={i} style={{ position: "absolute", top: `${i * (100 / 20)}%`, width: "100%", height: `${100 / 20}%`, background: i % 2 === 0 ? "#166534" : "#15803d" }} />
           ))}

           <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: "absolute", inset: 0 }}>
             <defs>
               <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                 <path d="M0,0 L0,6 L9,3 z" fill="#fde047" />
               </marker>
             </defs>
             <rect x={w * 0.04} y={h * 0.04} width={w * 0.92} height={h * 0.92} fill="none" stroke="#fff" strokeWidth="4" />
             <line x1={w * 0.04} y1={h * 0.5} x2={w * 0.96} y2={h * 0.5} stroke="#fff" strokeWidth="3" />
             <circle cx={w * 0.5} cy={h * 0.5} r={w * 0.1} fill="none" stroke="#fff" strokeWidth="3" />
             <rect x={w * 0.08} y={h * 0.04} width={w * 0.84} height={h * 0.16} fill="none" stroke="#fff" strokeWidth="3" />
             <rect x={w * 0.28} y={h * 0.04} width={w * 0.44} height={h * 0.08} fill="none" stroke="#fff" strokeWidth="3" />
             <rect x={w * 0.08} y={h * 0.80} width={w * 0.84} height={h * 0.16} fill="none" stroke="#fff" strokeWidth="3" />
             <rect x={w * 0.28} y={h * 0.88} width={w * 0.44} height={h * 0.08} fill="none" stroke="#fff" strokeWidth="3" />
             {lines.map((l, i) => (
               <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke="#fde047" strokeWidth="5" markerEnd="url(#arrow)" />
             ))}
             {drawing && (
               <line x1={drawing.x1} y1={drawing.y1} x2={drawing.x2} y2={drawing.y2} stroke="#fde047" strokeWidth="5" strokeDasharray="8 5" />
             )}
           </svg>

           {players.map((pos) => (
             <Draggable key={pos.id} position={{ x: pos.x - jerseySize / 2, y: pos.y - jerseySize / 2 }} bounds="parent" onStart={(e) => onPlayerPointerDown(pos.id, e)} onDrag={(e) => onDragMove(pos.id, e)} onStop={(e, data) => onDragStop(pos.id, e, data)}>
               <div className="player-token" style={{ position: "absolute", width: `${tokenWidth}px`, textAlign: "center", cursor: "grab", zIndex: 20 }}>
                 <JerseyIcon size={jerseySize} color={assigned[pos.id] ? "#fde047" : "#f8fafc"} />
                 <div style={{ color: "#fff", fontWeight: "800", fontSize: `${fontSize}px`, marginTop: "8px" }}>{assigned[pos.id] || pos.label.split(" ")[0]}</div>
               </div>
             </Draggable>
           ))}

           {showOpposition && oppositionPlayers.map((pos, index) => (
             <Draggable key={pos.id} position={{ x: pos.x - jerseySize / 2, y: pos.y - jerseySize / 2 }} bounds="parent" onStop={(e, data) => onOppositionDragStop(pos.id, e, data)}>
               <div className="player-token" style={{ position: "absolute", width: `${tokenWidth}px`, textAlign: "center", cursor: "grab", zIndex: 10 }}>
                 <JerseyIcon size={jerseySize} color="#ef4444" striped opacity={oppositionOpacity} />
                 <div style={{ color: "#fff", fontWeight: "800", fontSize: `${fontSize}px`, marginTop: "8px" }}>{oppositionLabels[index] || "Opp"}</div>
               </div>
             </Draggable>
           ))}
         </div>
       )}
     </div>

     {showOpposition && (
       <div style={{ position: "fixed", bottom: "24px", right: "24px", background: "#1e2937", padding: "22px", borderRadius: "22px", border: "2px solid #334155", zIndex: 500, width: "320px", boxShadow: "0 12px 30px rgba(0,0,0,0.4)" }}>
         <div style={{ color: "#f1f5f9", marginBottom: "18px", fontWeight: "800", fontSize: isMobile ? "18px" : "14px" }}>Opposition Visibility</div>
         <input type="range" min="0.2" max="1" step="0.05" value={oppositionOpacity} onChange={(e) => setOppositionOpacity(Number(e.target.value))} style={{ width: "100%", height: "42px" }} />
         <div style={{ color: "#cbd5e1", marginTop: "14px", fontSize: "18px", textAlign: "center", fontWeight: "700" }}>{Math.round(oppositionOpacity * 100)}%</div>
       </div>
     )}

     {sheetOpen && (
       <>
         <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 200 }} onClick={() => setSheetOpen(false)} />
         <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#1e2937", borderTopLeftRadius: "32px", borderTopRightRadius: "32px", maxHeight: "85vh", overflowY: "auto", zIndex: 210, padding: "28px" }}>
           <div style={{ color: "#fff", fontSize: "36px", fontWeight: "900", marginBottom: "28px" }}>Select Player</div>
           <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "18px" }}>
             {squad.map((player, idx) => {
               const isAssigned = Object.values(assigned).includes(player);
               return (
                 <button key={idx} onClick={() => { if (!isAssigned) assignPlayer(player); }} style={{ padding: "34px 20px", background: isAssigned ? "#1f2937" : "#334155", color: isAssigned ? "#64748b" : "#f1f5f9", border: "2px solid #475569", borderRadius: "22px", fontWeight: "800", fontSize: "26px", cursor: isAssigned ? "not-allowed" : "pointer", opacity: isAssigned ? 0.5 : 1 }}>
                   {player}
                 </button>
               );
             })}
           </div>
         </div>
       </>
     )}

     <style>{`* { box-sizing: border-box; } body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; } button, select, input[type="range"] { transition: all 0.18s ease; } button:active { transform: scale(0.96); } button, select, .player-token { touch-action: manipulation; } input[type="range"] { -webkit-appearance: none; appearance: none; background: transparent; } input[type="range"]::-webkit-slider-runnable-track { height: 12px; background: #475569; border-radius: 999px; } input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 34px; height: 34px; border-radius: 50%; background: #ffffff; margin-top: -11px; cursor: pointer; }`}</style>

     <div style={{ position: "fixed", bottom: "18px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "14px", padding: "12px 14px", background: "rgba(15, 23, 42, 0.9)", border: "1px solid #334155", borderRadius: "18px", backdropFilter: "blur(10px)", zIndex: 300, alignItems: "center" }}>
       <button onClick={() => setShowOpposition((o) => !o)} style={{ padding: "14px 18px", borderRadius: "14px", background: showOpposition ? "#7c3aed" : "#334155", color: "#fff", border: "none", fontWeight: "800", cursor: "pointer" }}>Opp</button>
       <button onClick={() => setLines((l) => l.slice(0, -1))} style={{ padding: "14px 18px", borderRadius: "14px", background: "#334155", color: "#fff", border: "none", fontWeight: "800", cursor: "pointer" }}>Undo</button>
       <button onClick={resetFormation} style={{ padding: "14px 18px", borderRadius: "14px", background: "#dc2626", color: "#fff", border: "none", fontWeight: "800", cursor: "pointer" }}>Reset</button>
     </div>
   </div>
 );
}
