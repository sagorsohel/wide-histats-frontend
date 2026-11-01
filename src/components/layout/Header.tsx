"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useWebsite } from "@/context/WebsiteContext";
import {
  Globe,
  Plus,
  Code,
  LogOut,
  ChevronDown,
  Activity,
  Check,
  ExternalLink,
} from "lucide-react";

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const {
    websites,
    selectedWebsite,
    setSelectedWebsite,
    openTrackingModal,
  } = useWebsite();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  return (
    <header className="h-16 border-b border-slate-200 bg-white sticky top-0 z-40 px-4 lg:px-8 flex items-center justify-between shadow-sm shrink-0">
      {/* Brand & Website Selector */}
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#1d5b9f] to-[#2563eb] flex items-center justify-center text-white font-black shadow-md shadow-blue-500/20">
            W
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight text-slate-900">
              Wide-Histat
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-50 text-[#1d5b9f] border border-blue-200">
              Live
            </span>
          </div>
        </Link>

        {/* Website Dropdown */}
        {selectedWebsite && (
          <div className="flex items-center gap-1.5">
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                title={`Website: ${selectedWebsite.name} (${selectedWebsite.domain})`}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800 text-sm font-medium transition-all"
              >
                <Globe className="w-4 h-4 text-[#1d5b9f]" />
                <span className="max-w-[140px] sm:max-w-[180px] truncate">
                  {selectedWebsite.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 ml-1" />
              </button>

            {dropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setDropdownOpen(false)}
                />
                <div className="absolute left-0 mt-2 w-64 rounded-xl border border-slate-200 bg-white shadow-2xl p-1.5 z-50 animate-slide-down">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase px-2.5 py-1.5">
                    Your Websites
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-0.5">
                    {websites.map((site) => (
                      <button
                        key={site.id}
                        onClick={() => {
                          setSelectedWebsite(site);
                          setDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-sm transition-colors ${
                          selectedWebsite.id === site.id
                            ? "bg-blue-50 text-[#1d5b9f] font-semibold"
                            : "text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <div className="flex flex-col text-left truncate">
                          <span className="truncate">{site.name}</span>
                          <span className="text-[11px] text-slate-400 truncate">
                            {site.domain}
                          </span>
                        </div>
                        {selectedWebsite.id === site.id && (
                          <Check className="w-4 h-4 text-[#1d5b9f] shrink-0 ml-2" />
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-slate-200 mt-1.5 pt-1.5">
                    <Link
                      href="/websites"
                      onClick={() => setDropdownOpen(false)}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#1d5b9f] hover:bg-blue-50 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add New Website
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>

            {/* Direct Open Link in New Tab */}
            <a
              href={
                selectedWebsite.domain.startsWith("http")
                  ? selectedWebsite.domain
                  : `https://${selectedWebsite.domain}`
              }
              target="_blank"
              rel="noopener noreferrer"
              title={`Open ${selectedWebsite.domain.startsWith("http") ? selectedWebsite.domain : `https://${selectedWebsite.domain}`} in new tab`}
              className="p-2 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-[#1d5b9f] transition-all flex items-center justify-center"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Tracking Code Snippet Button */}
        {selectedWebsite && (
          <button
            onClick={() => openTrackingModal(selectedWebsite)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#1d5b9f]/30 bg-[#1d5b9f]/10 text-[#1d5b9f] hover:bg-[#1d5b9f]/20 text-xs font-semibold transition-all shadow-sm"
          >
            <Code className="w-3.5 h-3.5" />
            <span>Tracking Code</span>
          </button>
        )}

        {/* Live Visitor Indicator */}
        {selectedWebsite && (
          <Link
            href="/realtime"
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold hover:bg-emerald-100 transition-all"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
            </span>
            <span className="tabular-nums">
              {selectedWebsite.activeVisitors || 1} online
            </span>
          </Link>
        )}

        {/* User Account Dropdown */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2.5 p-1 rounded-full hover:ring-2 hover:ring-blue-500/30 transition-all"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#1d5b9f] to-indigo-600 border border-blue-400 flex items-center justify-center text-xs font-bold text-white uppercase shadow-sm">
                {user.name.charAt(0)}
              </div>
            </button>

            {userDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setUserDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-52 rounded-xl border border-slate-200 bg-white shadow-2xl p-1.5 z-50 animate-slide-down">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <div className="font-semibold text-sm text-slate-800 truncate">
                      {user.name}
                    </div>
                    <div className="text-xs text-slate-500 truncate">
                      {user.email}
                    </div>
                  </div>

                  <div className="py-1">
                    <Link
                      href="/websites"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      Manage Websites
                    </Link>
                  </div>

                  <div className="border-t border-slate-100 pt-1">
                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-rose-600 hover:bg-rose-50 transition-colors font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <Link
            href="/login"
            className="px-4 py-1.5 rounded-lg bg-[#1d5b9f] hover:bg-[#174880] text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all"
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
};
