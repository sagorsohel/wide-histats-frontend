"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { AlertCircle, ArrowRight, ShieldCheck, Activity } from "lucide-react";

export default function RootLoginPage() {
  const router = useRouter();
  const { user, loading: authLoading, login, register } = useAuth();

  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already logged in, redirect straight to /control-panel
  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/control-panel");
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let success = false;
      if (isRegister) {
        if (!name.trim()) {
          setError("Name is required");
          setLoading(false);
          return;
        }
        success = await register(name, email, password);
      } else {
        success = await login(email, password);
      }

      if (success) {
        router.push("/control-panel");
      } else {
        setError(
          isRegister
            ? "Failed to register. Please check your credentials."
            : "Invalid email or password. Please verify credentials."
        );
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during authentication.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-6 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-slate-200/90 shadow-2xl shadow-slate-200/50 backdrop-blur-sm relative overflow-hidden">
          {/* Subtle decorative top bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#1d5b9f] via-blue-500 to-indigo-600" />

          {/* Header */}
          <div className="text-center mb-6 pt-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#1d5b9f] to-[#2563eb] mx-auto flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-blue-500/25 mb-3.5 ring-4 ring-blue-50">
              W
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {isRegister ? "Create an Account" : "Wide-Histat Login"}
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              {isRegister
                ? "Sign up to track and monitor website visitors in real time"
                : "Enter your email and password to access the analytics summary"}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {isRegister && (
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Your Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Admin"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-[#1d5b9f] focus:bg-white focus:outline-none text-slate-900 text-xs transition-all"
                />
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-[#1d5b9f] focus:bg-white focus:outline-none text-slate-900 text-xs transition-all font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-[#1d5b9f] focus:bg-white focus:outline-none text-slate-900 text-xs transition-all font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-[#1d5b9f] hover:bg-[#174880] text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all disabled:opacity-50 mt-2 cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Activity className="w-3.5 h-3.5 animate-spin" />
                  <span>Verifying credentials...</span>
                </>
              ) : isRegister ? (
                "Create Account & Proceed"
              ) : (
                <>
                  <span>Sign In & Go to Summary</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Toggle Login / Register */}
          <div className="mt-5 text-center text-xs text-slate-500">
            {isRegister ? (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(false);
                    setError(null);
                  }}
                  className="text-[#1d5b9f] hover:underline font-bold ml-1 cursor-pointer"
                >
                  Sign In
                </button>
              </>
            ) : (
              <>
                Don&apos;t have an account yet?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(true);
                    setError(null);
                  }}
                  className="text-[#1d5b9f] hover:underline font-bold ml-1 cursor-pointer"
                >
                  Register Now
                </button>
              </>
            )}
          </div>

          {/* Secure badge footer */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Secure JWT authentication with live telemetry</span>
          </div>
        </div>
      </div>
    </div>
  );
}
