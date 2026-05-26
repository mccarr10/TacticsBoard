import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import Draggable from "react-draggable";

const squad = [
  "John",
  "Lucas",
  "Alex",
  "Ronan",
  "Ruairi",
  "Jules",
  "Robbie",
  "Fionn",
  "Josh",
  "Sam",
  "Mason",
  "Marcel",
  "Alan",
  "Darragh",
  "Sonny",
  "Charlie",
  "Cian",
];

const oppositionLabels = ["GK", "LB", "RB", "CM", "LW", "RW", "ST"];

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

const JerseyIcon = ({
  size = 52,
  color = "white",
  striped = false,
  opacity = 1,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ opacity }}
  >
    <path
      d="M16 8 L24 4 L40 4 L48 8 L56 20 L48 28 L48 56 L16 56 L16 28 L8 20 Z"
      fill={color}
      stroke="#111"
      strokeWidth="4"
    />

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

export default function TacticalBoard() {
  const wrapperRef = useRef(null);
  const pitchRef = useRef(null);

  const [dims, setDims] = useState({ w: 0, h: 0 });
  const [formationKey, setFormationKey] = useState("2-3-1");

  const [assigned, setAssigned] = useState({});
  const [selectedPos, setSelectedPos] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const [players, setPlayers] = useState([]);
  const [oppositionPlayers, setOppositionPlayers] = useState([]);

  const [showOpposition, setShowOpposition] = useState(true);
  const [oppositionOpacity, setOppositionOpacity] = useState(0.85);

  const formation = useMemo(
    () => formations[formationKey],
    [formationKey]
  );

  const measure = useCallback(() => {
    if (!wrapperRef.current) return;

    const container = wrapperRef.current;

    const availableWidth = container.clientWidth;
    const availableHeight = container.clientHeight;

    const aspectRatio = 1.6;

    let w = availableWidth * 0.95;
    let h = w * aspectRatio;

    if (h > availableHeight * 0.95) {
      h = availableHeight * 0.95;
      w = h / aspectRatio;
    }

    w = Math.round(w);
    h = Math.round(h);

    setDims((prev) => {
      if (prev.w === w && prev.h === h) {
        return prev;
      }

      return { w, h };
    });
  }, []);

  useEffect(() => {
    measure();

    const observer = new ResizeObserver(() => {
      requestAnimationFrame(measure);
    });

    if (wrapperRef.current) {
      observer.observe(wrapperRef.current);
    }

    return () => observer.disconnect();
  }, [measure]);

  useEffect(() => {
    if (!dims.w || !dims.h) return;

    const newPlayers = formation.map((p) => ({
      ...p,
      x: p.xPct * dims.w,
      y: p.yPct * dims.h,
    }));

    const mirrored = formation.map((p) => ({
      ...p,
      id: `OPP_${p.id}`,
      x: (1 - p.xPct) * dims.w,
      y: (1 - p.yPct) * dims.h,
    }));

    setPlayers(newPlayers);
    setOppositionPlayers(mirrored);
  }, [formation, dims]);

  const jerseySize = Math.max(44, Math.min(72, dims.w * 0.085));
  const fontSize = Math.max(10, Math.min(16, dims.w * 0.018));
  const tokenWidth = jerseySize + 12;
  const isMobile = dims.w < 700;

  return (
    <div
      style={{
        width: "100vw",
        height: "100dvh",
        background: "#020617",
        position: "fixed",
        inset: 0,
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
      }}
    >
      <div
        style={{
          height: isMobile ? "120px" : "88px",
          padding: "20px 24px",
          background:
            "linear-gradient(135deg, #1e2937 0%, #0f172a 100%)",
          borderBottom: "2px solid #334155",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
          zIndex: 100,
        }}
      >
        <div>
          <div
            style={{
              color: "#f1f5f9",
              fontSize: isMobile ? "30px" : "22px",
              fontWeight: "950",
            }}
          >
            Tactical Board
          </div>

          <div
            style={{
              color: "#cbd5e1",
              fontSize: isMobile ? "16px" : "13px",
              marginTop: "6px",
              fontWeight: "600",
            }}
          >
            7-a-side • Academy Planner
          </div>
        </div>

        <select
          value={formationKey}
          onChange={(e) => setFormationKey(e.target.value)}
          style={{
            padding: "18px 24px",
            borderRadius: "18px",
            background: "#334155",
            color: "white",
            border: "2px solid #475569",
            fontWeight: "800",
          }}
        >
          {Object.keys(formations).map((f) => (
            <option key={f}>{f}</option>
          ))}
        </select>
      </div>

      <div
        ref={wrapperRef}
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "12px",
          overflow: "hidden",
        }}
      >
        {dims.w > 0 && (
          <div
            ref={pitchRef}
            style={{
              width: `${dims.w}px`,
              height: `${dims.h}px`,
              borderRadius: "20px",
              overflow: "hidden",
              position: "relative",
              border: "4px solid #e2e8f0",
              background: "#166534",
            }}
          >
            {players.map((pos) => (
              <Draggable
                key={pos.id}
                position={{
                  x: pos.x - jerseySize / 2,
                  y: pos.y - jerseySize / 2,
                }}
                bounds="parent"
              >
                <div
                  className="player-token"
                  style={{
                    position: "absolute",
                    width: `${tokenWidth}px`,
                    textAlign: "center",
                    cursor: "grab",
                    zIndex: 20,
                  }}
                >
                  <JerseyIcon
                    size={jerseySize}
                    color={
                      assigned[pos.id]
                        ? "#fde047"
                        : "#f8fafc"
                    }
                  />

                  <div
                    style={{
                      color: "#fff",
                      fontWeight: "800",
                      fontSize: `${fontSize}px`,
                      marginTop: "8px",
                    }}
                  >
                    {assigned[pos.id] ||
                      pos.label.split(" ")[0]}
                  </div>
                </div>
              </Draggable>
            ))}

            {showOpposition &&
              oppositionPlayers.map((pos, index) => (
                <Draggable
                  key={pos.id}
                  position={{
                    x: pos.x - jerseySize / 2,
                    y: pos.y - jerseySize / 2,
                  }}
                  bounds="parent"
                >
                  <div
                    style={{
                      position: "absolute",
                      width: `${tokenWidth}px`,
                      textAlign: "center",
                    }}
                  >
                    <JerseyIcon
                      size={jerseySize}
                      color="#ef4444"
                      striped
                      opacity={oppositionOpacity}
                    />

                    <div
                      style={{
                        color: "#fff",
                        fontWeight: "800",
                        fontSize: `${fontSize}px`,
                        marginTop: "8px",
                      }}
                    >
                      {oppositionLabels[index] || "Opp"}
                    </div>
                  </div>
                </Draggable>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}