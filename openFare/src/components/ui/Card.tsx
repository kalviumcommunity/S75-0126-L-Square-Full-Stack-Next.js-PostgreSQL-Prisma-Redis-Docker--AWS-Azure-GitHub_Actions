import { ReactNode } from "react";
import { useUI } from "@/hooks/useUI";

export default function Card({ children }: { children: ReactNode }) {
  const { theme } = useUI();
  const isDark = theme === "dark";

  return (
    <div
      className={`rounded-3xl border p-8 transition-all ${
        isDark
          ? "bg-slate-900/50 border-slate-800"
          : "bg-white border-slate-200 shadow-sm"
      }`}
    >
      {children}
    </div>
  );
}
