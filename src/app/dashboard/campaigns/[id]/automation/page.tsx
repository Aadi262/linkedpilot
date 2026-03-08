"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Zap, MessageSquare, UserCheck, Clock, Tag, MoveRight, Webhook } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Trigger = "reply_received" | "connection_accepted" | "n_days_no_reply";
type ActionType = "pause_lead" | "move_to_campaign" | "tag_lead" | "webhook";

interface AutomationRule {
  id: string;
  trigger: Trigger;
  action: ActionType;
  config: {
    days?: number;
    tag?: string;
    webhookUrl?: string;
    campaignId?: string;
  };
  isActive: boolean;
}

const TRIGGER_CONFIG: Record<Trigger, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  reply_received: { label: "Reply Received", icon: MessageSquare, color: "text-green-400", bg: "bg-green-600/10" },
  connection_accepted: { label: "Connection Accepted", icon: UserCheck, color: "text-violet-400", bg: "bg-violet-600/10" },
  n_days_no_reply: { label: "X Days, No Reply", icon: Clock, color: "text-yellow-400", bg: "bg-yellow-600/10" },
};

const ACTION_CONFIG: Record<ActionType, { label: string; icon: React.ElementType }> = {
  pause_lead: { label: "Pause Outreach for Lead", icon: Zap },
  move_to_campaign: { label: "Move to Another Campaign", icon: MoveRight },
  tag_lead: { label: "Tag Lead", icon: Tag },
  webhook: { label: "Fire Webhook", icon: Webhook },
};

const STUB_RULES: AutomationRule[] = [
  {
    id: "r1",
    trigger: "reply_received",
    action: "pause_lead",
    config: {},
    isActive: true,
  },
  {
    id: "r2",
    trigger: "n_days_no_reply",
    action: "tag_lead",
    config: { days: 14, tag: "cold-lead" },
    isActive: true,
  },
];

export default function AutomationRulesPage({ params }: { params: { id: string } }) {
  const [rules, setRules] = useState<AutomationRule[]>(STUB_RULES);
  const [showForm, setShowForm] = useState(false);
  const [newTrigger, setNewTrigger] = useState<Trigger>("reply_received");
  const [newAction, setNewAction] = useState<ActionType>("pause_lead");
  const [newDays, setNewDays] = useState(7);
  const [newTag, setNewTag] = useState("");
  const [newWebhookUrl, setNewWebhookUrl] = useState("");
  const [saved, setSaved] = useState(false);

  const addRule = () => {
    const config: AutomationRule["config"] = {};
    if (newTrigger === "n_days_no_reply") config.days = newDays;
    if (newAction === "tag_lead") config.tag = newTag;
    if (newAction === "webhook") config.webhookUrl = newWebhookUrl;

    setRules((prev) => [
      ...prev,
      { id: `r_${Date.now()}`, trigger: newTrigger, action: newAction, config, isActive: true },
    ]);
    setShowForm(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const deleteRule = (id: string) => setRules((prev) => prev.filter((r) => r.id !== id));
  const toggleRule = (id: string) => setRules((prev) => prev.map((r) => r.id === id ? { ...r, isActive: !r.isActive } : r));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/campaigns/${params.id}`}>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-white">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-white">Automation Rules</h2>
          <p className="text-gray-500 text-sm">IF trigger → THEN action. Rules run automatically as leads progress.</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-violet-600 hover:bg-violet-700 text-white gap-2"
        >
          <Plus className="w-4 h-4" /> Add Rule
        </Button>
      </div>

      {saved && (
        <div className="flex items-center gap-2 text-sm text-green-400 bg-green-600/10 border border-green-500/20 rounded-lg px-4 py-2.5">
          <Zap className="w-4 h-4" /> Rule saved successfully.
        </div>
      )}

      {/* Add Rule Form */}
      {showForm && (
        <div className="rounded-2xl border border-violet-500/30 bg-violet-600/5 p-6 space-y-5">
          <h3 className="text-sm font-semibold text-white">New Automation Rule</h3>

          {/* Trigger selector */}
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 font-medium">IF…</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {(Object.keys(TRIGGER_CONFIG) as Trigger[]).map((t) => {
                const cfg = TRIGGER_CONFIG[t];
                const Icon = cfg.icon;
                return (
                  <button
                    key={t}
                    onClick={() => setNewTrigger(t)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-3 rounded-xl border text-sm text-left transition-all",
                      newTrigger === t
                        ? `border-violet-500 ${cfg.bg} ${cfg.color}`
                        : "border-white/10 bg-white/5 text-gray-400 hover:border-white/20"
                    )}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {cfg.label}
                  </button>
                );
              })}
            </div>

            {/* Days config for n_days_no_reply */}
            {newTrigger === "n_days_no_reply" && (
              <div className="flex items-center gap-2 mt-3">
                <span className="text-xs text-gray-400">After</span>
                <input
                  type="number"
                  min={1}
                  max={90}
                  value={newDays}
                  onChange={(e) => setNewDays(Number(e.target.value))}
                  className="w-16 text-center bg-white/10 border border-white/20 rounded-lg text-white text-sm py-1.5 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
                <span className="text-xs text-gray-400">days with no reply</span>
              </div>
            )}
          </div>

          {/* Action selector */}
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 font-medium">THEN…</p>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(ACTION_CONFIG) as ActionType[]).map((a) => {
                const cfg = ACTION_CONFIG[a];
                const Icon = cfg.icon;
                return (
                  <button
                    key={a}
                    onClick={() => setNewAction(a)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-3 rounded-xl border text-sm text-left transition-all",
                      newAction === a
                        ? "border-violet-500 bg-violet-600/15 text-white"
                        : "border-white/10 bg-white/5 text-gray-400 hover:border-white/20"
                    )}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {cfg.label}
                  </button>
                );
              })}
            </div>

            {/* Action config */}
            {newAction === "tag_lead" && (
              <div className="mt-3">
                <input
                  type="text"
                  placeholder="Tag name (e.g. cold-lead, high-priority)"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>
            )}
            {newAction === "webhook" && (
              <div className="mt-3">
                <input
                  type="url"
                  placeholder="https://your-app.com/webhook"
                  value={newWebhookUrl}
                  onChange={(e) => setNewWebhookUrl(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-1">
            <Button onClick={addRule} className="bg-violet-600 hover:bg-violet-700 text-white">
              Save Rule
            </Button>
            <Button variant="ghost" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white">
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Rules list */}
      {rules.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 py-16 text-center">
          <Zap className="w-8 h-8 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No automation rules yet.</p>
          <p className="text-gray-600 text-xs mt-1">Add a rule to automatically respond to lead activity.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rules.map((rule) => {
            const triggerCfg = TRIGGER_CONFIG[rule.trigger];
            const actionCfg = ACTION_CONFIG[rule.action];
            const TriggerIcon = triggerCfg.icon;
            const ActionIcon = actionCfg.icon;

            return (
              <div
                key={rule.id}
                className={cn(
                  "rounded-xl border p-5 transition-all",
                  rule.isActive ? "border-white/10 bg-white/5" : "border-white/5 bg-white/[0.02] opacity-60"
                )}
              >
                <div className="flex items-center gap-4">
                  {/* IF block */}
                  <div className={cn("flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium", triggerCfg.bg, triggerCfg.color)}>
                    <TriggerIcon className="w-4 h-4" />
                    <span>IF</span>
                    <span>{triggerCfg.label}</span>
                    {rule.trigger === "n_days_no_reply" && rule.config.days && (
                      <span className="text-xs opacity-80">(after {rule.config.days}d)</span>
                    )}
                  </div>

                  <MoveRight className="w-4 h-4 text-gray-600 flex-shrink-0" />

                  {/* THEN block */}
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-white/10 text-gray-300 flex-1">
                    <ActionIcon className="w-4 h-4" />
                    <span>THEN</span>
                    <span>{actionCfg.label}</span>
                    {rule.config.tag && <span className="text-xs text-violet-400">#{rule.config.tag}</span>}
                    {rule.config.webhookUrl && (
                      <span className="text-xs text-gray-500 truncate max-w-xs">{rule.config.webhookUrl}</span>
                    )}
                  </div>

                  {/* Toggle + Delete */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => toggleRule(rule.id)}
                      className={cn(
                        "w-9 h-5 rounded-full transition-all relative",
                        rule.isActive ? "bg-violet-600" : "bg-white/20"
                      )}
                    >
                      <span className={cn(
                        "absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all",
                        rule.isActive ? "left-4" : "left-0.5"
                      )} />
                    </button>
                    <button onClick={() => deleteRule(rule.id)} className="text-gray-600 hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info callout */}
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-xs text-gray-500">
        <p className="font-medium text-gray-400 mb-1">How automation rules work</p>
        <ul className="space-y-1 list-disc list-inside">
          <li>Rules apply to all leads in this campaign</li>
          <li>Multiple rules can apply to the same lead</li>
          <li>Rules run in order — pause rules stop further processing</li>
          <li>Toggling a rule off keeps it saved but disables execution</li>
        </ul>
      </div>
    </div>
  );
}
