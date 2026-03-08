"use client";
import { useState } from "react";
import { MoreVertical, Shield, ShieldOff, RefreshCw, Trash2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type AccountStatus = "active" | "frozen" | "flagged" | "connecting" | "disconnected";

interface Account {
  id: string;
  displayName: string;
  username: string;
  status: AccountStatus;
  proxyProtected: boolean;
  dailyActionCount: number;
  weeklyConnectionCount: number;
  lastActiveAt: Date;
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

const statusConfig: Record<AccountStatus, { label: string; color: string; dot: string }> = {
  active: { label: "Active", color: "text-green-400 bg-green-400/10", dot: "bg-green-400" },
  frozen: { label: "Frozen", color: "text-yellow-400 bg-yellow-400/10", dot: "bg-yellow-400" },
  flagged: { label: "Flagged", color: "text-red-400 bg-red-400/10", dot: "bg-red-400" },
  connecting: { label: "Connecting", color: "text-blue-400 bg-blue-400/10", dot: "bg-blue-400" },
  disconnected: { label: "Disconnected", color: "text-gray-400 bg-gray-400/10", dot: "bg-gray-500" },
};

export function AccountCard({ account }: { account: Account }) {
  const [status, setStatus] = useState(account.status);
  const cfg = statusConfig[status];
  const dailyPct = (account.dailyActionCount / 200) * 100;
  const weeklyPct = (account.weeklyConnectionCount / 100) * 100;

  return (
    <div className={`rounded-xl border p-5 bg-white/5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-violet-500/10 cursor-pointer ${
      status === "flagged" ? "border-red-500/40" : status === "frozen" ? "border-yellow-500/30" : "border-white/10"
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-sm font-semibold text-white flex-shrink-0">
            {account.displayName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
          </div>
          <div>
            <div className="font-medium text-white text-sm">{account.displayName}</div>
            <div className="text-xs text-gray-500">@{account.username}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1.5 ${cfg.color} ${status === "frozen" ? "animate-pulse" : ""} ${status === "flagged" ? "ring-1 ring-red-500/50" : ""}`}>
            {status === "active" ? (
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
              </span>
            ) : (
              <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            )}
            {cfg.label}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-500 hover:text-gray-300">
                <MoreVertical className="w-3.5 h-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#0D0D1A] border-white/10 text-gray-300">
              <DropdownMenuItem className="gap-2 hover:text-white cursor-pointer" onClick={() => setStatus(status === "active" ? "disconnected" : "active")}>
                <RefreshCw className="w-3.5 h-3.5" />
                {status === "active" ? "Pause Account" : "Resume Account"}
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 hover:text-white cursor-pointer">
                <RefreshCw className="w-3.5 h-3.5" /> Refresh Session
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem className="gap-2 text-red-400 hover:text-red-300 cursor-pointer">
                <Trash2 className="w-3.5 h-3.5" /> Remove Account
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Proxy */}
      <div className="flex items-center gap-1.5 mb-4 text-xs">
        {account.proxyProtected ? (
          <><Shield className="w-3.5 h-3.5 text-green-400" /><span className="text-green-400">Proxy protected</span></>
        ) : (
          <><ShieldOff className="w-3.5 h-3.5 text-red-400" /><span className="text-red-400">No proxy assigned</span></>
        )}
      </div>

      {/* Daily actions */}
      <div className="space-y-2 mb-3">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-500">Daily actions</span>
            <span className={dailyPct > 80 ? "text-yellow-400" : "text-gray-400"}>
              {account.dailyActionCount} / 200
            </span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all ${dailyPct > 90 ? "bg-yellow-400" : "bg-violet-500"}`}
              style={{ width: `${Math.min(dailyPct, 100)}%` }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-500">Weekly connections</span>
            <span className={weeklyPct > 80 ? "text-yellow-400" : "text-gray-400"}>
              {account.weeklyConnectionCount} / 100
            </span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all ${weeklyPct > 80 ? "bg-yellow-400" : "bg-indigo-500"}`}
              style={{ width: `${Math.min(weeklyPct, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Last active */}
      <div className="flex items-center gap-1.5 text-xs text-gray-600">
        <Clock className="w-3 h-3" />
        Last active {timeAgo(account.lastActiveAt)}
      </div>
    </div>
  );
}
