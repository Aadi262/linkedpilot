"use client";
import { useState } from "react";
import { Plus, Mail, X, Crown, Users, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Role = "admin" | "manager" | "member";

interface Member { name: string; email: string; role: Role; status: "active" | "pending"; initials: string; }

const STUB_MEMBERS: Member[] = [
  { name: "You", email: "owner@acme.com", role: "admin", status: "active", initials: "YO" },
  { name: "Sarah Kim", email: "sarah@acme.com", role: "manager", status: "active", initials: "SK" },
  { name: "Mike Rodriguez", email: "mike@acme.com", role: "member", status: "active", initials: "MR" },
  { name: "Jenny Pending", email: "jenny@acme.com", role: "member", status: "pending", initials: "JP" },
];

const roleConfig: Record<Role, { label: string; icon: React.ElementType; color: string }> = {
  admin: { label: "Admin", icon: Crown, color: "text-yellow-400" },
  manager: { label: "Manager", icon: Shield, color: "text-violet-400" },
  member: { label: "Member", icon: Users, color: "text-gray-400" },
};

export default function TeamSettingsPage() {
  const [members, setMembers] = useState(STUB_MEMBERS);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<Role>("member");
  const [loading, setLoading] = useState(false);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.includes("@")) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setMembers((prev) => [...prev, {
      name: inviteEmail.split("@")[0],
      email: inviteEmail,
      role: inviteRole,
      status: "pending",
      initials: inviteEmail.slice(0, 2).toUpperCase(),
    }]);
    setInviteEmail("");
    setLoading(false);
  };

  const removeInvite = (email: string) => setMembers((prev) => prev.filter((m) => m.email !== email));

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Team</h2>
        <p className="text-gray-500 text-sm mt-0.5">Invite and manage team members</p>
      </div>

      {/* Invite form */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <h3 className="text-sm font-medium text-white mb-4">Invite a Member</h3>
        <form onSubmit={handleInvite} className="flex gap-3">
          <Input
            type="email"
            placeholder="colleague@company.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            required
            className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-gray-600"
          />
          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value as Role)}
            className="px-3 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="manager">Manager</option>
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
          <Button type="submit" disabled={loading} className="bg-violet-600 hover:bg-violet-700 text-white gap-2 flex-shrink-0">
            <Plus className="w-4 h-4" /> {loading ? "Inviting..." : "Invite"}
          </Button>
        </form>
      </div>

      {/* Members list */}
      <div className="rounded-xl border border-white/10 overflow-hidden">
        <div className="px-5 py-3 border-b border-white/10">
          <span className="text-sm font-medium text-white">{members.length} Members</span>
        </div>
        <div className="divide-y divide-white/5">
          {members.map((member) => {
            const { label, icon: RoleIcon, color } = roleConfig[member.role];
            return (
              <div key={member.email} className="flex items-center gap-4 px-5 py-3.5">
                <div className="w-9 h-9 rounded-full bg-violet-600/30 flex items-center justify-center text-xs font-semibold text-violet-300 flex-shrink-0">
                  {member.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white truncate">{member.name}</span>
                    {member.status === "pending" && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-400/10 text-yellow-400">Pending</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                    <Mail className="w-3 h-3" />{member.email}
                  </div>
                </div>
                <div className={`flex items-center gap-1.5 text-xs font-medium ${color}`}>
                  <RoleIcon className="w-3.5 h-3.5" />{label}
                </div>
                {member.status === "pending" && (
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-600 hover:text-red-400" onClick={() => removeInvite(member.email)}>
                    <X className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
