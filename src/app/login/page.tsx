"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { LogIn, Sparkles, AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const { login, register, quickDemoLogin } = useAuth();

  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        router.push("/");
      } else {
        setError(
          isRegister
            ? "Failed to register. Please check your credentials."
            : "Invalid email or password."
        );
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during authentication.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const ok = await quickDemoLogin();
      if (ok) {
        router.push("/");
      } else {
        setError("Demo login failed. Make sure backend is running.");
      }
    } catch (err: any) {
      setError(err.message || "Demo login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Glow behind card */}
        <div className="relative">
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-cyan-500/30 to-emerald-500/30 blur-xl opacity-50" />

          <div className="relative glass-panel rounded-3xl p-8 border border-cyan-500/30 shadow-2xl bg-[#0f172a]/90">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-emerald-400 mx-auto flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-cyan-500/30 mb-3">
                W
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight">
                {isRegister ? "Create an Account" : "Welcome Back"}
              </h1>
              <p className="text-xs text-muted-foreground mt-1">
                {isRegister
                  ? "Sign up to start tracking website traffic in real-time"
                  : "Sign in to access your analytics dashboard"}
              </p>
            </div>

            {/* Quick Demo Button */}
            <button
              type="button"
              onClick={handleDemoSignIn}
              disabled={loading}
              className="w-full mb-5 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold text-xs transition-all shadow-sm shadow-emerald-500/10 group"
            >
              <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>1-Click Demo Sign In (Admin)</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </button>

            <div className="relative flex items-center justify-center mb-5">
              <div className="border-t border-border w-full" />
              <span className="bg-[#0f172a] px-3 text-[11px] text-muted-foreground uppercase font-semibold">
                or continue with email
              </span>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {isRegister && (
                <div>
                  <label className="block font-semibold text-slate-300 mb-1.5">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#090d16] border border-border focus:border-cyan-500 focus:outline-none text-white text-xs"
                  />
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@widehistat.com"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#090d16] border border-border focus:border-cyan-500 focus:outline-none text-white text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#090d16] border border-border focus:border-cyan-500 focus:outline-none text-white text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/25 transition-all disabled:opacity-50 mt-2"
              >
                {loading
                  ? "Processing..."
                  : isRegister
                  ? "Create Account"
                  : "Sign In"}
              </button>
            </form>

            {/* Toggle Login / Register */}
            <div className="mt-5 text-center text-xs text-muted-foreground">
              {isRegister ? (
                <>
                  Already have an account?{" "}
                  <button
                    onClick={() => {
                      setIsRegister(false);
                      setError(null);
                    }}
                    className="text-cyan-400 hover:text-cyan-300 font-bold ml-1"
                  >
                    Sign In
                  </button>
                </>
              ) : (
                <>
                  Don&apos;t have an account yet?{" "}
                  <button
                    onClick={() => {
                      setIsRegister(true);
                      setError(null);
                    }}
                    className="text-cyan-400 hover:text-cyan-300 font-bold ml-1"
                  >
                    Register Now
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
