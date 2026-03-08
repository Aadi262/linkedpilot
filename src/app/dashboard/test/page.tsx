"use client";
import { useState, useEffect } from "react";
import {
    Database,
    Wifi,
    Shield,
    Monitor,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Loader2,
    Activity,
} from "lucide-react";

interface TestResult {
    status: "idle" | "loading" | "success" | "error";
    data?: Record<string, unknown>;
    error?: string;
}

interface AccountInfo {
    id: string;
    username: string;
    displayName: string;
    status: string;
}

export default function TestDashboard() {
    const [dbTest, setDbTest] = useState<TestResult>({ status: "idle" });
    const [redisTest, setRedisTest] = useState<TestResult>({ status: "idle" });
    const [accounts, setAccounts] = useState<AccountInfo[]>([]);
    const [sessionResults, setSessionResults] = useState<Record<string, TestResult>>({});
    const [smokeResults, setSmokeResults] = useState<Record<string, TestResult>>({});
    const [actionResult, setActionResult] = useState<TestResult>({ status: "idle" });
    const [counterResult, setCounterResult] = useState<TestResult>({ status: "idle" });

    // Action test inputs
    const [profileUrl, setProfileUrl] = useState("");
    const [selectedAccount, setSelectedAccount] = useState("");
    const [actionType, setActionType] = useState("view_profile");

    // Counter override inputs
    const [counterAccountId, setCounterAccountId] = useState("");
    const [counterValue, setCounterValue] = useState("0");
    const [counterType, setCounterType] = useState("actions");

    // Quick connect inputs
    const [cookieInput, setCookieInput] = useState("");
    const [nameInput, setNameInput] = useState("");
    const [connectResult, setConnectResult] = useState<TestResult>({ status: "idle" });

    const refreshAccounts = () => {
        fetch("/api/accounts")
            .then((r) => r.json())
            .then((d) => {
                if (d.data) {
                    setAccounts(d.data);
                    if (d.data.length > 0 && !selectedAccount) setSelectedAccount(d.data[0].id);
                }
            })
            .catch(() => { });
    };

    useEffect(() => {
        refreshAccounts();
    }, []);

    const quickConnect = async () => {
        if (!cookieInput || cookieInput.length < 20) return;
        setConnectResult({ status: "loading" });
        try {
            const res = await fetch("/api/test/quick-connect", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ li_at: cookieInput, displayName: nameInput || "Test Account" }),
            });
            const data = await res.json();
            if (data.success) {
                setConnectResult({ status: "success", data });
                setCookieInput("");
                setNameInput("");
                refreshAccounts();
            } else {
                setConnectResult({ status: "error", data });
            }
        } catch (err) {
            setConnectResult({ status: "error", error: String(err) });
        }
    };

    const testDb = async () => {
        setDbTest({ status: "loading" });
        try {
            const res = await fetch("/api/test/db");
            const data = await res.json();
            setDbTest({ status: data.connected ? "success" : "error", data });
        } catch (err) {
            setDbTest({ status: "error", error: String(err) });
        }
    };

    const testRedis = async () => {
        setRedisTest({ status: "loading" });
        try {
            const res = await fetch("/api/test/redis");
            const data = await res.json();
            setRedisTest({ status: data.connected ? "success" : "error", data });
        } catch (err) {
            setRedisTest({ status: "error", error: String(err) });
        }
    };

    const verifySession = async (accountId: string) => {
        setSessionResults((prev) => ({ ...prev, [accountId]: { status: "loading" } }));
        try {
            const res = await fetch("/api/test/verify-session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ accountId }),
            });
            const data = await res.json();
            setSessionResults((prev) => ({
                ...prev,
                [accountId]: { status: data.valid ? "success" : "error", data },
            }));
        } catch (err) {
            setSessionResults((prev) => ({
                ...prev,
                [accountId]: { status: "error", error: String(err) },
            }));
        }
    };

    const runSmoke = async (accountId: string) => {
        setSmokeResults((prev) => ({ ...prev, [accountId]: { status: "loading" } }));
        try {
            const res = await fetch("/api/test/smoke", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ accountId }),
            });
            const data = await res.json();
            setSmokeResults((prev) => ({
                ...prev,
                [accountId]: { status: data.loggedIn ? "success" : "error", data },
            }));
        } catch (err) {
            setSmokeResults((prev) => ({
                ...prev,
                [accountId]: { status: "error", error: String(err) },
            }));
        }
    };

    const runAction = async () => {
        if (!profileUrl || !selectedAccount) return;
        setActionResult({ status: "loading" });
        try {
            const res = await fetch("/api/test/action", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ accountId: selectedAccount, profileUrl, actionType }),
            });
            const data = await res.json();
            setActionResult({ status: res.ok ? "success" : "error", data });
        } catch (err) {
            setActionResult({ status: "error", error: String(err) });
        }
    };

    const setCounter = async () => {
        if (!counterAccountId) return;
        setCounterResult({ status: "loading" });
        try {
            const res = await fetch("/api/test/set-counter", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    accountId: counterAccountId,
                    counterType,
                    value: parseInt(counterValue),
                }),
            });
            const data = await res.json();
            setCounterResult({ status: "success", data });
        } catch (err) {
            setCounterResult({ status: "error", error: String(err) });
        }
    };

    const StatusIcon = ({ status }: { status: string }) => {
        if (status === "loading") return <Loader2 className="w-5 h-5 animate-spin text-blue-400" />;
        if (status === "success") return <CheckCircle2 className="w-5 h-5 text-green-400" />;
        if (status === "error") return <XCircle className="w-5 h-5 text-red-400" />;
        return <Activity className="w-5 h-5 text-gray-500" />;
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white p-6">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center gap-3">
                    <Monitor className="w-8 h-8 text-purple-400" />
                    <h1 className="text-3xl font-bold">LinkedPilot — Live Test Dashboard</h1>
                </div>
                <p className="text-gray-400">Developer tools to verify all services and test LinkedIn automation.</p>

                {/* Section 0: Quick Connect — paste li_at cookie */}
                {accounts.length === 0 && (
                    <section className="bg-gray-900 rounded-xl p-6 border-2 border-amber-600/50">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Shield className="w-5 h-5 text-amber-400" />
                                <h2 className="text-xl font-semibold text-amber-400">Quick Connect — Paste li_at Cookie</h2>
                            </div>
                            <StatusIcon status={connectResult.status} />
                        </div>
                        <div className="bg-amber-950/30 border border-amber-900/50 rounded-lg p-3 mb-4 text-sm text-amber-200">
                            <p className="mb-2"><strong>How to get your li_at cookie:</strong></p>
                            <ol className="list-decimal list-inside space-y-1 text-amber-300">
                                <li>Open Chrome → go to <strong>linkedin.com</strong> (make sure you&apos;re logged in)</li>
                                <li>Press <strong>F12</strong> → go to <strong>Application</strong> tab</li>
                                <li>Click <strong>Cookies</strong> → <strong>www.linkedin.com</strong></li>
                                <li>Find <strong>li_at</strong> → copy the <strong>Value</strong></li>
                                <li>Paste it below</li>
                            </ol>
                            <p className="mt-2 text-red-300">⚠️ Use a <strong>secondary test account</strong>, NOT your main LinkedIn!</p>
                        </div>
                        <div className="space-y-3">
                            <input
                                type="text" value={nameInput} onChange={(e) => setNameInput(e.target.value)}
                                placeholder="Display name (e.g. Test Account)" className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm"
                            />
                            <input
                                type="text" value={cookieInput} onChange={(e) => setCookieInput(e.target.value)}
                                placeholder="Paste li_at cookie value here..." className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm font-mono"
                            />
                            <button
                                onClick={quickConnect}
                                disabled={connectResult.status === "loading" || cookieInput.length < 20}
                                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 rounded-lg disabled:opacity-50 transition font-medium"
                            >
                                {connectResult.status === "loading" ? "Connecting..." : "🔗 Connect Account"}
                            </button>
                        </div>
                        {connectResult.data && (
                            <pre className="mt-4 p-3 bg-gray-800 rounded-lg text-sm overflow-auto">{JSON.stringify(connectResult.data, null, 2)}</pre>
                        )}
                    </section>
                )}

                {/* Section 1: DB Connection */}
                <section className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Database className="w-5 h-5 text-blue-400" />
                            <h2 className="text-xl font-semibold">Database Connection</h2>
                        </div>
                        <StatusIcon status={dbTest.status} />
                    </div>
                    <button onClick={testDb} disabled={dbTest.status === "loading"} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 transition">
                        Test DB Connection
                    </button>
                    {dbTest.data && (
                        <pre className="mt-4 p-3 bg-gray-800 rounded-lg text-sm overflow-auto">{JSON.stringify(dbTest.data, null, 2)}</pre>
                    )}
                </section>

                {/* Section 2: Redis Connection */}
                <section className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Wifi className="w-5 h-5 text-green-400" />
                            <h2 className="text-xl font-semibold">Redis Connection</h2>
                        </div>
                        <StatusIcon status={redisTest.status} />
                    </div>
                    <button onClick={testRedis} disabled={redisTest.status === "loading"} className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg disabled:opacity-50 transition">
                        Test Redis
                    </button>
                    {redisTest.data && (
                        <pre className="mt-4 p-3 bg-gray-800 rounded-lg text-sm overflow-auto">{JSON.stringify(redisTest.data, null, 2)}</pre>
                    )}
                </section>

                {/* Section 3: Session Verification */}
                <section className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                    <div className="flex items-center gap-2 mb-4">
                        <Shield className="w-5 h-5 text-purple-400" />
                        <h2 className="text-xl font-semibold">Session Verification</h2>
                    </div>
                    {accounts.length === 0 ? (
                        <p className="text-gray-500">No LinkedIn accounts connected.</p>
                    ) : (
                        <div className="space-y-3">
                            {accounts.map((acc) => (
                                <div key={acc.id} className="flex items-center justify-between bg-gray-800 p-3 rounded-lg">
                                    <div>
                                        <p className="font-medium">{acc.displayName || acc.username}</p>
                                        <p className="text-sm text-gray-400">Status: {acc.status} • ID: {acc.id.slice(0, 8)}...</p>
                                    </div>
                                    <div className="flex gap-2 items-center">
                                        <StatusIcon status={sessionResults[acc.id]?.status || "idle"} />
                                        <button onClick={() => verifySession(acc.id)} className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 rounded text-sm transition">
                                            Verify Session
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {Object.entries(sessionResults).map(([id, result]) =>
                                result.data ? (
                                    <pre key={id} className="p-3 bg-gray-800 rounded-lg text-sm overflow-auto">{JSON.stringify(result.data, null, 2)}</pre>
                                ) : null
                            )}
                        </div>
                    )}
                </section>

                {/* Section 4: Playwright Smoke Test */}
                <section className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                    <div className="flex items-center gap-2 mb-4">
                        <Monitor className="w-5 h-5 text-cyan-400" />
                        <h2 className="text-xl font-semibold">Playwright Smoke Test</h2>
                    </div>
                    {accounts.length === 0 ? (
                        <p className="text-gray-500">No accounts to test.</p>
                    ) : (
                        <div className="space-y-3">
                            {accounts.map((acc) => (
                                <div key={acc.id} className="flex items-center justify-between bg-gray-800 p-3 rounded-lg">
                                    <p className="font-medium">{acc.displayName || acc.username}</p>
                                    <div className="flex gap-2 items-center">
                                        <StatusIcon status={smokeResults[acc.id]?.status || "idle"} />
                                        <button onClick={() => runSmoke(acc.id)} className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 rounded text-sm transition">
                                            Run Smoke Test
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {Object.entries(smokeResults).map(([id, result]) =>
                                result.data ? (
                                    <pre key={id} className="p-3 bg-gray-800 rounded-lg text-sm overflow-auto">{JSON.stringify(result.data, null, 2)}</pre>
                                ) : null
                            )}
                        </div>
                    )}
                </section>

                {/* Section 5: Action Test */}
                <section className="bg-gray-900 rounded-xl p-6 border border-red-900/50">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                        <h2 className="text-xl font-semibold text-red-400">Action Test</h2>
                    </div>
                    <div className="bg-red-950/50 border border-red-900 rounded-lg p-3 mb-4 text-sm text-red-300">
                        ⚠️ CAUTION: These actions interact with real LinkedIn profiles.
                    </div>
                    <div className="space-y-3">
                        <input
                            type="text" value={profileUrl} onChange={(e) => setProfileUrl(e.target.value)}
                            placeholder="LinkedIn profile URL" className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm"
                        />
                        <div className="flex gap-3">
                            <select value={selectedAccount} onChange={(e) => setSelectedAccount(e.target.value)} className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm">
                                {accounts.map((acc) => (
                                    <option key={acc.id} value={acc.id}>{acc.displayName || acc.username}</option>
                                ))}
                            </select>
                            <select value={actionType} onChange={(e) => setActionType(e.target.value)} className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm">
                                <option value="view_profile">View Profile (safe)</option>
                                <option value="connection_request">Connection Request (REAL)</option>
                            </select>
                        </div>
                        <button onClick={runAction} disabled={actionResult.status === "loading" || !profileUrl} className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50 text-sm transition">
                            {actionResult.status === "loading" ? "Running..." : "Execute Action"}
                        </button>
                        {actionResult.data && (
                            <pre className="p-3 bg-gray-800 rounded-lg text-sm overflow-auto">{JSON.stringify(actionResult.data, null, 2)}</pre>
                        )}
                    </div>
                </section>

                {/* Section 6: Safety Counter Override */}
                <section className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                    <div className="flex items-center gap-2 mb-4">
                        <Activity className="w-5 h-5 text-yellow-400" />
                        <h2 className="text-xl font-semibold">Safety Counter Override (DEV)</h2>
                    </div>
                    <div className="space-y-3">
                        <input
                            type="text" value={counterAccountId} onChange={(e) => setCounterAccountId(e.target.value)}
                            placeholder="Account ID" className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm"
                        />
                        <div className="flex gap-3">
                            <select value={counterType} onChange={(e) => setCounterType(e.target.value)} className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm">
                                <option value="actions">Daily Actions</option>
                                <option value="connections">Weekly Connections</option>
                                <option value="reset">Reset Actions</option>
                            </select>
                            <input
                                type="number" value={counterValue} onChange={(e) => setCounterValue(e.target.value)}
                                placeholder="Value" className="w-24 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm"
                            />
                            <button onClick={setCounter} className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-sm transition">
                                Set Counter
                            </button>
                        </div>
                        {counterResult.data && (
                            <pre className="p-3 bg-gray-800 rounded-lg text-sm overflow-auto">{JSON.stringify(counterResult.data, null, 2)}</pre>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
