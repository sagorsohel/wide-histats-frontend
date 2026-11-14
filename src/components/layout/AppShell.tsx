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
    <div className="desktop-app-container w-[1140px] min-w-[1140px] max-w-[1140px] mx-auto h-auto min-h-0 flex flex-col bg-white   shadow-[0_10px_31px_rgb(1,45,121)] relative rounded-b-xl overflow-hidden">
      <Header />
      <div className="desktop-content-row flex-none border-none flex flex-col items-stretch w-full bg-[#F1F5F9]">
        <main className="desktop-main-scroll flex-none min-w-0 border-none border-black  px-2 py-2.5 lg:p-4 pb-4 bg-[linear-gradient(180deg,#1058d11f,#1058d1)]">
          <div className="w-full">{children}</div>
        </main>
      </div>
      <Footer />
    </div>
  );
};
