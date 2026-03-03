import Link from "next/link";
import { Building2, CreditCard, Users, Bell, Webhook } from "lucide-react";

const settingsLinks = [
  { href: "/dashboard/settings/workspace", icon: Building2, title: "Workspace", desc: "Name, slug, timezone, logo" },
  { href: "/dashboard/settings/billing", icon: CreditCard, title: "Billing", desc: "Plan, usage, manage subscription" },
  { href: "/dashboard/settings/team", icon: Users, title: "Team", desc: "Invite members, manage roles" },
  { href: "/dashboard/settings/notifications", icon: Bell, title: "Notifications", desc: "Email, Slack alerts" },
  { href: "/dashboard/settings/webhooks", icon: Webhook, title: "Webhooks", desc: "Outbound webhook configuration" },
];

export default function SettingsPage() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white">Settings</h2>
        <p className="text-gray-500 text-sm mt-0.5">Manage your workspace, team, and integrations</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
        {settingsLinks.map(({ href, icon: Icon, title, desc }) => (
          <Link key={href} href={href}>
            <div className="rounded-xl border border-white/10 bg-white/5 hover:border-violet-500/40 hover:bg-violet-600/5 p-5 flex items-start gap-4 transition-all cursor-pointer">
              <div className="w-9 h-9 rounded-lg bg-violet-600/20 flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-violet-400" />
              </div>
              <div>
                <div className="font-medium text-white text-sm">{title}</div>
                <div className="text-xs text-gray-500 mt-0.5">{desc}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
