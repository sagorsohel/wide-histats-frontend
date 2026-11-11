"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Footer } from "@/components/layout/Footer";

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

  // Dashboard shell: Header at top, Left Sidebar, Footer right under content, zero empty space
  return (
    <div className="desktop-app-container w-[1140px] min-w-[1140px] max-w-[1140px] mx-auto flex flex-col bg-white shadow-[0_0_50px_rgba(0,0,0,0.06)] border-x border-slate-200/90 relative">
      <Header />
      <div className="desktop-content-row flex-1 flex items-stretch">
        <Sidebar />
        <main className="desktop-main-scroll flex-1 min-w-0 p-3 sm:p-4 bg-[#F1F5F9]">
          <div className="w-full">{children}</div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

