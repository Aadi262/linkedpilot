"use client";
import { useState } from "react";
import { CreditCard, Zap, CheckCircle, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const PLAN_FEATURES = {
  starter: ["5 LinkedIn accounts", "3 active campaigns", "Basic analytics", "CSV import", "Email support"],
  agency: ["25 LinkedIn accounts", "Unlimited campaigns", "Unibox", "Full analytics + API", "Team workspaces", "Priority support"],
  scale: ["Unlimited accounts", "White-label", "Dedicated manager", "Custom proxies", "SLA guarantee"],
};

export default function BillingPage() {
  const [loading, setLoading] = useState(false);
  const currentPlan = "agency";
  const nextBilling = "April 1, 2026";
  const usage = { accounts: 3, maxAccounts: 25, campaigns: 5, maxCampaigns: 999 };

  const handleManageBilling = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      alert("Billing portal unavailable — add your Stripe keys in .env.local");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Billing</h2>
        <p className="text-gray-500 text-sm mt-0.5">Manage your subscription and usage</p>
      </div>

      {/* Current Plan */}
      <div className="rounded-xl border border-violet-500/40 bg-violet-600/5 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-violet-400" />
              <span className="text-white font-semibold capitalize">{currentPlan} Plan</span>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">Active</Badge>
            </div>
            <p className="text-gray-400 text-sm">$149/month · Next billing on {nextBilling}</p>
          </div>
          <Button
            onClick={handleManageBilling}
            disabled={loading}
            variant="outline"
            className="border-white/20 text-gray-300 hover:text-white gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
            Manage Billing
          </Button>
        </div>
        <ul className="grid grid-cols-2 gap-1.5">
          {PLAN_FEATURES[currentPlan as keyof typeof PLAN_FEATURES].map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm text-gray-400">
              <CheckCircle className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />{f}
            </li>
          ))}
        </ul>
      </div>

      {/* Usage */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <h3 className="text-sm font-medium text-white mb-4">Current Usage</h3>
        <div className="space-y-4">
          {[
            { label: "LinkedIn Accounts", used: usage.accounts, max: usage.maxAccounts },
            { label: "Active Campaigns", used: usage.campaigns, max: usage.maxCampaigns },
          ].map(({ label, used, max }) => (
            <div key={label}>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-gray-400">{label}</span>
                <span className="text-gray-300">{used} / {max === 999 ? "∞" : max}</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-violet-500"
                  style={{ width: max === 999 ? "5%" : `${(used / max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upgrade CTA */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <h3 className="text-sm font-medium text-white mb-1">Need more?</h3>
        <p className="text-gray-500 text-sm mb-4">Upgrade to Scale for unlimited accounts, white-label, and dedicated support.</p>
        <Button className="bg-violet-600 hover:bg-violet-700 text-white gap-2">
          <Zap className="w-4 h-4" /> Upgrade to Scale — $299/mo
        </Button>
      </div>
    </div>
  );
}
