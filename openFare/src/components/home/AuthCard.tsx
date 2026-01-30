"use client";

import Card from "@/components/ui/Card";
import { useAuth } from "@/hooks/useAuth";
import { LogIn, LogOut, ShieldCheck } from "lucide-react";

export default function AuthCard() {
  const { user, login, logout, isAuthenticated } = useAuth();

  return (
    <Card>
      <div className="flex justify-between mb-6">
        <h2 className="text-xl font-bold">Authentication</h2>
        <ShieldCheck className="text-blue-500" />
      </div>

      {isAuthenticated ? (
        <div className="flex justify-between items-center">
          <p>{user}</p>
          <button onClick={logout} className="text-red-500">
            <LogOut />
          </button>
        </div>
      ) : (
        <button
          onClick={() => login("KalviumUser")}
          className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold"
        >
          <LogIn className="inline mr-2" /> Sign in as Guest
        </button>
      )}
    </Card>
  );
}
