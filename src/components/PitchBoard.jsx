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
 const jerseySize = Math.max(90, Math.min(145, w * 0.29));
 const fontSize = Math.max(16, Math.min(24, w * 0.062));
 const tokenWidth = jerseySize + 40;

 return (
   <div style={{ width: "100vw", height: "100dvh", background: "#020617", position: "fixed", inset: 0, display: "flex", flexDirection: "column" }}>
     
     {/* Header - Fixed to top */}
     <div style={{ height: "110px", padding: "16px 20px", background: "linear-gradient(135deg, #1e2937 0%, #0f172a 100%)", borderBottom: "2px solid #334155", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, zIndex: 100 }}>
       <div>
         <div style={{ color: "#f1f5f9", fontSize: "36px", fontWeight: "950", letterSpacing: "-0.8px" }}>Tactical Board</div>
         <div style={{ color: "#cbd5e1", fontSize: "14px", marginTop: "4px", fontWeight: "500" }}>7-a-side • Academy Planner</div>
       </div>
       <div style={{ display: "flex", gap: "12px" }}>
         <button 
           onClick={() => setLines(l => l.slice(0, -1))} 
           title="Undo last line"
           style={{ 
             padding: "12px 18px",
             display: "flex", 
             alignItems: "center", 
             gap: "8px",
             borderRadius: "12px", 
             background: "#334155", 
             color: "#e2e8f0", 
             fontSize: "14px",
             fontWeight: "700",
             border: "none", 
             cursor: "pointer", 
             transition: "all 0.25s ease",
           }}
           onMouseOver={(e) => {
             e.target.style.background = "#475569";
             e.target.style.transform = "translateY(-2px)";
             e.target.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
           }}
           onMouseOut={(e) => {
             e.target.style.background = "#334155";
             e.target.style.transform = "translateY(0)";
             e.target.style.boxShadow = "none";
           }}
         >
           <span>↩</span>
           <span>Undo</span>
         </button>
         <button 
           onClick={resetFormation} 
           title="Reset entire formation"
           style={{ 
             padding: "12px 18px",
             display: "flex", 
             alignItems: "center", 
             gap: "8px",
             borderRadius: "12px", 
             background: "#b91c1c", 
             color: "#fef2f2", 
             fontSize: "14px",
             fontWeight: "700",
             border: "none", 
             cursor: "pointer", 
             transition: "all 0.25s ease",
           }}
           onMouseOver={(e) => {
             e.target.style.background = "#dc2626";
             e.target.style.transform = "translateY(-2px)";
             e.target.style.boxShadow = "0 4px 12px rgba(185, 28, 28, 0.4)";
           }}
           onMouseOut={(e) => {
             e.target.style.background = "#b91c1c";
             e.target.style.transform = "translateY(0)";
             e.target.style.boxShadow = "none";
           }}
         >
           <span>⟳</span>
           <span>Reset</span>
         </button>
       </div>
     </div>

     {/* Pitch Container - Fills remaining space */}
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

           {/* Pitch markings SVG */}
           <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: "absolute", inset: 0 }}>
             <defs>
               <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
                 <path d="M0,0 L0,6 L9,3 z" fill="#fde047" />
               </marker>
             </defs>

             {/* Outer boundary with corner flags */}
             <rect x={w * 0.04} y={h * 0.04} width={w * 0.92} height={h * 0.92} fill="none" stroke="#f8fafc" strokeWidth="4" />

             {/* Halfway line */}
             <line x1={w * 0.04} y1={h * 0.5} x2={w * 0.96} y2={h * 0.5} stroke="#f8fafc" strokeWidth="3" />

             {/* Center circle */}
             <circle cx={w * 0.5} cy={h * 0.5} r={w * 0.10} fill="none" stroke="#f8fafc" strokeWidth="3" />
             <circle cx={w * 0.5} cy={h * 0.5} r="3" fill="#f8fafc" />

             {/* TOP GOAL AREA - Clean simple boxes */}
             {/* Penalty Area (18 yards / larger box) */}
             <rect x={w * 0.08} y={h * 0.03} width={w * 0.84} height={h * 0.14} fill="none" stroke="#f8fafc" strokeWidth="3" />
             {/* Goal Area (6 yards / smaller box) */}
             <rect x={w * 0.26} y={h * 0.06} width={w * 0.48} height={h * 0.08} fill="none" stroke="#f8fafc" strokeWidth="3" />
             

             {/* BOTTOM GOAL AREA - Clean simple boxes */}
             {/* Penalty Area (18 yards / larger box) */}
             <rect x={w * 0.08} y={h * 0.83} width={w * 0.84} height={h * 0.14} fill="none" stroke="#f8fafc" strokeWidth="3" />
             {/* Goal Area (6 yards / smaller box) */}
             <rect x={w * 0.26} y={h * 0.86} width={w * 0.48} height={h * 0.08} fill="none" stroke="#f8fafc" strokeWidth="3" />
             
             {/* Drawn tactical lines */}
             {lines.map((l, i) => (
               <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke="#fde047" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" markerEnd="url(#arrow)" />
             ))}

             {/* Drawing preview */}
             {drawing && (
               <line x1={drawing.x1} y1={drawing.y1} x2={drawing.x2} y2={drawing.y2} stroke="#fde047" strokeWidth="4.5" strokeLinecap="round" strokeDasharray="6 4" opacity="0.7" />
             )}
           </svg>

           {/* Player tokens */}
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

     {/* Bottom Sheet Overlay */}
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

     {/* Bottom Sheet */}
     <div 
       style={{ 
         position: "fixed", 
         bottom: 0, 
         left: 0, 
         right: 0, 
         background: "#1e2937", 
         borderTopLeftRadius: "24px", 
         borderTopRightRadius: "24px", 
         maxHeight: "85vh", 
         overflowY: "auto", 
         zIndex: 210,
         borderTop: "2px solid #334155",
         transform: sheetOpen ? "translateY(0)" : "translateY(100%)",
         transition: "transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)",
         animation: sheetOpen ? "slideUp 0.3s cubic-bezier(0.32, 0.72, 0, 1)" : "none",
         boxShadow: "0 -10px 40px rgba(0,0,0,0.5)"
       }}
     >
       {/* Handle bar */}
       <div style={{ padding: "14px", display: "flex", justifyContent: "center" }}>
         <div style={{ width: "50px", height: "5px", background: "#475569", borderRadius: "2.5px" }} />
       </div>

       {/* Sheet content */}
       <div style={{ padding: "0 24px 40px" }}>
         <div style={{ marginBottom: "28px" }}>
           <div style={{ color: "#f1f5f9", fontSize: "32px", fontWeight: "900", marginBottom: "10px" }}>
             {selectedPos && FORMATION.find(f => f.id === selectedPos)?.label}
           </div>
           <div style={{ color: "#94a3b8", fontSize: "18px", fontWeight: "500" }}>
             Pick a player from your squad
           </div>
         </div>

         {/* Player grid - larger buttons */}
         <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(165px, 1fr))", gap: "16px", marginBottom: "28px" }}>
           {squad.map((player, idx) => {
             const isAssigned = Object.values(assigned).includes(player);
             return (
               <button
                 key={idx}
                 onClick={() => {
                   if (!isAssigned) assignPlayer(player);
                 }}
                 style={{
                   padding: "22px 16px",
                   background: isAssigned ? "#1f2937" : assigned[selectedPos] === player ? "#fde047" : "#334155",
                   color: assigned[selectedPos] === player ? "#111" : isAssigned ? "#64748b" : "#f1f5f9",
                   border: "2.5px solid " + (assigned[selectedPos] === player ? "#fde047" : "#475569"),
                   borderRadius: "14px",
                   fontWeight: "700",
                   fontSize: "18px",
                   cursor: isAssigned ? "not-allowed" : "pointer",
                   transition: "all 0.25s ease",
                   opacity: isAssigned ? 0.5 : 1,
                   textDecoration: isAssigned ? "line-through" : "none",
                   boxShadow: assigned[selectedPos] === player ? "0 0 20px rgba(253, 224, 71, 0.4)" : "none"
                 }}
                 onMouseOver={(e) => {
                   if (!isAssigned) {
                     e.target.style.background = "#475569";
                     e.target.style.transform = "translateY(-3px)";
                     e.target.style.boxShadow = "0 8px 20px rgba(0,0,0,0.3)";
                   }
                 }}
                 onMouseOut={(e) => {
                   if (!isAssigned) {
                     e.target.style.background = "#334155";
                     e.target.style.transform = "translateY(0)";
                     e.target.style.boxShadow = "none";
                   }
                 }}
               >
                 {player}
               </button>
             );
           })}
         </div>

         {/* Info box */}
         <div style={{ padding: "18px", background: "linear-gradient(135deg, #0f172a 0%, #1a1f35 100%)", borderRadius: "14px", color: "#cbd5e1", fontSize: "14px", lineHeight: "1.7", border: "1px solid #334155" }}>
           <div style={{ marginBottom: "10px" }}>💡 <strong>Tip:</strong> Already assigned players appear grayed out. Click outside to close.</div>
           <div>Drag players on the pitch to reposition them, or click to change assignments.</div>
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