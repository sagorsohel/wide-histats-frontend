"use client";

import React from "react";
import { CountryFlag } from "@/components/common/CountryFlag";

export const LandingAudience: React.FC = () => {
  return (
    <section className="w-full max-w-[1260px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Container Card with Soft Pastel Blue Background */}
      <div className="bg-[#eef5ff] rounded-[32px] p-8 sm:p-12 relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-10">
        {/* Left Column: Heading & Paragraph */}
        <div className="w-full lg:max-w-md shrink-0 z-10">
          <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-black text-[#0f172a] tracking-[-0.02em] leading-[1.12] mb-4">
            Your audience,
            <br />
            without the guesswork.
          </h2>
          <p className="text-slate-600 text-sm sm:text-[15px] leading-relaxed max-w-sm">
            See where your visitors are, and how they browse your site.
            Understand your audience by country, device, and browser — all in
            one clear view.
          </p>
        </div>

        {/* Right Column: World Map Silhouette + Blinking/Pulsing Green Dots + Floating Countries Card */}
        <div className="w-full flex-1 relative flex items-center justify-center min-h-[290px] sm:min-h-[320px]">
          {/* Detailed Realistic World Map Silhouette */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <svg
              viewBox="0 0 950 480"
              className="w-full h-full fill-[#cfe2fe]"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Greenland */}
              <path d="M 330 35 Q 360 30, 380 50 Q 370 85, 340 90 Q 320 70, 330 35 Z" />

              {/* North America */}
              <path d="M 120 75 Q 160 55, 230 60 Q 285 50, 310 90 Q 315 115, 280 130 Q 300 160, 260 190 Q 240 220, 210 240 Q 185 240, 175 220 Q 185 190, 160 180 Q 130 160, 110 130 Q 95 100, 120 75 Z" />
              {/* Central America bridge */}
              <path d="M 210 240 Q 235 265, 255 285 Q 245 295, 230 280 Q 215 260, 210 240 Z" />

              {/* South America */}
              <path d="M 255 285 Q 295 280, 335 315 Q 360 350, 330 395 Q 300 450, 275 465 Q 260 450, 270 400 Q 260 350, 245 320 Q 245 295, 255 285 Z" />

              {/* Europe */}
              <path d="M 445 100 Q 480 85, 520 100 Q 540 120, 520 145 Q 490 165, 460 160 Q 435 140, 445 100 Z" />
              {/* United Kingdom & Ireland */}
              <path d="M 435 110 Q 450 100, 445 125 Q 430 135, 435 110 Z" />
              <path d="M 415 115 Q 425 110, 420 125 Q 410 125, 415 115 Z" />
              {/* Scandinavia */}
              <path d="M 480 50 Q 515 45, 510 85 Q 485 95, 480 50 Z" />

              {/* Africa */}
              <path d="M 450 175 Q 520 170, 550 220 Q 565 270, 530 330 Q 500 380, 485 360 Q 470 300, 435 245 Q 420 200, 450 175 Z" />
              {/* Madagascar */}
              <path d="M 570 320 Q 585 315, 580 345 Q 565 355, 570 320 Z" />

              {/* Asia */}
              <path d="M 525 90 Q 640 70, 770 95 Q 810 140, 765 190 Q 720 210, 680 230 Q 640 270, 620 240 Q 625 200, 590 185 Q 545 180, 535 140 Q 520 110, 525 90 Z" />
              {/* India subcontinent */}
              <path d="M 625 200 Q 665 200, 650 250 Q 630 270, 620 235 Z" />
              {/* Southeast Asia islands */}
              <path d="M 700 255 Q 735 260, 725 285 Q 695 275, 700 255 Z" />
              <path d="M 740 275 Q 765 280, 755 305 Q 730 300, 740 275 Z" />
              {/* Japan */}
              <path d="M 795 135 Q 815 140, 805 175 Q 785 160, 795 135 Z" />

              {/* Australia */}
              <path d="M 730 340 Q 795 330, 815 365 Q 810 410, 765 420 Q 720 405, 725 365 Q 715 350, 730 340 Z" />
              {/* New Zealand */}
              <path d="M 835 410 Q 845 405, 840 435 Q 830 430, 835 410 Z" />
            </svg>
          </div>

          {/* 5 Pulsing / Blinking Green Radar Dots (Exact positions matching screenshot) */}

          {/* 1. North America (USA) */}
          <div
            className="absolute top-[31%] left-[19%] z-20 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none"
            title="United States - Live Traffic"
          >
            <span className="animate-ping absolute inline-flex h-6 w-6 rounded-full bg-[#00c48c] opacity-75" />
            <span className="animate-pulse absolute inline-flex h-4 w-4 rounded-full bg-[#00c48c]/40" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00c48c] ring-[2.5px] ring-white shadow-sm" />
          </div>

          {/* 2. South America (Brazil) */}
          <div
            className="absolute top-[67%] left-[29%] z-20 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none"
            title="South America - Live Traffic"
          >
            <span className="animate-ping absolute inline-flex h-6 w-6 rounded-full bg-[#00c48c] opacity-75 [animation-delay:0.3s]" />
            <span className="animate-pulse absolute inline-flex h-4 w-4 rounded-full bg-[#00c48c]/40" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00c48c] ring-[2.5px] ring-white shadow-sm" />
          </div>

          {/* 3. Europe (Germany / UK) */}
          <div
            className="absolute top-[28%] left-[49%] z-20 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none"
            title="Europe - Live Traffic"
          >
            <span className="animate-ping absolute inline-flex h-6 w-6 rounded-full bg-[#00c48c] opacity-75 [animation-delay:0.6s]" />
            <span className="animate-pulse absolute inline-flex h-4 w-4 rounded-full bg-[#00c48c]/40" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00c48c] ring-[2.5px] ring-white shadow-sm" />
          </div>

          {/* 4. Asia (India / South Asia) */}
          <div
            className="absolute top-[41%] left-[68%] z-20 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none"
            title="Asia - Live Traffic"
          >
            <span className="animate-ping absolute inline-flex h-6 w-6 rounded-full bg-[#00c48c] opacity-75 [animation-delay:0.9s]" />
            <span className="animate-pulse absolute inline-flex h-4 w-4 rounded-full bg-[#00c48c]/40" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00c48c] ring-[2.5px] ring-white shadow-sm" />
          </div>

          {/* 5. Australia */}
          <div
            className="absolute top-[75%] left-[78%] z-20 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none"
            title="Australia - Live Traffic"
          >
            <span className="animate-ping absolute inline-flex h-6 w-6 rounded-full bg-[#00c48c] opacity-75 [animation-delay:1.2s]" />
            <span className="animate-pulse absolute inline-flex h-4 w-4 rounded-full bg-[#00c48c]/40" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00c48c] ring-[2.5px] ring-white shadow-sm" />
          </div>

          {/* Floating White "Countries" Card (Exact Replica of Screenshot) */}
          <div className="relative z-30 w-[230px] sm:w-[245px] bg-white rounded-2xl shadow-[0_12px_32px_rgba(0,0,0,0.06)] p-4 sm:p-4.5 ml-auto mr-1 sm:mr-3 border border-white/80">
            <h4 className="text-[13px] font-bold text-[#0f172a] mb-3">
              Countries
            </h4>
            <div className="space-y-2.5 text-xs">
              {[
                { code: "US", name: "United States", pct: "41,9%" },
                { code: "GB", name: "United Kingdom", pct: "11,8%" },
                { code: "DE", name: "Germany", pct: "7,6%" },
                { code: "CA", name: "Canada", pct: "5,9%" },
                { code: "others", name: "Others", pct: "32,8%" },
              ].map((c, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2 text-slate-800 font-medium">
                    <CountryFlag code={c.code} countryName={c.name} size="sm" />
                    <span className="truncate">{c.name}</span>
                  </div>
                  <span className="font-semibold text-slate-700 text-right shrink-0">
                    {c.pct}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
