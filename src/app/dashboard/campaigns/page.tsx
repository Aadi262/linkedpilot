"use client";
import { useState } from "react";
import Link from "next/link";
import { Plus, Pause, Play, Copy, Archive, Trash2, MoreHorizontal, Search, ChevronUp, ChevronDown, Rocket } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button"
import { PageTransition } from "@/components/ui/page-transition"
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type CampaignStatus = "active" | "paused" | "completed" | "draft";

interface Campaign {
  id: string;
  name: string;
  status: CampaignStatus;
  accounts: number;
  leads: number;
  accepted: number;
  replied: number;
  createdAt: string;
}

const STUB_CAMPAIGNS: Campaign[] = [
  { id: "c1", name: "Q1 SaaS Founders Outreach", status: "active", accounts: 3, leads: 847, accepted: 312, replied: 89, createdAt: "Jan 15, 2026" },
  { id: "c2", name: "Agency Decision Makers — Feb", status: "active", accounts: 2, leads: 420, accepted: 167, replied: 54, createdAt: "Feb 1, 2026" },
  { id: "c3", name: "Series A Startups NYC", status: "paused", accounts: 4, leads: 230, accepted: 78, replied: 22, createdAt: "Jan 28, 2026" },
  { id: "c4", name: "VP Sales Re-engagement", status: "completed", accounts: 1, leads: 560, accepted: 243, replied: 91, createdAt: "Dec 10, 2025" },
  { id: "c5", name: "EMEA Tech Leads", status: "draft", accounts: 0, leads: 0, accepted: 0, replied: 0, createdAt: "Feb 20, 2026" },
  { id: "c6", name: "Fintech CTOs — LinkedIn", status: "active", accounts: 2, leads: 310, accepted: 118, replied: 41, createdAt: "Feb 10, 2026" },
];

const statusConfig: Record<CampaignStatus, { label: string; color: string }> = {
  active: { label: "Active", color: "bg-green-400/10 text-green-400 border-green-400/20" },
  paused: { label: "Paused", color: "bg-yellow-400/10 text-yellow-400 border-yellow-400/20" },
  completed: { label: "Completed", color: "bg-blue-400/10 text-blue-400 border-blue-400/20" },
  draft: { label: "Draft", color: "bg-gray-400/10 text-gray-400 border-gray-400/20" },
};

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 bg-white/10 rounded-full h-1.5 flex-shrink-0">
        <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-gray-400 w-10">{max > 0 ? `${Math.round(pct)}%` : "—"}</span>
    </div>
  );
}

export default function CampaignsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | CampaignStatus>("all");
  const [campaigns, setCampaigns] = useState(STUB_CAMPAIGNS);

  const filtered = campaigns.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || c.status === filter;
    return matchesSearch && matchesFilter;
  });

  const toggleStatus = (id: string) => {
    setCampaigns((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: c.status === "active" ? "paused" : "active" } : c
      )
    );
  };

  const filterButtons: { key: "all" | CampaignStatus; label: string }[] = [
    { key: "all", label: "All" },
    { key: "active", label: "Active" },
    { key: "paused", label: "Paused" },
    { key: "completed", label: "Completed" },
    { key: "draft", label: "Drafts" },
  ];

  return (
    <PageTransition>
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white">Campaigns</h2>
          <p className="text-gray-500 text-sm mt-0.5">{campaigns.filter(c => c.status === "active").length} active · {campaigns.length} total</p>
        </div>
        <Link href="/dashboard/campaigns/new">
          <Button variant="primary" className="gap-2">
            <Plus className="w-4 h-4" /> New Campaign
          </Button>
        </Link>
      </div>

      {/* Filters + Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            placeholder="Search campaigns..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-gray-600 h-9"
          />
        </div>
        <div className="flex gap-1">
          {filterButtons.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === key ? "bg-violet-600 text-white" : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-white/10 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.03]">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Accounts</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Leads</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Accepted</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Replied</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">Created</th>
              <th className="px-4 py-3 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-10">
                  {campaigns.length === 0 ? (
                    <EmptyState
                      icon={Rocket}
                      title="No campaigns yet"
                      description="Create your first campaign to start automating LinkedIn outreach."
                      action={{ label: 'New Campaign', href: '/dashboard/campaigns/new' }}
                    />
                  ) : (
                    <p className="text-center text-gray-500 text-sm">No campaigns match your filters.</p>
                  )}
                </td>
              </tr>
            ) : (
              filtered.map((campaign, i) => {
                const cfg = statusConfig[campaign.status];
                return (
                  <tr
                    key={campaign.id}
                    className={`border-b border-white/5 hover:bg-white/[0.03] transition-colors ${
                      i === filtered.length - 1 ? "border-b-0" : ""
                    }`}
                  >
                    <td className="px-4 py-3.5">
                      <Link href={`/dashboard/campaigns/${campaign.id}`} className="font-medium text-white text-sm hover:text-violet-300 transition-colors">
                        {campaign.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${cfg.color}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <span className="text-sm text-gray-400">{campaign.accounts}</span>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <span className="text-sm text-gray-400">{campaign.leads.toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <MiniBar value={campaign.accepted} max={campaign.leads} color="bg-violet-500" />
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <MiniBar value={campaign.replied} max={campaign.leads} color="bg-green-500" />
                    </td>
                    <td className="px-4 py-3.5 hidden xl:table-cell">
                      <span className="text-xs text-gray-600">{campaign.createdAt}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-600 hover:text-gray-300">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[#0D0D1A] border-white/10 text-gray-300 w-40">
                          <DropdownMenuItem className="gap-2 hover:text-white cursor-pointer" onClick={() => toggleStatus(campaign.id)}>
                            {campaign.status === "active" ? <><Pause className="w-3.5 h-3.5" /> Pause</> : <><Play className="w-3.5 h-3.5" /> Resume</>}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 hover:text-white cursor-pointer">
                            <Copy className="w-3.5 h-3.5" /> Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 hover:text-white cursor-pointer">
                            <Archive className="w-3.5 h-3.5" /> Archive
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-white/10" />
                          <DropdownMenuItem className="gap-2 text-red-400 hover:text-red-300 cursor-pointer">
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
    </PageTransition>
  );
}
