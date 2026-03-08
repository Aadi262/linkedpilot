"use client";
import { useState } from "react";
import { Plus, Trash2, Send, Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const EVENT_OPTIONS = [
  { id: "reply_received", label: "Reply Received" },
  { id: "connection_accepted", label: "Connection Accepted" },
  { id: "campaign_complete", label: "Campaign Complete" },
  { id: "account_flagged", label: "Account Flagged" },
  { id: "connection_sent", label: "Connection Sent" },
];

interface Webhook {
  id: string;
  url: string;
  events: string[];
  secret: string;
  isActive: boolean;
  lastDelivered: string | null;
}

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([
    {
      id: "wh_1",
      url: "https://hooks.zapier.com/hooks/catch/123456/abcdef",
      events: ["reply_received", "connection_accepted"],
      secret: "whsec_abc123xyz789",
      isActive: true,
      lastDelivered: "10 minutes ago",
    },
  ]);
  const [showAdd, setShowAdd] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [newEvents, setNewEvents] = useState<string[]>([]);
  const [revealedSecrets, setRevealedSecrets] = useState<Set<string>>(new Set());
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, "success" | "failed">>({});

  const addWebhook = () => {
    if (!newUrl || newEvents.length === 0) return;
    const wh: Webhook = {
      id: `wh_${Date.now()}`,
      url: newUrl,
      events: newEvents,
      secret: `whsec_${Math.random().toString(36).slice(2, 18)}`,
      isActive: true,
      lastDelivered: null,
    };
    setWebhooks((prev) => [...prev, wh]);
    setNewUrl(""); setNewEvents([]); setShowAdd(false);
  };

  const removeWebhook = (id: string) => setWebhooks((prev) => prev.filter((w) => w.id !== id));
  const toggleSecret = (id: string) => setRevealedSecrets((prev) => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  const testWebhook = async (id: string) => {
    setTestingId(id);
    await new Promise((r) => setTimeout(r, 1500));
    setTestResults((prev) => ({ ...prev, [id]: "success" }));
    setTestingId(null);
    setTimeout(() => setTestResults((prev) => { const n = { ...prev }; delete n[id]; return n; }), 3000);
  };

  const toggleEvent = (e: string) => setNewEvents((prev) => prev.includes(e) ? prev.filter((x) => x !== e) : [...prev, e]);

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Webhooks</h2>
          <p className="text-gray-500 text-sm mt-0.5">Send real-time events to external services</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="bg-violet-600 hover:bg-violet-700 text-white gap-2">
          <Plus className="w-4 h-4" /> Add Webhook
        </Button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="rounded-xl border border-violet-500/30 bg-violet-600/5 p-5 space-y-4">
          <h3 className="text-sm font-medium text-white">New Webhook</h3>
          <div>
            <Label className="text-gray-300 text-sm mb-1.5 block">Endpoint URL</Label>
            <Input placeholder="https://your-app.com/webhooks/linkedpilot" value={newUrl} onChange={(e) => setNewUrl(e.target.value)} className="bg-white/10 border-white/20 text-white placeholder:text-gray-600" />
          </div>
          <div>
            <Label className="text-gray-300 text-sm mb-2 block">Events to subscribe</Label>
            <div className="flex flex-wrap gap-2">
              {EVENT_OPTIONS.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => toggleEvent(id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${newEvents.includes(id) ? "border-violet-500 bg-violet-600/20 text-violet-300" : "border-white/10 bg-white/5 text-gray-400 hover:text-white"}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={addWebhook} disabled={!newUrl || newEvents.length === 0} className="bg-violet-600 hover:bg-violet-700 text-white">Create Webhook</Button>
            <Button variant="ghost" onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-white">Cancel</Button>
          </div>
        </div>
      )}

      {/* Webhooks list */}
      {webhooks.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-white/5 py-16 text-center">
          <p className="text-gray-500 text-sm">No webhooks configured yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {webhooks.map((wh) => (
            <div key={wh.id} className="rounded-xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${wh.isActive ? "bg-green-400" : "bg-gray-500"}`} />
                    <span className="text-sm text-white font-mono truncate">{wh.url}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {wh.events.map((e) => (
                      <span key={e} className="text-xs px-1.5 py-0.5 bg-white/10 text-gray-400 rounded">{e.replace(/_/g, " ")}</span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={testingId === wh.id}
                    onClick={() => testWebhook(wh.id)}
                    className="border-white/20 text-gray-400 hover:text-white h-7 text-xs gap-1"
                  >
                    {testingId === wh.id ? "Sending..." : testResults[wh.id] === "success" ? <><CheckCircle2 className="w-3 h-3 text-green-400" /> Sent!</> : testResults[wh.id] === "failed" ? <><XCircle className="w-3 h-3 text-red-400" /> Failed</> : <><Send className="w-3 h-3" /> Test</>}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-600 hover:text-red-400" onClick={() => removeWebhook(wh.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
              {/* Secret */}
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/10">
                <span className="text-xs text-gray-500 flex-shrink-0">Secret:</span>
                <code className="text-xs font-mono text-gray-400 flex-1 truncate">
                  {revealedSecrets.has(wh.id) ? wh.secret : "whsec_••••••••••••••••"}
                </code>
                <button onClick={() => toggleSecret(wh.id)} className="text-gray-600 hover:text-gray-400">
                  {revealedSecrets.has(wh.id) ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
                {wh.lastDelivered && <span className="text-xs text-gray-600">Last delivered: {wh.lastDelivered}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
