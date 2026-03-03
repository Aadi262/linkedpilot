"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, Building2, Users, Briefcase, ChevronRight, Check, Loader2, Shield, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Step = 1 | 2 | 3;

interface WorkspaceData {
  name: string;
  useCase: string;
}

interface LinkedInData {
  email: string;
  password: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [workspaceData, setWorkspaceData] = useState<WorkspaceData>({ name: "", useCase: "personal" });
  const [linkedinData, setLinkedinData] = useState<LinkedInData>({ email: "", password: "" });
  const [connectedAccount, setConnectedAccount] = useState<{ username: string; ip: string } | null>(null);

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
      setStep(2);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleLinkedInConnect = async () => {
    if (!linkedinData.email || !linkedinData.password) {
      setError("Both email and password are required");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/linkedin/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(linkedinData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to connect account");
      setConnectedAccount(data.account);
      setStep(3);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Connection failed");
    } finally {
      setLoading(false);
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
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                step > num ? "bg-green-500 text-white" : step === num ? "bg-violet-600 text-white" : "bg-white/10 text-gray-500"
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
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-sm text-left transition-all ${
                        workspaceData.useCase === id
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
                className="w-full bg-violet-600 hover:bg-violet-700 text-white h-11"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Continue <ChevronRight className="w-4 h-4 ml-1" /></>}
              </Button>
            </div>
          </div>
        )}

        {/* Step 2 — LinkedIn Connect */}
        {step === 2 && (
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Connect a LinkedIn account</h1>
            <p className="text-gray-400 text-sm mb-4">We&apos;ll act on your behalf using your credentials.</p>

            <div className="flex items-start gap-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-5">
              <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
              <p className="text-yellow-300 text-xs">
                Only connect LinkedIn accounts you own. We recommend starting with 1 account.
                Credentials are encrypted and never shared.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-gray-300 text-sm mb-1.5 block">LinkedIn email</Label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={linkedinData.email}
                  onChange={(e) => setLinkedinData({ ...linkedinData, email: e.target.value })}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
                />
              </div>
              <div>
                <Label className="text-gray-300 text-sm mb-1.5 block">LinkedIn password</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={linkedinData.password}
                  onChange={(e) => setLinkedinData({ ...linkedinData, password: e.target.value })}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
                />
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              {loading && (
                <div className="flex items-center gap-2 text-gray-400 text-sm py-2">
                  <Loader2 className="w-4 h-4 animate-spin text-violet-400" />
                  Connecting and assigning dedicated proxy...
                </div>
              )}

              <Button
                onClick={handleLinkedInConnect}
                disabled={loading}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white h-11"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Connect Account <ChevronRight className="w-4 h-4 ml-1" /></>}
              </Button>

              <button
                onClick={() => setStep(3)}
                className="w-full text-center text-sm text-gray-500 hover:text-gray-400 transition-colors py-1"
              >
                Skip for now
              </button>
            </div>
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
                    <span className="text-gray-500">Username</span>
                    <span className="text-gray-300">{connectedAccount.username}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Dedicated proxy</span>
                    <span className="text-green-400">Protected ✓</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">IP address</span>
                    <span className="text-gray-400 font-mono text-xs">{connectedAccount.ip}</span>
                  </div>
                </div>
              </div>
            )}

            <Button
              onClick={() => router.push("/dashboard")}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white h-11"
            >
              Go to Dashboard <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
