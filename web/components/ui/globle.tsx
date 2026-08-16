"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GlobeProps {
  /** Accent color for arcs and active dots (hex). Default: #c97955 */
  accentColor?: string;
  /** Second accent (for arcs on the other hemisphere). Default: #7C8AF7 */
  accentColor2?: string;
  /** CSS size of the globe container (width & height). Default: 480px */
  size?: number;
  /** Show a privacy shield overlay mode */
  shieldMode?: boolean;
  className?: string;
}

// ─── Seeded pseudo-random (stable across SSR/client) ─────────────────────────

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

// ─── Project lon/lat → SVG (x, y) on an ellipse ──────────────────────────────

function project(
  lon: number,
  lat: number,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  rotationDeg: number
): [number, number] {
  const r = (Math.PI / 180) * rotationDeg;
  const lonR = (Math.PI / 180) * lon;
  const latR = (Math.PI / 180) * lat;
  const rotatedLon = lonR + r;
  const x = cx + rx * Math.cos(latR) * Math.sin(rotatedLon);
  const y = cy - ry * Math.sin(latR);
  return [x, y];
}

// Is the point on the visible (front) hemisphere?
function isVisible(lon: number, lat: number, rotationDeg: number): boolean {
  const r = (Math.PI / 180) * rotationDeg;
  const lonR = (Math.PI / 180) * lon;
  const latR = (Math.PI / 180) * lat;
  return Math.cos(latR) * Math.cos(lonR + r) > 0;
}

// ─── Key city dots ────────────────────────────────────────────────────────────

const CITIES: { name: string; lon: number; lat: number; active?: boolean }[] = [
  { name: "New York",    lon: -74,  lat: 40.7, active: true  },
  { name: "London",      lon:  -0,  lat: 51.5, active: true  },
  { name: "Tokyo",       lon: 139,  lat: 35.7, active: true  },
  { name: "Sydney",      lon: 151,  lat: -33.9 },
  { name: "Dubai",       lon: 55.3, lat: 25.2, active: true  },
  { name: "São Paulo",   lon: -46.6, lat: -23.5 },
  { name: "Mumbai",      lon: 72.8, lat: 19.1 },
  { name: "Berlin",      lon: 13.4, lat: 52.5 },
  { name: "Singapore",   lon: 103.8, lat: 1.3, active: true  },
  { name: "Lagos",       lon: 3.4,  lat: 6.5  },
  { name: "Chicago",     lon: -87.6, lat: 41.9 },
  { name: "Toronto",     lon: -79.4, lat: 43.7 },
  { name: "Paris",       lon: 2.3,  lat: 48.9 },
  { name: "Beijing",     lon: 116.4, lat: 39.9, active: true },
  { name: "Cairo",       lon: 31.2, lat: 30.1 },
  { name: "Jakarta",     lon: 106.8, lat: -6.2 },
  { name: "Mexico City", lon: -99.1, lat: 19.4 },
  { name: "Seoul",       lon: 126.9, lat: 37.6 },
  { name: "Nairobi",     lon: 36.8,  lat: -1.3 },
  { name: "Oslo",        lon: 10.7,  lat: 59.9 },
];

// Arc connections between active cities
const ARCS: [string, string][] = [
  ["New York", "London"],
  ["London", "Dubai"],
  ["Dubai", "Singapore"],
  ["Singapore", "Tokyo"],
  ["Tokyo", "Beijing"],
  ["New York", "Tokyo"],
  ["London", "Beijing"],
  ["Dubai", "Tokyo"],
];

// ─── Globe Component ──────────────────────────────────────────────────────────

export const Globe = React.forwardRef<HTMLDivElement, GlobeProps>(
  (
    {
      accentColor = "#c97955",
      accentColor2 = "#7C8AF7",
      size = 480,
      shieldMode = false,
      className,
    },
    ref
  ) => {
    const [rotation, setRotation] = useState(0);
    const animFrameRef = useRef<number>(0);
    const lastTimeRef = useRef<number>(0);
    const rng = seededRandom(42);

    // Auto-rotate
    useEffect(() => {
      const animate = (time: number) => {
        if (lastTimeRef.current) {
          const delta = time - lastTimeRef.current;
          setRotation((r) => (r + delta * 0.012) % 360);
        }
        lastTimeRef.current = time;
        animFrameRef.current = requestAnimationFrame(animate);
      };
      animFrameRef.current = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(animFrameRef.current);
    }, []);

    const cx = size / 2;
    const cy = size / 2;
    const rx = size * 0.44;
    const ry = size * 0.44;

    // Generate background dots (stable seed)
    const bgDots: { lon: number; lat: number }[] = [];
    const tempRng = seededRandom(7);
    for (let i = 0; i < 280; i++) {
      bgDots.push({
        lon: tempRng() * 360 - 180,
        lat: tempRng() * 160 - 80,
      });
    }

    // Lat/lon grid lines
    const latLines = [-60, -30, 0, 30, 60];
    const lonLines = [-120, -60, 0, 60, 120];

    const cityMap = Object.fromEntries(CITIES.map((c) => [c.name, c]));

    // Build arc SVG path between two lon/lat points (curved through a midpoint)
    function arcPath(c1: (typeof CITIES)[0], c2: (typeof CITIES)[0]): string {
      const [x1, y1] = project(c1.lon, c1.lat, cx, cy, rx, ry, rotation);
      const [x2, y2] = project(c2.lon, c2.lat, cx, cy, rx, ry, rotation);
      // Midpoint elevated (for arc effect)
      const mx = (x1 + x2) / 2;
      const my = (y1 + y2) / 2 - size * 0.12;
      return `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`;
    }

    return (
      <div
        ref={ref}
        className={cn("relative select-none", className)}
        style={{ width: size, height: size }}
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ overflow: "visible" }}
        >
          <defs>
            {/* Sphere gradient */}
            <radialGradient id="globe-grad" cx="40%" cy="35%" r="65%">
              <stop offset="0%"   stopColor="#1a1a2e" />
              <stop offset="60%"  stopColor="#0d0d16" />
              <stop offset="100%" stopColor="#050508" />
            </radialGradient>

            {/* Atmosphere glow */}
            <radialGradient id="atmos-grad" cx="50%" cy="50%" r="50%">
              <stop offset="70%" stopColor={accentColor} stopOpacity="0" />
              <stop offset="100%" stopColor={accentColor} stopOpacity="0.18" />
            </radialGradient>

            {/* Arc gradient */}
            <linearGradient id="arc-grad-1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor={accentColor}  stopOpacity="0.9" />
              <stop offset="100%" stopColor={accentColor2} stopOpacity="0.7" />
            </linearGradient>

            {/* Clip to sphere */}
            <clipPath id="sphere-clip">
              <ellipse cx={cx} cy={cy} rx={rx} ry={ry} />
            </clipPath>

            {/* Shield mode overlay gradient */}
            {shieldMode && (
              <radialGradient id="shield-grad" cx="50%" cy="30%" r="70%">
                <stop offset="0%"   stopColor="#3DDC84" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#3DDC84" stopOpacity="0" />
              </radialGradient>
            )}
          </defs>

          {/* ── Atmosphere outer glow ── */}
          <ellipse cx={cx} cy={cy} rx={rx + size * 0.04} ry={ry + size * 0.04}
            fill="none"
            stroke={accentColor}
            strokeWidth="1"
            strokeOpacity="0.12"
          />
          <ellipse cx={cx} cy={cy} rx={rx + size * 0.07} ry={ry + size * 0.07}
            fill="none"
            stroke={accentColor}
            strokeWidth="0.5"
            strokeOpacity="0.06"
          />

          {/* ── Globe sphere ── */}
          <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="url(#globe-grad)" />
          <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="url(#atmos-grad)" />

          {/* ── Clipped content ── */}
          <g clipPath="url(#sphere-clip)">

            {/* Lat grid lines */}
            {latLines.map((lat) => {
              const points: string[] = [];
              for (let lon = -180; lon <= 180; lon += 4) {
                const [x, y] = project(lon, lat, cx, cy, rx, ry, rotation);
                points.push(`${lon === -180 ? "M" : "L"} ${x} ${y}`);
              }
              return (
                <path
                  key={`lat-${lat}`}
                  d={points.join(" ")}
                  stroke="rgba(255,255,255,0.04)"
                  strokeWidth="0.6"
                  fill="none"
                />
              );
            })}

            {/* Lon grid lines */}
            {lonLines.map((lon) => {
              const points: string[] = [];
              for (let lat = -80; lat <= 80; lat += 4) {
                const [x, y] = project(lon, lat, cx, cy, rx, ry, rotation);
                points.push(`${lat === -80 ? "M" : "L"} ${x} ${y}`);
              }
              return (
                <path
                  key={`lon-${lon}`}
                  d={points.join(" ")}
                  stroke="rgba(255,255,255,0.04)"
                  strokeWidth="0.6"
                  fill="none"
                />
              );
            })}

            {/* Background dots */}
            {bgDots.map((dot, i) => {
              if (!isVisible(dot.lon, dot.lat, rotation)) return null;
              const [x, y] = project(dot.lon, dot.lat, cx, cy, rx, ry, rotation);
              return (
                <circle
                  key={`dot-${i}`}
                  cx={x}
                  cy={y}
                  r={0.9}
                  fill="rgba(255,255,255,0.18)"
                />
              );
            })}

            {/* Arc connections */}
            {ARCS.map(([a, b], i) => {
              const c1 = cityMap[a];
              const c2 = cityMap[b];
              if (!c1 || !c2) return null;
              const v1 = isVisible(c1.lon, c1.lat, rotation);
              const v2 = isVisible(c2.lon, c2.lat, rotation);
              if (!v1 || !v2) return null;
              return (
                <path
                  key={`arc-${i}`}
                  d={arcPath(c1, c2)}
                  stroke="url(#arc-grad-1)"
                  strokeWidth="1.2"
                  fill="none"
                  strokeLinecap="round"
                  strokeOpacity="0.65"
                  strokeDasharray="4 3"
                />
              );
            })}

            {/* City dots */}
            {CITIES.map((city) => {
              if (!isVisible(city.lon, city.lat, rotation)) return null;
              const [x, y] = project(city.lon, city.lat, cx, cy, rx, ry, rotation);
              const color = city.active ? accentColor : "rgba(255,255,255,0.4)";
              const r = city.active ? 3.5 : 2;
              return (
                <g key={city.name}>
                  {city.active && (
                    <circle cx={x} cy={y} r={r + 4} fill={accentColor} fillOpacity="0.12" />
                  )}
                  <circle cx={x} cy={y} r={r} fill={color} />
                </g>
              );
            })}

            {/* Shield mode overlay */}
            {shieldMode && (
              <rect
                x={0} y={0} width={size} height={size}
                fill="url(#shield-grad)"
              />
            )}
          </g>

          {/* ── Specular highlight ── */}
          <ellipse
            cx={cx - rx * 0.28}
            cy={cy - ry * 0.3}
            rx={rx * 0.35}
            ry={ry * 0.22}
            fill="white"
            fillOpacity="0.04"
          />

          {/* ── Outer ring border ── */}
          <ellipse
            cx={cx} cy={cy} rx={rx} ry={ry}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1"
            fill="none"
          />

          {/* ── Shield icon overlay ── */}
          {shieldMode && (
            <g transform={`translate(${cx - 24}, ${cy - 28})`}>
              <path
                d="M24 3L4 11v10c0 11.1 8.5 21.5 20 24 11.5-2.5 20-12.9 20-24V11L24 3z"
                fill="#3DDC84"
                fillOpacity="0.15"
                stroke="#3DDC84"
                strokeWidth="1.5"
                strokeOpacity="0.5"
              />
              <path
                d="M18 24l4 4 8-8"
                stroke="#3DDC84"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeOpacity="0.8"
              />
            </g>
          )}
        </svg>
      </div>
    );
  }
);

Globe.displayName = "Globe";
