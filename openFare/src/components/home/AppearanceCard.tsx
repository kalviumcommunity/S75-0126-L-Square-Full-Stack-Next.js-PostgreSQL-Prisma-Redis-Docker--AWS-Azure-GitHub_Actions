"use client";

import Card from "@/components/ui/Card";
import { useUI } from "@/hooks/useUI";
import { Sun, Moon, PanelLeft } from "lucide-react";

export default function AppearanceCard() {
  const { theme, toggleTheme, sidebarOpen, toggleSidebar } = useUI();
  const isDark = theme === "dark";

  return (
    <Card>
      <div className="flex justify-between mb-6">
        <h2 className="text-xl font-bold">Appearance</h2>
        <button onClick={toggleTheme}>
          {isDark ? <Sun /> : <Moon />}
        </button>
      </div>

      <button onClick={toggleSidebar} className="flex justify-between w-full">
        <span className="flex gap-2">
          <PanelLeft /> Sidebar
        </span>
        <span>{sidebarOpen ? "ON" : "OFF"}</span>
      </button>
    </Card>
  );
}
