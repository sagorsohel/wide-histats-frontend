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
        router.push("/summary");
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
        router.push("/summary");
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
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#1d5b9f] to-[#2563eb] mx-auto flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/20 mb-3">
              W
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {isRegister ? "Create an Account" : "Welcome Back"}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
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
            className="w-full mb-5 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-[#1d5b9f] font-bold text-xs transition-all shadow-2xs group cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#1d5b9f] animate-pulse" />
            <span>1-Click Demo Sign In (Admin)</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </button>

          <div className="relative flex items-center justify-center mb-5">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[11px] text-slate-400 uppercase font-semibold">
              or continue with email
            </span>
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
                  placeholder="John Doe"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-[#1d5b9f] focus:outline-none text-slate-900 text-xs"
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
                placeholder="admin@widehistat.com"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-[#1d5b9f] focus:outline-none text-slate-900 text-xs"
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
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-[#1d5b9f] focus:outline-none text-slate-900 text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-[#1d5b9f] hover:bg-[#174880] text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all disabled:opacity-50 mt-2 cursor-pointer"
            >
              {loading
                ? "Processing..."
                : isRegister
                ? "Create Account"
                : "Sign In"}
            </button>
          </form>

          {/* Toggle Login / Register */}
          <div className="mt-5 text-center text-xs text-slate-500">
            {isRegister ? (
              <>
                Already have an account?{" "}
                <button
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
        </div>
      </div>
    </div>
  );
}
