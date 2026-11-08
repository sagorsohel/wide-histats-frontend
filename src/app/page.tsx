"use client";

import React from "react";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingHero } from "@/components/landing/LandingHero";
import { LandingMockup } from "@/components/landing/LandingMockup";
import { LandingFeatures } from "@/components/landing/LandingFeatures";
import { LandingAudience } from "@/components/landing/LandingAudience";
import { LandingSteps } from "@/components/landing/LandingSteps";
import { LandingCounter } from "@/components/landing/LandingCounter";
import { LandingFaq } from "@/components/landing/LandingFaq";
import { LandingCta } from "@/components/landing/LandingCta";
import { LandingFooter } from "@/components/landing/LandingFooter";

export default function HomePage() {
  return (
    <div className="w-full  mx-auto bg-white text-slate-900 selection:bg-blue-600/10 selection:text-blue-600 shadow-[0_0_50px_rgba(0,0,0,0.04)] border-x border-slate-200/80 min-h-screen flex flex-col">
      {/* 1. Header / Navbar Section */}
      <LandingNavbar />

      <main className="flex-1 w-full">
        {/* 2. Hero Section */}
        <LandingHero />

        {/* 3. Dashboard Preview Mockup Card */}
        <LandingMockup />

        {/* 4. "Less noise. More understanding." Feature Cards */}
        <LandingFeatures />

        {/* 5. "Your audience, without the guesswork." Geolocation Banner */}
        <LandingAudience />

        {/* 6. "Three steps. Then you're live." Timeline Steps */}
        <LandingSteps />

        {/* 7. "A little counter. A perfect fit." Hit Counter Styles */}
        <LandingCounter />

        {/* 8. FAQ Accordion Section */}
        <LandingFaq />

        {/* 9. "A clearer view starts here." CTA Banner */}
        <LandingCta />
      </main>

      {/* 10. Footer Section */}
      <LandingFooter />
    </div>
  );
}
