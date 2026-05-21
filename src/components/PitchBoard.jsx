import { useState } from 'react';
import Draggable from 'react-draggable';

// --- FORMATION TEMPLATE (GK - 2 DEF - 3 MID - 1 STR) ---
const formationTemplate = [
  { role: 'GK', x: 450, y: 700 },
  { role: 'DEF', x: 250, y: 520 },
  { role: 'DEF', x: 650, y: 520 },
  { role: 'MID', x: 200, y: 330 },
  { role: 'MID', x: 450, y: 330 },
  { role: 'MID', x: 700, y: 330 },
  { role: 'STR', x: 450, y: 150 },
];

export default function PitchBoard({ team }) {
  const [lines, setLines] = useState([]);
  const [current, setCurrent] = useState(null);

  // --- FORCE EXACTLY 7 STARTERS IN FORMATION ---
  const starters = team.starters.slice(0, 7).map((p, i) => ({
    ...p,
    role: formationTemplate[i].role,
    x: formationTemplate[i].x,
    y: formationTemplate[i].y,
  }));

  // --- ARROW DRAWING ---
  const start = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    setCurrent({
      x1: e.clientX - r.left,
      y1: e.clientY - r.top,
      x2: e.clientX - r.left,
      y2: e.clientY - r.top,
    });
  };

  const move = (e) => {
    if (!current) return;
    const r = e.currentTarget.getBoundingClientRect();
    setCurrent({
      ...current,
      x2: e.clientX - r.left,
      y2: e.clientY - r.top,
    });
  };

  const end = () => {
    if (current) setLines([...lines, current]);
    setCurrent(null);
  };

  // --- CLEAR + UNDO ---
  const undoArrow = () => setLines(lines.slice(0, -1));
  const clearArrows = () => setLines([]);

  return (
    <div
      className="page"
      style={{
        padding: '20px',
        color: '#f1f5f9',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <h2 style={{ marginBottom: '12px', fontWeight: 600 }}>
        {team.name} — 7‑Player Formation
      </h2>

      {/* --- TOOLBAR --- */}
      <div style={{ marginBottom: '10px', display: 'flex', gap: '10px' }}>
        <button
          onClick={undoArrow}
          style={{
            padding: '8px 14px',
            background: '#334155',
            color: '#fff',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Undo Arrow
        </button>

        <button
          onClick={clearArrows}
          style={{
            padding: '8px 14px',
            background: '#b91c1c',
            color: '#fff',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Clear All Arrows
        </button>
      </div>

      {/* --- PITCH --- */}
      <div
        className="pitch"
        onMouseDown={start}
        onMouseMove={move}
        onMouseUp={end}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '900px',
          aspectRatio: '16/9',
          margin: '0 auto 20px auto',
          borderRadius: '16px',
          overflow: 'hidden',
          background: '#14532d',
          boxShadow: '0 18px 45px rgba(0,0,0,0.45)',
        }}
      >
        {/* Grass stripes */}
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: `${i * 10}%`,
              width: '100%',
              height: '10%',
              background: i % 2 === 0 ? '#166534' : '#15803d',
            }}
          />
        ))}

        {/* Pitch Lines */}
        <svg
          width="100%"
          height="100%"
          style={{ position: 'absolute', top: 0, left: 0 }}
        >
          <rect
            x="2%"
            y="2%"
            width="96%"
            height="96%"
            fill="none"
            stroke="#ffffff"
            strokeWidth="3"
          />
          <line
            x1="50%"
            y1="2%"
            x2="50%"
            y2="98%"
            stroke="#ffffff"
            strokeWidth="3"
          />
          <circle
            cx="50%"
            cy="50%"
            r="6%"
            stroke="#ffffff"
            strokeWidth="3"
            fill="none"
          />
        </svg>

        {/* Arrow Layer */}
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
          }}
        >
          <defs>
            <marker
              id="arrow"
              markerWidth="10"
              markerHeight="10"
              refX="8"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 10 3, 0 6" fill="#f43f5e" />
            </marker>
          </defs>

          {lines.map((l, i) => (
            <line
              key={i}
              x1={l.x1}
              y1={l.y1}
              x2={l.x2}
              y2={l.y2}
              stroke="#f43f5e"
              strokeWidth="4"
              markerEnd="url(#arrow)"
            />
          ))}

          {current && (
            <line
              x1={current.x1}
              y1={current.y1}
              x2={current.x2}
              y2={current.y2}
              stroke="orange"
              strokeWidth="4"
              markerEnd="url(#arrow)"
            />
          )}
        </svg>

        {/* --- PLAYERS (PERSON ICON + NAME + ROLE) --- */}
        {starters.map((p) => (
          <Draggable
            key={p.id}
            defaultPosition={{ x: p.x, y: p.y }}
            bounds="parent"
          >
            <div
              style={{
                position: 'absolute',
                textAlign: 'center',
                color: '#fff',
                cursor: 'grab',
                userSelect: 'none',
              }}
            >
              {/* Person Icon */}
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="#fff"
                style={{
                  filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.4))',
                }}
              >
                <circle cx="12" cy="6" r="4" />
                <path d="M12 10c-4 0-7 3-7 7v3h14v-3c0-4-3-7-7-7z" />
              </svg>

              {/* Name */}
              <div style={{ fontWeight: 600, fontSize: '14px' }}>{p.name}</div>

              {/* Role */}
              <div style={{ fontSize: '11px', opacity: 0.8 }}>{p.role}</div>
            </div>
          </Draggable>
        ))}
      </div>

      {/* Subs */}
      <h3 style={{ marginTop: '20px', marginBottom: '8px', fontWeight: 600 }}>
        Substitutes
      </h3>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {team.subs.map((s, i) => (
          <span
            key={i}
            style={{
              padding: '6px 12px',
              background: '#1e293b',
              borderRadius: '999px',
              color: '#e2e8f0',
              fontSize: '13px',
            }}
          >
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}
