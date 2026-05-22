import { useState } from "react";
import Draggable from "react-draggable";

// — FULL SQUAD LIST —
const squad = [
 "John","Lucas","Alex","Ronan","Ruairi","Jules","Robbie",
 "Fionn","Josh","Sam","Mason","Marcel","Alan","Darragh","Sonny","Charlie","Cian"
];

// — JERSEY SVG —
const JerseyIcon = ({ isOpposition }) => (
 <svg width="36" height="36" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
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

// — FORMATION: 1-2-1-2-1 matching the image layout —
const initialFormation = [
 { id: "GK",   label: "Goalkeeper",         xPct: 50,  yPct: 82 },
 { id: "DEF1", label: "Defender 1",         xPct: 30,  yPct: 66 },
 { id: "DEF2", label: "Defender 2",         xPct: 60,  yPct: 66 },
 { id: "CM",   label: "Central Midfielder", xPct: 50,  yPct: 50 },
 { id: "WM1",  label: "Wide Midfielder 1",  xPct: 18,  yPct: 36 },
 { id: "WM2",  label: "Wide Midfielder 2",  xPct: 72,  yPct: 36 },
 { id: "STR",  label: "Striker",            xPct: 45,  yPct: 20 },
];

export default function PitchBoard() {
 const [assigned, setAssigned] = useState({});
 const [selectedPos, setSelectedPos] = useState(null);
 const [lines, setLines] = useState([]);
 const [current, setCurrent] = useState(null);
 const [formation, setFormation] = useState(initialFormation);
 const [pitchSize, setPitchSize] = useState({ w: 360, h: 560 });

 const pitchRef = (el) => {
   if (el) {
     const rect = el.getBoundingClientRect();
     if (rect.width > 0) setPitchSize({ w: rect.width, h: rect.height });
   }
 };

 const assignPlayer = (player) => {
   if (!selectedPos) return;
   setAssigned({ ...assigned, [selectedPos]: player });
   setSelectedPos(null);
 };

 const start = (e) => {
   const r = e.currentTarget.getBoundingClientRect();
   setCurrent({
     x1: e.clientX - r.left, y1: e.clientY - r.top,
     x2: e.clientX - r.left, y2: e.clientY - r.top
   });
 };

 const move = (e) => {
   if (!current) return;
   const r = e.currentTarget.getBoundingClientRect();
   setCurrent({ ...current, x2: e.clientX - r.left, y2: e.clientY - r.top });
 };

 const end = () => {
   if (current) setLines([...lines, current]);
   setCurrent(null);
 };

 const undoArrow = () => setLines(lines.slice(0, -1));
 const clearArrows = () => setLines([]);

 const handleDrag = (posId, data, pitchW, pitchH) => {
   setFormation(formation.map((pos) =>
     pos.id === posId
       ? { ...pos, xPct: (data.x / pitchW) * 100, yPct: (data.y / pitchH) * 100 }
       : pos
   ));
 };

 return (
   <div style={{ display: "flex", height: "100vh", fontFamily: "'Segoe UI', sans-serif", background: "#0f172a" }}>

     {/* Sidebar */}
     <div style={{
       width: "200px", background: "#1e293b", color: "white",
       padding: "12px", overflowY: "auto", borderRight: "3px solid #0f172a",
       flexShrink: 0
     }}>
       <h2 style={{ marginBottom: "10px", fontSize: "16px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px" }}>
         Squad List
       </h2>

       {selectedPos && (
         <div style={{
           background: "#facc15", color: "black", padding: "8px",
           borderRadius: "8px", marginBottom: "10px", fontWeight: "bold",
           textAlign: "center", fontSize: "13px"
         }}>
           Assigning: {selectedPos}
         </div>
       )}

       {squad.map((player) => (
         <div
           key={player}
           onClick={() => assignPlayer(player)}
           style={{
             background: "#334155", borderRadius: "8px", marginBottom: "6px",
             padding: "6px 8px", cursor: "pointer", display: "flex",
             alignItems: "center", gap: "8px", fontSize: "14px",
             border: "1px solid #475569", transition: "background 0.15s"
           }}
           onMouseEnter={e => e.currentTarget.style.background = "#475569"}
           onMouseLeave={e => e.currentTarget.style.background = "#334155"}
         >
           <JerseyIcon />
           {player}
         </div>
       ))}
     </div>

     {/* Main area */}
     <div style={{
       flex: 1, padding: "12px", display: "flex",
       flexDirection: "column", alignItems: "center", overflow: "hidden"
     }}>
       <h2 style={{ marginBottom: "8px", fontSize: "18px", color: "white" }}>7-Player Formation</h2>

       <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
         <button onClick={undoArrow} style={{
           padding: "7px 14px", background: "#334155", color: "white",
           borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "13px"
         }}>Undo Arrow</button>
         <button onClick={clearArrows} style={{
           padding: "7px 14px", background: "#b91c1c", color: "white",
           borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "13px"
         }}>Clear All Arrows</button>
       </div>

       {/* Pitch wrapper */}
       <div style={{ flex: 1, width: "100%", display: "flex", justifyContent: "center", alignItems: "flex-start" }}>
         <div style={{ position: "relative", width: "min(100%, 420px)", aspectRatio: "3/4" }}>

           {/* The actual pitch */}
           <div
             ref={pitchRef}
             onMouseDown={start}
             onMouseMove={move}
             onMouseUp={end}
             style={{
               position: "absolute", inset: 0,
               borderRadius: "10px",
               overflow: "hidden",
               boxShadow: "0 12px 40px rgba(0,0,0,0.5)"
             }}
           >
             {/* Grass stripes */}
             {[...Array(14)].map((_, i) => (
               <div key={i} style={{
                 position: "absolute",
                 top: `${i * (100 / 14)}%`,
                 width: "100%",
                 height: `${100 / 14}%`,
                 background: i % 2 === 0 ? "#3a8a3a" : "#2d7a2d"
               }} />
             ))}

             {/* Pitch markings SVG */}
             <svg
               style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
               viewBox="0 0 300 400"
               preserveAspectRatio="none"
             >
               {/* Outer boundary */}
               <rect x="14" y="14" width="272" height="372" fill="none" stroke="white" strokeWidth="2.5" />

               {/* Halfway line */}
               <line x1="14" y1="200" x2="286" y2="200" stroke="white" strokeWidth="2" />

               {/* Centre circle */}
               <circle cx="150" cy="200" r="38" fill="none" stroke="white" strokeWidth="2" />
               {/* Centre spot */}
               <circle cx="150" cy="200" r="2.5" fill="white" />

               {/* TOP penalty area - Large box */}
               <rect x="62" y="14" width="176" height="70" fill="none" stroke="white" strokeWidth="2" />
               {/* TOP penalty area - Small box */}
               <rect x="104" y="14" width="92" height="30" fill="none" stroke="white" strokeWidth="2" />
               {/* TOP goal */}
               <rect x="122" y="8" width="56" height="10" fill="none" stroke="white" strokeWidth="2" />
               {/* TOP penalty spot */}
               <circle cx="150" cy="60" r="2" fill="white" />
               {/* TOP penalty arc */}
               <path d="M 118 84 A 38 38 0 0 1 182 84" fill="none" stroke="white" strokeWidth="2" />

               {/* BOTTOM penalty area - Large box */}
               <rect x="62" y="316" width="176" height="70" fill="none" stroke="white" strokeWidth="2" />
               {/* BOTTOM penalty area - Small box */}
               <rect x="104" y="356" width="92" height="30" fill="none" stroke="white" strokeWidth="2" />
               {/* BOTTOM goal */}
               <rect x="122" y="382" width="56" height="10" fill="none" stroke="white" strokeWidth="2" />
               {/* BOTTOM penalty spot */}
               <circle cx="150" cy="340" r="2" fill="white" />
               {/* BOTTOM penalty arc */}
               <path d="M 118 316 A 38 38 0 0 0 182 316" fill="none" stroke="white" strokeWidth="2" />

               {/* User-drawn arrows */}
               {lines.map((l, i) => (
                 <line
                   key={i}
                   x1={(l.x1 / (pitchSize.w || 300)) * 300}
                   y1={(l.y1 / (pitchSize.h || 400)) * 400}
                   x2={(l.x2 / (pitchSize.w || 300)) * 300}
                   y2={(l.y2 / (pitchSize.h || 400)) * 400}
                   stroke="#facc15" strokeWidth="2.5"
                   markerEnd="url(#arrow)"
                 />
               ))}
               {current && (
                 <line
                   x1={(current.x1 / (pitchSize.w || 300)) * 300}
                   y1={(current.y1 / (pitchSize.h || 400)) * 400}
                   x2={(current.x2 / (pitchSize.w || 300)) * 300}
                   y2={(current.y2 / (pitchSize.h || 400)) * 400}
                   stroke="#facc15" strokeWidth="2.5" strokeDasharray="6 3"
                   markerEnd="url(#arrow)"
                 />
               )}
               <defs>
                 <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                   <path d="M0,0 L6,3 L0,6 Z" fill="#facc15" />
                 </marker>
               </defs>
             </svg>

             {/* Players */}
             {formation.map((pos) => {
               const xPx = (pos.xPct / 100) * (pitchSize.w || 300) - 18;
               const yPx = (pos.yPct / 100) * (pitchSize.h || 400) - 18;
               return (
                 <Draggable
                   key={pos.id}
                   position={{ x: xPx, y: yPx }}
                   bounds="parent"
                   onStop={(e, data) => handleDrag(pos.id, { x: data.x + 18, y: data.y + 18 }, pitchSize.w || 300, pitchSize.h || 400)}
                 >
                   <div
                     onClick={() => setSelectedPos(pos.id)}
                     style={{
                       position: "absolute",
                       textAlign: "center",
                       cursor: "pointer",
                       width: "54px",
                       transform: selectedPos === pos.id ? "scale(1.15)" : "scale(1)",
                       transition: "transform 0.15s",
                       filter: selectedPos === pos.id ? "drop-shadow(0 0 6px #facc15)" : "none"
                     }}
                   >
                     <JerseyIcon />
                     <div style={{
                       color: "white",
                       fontWeight: "bold",
                       fontSize: "10px",
                       marginTop: "2px",
                       textShadow: "1px 1px 3px #000",
                       whiteSpace: "nowrap"
                     }}>
                       {assigned[pos.id] || pos.label}
                     </div>
                   </div>
                 </Draggable>
               );
             })}
           </div>
         </div>
       </div>
     </div>
   </div>
 );
}
