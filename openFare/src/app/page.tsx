"use client";
import { useAuth } from "@/hooks/useAuth";
import { useUI } from "@/hooks/useUI";
import { 
  LayoutDashboard, 
  LogOut, 
  LogIn, 
  Sun, 
  Moon, 
  PanelLeft, 
  ShieldCheck, 
  Globe, 
  Zap,
  ArrowRight
} from "lucide-react"; // Note: Installing lucide-react is highly recommended for cleaner icons

export default function Home() {
  const { user, login, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme, sidebarOpen, toggleSidebar } = useUI();

  const isDark = theme === "dark";

  return (
    <main className={`min-h-screen transition-colors duration-500 font-sans ${
      isDark ? "bg-[#0B0F1A] text-slate-200" : "bg-[#F8FAFC] text-slate-900"
    }`}>
      
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-20 ${isDark ? 'bg-blue-500' : 'bg-blue-300'}`} />
        <div className={`absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-20 ${isDark ? 'bg-indigo-500' : 'bg-purple-300'}`} />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 py-20">
        
        {/* Header Section */}
        <header className="text-center mb-20 space-y-6">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-medium transition-colors ${
            isDark ? "bg-slate-800/50 border-slate-700 text-blue-400" : "bg-blue-50 border-blue-100 text-blue-600"
          }`}>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            v1.0.0 is live
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
            Travel smarter with <span className="bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">OpenFare</span>
          </h1>
          
          <p className={`text-lg md:text-xl max-w-2xl mx-auto ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            A high-performance bus booking engine powered by a modern distributed architecture.
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <button className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-semibold shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-1 flex items-center gap-2">
              Get Started <ArrowRight size={18} />
            </button>
            <button className={`px-8 py-4 rounded-2xl font-semibold border transition-all hover:bg-slate-500/5 ${
              isDark ? "border-slate-700 text-slate-200" : "border-slate-200 text-slate-700"
            }`}>
              Live Demo
            </button>
          </div>
        </header>

        {/* Control Center (Bento Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-20">
          
          {/* Auth Card */}
          <div className={`md:col-span-7 rounded-3xl border p-8 transition-all ${
            isDark ? "bg-slate-900/50 border-slate-800" : "bg-white border-slate-200 shadow-sm"
          }`}>
            <div className="flex items-center justify-between mb-8">
              <div className="space-y-1">
                <h2 className="text-xl font-bold">Authentication</h2>
                <p className={`text-sm ${isDark ? "text-slate-500" : "text-slate-500"}`}>Manage your session state</p>
              </div>
              <div className={`p-3 rounded-2xl ${isDark ? "bg-slate-800" : "bg-slate-100"}`}>
                <ShieldCheck className="text-blue-500" />
              </div>
            </div>

            {isAuthenticated ? (
              <div className="flex items-center justify-between p-4 rounded-2xl border border-dashed border-slate-700 bg-slate-500/5">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold">
                    {user?.[0]}
                  </div>
                  <div>
                    <p className="font-medium">{user}</p>
                    <p className="text-xs text-green-500 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500" /> Active Session
                    </p>
                  </div>
                </div>
                <button onClick={logout} className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors">
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => login("KalviumUser")}
                className="w-full py-4 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              >
                <LogIn size={20} /> Sign in as Guest
              </button>
            )}
          </div>

          {/* Theme/UI Card */}
          <div className={`md:col-span-5 rounded-3xl border p-8 transition-all ${
            isDark ? "bg-slate-900/50 border-slate-800" : "bg-white border-slate-200 shadow-sm"
          }`}>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold">Appearance</h2>
              <button 
                onClick={toggleTheme}
                className={`p-3 rounded-2xl transition-all ${isDark ? "bg-slate-800 hover:bg-slate-700" : "bg-slate-100 hover:bg-slate-200"}`}
              >
                {isDark ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-slate-700" />}
              </button>
            </div>

            <div className="space-y-4">
              <button 
                onClick={toggleSidebar}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                  sidebarOpen 
                    ? "border-blue-500 bg-blue-500/5 text-blue-500" 
                    : isDark ? "border-slate-800 hover:bg-slate-800" : "border-slate-100 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3 font-medium">
                  <PanelLeft size={20} /> Sidebar Layout
                </div>
                <div className={`w-10 h-5 rounded-full relative transition-colors ${sidebarOpen ? 'bg-blue-500' : 'bg-slate-400'}`}>
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${sidebarOpen ? 'left-6' : 'left-1'}`} />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {[
            { title: "Edge Performance", icon: <Zap />, desc: "Redis caching ensures sub-100ms response times globally." },
            { title: "Hybrid Routing", icon: <Globe />, desc: "Seamlessly switch between public and protected routes." },
            { title: "Modern Stack", icon: <LayoutDashboard />, desc: "Next.js 16 with Prisma ORM for type-safe data access." },
          ].map((f, i) => (
            <div key={i} className="group cursor-default">
              <div className={`mb-4 p-3 inline-block rounded-xl transition-colors ${isDark ? "bg-slate-800 group-hover:bg-blue-500/20" : "bg-white border group-hover:border-blue-200 shadow-sm"}`}>
                <div className="text-blue-500">{f.icon}</div>
              </div>
              <h3 className="text-lg font-bold mb-2">{f.title}</h3>
              <p className={`text-sm leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <footer className={`pt-10 border-t ${isDark ? "border-slate-800 text-slate-500" : "border-slate-200 text-slate-400"} text-center text-sm`}>
          Built with TypeScript & Tailwind CSS • 2026 OpenFare Inc.
        </footer>
      </div>
    </main>
  );
}