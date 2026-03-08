"use client";

import { useState } from "react";
import { Shield, RefreshCw, AlertTriangle, CheckCircle, Clock, XCircle, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { PageTransition } from "@/components/ui/page-transition"

// ─── Types ────────────────────────────────────────────────────────────────────

type AccountStatus = "active" | "frozen" | "flagged" | "disconnected";

interface SafetyAccount {
  id: string;
  displayName: string;
  initials: string;
  status: AccountStatus;
  actionsToday: number;
  connectionsThisWeek: number;
  lastFlagged: string | null;
  freezeReason: string | null;
  lastActive: string;
  proxy: string;
}

interface SafetyEvent {
  id: string;
  accountName: string;
  type: "freeze" | "flag" | "proxy_replaced" | "unfreeze" | "cap_reached";
  message: string;
  time: string;
}

// ─── Stub data ────────────────────────────────────────────────────────────────

const STUB_ACCOUNTS: SafetyAccount[] = [
  {
    id: "acc_1", displayName: "Sarah Kim", initials: "SK",
    status: "active", actionsToday: 124, connectionsThisWeek: 67,
    lastFlagged: null, freezeReason: null, lastActive: "2 minutes ago",
    proxy: "185.220.x.x",
  },
  {
    id: "acc_2", displayName: "Mike Rodriguez", initials: "MR",
    status: "frozen", actionsToday: 200, connectionsThisWeek: 88,
    lastFlagged: "2 days ago", freezeReason: "daily_limit_reached",
    lastActive: "12 hours ago", proxy: "146.70.x.x",
  },
  {
    id: "acc_3", displayName: "Alex Thompson", initials: "AT",
    status: "flagged", actionsToday: 45, connectionsThisWeek: 12,
    lastFlagged: "Today, 3:14pm", freezeReason: "linkedin_checkpoint",
    lastActive: "6 hours ago", proxy: "104.28.x.x",
  },
  {
    id: "acc_4", displayName: "Jenny Walsh", initials: "JW",
    status: "active", actionsToday: 78, connectionsThisWeek: 41,
    lastFlagged: null, freezeReason: null, lastActive: "15 minutes ago",
    proxy: "185.220.x.x",
  },
  {
    id: "acc_5", displayName: "Chris Baker", initials: "CB",
    status: "active", actionsToday: 33, connectionsThisWeek: 19,
    lastFlagged: null, freezeReason: null, lastActive: "1 hour ago",
    proxy: "146.70.x.x",
  },
];

const STUB_EVENTS: SafetyEvent[] = [
  { id: "e1", accountName: "Alex Thompson", type: "flag", message: "LinkedIn checkpoint detected — session terminated. Manual review needed.", time: "Today, 3:14pm" },
  { id: "e2", accountName: "Mike Rodriguez", type: "freeze", message: "Account frozen: daily action limit (200) reached. Auto-resumes at midnight UTC.", time: "Today, 12:03pm" },
  { id: "e3", accountName: "Sarah Kim", type: "cap_reached", message: "Weekly connection cap at 95 — connection step paused, messages continue.", time: "Yesterday, 4:30pm" },
  { id: "e4", accountName: "Jenny Walsh", type: "proxy_replaced", message: "Proxy IP flagged. New residential IP assigned automatically. Campaign resumed in 10 minutes.", time: "2 days ago" },
  { id: "e5", accountName: "Mike Rodriguez", type: "unfreeze", message: "Account unfrozen (daily reset at midnight UTC). Daily action count reset to 0.", time: "Yesterday, 12:00am" },
  { id: "e6", accountName: "Chris Baker", type: "freeze", message: "Account frozen: daily action limit (200) reached.", time: "3 days ago" },
];

const STATUS_CONFIG: Record<AccountStatus, { label: string; color: string; bg: string; border: string; dot: string }> = {
  active: { label: "Active", color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20", dot: "bg-green-400" },
  frozen: { label: "Frozen", color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20", dot: "bg-yellow-400" },
  flagged: { label: "Flagged", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", dot: "bg-red-400" },
  disconnected: { label: "Disconnected", color: "text-gray-400", bg: "bg-gray-500/10", border: "border-gray-500/20", dot: "bg-gray-400" },
};

const EVENT_CONFIG: Record<SafetyEvent["type"], { icon: React.ElementType; color: string; bg: string }> = {
  flag: { icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/10" },
  freeze: { icon: Clock, color: "text-yellow-400", bg: "bg-yellow-500/10" },
  cap_reached: { icon: AlertTriangle, color: "text-orange-400", bg: "bg-orange-500/10" },
  proxy_replaced: { icon: RefreshCw, color: "text-blue-400", bg: "bg-blue-500/10" },
  unfreeze: { icon: CheckCircle, color: "text-green-400", bg: "bg-green-500/10" },
};

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min((value / max) * 100, 100);
  const isHigh = pct >= 80;
  return (
    <div className="space-y-0.5">
      <div className="flex justify-between text-[10px] text-gray-500">
        <span>{value} / {max}</span>
        <span>{Math.round(pct)}%</span>
      </div>
      <div className="w-full bg-white/10 rounded-full h-1.5">
        <div
          className={cn("h-1.5 rounded-full transition-all", isHigh ? "bg-red-400" : color)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SafetyPage() {
  const [accounts, setAccounts] = useState(STUB_ACCOUNTS);
  const [unfreezing, setUnfreezing] = useState<string | null>(null);

  const handleUnfreeze = async (id: string) => {
    setUnfreezing(id);
    await new Promise((r) => setTimeout(r, 1200)); // stub delay
    setAccounts((prev) =>
      prev.map((a) => a.id === id ? { ...a, status: "active", freezeReason: null, actionsToday: 0 } : a)
    );
    setUnfreezing(null);
  };

  const statusCounts = {
    active: accounts.filter((a) => a.status === "active").length,
    frozen: accounts.filter((a) => a.status === "frozen").length,
    flagged: accounts.filter((a) => a.status === "flagged").length,
  };

  return (
    <PageTransition>
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Safety Monitor</h2>
          <p className="text-gray-500 text-sm mt-0.5">Account health, action logs, and manual override controls</p>
        </div>
        <div className="flex items-center gap-3">
          {statusCounts.flagged > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
              <XCircle className="w-3.5 h-3.5" />
              {statusCounts.flagged} account{statusCounts.flagged > 1 ? "s" : ""} need review
            </div>
          )}
          {statusCounts.frozen > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-xs text-yellow-400">
              <Clock className="w-3.5 h-3.5" />
              {statusCounts.frozen} frozen
            </div>
          )}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-xs text-green-400">
            <Shield className="w-3.5 h-3.5" />
            {statusCounts.active} healthy
          </div>
        </div>
      </div>

      {/* Flagged account alert */}
      {accounts.filter((a) => a.status === "flagged").map((acc) => (
        <div key={acc.id} className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/5 p-4">
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-300">Account @{acc.displayName} flagged by LinkedIn</p>
            <p className="text-xs text-red-400/70 mt-0.5">
              LinkedIn checkpoint detected. Session terminated. All campaigns for this account are paused.
              Manual review and cookie refresh required.
            </p>
          </div>
          <Button variant="outline" size="sm" className="border-red-500/30 text-red-400 hover:text-red-300 h-7 text-xs gap-1 flex-shrink-0">
            <RefreshCw className="w-3 h-3" /> Reconnect
          </Button>
        </div>
      ))}

      {/* Accounts table */}
      <div className="rounded-xl border border-white/10 overflow-hidden">
        <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between">
          <span className="text-sm font-medium text-white">Account Health</span>
          <span className="text-xs text-gray-600">{accounts.length} accounts</span>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              <th className="text-left px-5 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
              <th className="text-left px-5 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="text-left px-5 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Actions Today</th>
              <th className="text-left px-5 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Connections / Week</th>
              <th className="text-left px-5 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">Proxy</th>
              <th className="text-left px-5 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Last Active</th>
              <th className="px-5 py-2.5 w-28" />
            </tr>
          </thead>
          <tbody>
            {accounts.map((acc) => {
              const cfg = STATUS_CONFIG[acc.status];
              return (
                <tr
                  key={acc.id}
                  className={cn(
                    "border-b border-white/5 last:border-b-0 transition-colors",
                    acc.status === "flagged" ? "bg-red-500/[0.03]" : acc.status === "frozen" ? "bg-yellow-500/[0.03]" : "hover:bg-white/[0.02]"
                  )}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-violet-600/30 flex items-center justify-center text-xs font-semibold text-violet-300 flex-shrink-0">
                        {acc.initials}
                      </div>
                      <span className="text-sm font-medium text-white">{acc.displayName}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />
                      <span className={cn("text-xs font-medium", cfg.color)}>{cfg.label}</span>
                    </div>
                    {acc.freezeReason && (
                      <p className="text-[10px] text-gray-600 mt-0.5">
                        {acc.freezeReason.replace(/_/g, " ")}
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <div className="w-32">
                      <ProgressBar value={acc.actionsToday} max={200} color="bg-violet-500" />
                    </div>
                  </td>
                  <td className="px-5 py-4 hidden lg:table-cell">
                    <div className="w-32">
                      <ProgressBar value={acc.connectionsThisWeek} max={95} color="bg-blue-500" />
                    </div>
                  </td>
                  <td className="px-5 py-4 hidden xl:table-cell">
                    <span className="text-xs font-mono text-gray-500">{acc.proxy}</span>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <span className="text-xs text-gray-600">{acc.lastActive}</span>
                  </td>
                  <td className="px-5 py-4">
                    {acc.status === "frozen" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUnfreeze(acc.id)}
                        disabled={unfreezing === acc.id}
                        className="border-white/20 text-gray-300 hover:text-white h-7 text-xs gap-1"
                      >
                        {unfreezing === acc.id ? (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : (
                          <Unlock className="w-3 h-3" />
                        )}
                        Unfreeze
                      </Button>
                    )}
                    {acc.status === "flagged" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-500/30 text-red-400 hover:text-red-300 h-7 text-xs gap-1"
                      >
                        <AlertTriangle className="w-3 h-3" /> Review
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Safety rules explanation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: Shield, title: "Daily Action Cap", desc: "200 actions / day per account. At 200, account auto-freezes until midnight UTC.", color: "text-violet-400", bg: "bg-violet-600/10" },
          { icon: CheckCircle, title: "Weekly Connection Cap", desc: "95 connection requests / week. Connection step pauses; messages continue.", color: "text-blue-400", bg: "bg-blue-600/10" },
          { icon: AlertTriangle, title: "LinkedIn Checkpoint", desc: "If LinkedIn shows a CAPTCHA or checkpoint, session is immediately terminated and account flagged for review.", color: "text-red-400", bg: "bg-red-600/10" },
        ].map(({ icon: Icon, title, desc, color, bg }) => (
          <div key={title} className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-3", bg)}>
              <Icon className={cn("w-4 h-4", color)} />
            </div>
            <div className="text-sm font-medium text-white mb-1">{title}</div>
            <div className="text-xs text-gray-500 leading-relaxed">{desc}</div>
          </div>
        ))}
      </div>

      {/* Event log */}
      <div className="rounded-xl border border-white/10 overflow-hidden">
        <div className="px-5 py-3 border-b border-white/10">
          <span className="text-sm font-medium text-white">Safety Event Log</span>
        </div>
        <div className="divide-y divide-white/5">
          {STUB_EVENTS.map((event) => {
            const cfg = EVENT_CONFIG[event.type];
            const Icon = cfg.icon;
            return (
              <div key={event.id} className="flex items-start gap-4 px-5 py-3.5 hover:bg-white/[0.02]">
                <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5", cfg.bg)}>
                  <Icon className={cn("w-3.5 h-3.5", cfg.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-medium text-white">{event.accountName}</span>
                    <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-medium", cfg.bg, cfg.color)}>
                      {event.type.replace(/_/g, " ")}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{event.message}</p>
                </div>
                <span className="text-[10px] text-gray-600 flex-shrink-0 mt-0.5">{event.time}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
    </PageTransition>
  );
}
