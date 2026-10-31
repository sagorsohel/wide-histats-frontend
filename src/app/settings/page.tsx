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
      <div className="pb-2 border-b border-border/50">
        <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
          Platform Settings
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          System telemetry, account profile, and tracking configuration
        </p>
      </div>

      {/* Account Profile Card */}
      <div className="glass-panel p-6 rounded-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">Owner Account</h3>
            <p className="text-xs text-muted-foreground">Logged-in account credentials</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-border">
            <span className="text-muted-foreground block text-[11px] mb-1">Full Name</span>
            <span className="font-bold text-white text-sm">{user?.name || "Administrator"}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-border">
            <span className="text-muted-foreground block text-[11px] mb-1">Email Address</span>
            <span className="font-bold text-white text-sm">{user?.email || "admin@widehistat.com"}</span>
          </div>
        </div>
      </div>

      {/* Backend & Database Telemetry */}
      <div className="glass-panel p-6 rounded-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">System Architecture</h3>
            <p className="text-xs text-muted-foreground">Connected backend API and database</p>
          </div>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/40 border border-border">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-slate-200">Backend API (Express & TypeScript)</span>
            </div>
            <span className="font-mono text-cyan-400 font-bold">http://localhost:5005</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/40 border border-border">
            <div className="flex items-center gap-2.5">
              <Database className="w-4 h-4 text-cyan-400" />
              <span className="font-semibold text-slate-200">Database Engine</span>
            </div>
            <span className="font-bold text-slate-300">PostgreSQL (Drizzle ORM)</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/40 border border-border">
            <div className="flex items-center gap-2.5">
              <Shield className="w-4 h-4 text-purple-400" />
              <span className="font-semibold text-slate-200">Data Isolation</span>
            </div>
            <span className="font-bold text-slate-300">Isolated multi-tenant by Website & Owner</span>
          </div>
        </div>
      </div>
    </div>
  );
}
