"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Zap, Building2, Users, Briefcase, ChevronRight, Check, Loader2, Shield, AlertTriangle, Chrome, Key, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Step = 1 | 2 | 3;
type ConnectTab = "extension" | "manual";

interface WorkspaceData {
  name: string;
  useCase: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [workspaceData, setWorkspaceData] = useState<WorkspaceData>({ name: "", useCase: "personal" });
  const [connectedAccount, setConnectedAccount] = useState<{ username: string; id: string } | null>(null);

  // Step 2 state
  const [connectTab, setConnectTab] = useState<ConnectTab>("extension");
  const [accountId, setAccountId] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);
  const [pollStatus, setPollStatus] = useState<string | null>(null);
  const [manualCookie, setManualCookie] = useState("");
  const [pollTimeout, setPollTimeout] = useState(false);

  const useCases = [
    { id: "personal", label: "Personal outreach", icon: Users },
    { id: "agency", label: "Agency", icon: Building2 },
    { id: "sales", label: "Sales team", icon: Briefcase },
  ];

  const handleWorkspaceSubmit = async () => {
    if (!workspaceData.name.trim()) {
      setError("Workspace name is required");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/onboarding/workspace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(workspaceData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create workspace");

      // Create a pending LinkedIn account to get an accountId for the extension
      const accRes = await fetch("/api/linkedin/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "pending@placeholder.com", password: "placeholder" }),
      });
      const accData = await accRes.json();
      if (accData.account?.id) {
        setAccountId(accData.account.id);
      }

      setStep(2);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Poll for session verification status
  const pollForSession = useCallback(async () => {
    if (!accountId) return;
    setPolling(true);
    setPollTimeout(false);

    const startTime = Date.now();
    const intervalId = setInterval(async () => {
      if (Date.now() - startTime > 120000) {
        clearInterval(intervalId);
        setPolling(false);
        setPollTimeout(true);
        return;
      }

      try {
        const res = await fetch(`/api/linkedin/session/ingest?accountId=${accountId}`);
        const data = await res.json();
        setPollStatus(data.status);

        if (data.status === "active") {
          clearInterval(intervalId);
          setPolling(false);
          setConnectedAccount({ username: accountId.slice(0, 8), id: accountId });
          setStep(3);
        } else if (data.status === "flagged") {
          clearInterval(intervalId);
          setPolling(false);
          setError("LinkedIn flagged this session. Try the manual method.");
        }
      } catch {
        // Continue polling on error
      }
    }, 3000);

    return () => clearInterval(intervalId);
  }, [accountId]);

  const handleManualSubmit = async () => {
    if (!manualCookie || manualCookie.length < 20) {
      setError("Please enter a valid li_at cookie value (min 20 chars)");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/linkedin/session/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ li_at: manualCookie, accountId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit cookie");

      // Start polling for verification
      pollForSession();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to submit cookie");
    } finally {
      setLoading(false);
    }
  };

  const copyAccountId = () => {
    if (accountId) {
      navigator.clipboard.writeText(accountId);
    }
  };

  const steps = [
    { num: 1, label: "Workspace" },
    { num: 2, label: "Connect Account" },
    { num: 3, label: "Ready" },
  ];

  return (
    <div className="min-h-screen bg-[#0D0D1A] flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-10">
        <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-xl bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
          LinkedPilot
        </span>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-2 mb-10">
        {steps.map(({ num, label }, i) => (
          <div key={num} className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${step > num ? "bg-green-500 text-white" : step === num ? "bg-violet-600 text-white" : "bg-white/10 text-gray-500"
                }`}>
                {step > num ? <Check className="w-3.5 h-3.5" /> : num}
              </div>
              <span className={`text-sm hidden sm:inline ${step === num ? "text-white font-medium" : "text-gray-500"}`}>{label}</span>
            </div>
            {i < steps.length - 1 && <div className="w-8 h-px bg-white/10 mx-1" />}
          </div>
        ))}
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-8">

        {/* Step 1 — Workspace */}
        {step === 1 && (
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Set up your workspace</h1>
            <p className="text-gray-400 text-sm mb-6">This is where your campaigns, accounts, and team live.</p>

            <div className="space-y-5">
              <div>
                <Label className="text-gray-300 text-sm mb-1.5 block">Workspace name</Label>
                <Input
                  placeholder="Acme Corp Outreach"
                  value={workspaceData.name}
                  onChange={(e) => setWorkspaceData({ ...workspaceData, name: e.target.value })}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
                />
              </div>

              <div>
                <Label className="text-gray-300 text-sm mb-2 block">How will you use LinkedPilot?</Label>
                <div className="space-y-2">
                  {useCases.map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => setWorkspaceData({ ...workspaceData, useCase: id })}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-sm text-left transition-all ${workspaceData.useCase === id
                          ? "border-violet-500 bg-violet-600/15 text-white"
                          : "border-white/10 bg-white/5 text-gray-400 hover:border-white/20"
                        }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      {label}
                      {workspaceData.useCase === id && <Check className="w-4 h-4 ml-auto text-violet-400" />}
                    </button>
                  ))}
                </div>
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <Button
                onClick={handleWorkspaceSubmit}
                disabled={loading}
                variant="primary" className="w-full h-11"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Continue <ChevronRight className="w-4 h-4 ml-1" /></>}
              </Button>
            </div>
          </div>
        )}

        {/* Step 2 — LinkedIn Connect (Chrome Extension + Manual) */}
        {step === 2 && (
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Connect a LinkedIn account</h1>
            <p className="text-gray-400 text-sm mb-4">No password needed — we use session cookies for security.</p>

            {/* Tab selector */}
            <div className="flex border border-white/10 rounded-lg mb-5 overflow-hidden">
              <button
                onClick={() => setConnectTab("extension")}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-sm transition ${connectTab === "extension" ? "bg-violet-600/20 text-violet-300 border-b-2 border-violet-500" : "text-gray-500 hover:text-gray-300"
                  }`}
              >
                <Chrome className="w-4 h-4" /> Extension
              </button>
              <button
                onClick={() => setConnectTab("manual")}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-sm transition ${connectTab === "manual" ? "bg-violet-600/20 text-violet-300 border-b-2 border-violet-500" : "text-gray-500 hover:text-gray-300"
                  }`}
              >
                <Key className="w-4 h-4" /> Manual Cookie
              </button>
            </div>

            {/* Chrome Extension Tab */}
            {connectTab === "extension" && (
              <div className="space-y-4">
                <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-sm space-y-2.5">
                  <p className="text-gray-300 font-medium">Setup steps:</p>
                  <ol className="list-decimal list-inside space-y-1.5 text-gray-400 text-xs">
                    <li>Open Chrome → <code className="bg-white/10 px-1 rounded">chrome://extensions</code></li>
                    <li>Enable <strong className="text-gray-300">Developer Mode</strong> (top right)</li>
                    <li>Click <strong className="text-gray-300">Load unpacked</strong> → select the <code className="bg-white/10 px-1 rounded">chrome-extension/</code> folder</li>
                    <li>Go to <strong className="text-gray-300">linkedin.com</strong> and make sure you&apos;re logged in</li>
                    <li>Click the <strong className="text-gray-300">LinkedPilot</strong> icon in Chrome toolbar</li>
                    <li>Click <strong className="text-violet-400">Extract Session → LinkedPilot</strong></li>
                  </ol>
                </div>

                {accountId && (
                  <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg p-3">
                    <span className="text-xs text-gray-500">Account ID:</span>
                    <code className="text-xs text-violet-300 flex-1 truncate">{accountId}</code>
                    <button onClick={copyAccountId} className="text-gray-400 hover:text-white transition">
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {!polling && !pollTimeout && (
                  <Button onClick={pollForSession} variant="primary" className="w-full h-11">
                    I installed the extension — start waiting
                  </Button>
                )}

                {polling && (
                  <div className="flex items-center gap-2 justify-center text-gray-400 text-sm py-3">
                    <Loader2 className="w-4 h-4 animate-spin text-violet-400" />
                    Waiting for session... ({pollStatus || 'checking'})
                  </div>
                )}

                {pollTimeout && (
                  <div className="text-center space-y-2">
                    <p className="text-amber-400 text-sm">Timed out waiting for session.</p>
                    <button onClick={() => setConnectTab("manual")} className="text-violet-400 text-sm underline">
                      Try the manual method instead
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Manual Cookie Tab */}
            {connectTab === "manual" && (
              <div className="space-y-4">
                <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-sm space-y-2 text-gray-400">
                  <p className="text-gray-300 font-medium">How to find your li_at cookie:</p>
                  <ol className="list-decimal list-inside space-y-1 text-xs">
                    <li>Open Chrome → go to <strong className="text-gray-300">linkedin.com</strong></li>
                    <li>Press <code className="bg-white/10 px-1 rounded">F12</code> → <strong className="text-gray-300">Application</strong> tab</li>
                    <li>Under <strong className="text-gray-300">Cookies</strong> → <code className="bg-white/10 px-1 rounded">www.linkedin.com</code></li>
                    <li>Find <code className="bg-white/10 px-1 rounded text-violet-300">li_at</code> → Copy the <strong className="text-gray-300">Value</strong></li>
                  </ol>
                </div>

                <div>
                  <Label className="text-gray-300 text-sm mb-1.5 block">li_at cookie value</Label>
                  <Input
                    type="text"
                    placeholder="AQEDAxxxxxx..."
                    value={manualCookie}
                    onChange={(e) => setManualCookie(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 font-mono text-xs"
                  />
                </div>

                {error && <p className="text-red-400 text-sm">{error}</p>}

                {polling && (
                  <div className="flex items-center gap-2 justify-center text-gray-400 text-sm py-2">
                    <Loader2 className="w-4 h-4 animate-spin text-violet-400" />
                    Verifying session...
                  </div>
                )}

                <Button
                  onClick={handleManualSubmit}
                  disabled={loading || polling}
                  variant="primary" className="w-full h-11"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Submit Cookie <ChevronRight className="w-4 h-4 ml-1" /></>}
                </Button>
              </div>
            )}

            <button
              onClick={() => setStep(3)}
              className="w-full text-center text-sm text-gray-500 hover:text-gray-400 transition-colors py-2 mt-3"
            >
              Skip for now
            </button>
          </div>
        )}

        {/* Step 3 — Confirmation */}
        {step === 3 && (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-5">
              <Check className="w-8 h-8 text-green-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">You&apos;re all set!</h1>
            <p className="text-gray-400 text-sm mb-6">Your workspace is ready. Let&apos;s build your first campaign.</p>

            {connectedAccount && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6 text-left">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-4 h-4 text-green-400" />
                  <span className="text-sm font-medium text-white">Account connected</span>
                </div>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Account ID</span>
                    <span className="text-gray-300 font-mono text-xs">{connectedAccount.id.slice(0, 12)}...</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Session</span>
                    <span className="text-green-400">Verified ✓</span>
                  </div>
                </div>
              </div>
            )}

            <Button
              onClick={() => router.push("/dashboard")}
              variant="primary" className="w-full h-11"
            >
              Go to Dashboard <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
