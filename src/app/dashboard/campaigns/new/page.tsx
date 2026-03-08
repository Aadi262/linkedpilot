"use client";
import { useState, useReducer } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronRight, ChevronLeft, Loader2, Plus, Trash2, GripVertical, Users, Zap, AlertTriangle, Upload, Link2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type StepType = "connection_request" | "message" | "follow_up" | "inmail";

interface SequenceStep {
  id: string;
  type: StepType;
  content: string;
  note?: string;
  delay: number;
  subject?: string;
}

interface CampaignState {
  name: string;
  goal: string;
  dailyLimit: number;
  startDate: string;
  endDate: string;
  selectedAccounts: string[];
  leads: { linkedinProfileUrl: string; firstName?: string; lastName?: string; company?: string }[];
  sequence: SequenceStep[];
}

type Action =
  | { type: "SET_FIELD"; key: keyof CampaignState; value: unknown }
  | { type: "TOGGLE_ACCOUNT"; id: string }
  | { type: "ADD_STEP"; stepType: StepType }
  | { type: "UPDATE_STEP"; id: string; field: string; value: string | number }
  | { type: "REMOVE_STEP"; id: string }
  | { type: "SET_LEADS"; leads: CampaignState["leads"] };

function reducer(state: CampaignState, action: Action): CampaignState {
  switch (action.type) {
    case "SET_FIELD": return { ...state, [action.key]: action.value };
    case "TOGGLE_ACCOUNT": {
      const has = state.selectedAccounts.includes(action.id);
      return { ...state, selectedAccounts: has ? state.selectedAccounts.filter((a) => a !== action.id) : [...state.selectedAccounts, action.id] };
    }
    case "ADD_STEP": {
      const newStep: SequenceStep = { id: `step_${Date.now()}`, type: action.stepType, content: "", delay: state.sequence.length === 0 ? 0 : 3 };
      return { ...state, sequence: [...state.sequence, newStep] };
    }
    case "UPDATE_STEP": return { ...state, sequence: state.sequence.map((s) => s.id === action.id ? { ...s, [action.field]: action.value } : s) };
    case "REMOVE_STEP": return { ...state, sequence: state.sequence.filter((s) => s.id !== action.id) };
    case "SET_LEADS": return { ...state, leads: action.leads };
    default: return state;
  }
}

// ─── Stub data ─────────────────────────────────────────────────────────────

const STUB_ACCOUNTS = [
  { id: "acc_1", displayName: "Sarah Kim", status: "active", dailyLeft: 76 },
  { id: "acc_2", displayName: "Mike Rodriguez", status: "active", dailyLeft: 133 },
  { id: "acc_3", displayName: "Alex Thompson", status: "frozen", dailyLeft: 0 },
];

// ─── Step type config ──────────────────────────────────────────────────────

const STEP_TYPE_CONFIG: Record<StepType, { label: string; color: string; bg: string }> = {
  connection_request: { label: "Connection Request", color: "text-violet-400", bg: "bg-violet-600/20" },
  message: { label: "Message", color: "text-blue-400", bg: "bg-blue-600/20" },
  follow_up: { label: "Follow-up", color: "text-green-400", bg: "bg-green-600/20" },
  inmail: { label: "InMail", color: "text-yellow-400", bg: "bg-yellow-600/20" },
};

const VARIABLES = ["{{firstName}}", "{{lastName}}", "{{company}}", "{{title}}"];

// ─── Wizard steps config ───────────────────────────────────────────────────

const WIZARD_STEPS = ["Basics", "Accounts", "Leads", "Sequence", "Review"];

// ─── Component ────────────────────────────────────────────────────────────

export default function NewCampaignPage() {
  const router = useRouter();
  const [wizardStep, setWizardStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [importTab, setImportTab] = useState<"csv" | "salesnav" | "linkedin">("csv");
  const [csvPreview, setCsvPreview] = useState<string[][]>([]);
  const [importUrl, setImportUrl] = useState("");

  const [state, dispatch] = useReducer(reducer, {
    name: "",
    goal: "generate_leads",
    dailyLimit: 30,
    startDate: "",
    endDate: "",
    selectedAccounts: [],
    leads: [],
    sequence: [],
  });

  const goNext = () => setWizardStep((s) => Math.min(s + 1, 4));
  const goPrev = () => setWizardStep((s) => Math.max(s - 1, 0));

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const rows = text.trim().split("\n").map((r) => r.split(",").map((c) => c.trim().replace(/^"|"$/g, "")));
      setCsvPreview(rows.slice(0, 6));
      const dataRows = rows.slice(1);
      const leads = dataRows.map((r) => ({ linkedinProfileUrl: r[0] || "", firstName: r[1], lastName: r[2], company: r[3] }));
      dispatch({ type: "SET_LEADS", leads });
    };
    reader.readAsText(file);
  };

  const handleLaunch = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state),
      });
      const data = await res.json();
      if (data.success) router.push("/dashboard/campaigns");
    } catch {
      /* stub: just navigate */
    } finally {
      setLoading(false);
      router.push("/dashboard/campaigns");
    }
  };

  const selectedCapacity = STUB_ACCOUNTS
    .filter((a) => state.selectedAccounts.includes(a.id) && a.status === "active")
    .reduce((sum, a) => sum + a.dailyLeft, 0);

  return (
    <div className="max-w-3xl mx-auto">
      {/* Wizard progress */}
      <div className="flex items-center gap-0 mb-10">
        {WIZARD_STEPS.map((label, i) => (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all",
                wizardStep > i ? "bg-green-500 text-white" : wizardStep === i ? "bg-violet-600 text-white" : "bg-white/10 text-gray-500"
              )}>
                {wizardStep > i ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className={cn("text-xs mt-1 hidden sm:block", wizardStep === i ? "text-white font-medium" : "text-gray-600")}>{label}</span>
            </div>
            {i < WIZARD_STEPS.length - 1 && (
              <div className={cn("flex-1 h-px mx-2 mb-4", wizardStep > i ? "bg-green-500/50" : "bg-white/10")} />
            )}
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-8">

        {/* ── Step 1: Basics ── */}
        {wizardStep === 0 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-white">Campaign Basics</h2>
              <p className="text-gray-500 text-sm mt-1">Give your campaign a name and set your goal.</p>
            </div>
            <div>
              <Label className="text-gray-300 text-sm mb-1.5 block">Campaign Name *</Label>
              <Input placeholder="Q2 SaaS Founders Outreach" value={state.name} onChange={(e) => dispatch({ type: "SET_FIELD", key: "name", value: e.target.value })} className="bg-white/10 border-white/20 text-white placeholder:text-gray-600" />
            </div>
            <div>
              <Label className="text-gray-300 text-sm mb-2 block">Goal</Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: "generate_leads", label: "Generate Leads" },
                  { id: "book_meetings", label: "Book Meetings" },
                  { id: "reengage", label: "Re-engage Connections" },
                ].map(({ id, label }) => (
                  <button key={id} onClick={() => dispatch({ type: "SET_FIELD", key: "goal", value: id })}
                    className={cn("px-4 py-3 rounded-lg border text-sm text-left transition-all", state.goal === id ? "border-violet-500 bg-violet-600/15 text-white" : "border-white/10 bg-white/5 text-gray-400 hover:border-white/20")}>
                    {state.goal === id && <Check className="w-3.5 h-3.5 inline mr-1.5 text-violet-400" />}{label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-gray-300 text-sm mb-2 block">Daily Outreach Limit: <span className="text-violet-400 font-semibold">{state.dailyLimit} actions/day</span></Label>
              <input type="range" min={10} max={100} step={5} value={state.dailyLimit} onChange={(e) => dispatch({ type: "SET_FIELD", key: "dailyLimit", value: Number(e.target.value) })} className="w-full accent-violet-600" />
              <div className="flex justify-between text-xs text-gray-600 mt-1"><span>10</span><span>100</span></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300 text-sm mb-1.5 block">Start Date</Label>
                <Input type="date" value={state.startDate} onChange={(e) => dispatch({ type: "SET_FIELD", key: "startDate", value: e.target.value })} className="bg-white/10 border-white/20 text-white [color-scheme:dark]" />
              </div>
              <div>
                <Label className="text-gray-300 text-sm mb-1.5 block">End Date (optional)</Label>
                <Input type="date" value={state.endDate} onChange={(e) => dispatch({ type: "SET_FIELD", key: "endDate", value: e.target.value })} className="bg-white/10 border-white/20 text-white [color-scheme:dark]" />
              </div>
            </div>
          </div>
        )}

        {/* ── Step 2: Select Accounts ── */}
        {wizardStep === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-white">Select Sender Accounts</h2>
              <p className="text-gray-500 text-sm mt-1">Choose which LinkedIn accounts will run this campaign.</p>
            </div>
            <div className="space-y-3">
              {STUB_ACCOUNTS.map((acc) => {
                const selected = state.selectedAccounts.includes(acc.id);
                const frozen = acc.status === "frozen";
                return (
                  <button key={acc.id} onClick={() => !frozen && dispatch({ type: "TOGGLE_ACCOUNT", id: acc.id })} disabled={frozen}
                    className={cn("w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all",
                      frozen ? "border-white/5 bg-white/[0.02] opacity-50 cursor-not-allowed" :
                      selected ? "border-violet-500 bg-violet-600/10" : "border-white/10 bg-white/5 hover:border-white/20")}>
                    <div className={cn("w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all", selected ? "border-violet-500 bg-violet-600" : "border-white/20")}>
                      {selected && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <div className="w-9 h-9 rounded-full bg-violet-600/30 flex items-center justify-center text-xs font-semibold text-violet-300 flex-shrink-0">
                      {acc.displayName.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white">{acc.displayName}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{frozen ? "Frozen — cannot be selected" : `${acc.dailyLeft} daily actions remaining`}</div>
                    </div>
                    <span className={cn("text-xs px-2 py-0.5 rounded-full border", frozen ? "bg-yellow-400/10 text-yellow-400 border-yellow-400/20" : "bg-green-400/10 text-green-400 border-green-400/20")}>
                      {frozen ? "Frozen" : "Active"}
                    </span>
                  </button>
                );
              })}
            </div>
            {state.selectedAccounts.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-violet-300 bg-violet-600/10 border border-violet-500/20 rounded-lg px-4 py-2.5">
                <Zap className="w-4 h-4" />
                Total daily capacity across selected accounts: <span className="font-semibold">{selectedCapacity} actions/day</span>
              </div>
            )}
          </div>
        )}

        {/* ── Step 3: Import Leads ── */}
        {wizardStep === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-semibold text-white">Import Leads</h2>
              <p className="text-gray-500 text-sm mt-1">Add the LinkedIn profiles you want to reach out to.</p>
            </div>

            {/* Tab selector */}
            <div className="flex gap-1 bg-white/5 rounded-lg p-1 border border-white/10 w-fit">
              {([["csv", "CSV Upload", Upload], ["salesnav", "Sales Nav URL", Link2], ["linkedin", "LinkedIn URL", FileText]] as const).map(([id, label, Icon]) => (
                <button key={id} onClick={() => setImportTab(id)}
                  className={cn("flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all", importTab === id ? "bg-violet-600 text-white" : "text-gray-400 hover:text-white")}>
                  <Icon className="w-3.5 h-3.5" />{label}
                </button>
              ))}
            </div>

            {/* CSV tab */}
            {importTab === "csv" && (
              <div>
                <label className="block">
                  <div className="border-2 border-dashed border-white/10 hover:border-violet-500/50 rounded-xl p-10 text-center cursor-pointer transition-colors">
                    <Upload className="w-8 h-8 text-gray-600 mx-auto mb-3" />
                    <p className="text-sm text-gray-400">Drag &amp; drop your CSV or <span className="text-violet-400">click to browse</span></p>
                    <p className="text-xs text-gray-600 mt-1">Required column: linkedinProfileUrl. Optional: firstName, lastName, company, title</p>
                  </div>
                  <input type="file" accept=".csv" className="hidden" onChange={handleCSVUpload} />
                </label>
                {csvPreview.length > 0 && (
                  <div className="mt-4 rounded-xl border border-white/10 overflow-hidden">
                    <div className="px-4 py-2.5 border-b border-white/10 bg-white/[0.03] flex justify-between items-center">
                      <span className="text-xs font-medium text-gray-400">Preview (first 5 rows)</span>
                      <span className="text-xs text-green-400">{state.leads.length} leads ready to import</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead><tr className="border-b border-white/5">{csvPreview[0]?.map((h, i) => <th key={i} className="px-4 py-2 text-left text-gray-500 font-medium">{h}</th>)}</tr></thead>
                        <tbody>{csvPreview.slice(1).map((row, i) => <tr key={i} className="border-b border-white/5 last:border-0"><td className="px-4 py-2 text-gray-400" colSpan={99}>{row.join(" · ")}</td></tr>)}</tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Sales Nav / LinkedIn URL tabs */}
            {(importTab === "salesnav" || importTab === "linkedin") && (
              <div className="space-y-3">
                <div>
                  <Label className="text-gray-300 text-sm mb-1.5 block">
                    {importTab === "salesnav" ? "Sales Navigator Search URL" : "LinkedIn Search URL"}
                  </Label>
                  <Input
                    placeholder={importTab === "salesnav" ? "https://www.linkedin.com/sales/search/people?..." : "https://www.linkedin.com/search/results/people?..."}
                    value={importUrl}
                    onChange={(e) => setImportUrl(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-600"
                  />
                </div>
                <div className="flex items-start gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                  <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <p className="text-yellow-300 text-xs">In stub mode, URL imports return mock data. Add your LinkedIn session cookie in production to enable real scraping.</p>
                </div>
                <Button onClick={() => { dispatch({ type: "SET_LEADS", leads: [{ linkedinProfileUrl: "https://linkedin.com/in/example-1" }, { linkedinProfileUrl: "https://linkedin.com/in/example-2" }] }); }}
                  variant="outline" className="border-white/20 text-gray-300 hover:text-white">
                  Import (Stub — 2 mock leads)
                </Button>
                {state.leads.length > 0 && <p className="text-xs text-green-400">{state.leads.length} leads queued for import</p>}
              </div>
            )}
          </div>
        )}

        {/* ── Step 4: Sequence Builder ── */}
        {wizardStep === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-semibold text-white">Build Your Sequence</h2>
              <p className="text-gray-500 text-sm mt-1">Create the steps your campaign will run through for each lead.</p>
            </div>

            {/* Add step button */}
            <div className="flex flex-wrap gap-2">
              {(Object.keys(STEP_TYPE_CONFIG) as StepType[]).map((type) => {
                const cfg = STEP_TYPE_CONFIG[type];
                return (
                  <button key={type} onClick={() => dispatch({ type: "ADD_STEP", stepType: type })}
                    className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-xs font-medium hover:border-white/20 transition-all", cfg.bg, cfg.color)}>
                    <Plus className="w-3.5 h-3.5" />{cfg.label}
                  </button>
                );
              })}
            </div>

            {/* Steps list */}
            {state.sequence.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 py-14 text-center">
                <p className="text-gray-600 text-sm">No steps yet. Add a step above to get started.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {state.sequence.map((step, i) => {
                  const cfg = STEP_TYPE_CONFIG[step.type];
                  return (
                    <div key={step.id} className={cn("rounded-xl border p-4", cfg.bg, "border-white/10")}>
                      <div className="flex items-center gap-3 mb-3">
                        <GripVertical className="w-4 h-4 text-gray-600 cursor-grab flex-shrink-0" />
                        <div className={cn("w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-semibold", cfg.color)}>{i + 1}</div>
                        <span className={cn("text-xs font-semibold uppercase tracking-wider", cfg.color)}>{cfg.label}</span>
                        {i > 0 && (
                          <div className="flex items-center gap-1.5 ml-auto mr-2">
                            <span className="text-xs text-gray-500">Send after</span>
                            <input type="number" min={1} max={30} value={step.delay}
                              onChange={(e) => dispatch({ type: "UPDATE_STEP", id: step.id, field: "delay", value: Number(e.target.value) })}
                              className="w-12 text-center bg-white/10 border border-white/20 rounded text-white text-xs py-1" />
                            <span className="text-xs text-gray-500">days</span>
                          </div>
                        )}
                        <button onClick={() => dispatch({ type: "REMOVE_STEP", id: step.id })} className={cn("text-gray-600 hover:text-red-400 transition-colors", i > 0 ? "" : "ml-auto")}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {step.type === "inmail" && (
                        <Input
                          placeholder="Subject line..."
                          value={step.subject || ""}
                          onChange={(e) => dispatch({ type: "UPDATE_STEP", id: step.id, field: "subject", value: e.target.value })}
                          className="bg-white/10 border-white/20 text-white placeholder:text-gray-600 mb-2 text-sm"
                        />
                      )}

                      <textarea
                        rows={3}
                        placeholder={step.type === "connection_request" ? "Personalize your connection note (optional, max 300 chars)..." : "Write your message... Use {{firstName}}, {{company}}, {{title}}"}
                        value={step.content}
                        maxLength={step.type === "connection_request" ? 300 : 2000}
                        onChange={(e) => dispatch({ type: "UPDATE_STEP", id: step.id, field: "content", value: e.target.value })}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none"
                      />

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex gap-1.5 flex-wrap">
                          {VARIABLES.map((v) => (
                            <button key={v} onClick={() => dispatch({ type: "UPDATE_STEP", id: step.id, field: "content", value: step.content + v })}
                              className="text-xs px-2 py-0.5 bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white rounded transition-colors">
                              {v}
                            </button>
                          ))}
                        </div>
                        {step.type === "connection_request" && (
                          <span className="text-xs text-gray-600 flex-shrink-0">{step.content.length}/300</span>
                        )}
                      </div>

                      {step.type === "follow_up" && (
                        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-yellow-500" />
                          Only sends if no reply received within {step.delay} days
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Step 5: Review + Launch ── */}
        {wizardStep === 4 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-semibold text-white">Review &amp; Launch</h2>
              <p className="text-gray-500 text-sm mt-1">Double-check everything before launching your campaign.</p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.03] divide-y divide-white/10">
              {[
                { label: "Campaign Name", value: state.name || "(untitled)" },
                { label: "Goal", value: state.goal.replace(/_/g, " ") },
                { label: "Daily Limit", value: `${state.dailyLimit} actions/day` },
                { label: "Sender Accounts", value: `${state.selectedAccounts.length} account${state.selectedAccounts.length !== 1 ? "s" : ""}` },
                { label: "Leads", value: state.leads.length > 0 ? `${state.leads.length} leads imported` : "None imported yet" },
                { label: "Sequence Steps", value: `${state.sequence.length} step${state.sequence.length !== 1 ? "s" : ""}` },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between px-5 py-3.5 text-sm">
                  <span className="text-gray-500">{label}</span>
                  <span className="text-white font-medium capitalize">{value}</span>
                </div>
              ))}
            </div>

            {state.selectedAccounts.length > 0 && state.leads.length > 0 && state.dailyLimit > 0 && (
              <div className="flex items-center gap-2 text-sm text-blue-300 bg-blue-600/10 border border-blue-500/20 rounded-lg px-4 py-3">
                <Users className="w-4 h-4 flex-shrink-0" />
                Estimated completion: ~{Math.ceil(state.leads.length / (state.dailyLimit * Math.max(1, state.selectedAccounts.length)))} days at current settings
              </div>
            )}

            <div className="flex gap-3">
              <Button onClick={handleLaunch} disabled={loading} variant="primary" className="flex-1 h-11">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Launch Campaign"}
              </Button>
              <Button variant="outline" className="border-white/20 text-gray-300 hover:text-white h-11" onClick={() => router.push("/dashboard/campaigns")}>
                Save as Draft
              </Button>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-6 border-t border-white/10">
          <Button variant="ghost" onClick={goPrev} disabled={wizardStep === 0} className="text-gray-400 hover:text-white gap-2">
            <ChevronLeft className="w-4 h-4" /> Back
          </Button>
          {wizardStep < 4 ? (
            <Button onClick={goNext} disabled={wizardStep === 0 && !state.name.trim()} variant="primary" className="gap-2">
              Continue <ChevronRight className="w-4 h-4" />
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
