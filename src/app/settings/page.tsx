"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useWebsite } from "@/context/WebsiteContext";
import { Settings, Shield, Server, Database, Code, CheckCircle2 } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();
  const { selectedWebsite } = useWebsite();

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Banner */}
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
          Platform Settings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          System telemetry, account profile, and tracking configuration
        </p>
      </div>

      {/* Account Profile Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#1d5b9f]">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900">Owner Account</h3>
            <p className="text-xs text-slate-500">Logged-in account credentials</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block text-[11px] mb-1">Full Name</span>
            <span className="font-bold text-slate-900 text-sm">{user?.name || "Administrator"}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block text-[11px] mb-1">Email Address</span>
            <span className="font-bold text-slate-900 text-sm">{user?.email || "admin@widehistat.com"}</span>
          </div>
        </div>
      </div>

      {/* Backend & Database Telemetry */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900">System Architecture</h3>
            <p className="text-xs text-slate-500">Connected backend API and database</p>
          </div>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold text-slate-800">Backend API (Express & TypeScript)</span>
            </div>
            <span className="font-mono text-[#1d5b9f] font-bold">http://localhost:5050</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2.5">
              <Database className="w-4 h-4 text-[#1d5b9f]" />
              <span className="font-semibold text-slate-800">Database Engine</span>
            </div>
            <span className="font-bold text-slate-700">PostgreSQL (Drizzle ORM)</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2.5">
              <Shield className="w-4 h-4 text-purple-600" />
              <span className="font-semibold text-slate-800">Data Isolation</span>
            </div>
            <span className="font-bold text-slate-700">Isolated multi-tenant by Website & Owner</span>
          </div>
        </div>
      </div>
    </div>
  );
}
