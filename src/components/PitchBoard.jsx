import { useState } from 'react';
import Draggable from 'react-draggable';

export default function PitchBoard({ team }) {
  const [lines, setLines] = useState([]);
  const [current, setCurrent] = useState(null);

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

  return (
    <div
      className="page"
      style={{
        padding: '20px',
        color: '#f1f5f9',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <h2
        style={{
          marginBottom: '12px',
          fontWeight: 600,
          letterSpacing: '0.5px',
        }}
      >
        {team.name}
      </h2>

      {/* Pitch Container */}
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
              top: `${(i * 10)}%`,
              left: 0,
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

        {/* Arrow Drawing Layer */}
        <svg
          className="overlay"
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

        {/* Players */}
        {team.starters.map((p) => (
          <Draggable
            key={p.id}
            defaultPosition={{ x: p.x, y: p.y }}
            bounds="parent"
          >
            <div
              className="player"
              style={{
                position: 'absolute',
                padding: '10px 16px',
                borderRadius: '999px',
                background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
                color: '#fff',
                fontWeight: 600,
                fontSize: '14px',
                boxShadow: '0 6px 14px rgba(0,0,0,0.45)',
                cursor: 'grab',
                userSelect: 'none',
                transition: 'transform 0.15s ease',
              }}
              onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
              onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              {p.name}
            </div>
          </Draggable>
        ))}
      </div>

      {/* Subs */}
      <h3
        style={{
          marginTop: '20px',
          marginBottom: '8px',
          fontWeight: 600,
        }}
      >
        Substitutes
      </h3>

      <div
        className="players"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        {team.subs.map((s, i) => (
          <span
            key={i}
            className="pill"
            style={{
              padding: '6px 12px',
              background: '#1e293b',
              borderRadius: '999px',
              color: '#e2e8f0',
              fontSize: '13px',
              fontWeight: 500,
            }}
          >
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}
