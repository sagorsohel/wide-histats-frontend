"use client";

import React from "react";

interface AnalycosLogoProps {
  size?: number | string;
  className?: string;
  animated?: boolean;
  speed?: "slow" | "normal" | "fast";
  showText?: boolean;
  textClassName?: string;
}

export const AnalycosLogo: React.FC<AnalycosLogoProps> = ({
  size = 32,
  className = "",
  animated = true,
  speed = "normal",
  showText = false,
  textClassName = "font-extrabold text-slate-900 tracking-tight",
}) => {
  // Cycle duration for one full percentage-fill & push sequence
  const cycleDuration =
    speed === "fast" ? "3.2s" : speed === "slow" ? "6.5s" : "4.6s";
  const colorCycleDuration =
    speed === "fast" ? "6.4s" : speed === "slow" ? "13s" : "9.2s";

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <div
        className="relative shrink-0 flex items-center justify-center select-none"
        style={{ width: size, height: size }}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full overflow-visible"
          style={
            animated
              ? {
                  animation: `analycos-step-push ${cycleDuration} cubic-bezier(0.4, 0, 0.2, 1) infinite, analycos-color-shift ${colorCycleDuration} linear infinite`,
                  transformOrigin: "50% 50%",
                }
              : undefined
          }
        >
          <style>
            {`
              /* ========================================================
                 1. STEPPING PUSH ROTATION ("dhakka diye diye jabe")
                 Rotates in snappy stepped impulses as each arc fills up!
                 ======================================================== */
              @keyframes analycos-step-push {
                0% {
                  transform: rotate(0deg);
                }
                /* Push 1: Blue starts filling */
                18% {
                  transform: rotate(55deg);
                }
                22% {
                  transform: rotate(65deg);
                }
                /* Push 2: Cyan kicks in & pushes forward */
                38% {
                  transform: rotate(125deg);
                }
                44% {
                  transform: rotate(135deg);
                }
                /* Push 3: Orange pushes strongly */
                62% {
                  transform: rotate(235deg);
                }
                68% {
                  transform: rotate(250deg);
                }
                /* Push 4: Yellow fills the final gap (100% full ring!) */
                82% {
                  transform: rotate(325deg);
                }
                85% {
                  transform: rotate(335deg);
                }
                /* Completion spin & smooth reset for next cycle */
                93% {
                  transform: rotate(360deg);
                }
                100% {
                  transform: rotate(360deg);
                }
              }

              /* ========================================================
                 2. LIVE COLOR SHIFTING ("color change hobe")
                 ======================================================== */
              @keyframes analycos-color-shift {
                0% {
                  filter: hue-rotate(0deg) saturate(1.1);
                }
                50% {
                  filter: hue-rotate(180deg) saturate(1.25);
                }
                100% {
                  filter: hue-rotate(360deg) saturate(1.1);
                }
              }

              /* ========================================================
                 3. PERCENTAGE PROGRESSIVE FILL-UP ("fillup hobe")
                 Circumference = 226.2
                 Each color draws in like a percentage meter, pushing
                 the boundary until the entire circle is 100% filled!
                 ======================================================== */

              /* Blue Segment (fills 0% to 30%, length 0 -> 67.5) */
              @keyframes fill-blue-segment {
                0% {
                  stroke-dasharray: 0 226.2;
                  stroke-dashoffset: 0;
                  opacity: 0.6;
                }
                18%, 85% {
                  stroke-dasharray: 67.5 226.2;
                  stroke-dashoffset: 0;
                  opacity: 1;
                }
                93% {
                  stroke-dasharray: 67.5 226.2;
                  stroke-dashoffset: -30;
                  opacity: 0.8;
                }
                100% {
                  stroke-dasharray: 0 226.2;
                  stroke-dashoffset: -67.5;
                  opacity: 0;
                }
              }

              /* Cyan Segment (starts at 30%, fills to 50%, length 0 -> 45) */
              @keyframes fill-cyan-segment {
                0%, 18% {
                  stroke-dasharray: 0 226.2;
                  stroke-dashoffset: -67.5;
                  opacity: 0;
                }
                22% {
                  opacity: 1;
                }
                40%, 85% {
                  stroke-dasharray: 45 226.2;
                  stroke-dashoffset: -67.5;
                  opacity: 1;
                }
                93% {
                  stroke-dasharray: 45 226.2;
                  stroke-dashoffset: -90;
                  opacity: 0.8;
                }
                100% {
                  stroke-dasharray: 0 226.2;
                  stroke-dashoffset: -112.5;
                  opacity: 0;
                }
              }

              /* Orange Segment (starts at 50%, fills to 85%, length 0 -> 79.5) */
              @keyframes fill-orange-segment {
                0%, 40% {
                  stroke-dasharray: 0 226.2;
                  stroke-dashoffset: -112.5;
                  opacity: 0;
                }
                44% {
                  opacity: 1;
                }
                64%, 85% {
                  stroke-dasharray: 79.5 226.2;
                  stroke-dashoffset: -112.5;
                  opacity: 1;
                }
                93% {
                  stroke-dasharray: 79.5 226.2;
                  stroke-dashoffset: -150;
                  opacity: 0.8;
                }
                100% {
                  stroke-dasharray: 0 226.2;
                  stroke-dashoffset: -192;
                  opacity: 0;
                }
              }

              /* Yellow Segment (starts at 85%, fills to 100%, length 0 -> 34.2) */
              @keyframes fill-yellow-segment {
                0%, 64% {
                  stroke-dasharray: 0 226.2;
                  stroke-dashoffset: -192;
                  opacity: 0;
                }
                68% {
                  opacity: 1;
                }
                82%, 85% {
                  stroke-dasharray: 34.2 226.2;
                  stroke-dashoffset: -192;
                  opacity: 1;
                }
                93% {
                  stroke-dasharray: 34.2 226.2;
                  stroke-dashoffset: -210;
                  opacity: 0.8;
                }
                100% {
                  stroke-dasharray: 0 226.2;
                  stroke-dashoffset: -226.2;
                  opacity: 0;
                }
              }

              .anim-seg-blue {
                ${animated ? `animation: fill-blue-segment ${cycleDuration} cubic-bezier(0.35, 0, 0.25, 1) infinite;` : "stroke-dasharray: 67.5 158.7; stroke-dashoffset: 0;"}
              }
              .anim-seg-cyan {
                ${animated ? `animation: fill-cyan-segment ${cycleDuration} cubic-bezier(0.35, 0, 0.25, 1) infinite;` : "stroke-dasharray: 45 181.2; stroke-dashoffset: -67.5;"}
              }
              .anim-seg-orange {
                ${animated ? `animation: fill-orange-segment ${cycleDuration} cubic-bezier(0.35, 0, 0.25, 1) infinite;` : "stroke-dasharray: 79.5 146.7; stroke-dashoffset: -112.5;"}
              }
              .anim-seg-yellow {
                ${animated ? `animation: fill-yellow-segment ${cycleDuration} cubic-bezier(0.35, 0, 0.25, 1) infinite;` : "stroke-dasharray: 34.2 192; stroke-dashoffset: -192;"}
              }
            `}
          </style>

          {/* Faint subtle background track for smooth contrast */}
          <circle
            cx="50"
            cy="50"
            r="36"
            fill="none"
            stroke="#f1f5f9"
            strokeWidth="15"
          />

          {/* 
            Circumference = 2 * PI * 36 = 226.195
            Arc 1 (Blue): ~30% = 67.5 length
            Arc 2 (Cyan): ~20% = 45 length
            Arc 3 (Orange): ~35% = 79.5 length
            Arc 4 (Yellow): ~15% = 34.2 length
          */}

          {/* Blue segment (0% to 30%) */}
          <circle
            cx="50"
            cy="50"
            r="36"
            fill="none"
            stroke="#1a73e8"
            strokeWidth="14"
            className="anim-seg-blue"
            strokeLinecap="butt"
          />

          {/* Cyan segment (30% to 50%) */}
          <circle
            cx="50"
            cy="50"
            r="36"
            fill="none"
            stroke="#00bcd4"
            strokeWidth="14"
            className="anim-seg-cyan"
            strokeLinecap="butt"
          />

          {/* Orange segment (50% to 85%) */}
          <circle
            cx="50"
            cy="50"
            r="36"
            fill="none"
            stroke="#ff6d00"
            strokeWidth="14"
            className="anim-seg-orange"
            strokeLinecap="butt"
          />

          {/* Yellow segment (85% to 100%) */}
          <circle
            cx="50"
            cy="50"
            r="36"
            fill="none"
            stroke="#fbbc04"
            strokeWidth="14"
            className="anim-seg-yellow"
            strokeLinecap="butt"
          />
        </svg>
      </div>

      {showText && <span className={textClassName}>Analycos</span>}
    </div>
  );
};
