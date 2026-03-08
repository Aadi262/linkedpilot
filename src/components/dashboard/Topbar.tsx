"use client";
import { usePathname } from "next/navigation";
import { Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";

const pageTitles: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/accounts": "Accounts",
  "/dashboard/campaigns": "Campaigns",
  "/dashboard/inbox": "Inbox",
  "/dashboard/analytics": "Analytics",
  "/dashboard/safety": "Safety Monitor",
  "/dashboard/settings": "Settings",
  "/dashboard/settings/workspace": "Workspace Settings",
  "/dashboard/settings/billing": "Billing",
  "/dashboard/settings/team": "Team",
  "/dashboard/settings/notifications": "Notifications",
  "/dashboard/settings/webhooks": "Webhooks",
};

export function Topbar() {
  const pathname = usePathname();
  const title = pageTitles[pathname] ?? "Dashboard";

  return (
    <header className="h-16 bg-[#08080F] border-b border-white/10 flex items-center justify-between px-6 sticky top-0 z-30">
      <h1 className="text-base font-semibold text-white">{title}</h1>
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="relative text-gray-500 hover:text-gray-300 h-9 w-9">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-violet-500 rounded-full" />
        </Button>
        <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center cursor-pointer hover:bg-violet-700 transition-colors">
          <User className="w-4 h-4 text-white" />
        </div>
      </div>
    </header>
  );
}
