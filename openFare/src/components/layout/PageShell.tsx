"use client";

import { ReactNode } from "react";
import { useUI } from "@/hooks/useUI";

export default function PageShell({ children }: { children: ReactNode }) {
  const { theme } = useUI();
  const isDark = theme === "dark";

  return (
    <main
      className={`min-h-screen transition-colors duration-500 font-sans ${
        isDark ? "bg-[#0B0F1A] text-slate-200" : "bg-[#F8FAFC] text-slate-900"
      }`}
    >
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-20 ${
            isDark ? "bg-blue-500" : "bg-blue-300"
          }`}
        />
        <div
          className={`absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-20 ${
            isDark ? "bg-indigo-500" : "bg-purple-300"
          }`}
        />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 py-20">
        {children}
      </div>
    </main>
  );
}
