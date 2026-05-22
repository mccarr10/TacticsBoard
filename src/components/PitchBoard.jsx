import { useState, useRef, useEffect, useCallback } from "react";
import Draggable from "react-draggable";

const squad = ["John","Lucas","Alex","Ronan","Ruairi","Jules","Robbie","Fionn","Josh","Sam","Mason","Marcel","Alan","Darragh","Sonny","Charlie","Cian"];

const JerseyIcon = ({ size = 52, color = "white" }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 8 L24 4 L40 4 L48 8 L56 20 L48 28 L48 56 L16 56 L16 28 L8 20 Z" fill={color} stroke="#111" strokeWidth="4"/>
    <rect x="22" y="4" width="6" height="52" fill="#111"/>
    <rect x="36" y="4" width="6" height="52" fill="#111"/>
  </svg>
);

const FORMATION = [
  { id: "GK", label: "Goalkeeper", xPct: 0.50, yPct: 0.88 },
  { id: "DEF1", label: "Defender 1", xPct: 0.27, yPct: 0.68 },
  { id: "DEF2", label: "Defender 2", xPct: 0.73, yPct: 0.68 },
  { id: "CM", label: "Central Mid", xPct: 0.50, yPct: 0.48 },
  { id: "WM1", label: "Wide Mid 1", xPct: 0.14, yPct: 0.36 },
  { id: "WM2", label: "Wide Mid 2", xPct: 0.86, yPct: 0.36 },
  { id: "STR", label: "Striker", xPct: 0.50, yPct: 0.16 },
];

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

    let w = Math.min(aw * 0.97, 650);
    let h = w * 1.48; // Taller for better iPhone usage

    setDims({ w, h });
    setPlayers(FORMATION.map(p => ({ ...p, x: p.xPct * w, y: p.yPct * h })));
    setReady(true);
  }, []);

  useEffect(() => { measure(); const ro = new ResizeObserver(measure); if (wrapperRef.current) ro.observe(wrapperRef.current); return () => ro.disconnect(); }, [measure]);

  // ... keep your existing onDrawStart, onDrawMove, onDrawEnd, drag handlers ...

  const { w, h } = dims;
  const jerseySize = Math.max(68, Math.min(98, w * 0.17));
  const fontSize = Math.max(13.5, Math.min(17, w * 0.044));
  const tokenWidth = jerseySize + 30;

  return (
    <div style={{width:"100vw", height:"100dvh", background:"#020617", position:"fixed", inset:0, display:"flex", justifyContent:"center", alignItems:"center"}}>
      <div style={{width:"100%", height:"100%", maxWidth:"680px", background:"#0f172a", display:"flex", flexDirection:"column", position:"relative"}}>
        
        {/* Header */}
        <div style={{height:"88px", padding:"16px 20px 12px", background:"#1e2937", borderBottom:"1px solid #334155", display:"flex", alignItems:"center", justifyContent:"space-between"}}>
          <div>
            <div style={{color:"#f1f5f9", fontSize:"27px", fontWeight:"900"}}>Tactical Board</div>
            <div style={{color:"#94a3b8", fontSize:"14px"}}>7-a-side • Academy Planner</div>
          </div>
          <div style={{display:"flex", gap:"8px"}}>
            <button onClick={() => setLines(l => l.slice(0,-1))} style={{width:"48px",height:"48px",borderRadius:"14px",background:"#334155",color:"white",fontSize:"22px",border:"none"}}>↩</button>
            <button onClick={() => {setLines([]); setAssigned({}); measure();}} style={{width:"48px",height:"48px",borderRadius:"14px",background:"#7f1d1d",color:"white",fontSize:"20px",border:"none"}}>⟳</button>
          </div>
        </div>

        {/* Pitch */}
        <div ref={wrapperRef} style={{flex:1, display:"flex", justifyContent:"center", alignItems:"center", padding:"10px"}}>
          {ready && w > 0 && (
            <div ref={pitchRef} style={{width:`${w}px`, height:`${h}px`, borderRadius:"20px", overflow:"hidden", position:"relative", border:"4px solid #e2e8f0", boxShadow:"0 25px 70px rgba(0,0,0,0.65)"}} onMouseDown={onDrawStart} onMouseMove={onDrawMove} onMouseUp={onDrawEnd} onTouchStart={onDrawStart} onTouchMove={onDrawMove} onTouchEnd={onDrawEnd}>
              
              {/* Grass */}
              {[...Array(18)].map((_,i) => <div key={i} style={{position:"absolute", top:`${i*(100/18)}%`, width:"100%", height:`${100/18}%`, background: i%2===0 ? "#16a34a" : "#15803d"}} />)}

              <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{position:"absolute", inset:0}}>
                <rect x="4%" y="3%" width="92%" height="94%" fill="none" stroke="#f8fafc" strokeWidth="6" />

                <line x1="4%" y1="50%" x2="96%" y2="50%" stroke="#f8fafc" strokeWidth="4" />
                <circle cx="50%" cy="50%" r="13.8%" fill="none" stroke="#f8fafc" strokeWidth="4" />

                {/* Top Goal (Attacking) */}
                <rect x="4%" y="5%" width="29%" height="23%" fill="none" stroke="#f8fafc" strokeWidth="3.8" />
                <rect x="8.5%" y="9.5%" width="18%" height="14%" fill="none" stroke="#f8fafc" strokeWidth="3.8" />
                <line x1="96%" y1="14.5%" x2="96%" y2="27%" stroke="#f8fafc" strokeWidth="9" strokeLinecap="round" />

                {/* Bottom Goal (Defensive) */}
                <rect x="4%" y="72%" width="29%" height="23%" fill="none" stroke="#f8fafc" strokeWidth="3.8" />
                <rect x="8.5%" y="76.5%" width="18%" height="14%" fill="none" stroke="#f8fafc" strokeWidth="3.8" />
                <line x1="4%" y1="73%" x2="4%" y2="85.5%" stroke="#f8fafc" strokeWidth="9" strokeLinecap="round" />

                {/* Drawn Lines */}
                {lines.map((l,i) => <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke="#fde047" strokeWidth="5.5" strokeLinecap="round" markerEnd="url(#arrow)" />)}
                {drawing && <line x1={drawing.x1} y1={drawing.y1} x2={drawing.x2} y2={drawing.y2} stroke="#fde047" strokeWidth="5.5" strokeDasharray="8 5" />}
              </svg>

              {/* Players */}
              {players.map(pos => (
                <Draggable key={pos.id} position={{x: pos.x - jerseySize/2, y: pos.y - jerseySize/2}} bounds="parent" onStart={e=>onPlayerPointerDown(pos.id,e)} onDrag={e=>onDragMove(pos.id,e)} onStop={(e,data)=>onDragStop(pos.id,e,data)}>
                  <div className="player-token" style={{position:"absolute", width:`${tokenWidth}px`, textAlign:"center", cursor:"grab", zIndex:20}}>
                    <JerseyIcon size={jerseySize} color={assigned[pos.id] ? "#fde047" : "#f8fafc"} />
                    <div style={{color:"#f8fafc", fontWeight:"800", fontSize:`${fontSize}px`, marginTop:"6px"}}>{assigned[pos.id] || pos.label}</div>
                  </div>
                </Draggable>
              ))}
            </div>
          )}
        </div>

        {/* Your Bottom Sheet Code Here */}
      </div>
    </div>
  );
}