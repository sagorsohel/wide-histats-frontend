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

export const AnalycosAnimatedText: React.FC<{
  className?: string;
  sizeClass?: string;
}> = ({
  className = "",
  sizeClass = "text-xl",
}) => {
  return (
    <span
      className={`font-black tracking-tight relative select-none inline-flex items-center drop-shadow-[0_2px_10px_rgba(20,85,187,0.25)] group-hover:drop-shadow-[0_4px_14px_rgba(20,85,187,0.4)] transition-all ${sizeClass} ${className}`}
    >
      <span
        className="bg-gradient-to-r from-[#1455bb] via-[#2563eb] via-[#00bcd4] via-[#ff6d00] via-[#fbbc04] to-[#1455bb] bg-[length:300%_auto] bg-clip-text text-transparent group-hover:scale-[1.02] transition-transform duration-300"
        style={{
          animation: "analycos-text-shimmer 3.5s ease-in-out infinite",
        }}
      >
        Analycos
      </span>
      <style>{`
        @keyframes analycos-text-shimmer {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </span>
  );
};

export const AnalycosLogo: React.FC<AnalycosLogoProps> = ({
  size = 32,
  className = "",
  animated = true,
  speed = "fast",
  showText = false,
  textClassName = "",
}) => {
  // Snappy fast cycle durations for prompt responsiveness
  const cycleDuration =
    speed === "fast" ? "1.9s" : speed === "slow" ? "4.2s" : "2.6s";
  const colorCycleDuration =
    speed === "fast" ? "3.8s" : speed === "slow" ? "8.4s" : "5.2s";

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <div
        className="relative shrink-0 flex items-center justify-center select-none drop-shadow-[0_4px_12px_rgba(26,115,232,0.3)] group-hover:drop-shadow-[0_6px_16px_rgba(26,115,232,0.45)] transition-all"
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
                 1. FAST STEPPING PUSH ROTATION ("dhakka diye diye jabe")
                 Snappy stepped impulse pushes as each arc fills up!
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
                /* Snappy completion spin & smooth reset */
                93% {
                  transform: rotate(360deg);
                }
                100% {
                  transform: rotate(360deg);
                }
              }

              /* ========================================================
                 2. LIVE DYNAMIC COLOR SHIFT ("color change hobe")
                 ======================================================== */
              @keyframes analycos-color-shift {
                0% {
                  filter: hue-rotate(0deg) saturate(1.15);
                }
                50% {
                  filter: hue-rotate(180deg) saturate(1.3);
                }
                100% {
                  filter: hue-rotate(360deg) saturate(1.15);
                }
              }

              /* ========================================================
                 3. FAST PERCENTAGE PROGRESSIVE FILL-UP ("fillup hobe")
                 Circumference = 226.2
                 ======================================================== */

              /* Blue Segment (fills 0% to 30%, length 0 -> 67.5) */
              @keyframes fill-blue-segment {
                0% {
                  stroke-dasharray: 0 226.2;
                  stroke-dashoffset: 0;
                  opacity: 0.7;
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

      {showText && (
        <AnalycosAnimatedText
          className={textClassName}
          sizeClass={Number(size) >= 32 ? "text-xl" : "text-base"}
        />
      )}
    </div>
  );
};
