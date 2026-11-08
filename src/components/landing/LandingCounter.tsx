"use client";

import React from "react";

export const LandingCounter: React.FC = () => {
  return (
    <section className="w-full max-w-[1260px] mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-100">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
        {/* Left: Heading & Description */}
        <div className="max-w-md">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight leading-tight mb-3">
            A little counter.
            <br />
            A perfect fit.
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
            Add a customizable hit counter to your site. Clean, lightweight, and designed to match your style.
          </p>
        </div>

        {/* Right: 3 Counter Styles */}
        <div className="grid grid-cols-3 gap-4 sm:gap-6 shrink-0">
          {/* Style 1: Minimal */}
          <div className="flex flex-col items-center">
            <div className="w-24 sm:w-28 py-2.5 px-3 rounded-xl bg-slate-100 border border-slate-200/80 text-center font-bold text-slate-800 text-xs sm:text-sm shadow-2xs">
              13,576
            </div>
            <span className="text-[11px] font-medium text-slate-400 mt-2">
              Minimal
            </span>
          </div>

          {/* Style 2: Classic */}
          <div className="flex flex-col items-center">
            <div className="w-24 sm:w-28 py-2.5 px-3 rounded-xl bg-[#1b5fc9] text-center font-bold text-white text-xs sm:text-sm shadow-md shadow-blue-600/20">
              13,576
            </div>
            <span className="text-[11px] font-medium text-slate-400 mt-2">
              Classic
            </span>
          </div>

          {/* Style 3: Outline */}
          <div className="flex flex-col items-center">
            <div className="w-24 sm:w-28 py-2.5 px-3 rounded-xl bg-white border-2 border-[#1b5fc9] text-center font-bold text-[#1b5fc9] text-xs sm:text-sm shadow-2xs">
              13,576
            </div>
            <span className="text-[11px] font-medium text-slate-400 mt-2">
              Outline
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

