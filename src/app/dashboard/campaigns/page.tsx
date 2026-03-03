import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Megaphone } from "lucide-react";

export default function CampaignsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Campaigns</h2>
        <Link href="/dashboard/campaigns/new">
          <Button className="bg-violet-600 hover:bg-violet-700 text-white gap-2">
            <Plus className="w-4 h-4" /> New Campaign
          </Button>
        </Link>
      </div>
      <div className="rounded-xl border border-white/10 bg-white/5 flex flex-col items-center justify-center py-24 text-center">
        <div className="w-14 h-14 rounded-2xl bg-violet-600/20 flex items-center justify-center mb-4">
          <Megaphone className="w-7 h-7 text-violet-400" />
        </div>
        <h3 className="text-white font-semibold text-lg mb-2">No campaigns yet</h3>
        <p className="text-gray-500 text-sm mb-6 max-w-xs">
          Create your first campaign to start sending connection requests and messages.
        </p>
        <Link href="/dashboard/campaigns/new">
          <Button className="bg-violet-600 hover:bg-violet-700 text-white">Create First Campaign</Button>
        </Link>
      </div>
    </div>
  );
}
