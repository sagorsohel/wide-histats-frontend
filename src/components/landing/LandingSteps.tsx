"use client";

import React from "react";

export const LandingSteps: React.FC = () => {
  return (
    <section id="how-it-works" className="w-full max-w-[1260px] mx-auto px-4 sm:px-6 lg:px-8 py-20">
      {/* Title */}
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-950 tracking-tight text-center mb-16">
        Three steps. Then you&apos;re live.
      </h2>

      {/* Horizontal Steps with Connecting Line */}
      <div className="relative">
        {/* Connecting horizontal line */}
        <div className="hidden md:block absolute top-5 left-[15%] right-[15%] h-[2px] bg-slate-200 z-0" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 relative z-10 text-center">
          {/* Step 1 */}
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-[#1b5fc9] text-white flex items-center justify-center font-bold text-xs shadow-md shadow-blue-500/25 mb-4 ring-4 ring-white">
              01
            </div>
            <h3 className="font-extrabold text-base text-slate-900 mb-1.5">
              Add your website
            </h3>
            <p className="text-xs text-slate-500 max-w-[220px] leading-relaxed">
              Enter your website URL in seconds.
            </p>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-[#1b5fc9] text-white flex items-center justify-center font-bold text-xs shadow-md shadow-blue-500/25 mb-4 ring-4 ring-white">
              02
            </div>
            <h3 className="font-extrabold text-base text-slate-900 mb-1.5">
              Paste your tracking code
            </h3>
            <p className="text-xs text-slate-500 max-w-[220px] leading-relaxed">
              Add a small code snippet to your site.
            </p>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-[#1b5fc9] text-white flex items-center justify-center font-bold text-xs shadow-md shadow-blue-500/25 mb-4 ring-4 ring-white">
              03
            </div>
            <h3 className="font-extrabold text-base text-slate-900 mb-1.5">
              Watch your insights appear
            </h3>
            <p className="text-xs text-slate-500 max-w-[220px] leading-relaxed">
              See your visitors and traffic in real time.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

