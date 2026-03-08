import Link from "next/link";
import { ArrowLeft, Pause, Users, MessageSquare, TrendingUp, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const STUB = {
  id: "c1",
  name: "Q1 SaaS Founders Outreach",
  status: "active",
  leads: 847,
  accepted: 312,
  replied: 89,
  steps: [
    { type: "Connection Request", delay: "Day 1", content: "Hi {{firstName}}, I came across your profile and would love to connect!", sent: 847, accepted: 312 },
    { type: "Message", delay: "Day 3 (after accept)", content: "Thanks for connecting, {{firstName}}! I wanted to share something that might be relevant for {{company}}...", sent: 312, accepted: 187 },
    { type: "Follow-up", delay: "Day 7 (no reply)", content: "Hey {{firstName}}, just wanted to bump this in case it got buried...", sent: 125, accepted: 89 },
  ],
  leadsTable: [
    { name: "John Doe", company: "Acme Corp", step: "Message sent", status: "active", lastActivity: "2 hours ago" },
    { name: "Sarah Chen", company: "TechFlow", step: "Replied", status: "replied", lastActivity: "5 hours ago" },
    { name: "Mike Barnes", company: "Startup XYZ", step: "Connected", status: "active", lastActivity: "1 day ago" },
    { name: "Emma Wilson", company: "GrowthCo", step: "Connection sent", status: "pending", lastActivity: "2 days ago" },
  ],
};

export default function CampaignDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      {/* Back + Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/campaigns">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-white">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-white">{STUB.name}</h2>
          <p className="text-gray-500 text-sm">Campaign ID: {params.id}</p>
        </div>
        <Link href={`/dashboard/campaigns/${params.id}/automation`}>
          <Button variant="outline" className="border-white/20 text-gray-300 hover:text-white gap-2">
            <Zap className="w-3.5 h-3.5" /> Automation Rules
          </Button>
        </Link>
        <Button variant="outline" className="border-white/20 text-gray-300 hover:text-white gap-2">
          <Pause className="w-3.5 h-3.5" /> Pause Campaign
        </Button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Leads", value: STUB.leads.toLocaleString(), icon: Users, color: "text-blue-400" },
          { label: "Connected", value: STUB.accepted.toLocaleString(), icon: Users, color: "text-violet-400" },
          { label: "Replied", value: STUB.replied.toLocaleString(), icon: MessageSquare, color: "text-green-400" },
          { label: "Reply Rate", value: `${Math.round((STUB.replied / STUB.leads) * 100)}%`, icon: TrendingUp, color: "text-yellow-400" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon className={`w-4 h-4 ${color}`} />
              <span className="text-xs text-gray-500">{label}</span>
            </div>
            <div className="text-2xl font-bold text-white">{value}</div>
          </div>
        ))}
      </div>

      {/* Sequence Steps */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <h3 className="text-sm font-medium text-white mb-4">Sequence Steps</h3>
        <div className="space-y-3">
          {STUB.steps.map((step, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-7 h-7 rounded-full bg-violet-600/20 border border-violet-600/30 flex items-center justify-center text-xs font-semibold text-violet-400 flex-shrink-0">
                {i + 1}
              </div>
              <div className="flex-1 bg-white/[0.03] border border-white/10 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-violet-400">{step.type}</span>
                  <span className="text-xs text-gray-600">{step.delay}</span>
                </div>
                <p className="text-xs text-gray-400 truncate">{step.content}</p>
              </div>
              <div className="text-right hidden md:block">
                <div className="text-sm font-medium text-white">{step.sent.toLocaleString()}</div>
                <div className="text-xs text-gray-600">sent</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Leads Table */}
      <div className="rounded-xl border border-white/10 overflow-hidden">
        <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between">
          <span className="text-sm font-medium text-white">Leads</span>
          <span className="text-xs text-gray-600">{STUB.leadsTable.length} shown</span>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              <th className="text-left px-5 py-2.5 text-xs font-medium text-gray-600 uppercase tracking-wider">Name</th>
              <th className="text-left px-5 py-2.5 text-xs font-medium text-gray-600 uppercase tracking-wider hidden md:table-cell">Company</th>
              <th className="text-left px-5 py-2.5 text-xs font-medium text-gray-600 uppercase tracking-wider">Current Step</th>
              <th className="text-left px-5 py-2.5 text-xs font-medium text-gray-600 uppercase tracking-wider hidden lg:table-cell">Last Activity</th>
            </tr>
          </thead>
          <tbody>
            {STUB.leadsTable.map((lead, i) => (
              <tr key={i} className="border-b border-white/5 last:border-b-0 hover:bg-white/[0.02]">
                <td className="px-5 py-3 text-sm text-white font-medium">{lead.name}</td>
                <td className="px-5 py-3 text-sm text-gray-400 hidden md:table-cell">{lead.company}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    lead.status === "replied" ? "bg-green-400/10 text-green-400" :
                    lead.status === "active" ? "bg-violet-400/10 text-violet-400" :
                    "bg-gray-400/10 text-gray-400"
                  }`}>{lead.step}</span>
                </td>
                <td className="px-5 py-3 text-xs text-gray-600 hidden lg:table-cell">{lead.lastActivity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
