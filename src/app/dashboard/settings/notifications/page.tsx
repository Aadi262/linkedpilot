"use client";
import { useState } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface NotifSetting { id: string; label: string; desc: string; enabled: boolean; }

export default function NotificationsPage() {
  const [settings, setSettings] = useState<NotifSetting[]>([
    { id: "reply", label: "Email on reply received", desc: "Get an email every time a lead replies to your campaign", enabled: true },
    { id: "campaign_complete", label: "Email on campaign complete", desc: "Get notified when a campaign finishes all steps", enabled: true },
    { id: "account_flagged", label: "Email on account flagged", desc: "Urgent alert if a LinkedIn account gets flagged or restricted", enabled: true },
    { id: "daily_summary", label: "Daily summary email", desc: "A summary of all activity sent every morning at 9am", enabled: false },
    { id: "weekly_report", label: "Weekly performance report", desc: "Campaign metrics and trends every Monday", enabled: false },
  ]);
  const [slackWebhook, setSlackWebhook] = useState("");
  const [saved, setSaved] = useState(false);

  const toggle = (id: string) => setSettings((prev) => prev.map((s) => s.id === id ? { ...s, enabled: !s.enabled } : s));

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Notifications</h2>
        <p className="text-gray-500 text-sm mt-0.5">Choose how you want to be notified</p>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-5 space-y-5">
        <h3 className="text-sm font-medium text-white">Email Notifications</h3>
        {settings.map(({ id, label, desc, enabled }) => (
          <div key={id} className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm text-white font-medium">{label}</div>
              <div className="text-xs text-gray-500 mt-0.5">{desc}</div>
            </div>
            <Switch checked={enabled} onCheckedChange={() => toggle(id)} className="flex-shrink-0 mt-0.5" />
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-5 space-y-4">
        <h3 className="text-sm font-medium text-white">Slack Integration</h3>
        <p className="text-xs text-gray-500">Post notifications to a Slack channel via incoming webhook.</p>
        <div>
          <Label className="text-gray-300 text-sm mb-1.5 block">Slack Webhook URL</Label>
          <Input
            placeholder="https://hooks.slack.com/services/..."
            value={slackWebhook}
            onChange={(e) => setSlackWebhook(e.target.value)}
            className="bg-white/10 border-white/20 text-white placeholder:text-gray-600"
          />
        </div>
      </div>

      <Button onClick={handleSave} className="bg-violet-600 hover:bg-violet-700 text-white gap-2">
        <Save className="w-4 h-4" />
        {saved ? "Saved!" : "Save Preferences"}
      </Button>
    </div>
  );
}
