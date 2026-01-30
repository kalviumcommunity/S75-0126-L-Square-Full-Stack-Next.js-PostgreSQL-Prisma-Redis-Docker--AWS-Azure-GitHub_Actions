"use client";

import { ArrowRight } from "lucide-react";
import { useUI } from "@/hooks/useUI";

export default function HeaderSection() {
  const { theme } = useUI();
  const isDark = theme === "dark";

  return (
    <header className="text-center mb-20 space-y-6">
      <div
        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-medium ${
          isDark
            ? "bg-slate-800/50 border-slate-700 text-blue-400"
            : "bg-blue-50 border-blue-100 text-blue-600"
        }`}
      >
        v1.0.0 is live
      </div>

      <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
        Travel smarter with{" "}
        <span className="bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
          OpenFare
        </span>
      </h1>

      <p
        className={`text-lg md:text-xl max-w-2xl mx-auto ${
          isDark ? "text-slate-400" : "text-slate-600"
        }`}
      >
        A high-performance bus booking engine powered by modern architecture.
      </p>

      <div className="flex justify-center gap-4 pt-4">
        <button className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-semibold flex items-center gap-2">
          Get Started <ArrowRight size={18} />
        </button>
        <button className="px-8 py-4 rounded-2xl border font-semibold">
          Live Demo
        </button>
      </div>
    </header>
  );
}
