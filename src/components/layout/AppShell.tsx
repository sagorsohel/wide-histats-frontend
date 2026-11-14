"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const AppShell: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const pathname = usePathname();
  const isLandingPage = pathname === "/";

  // For landing page (/): boxed 1260px container with natural scrolling
  if (isLandingPage) {
    return (
      <div className="min-h-screen w-full bg-[#f8fafc] text-slate-800 antialiased">
        {children}
      </div>
    );
  }

  // Dashboard shell: 1140px boxed container, Two-tier Header with blue nav bar at top, NO SIDEBAR, Footer fixed at bottom
  return (
    <div className="desktop-app-container w-[1140px] min-w-[1140px] max-w-[1140px] mx-auto min-h-screen flex flex-col bg-white border border-black shadow-[0_10px_31px_rgb(1,45,121)] relative">
      <Header />
      <div className="desktop-content-row flex-1 flex flex-col items-stretch w-full">
        <main className="desktop-main-scroll flex-1 min-w-0 px-2 py-2.5 lg:p-4 pb-6 bg-[#F1F5F9]">
          <div className="w-full">{children}</div>
        </main>
      </div>
      <Footer />
    </div>
  );
};
