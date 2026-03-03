import { AccountCard } from "@/components/accounts/AccountCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

// Stub data — will be replaced with DB fetch
const ACCOUNTS = [
  {
    id: "acc_1",
    displayName: "Sarah Kim",
    username: "sarah-kim",
    status: "active" as const,
    proxyProtected: true,
    dailyActionCount: 124,
    weeklyConnectionCount: 67,
    lastActiveAt: new Date(Date.now() - 2 * 60 * 1000),
  },
  {
    id: "acc_2",
    displayName: "Mike Rodriguez",
    username: "mike-rodriguez",
    status: "active" as const,
    proxyProtected: true,
    dailyActionCount: 67,
    weeklyConnectionCount: 23,
    lastActiveAt: new Date(Date.now() - 15 * 60 * 1000),
  },
  {
    id: "acc_3",
    displayName: "Alex Thompson",
    username: "alex-thompson",
    status: "frozen" as const,
    proxyProtected: true,
    dailyActionCount: 195,
    weeklyConnectionCount: 88,
    lastActiveAt: new Date(Date.now() - 30 * 60 * 1000),
  },
];

export default function AccountsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white">Connected Accounts</h2>
          <p className="text-gray-500 text-sm mt-0.5">{ACCOUNTS.length} accounts · {ACCOUNTS.filter(a => a.status === "active").length} active</p>
        </div>
        <Link href="/onboarding">
          <Button className="bg-violet-600 hover:bg-violet-700 text-white gap-2">
            <Plus className="w-4 h-4" /> Connect New Account
          </Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ACCOUNTS.map((account) => (
          <AccountCard key={account.id} account={account} />
        ))}
      </div>
    </div>
  );
}
