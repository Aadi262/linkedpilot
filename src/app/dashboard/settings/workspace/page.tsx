"use client";
import { useState } from "react";
import { Save, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function WorkspaceSettingsPage() {
  const [name, setName] = useState("My Workspace");
  const [slug, setSlug] = useState("my-workspace");
  const [timezone, setTimezone] = useState("America/New_York");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Workspace Settings</h2>
        <p className="text-gray-500 text-sm mt-0.5">Manage your workspace configuration</p>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-5">
        <div className="flex items-center gap-4 pb-5 border-b border-white/10">
          <div className="w-14 h-14 rounded-xl bg-violet-600/20 border border-violet-600/30 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-violet-400" />
          </div>
          <div>
            <div className="text-sm font-medium text-white">Workspace Logo</div>
            <div className="text-xs text-gray-500 mt-0.5">Upload a logo (PNG, JPG, max 2MB)</div>
            <Button variant="outline" size="sm" className="mt-2 border-white/20 text-gray-400 hover:text-white h-7 text-xs">
              Upload Logo
            </Button>
          </div>
        </div>

        <div>
          <Label className="text-gray-300 text-sm mb-1.5 block">Workspace Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-white/10 border-white/20 text-white" />
        </div>

        <div>
          <Label className="text-gray-300 text-sm mb-1.5 block">Workspace Slug</Label>
          <div className="flex items-center gap-0">
            <div className="px-3 h-10 bg-white/5 border border-r-0 border-white/20 rounded-l-lg flex items-center text-gray-500 text-sm">
              app.linkedpilot.com/
            </div>
            <Input value={slug} onChange={(e) => setSlug(e.target.value)} className="bg-white/10 border-white/20 text-white rounded-l-none" />
          </div>
        </div>

        <div>
          <Label className="text-gray-300 text-sm mb-1.5 block">Timezone</Label>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="w-full h-10 px-3 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="America/New_York">Eastern Time (ET)</option>
            <option value="America/Chicago">Central Time (CT)</option>
            <option value="America/Denver">Mountain Time (MT)</option>
            <option value="America/Los_Angeles">Pacific Time (PT)</option>
            <option value="Europe/London">London (GMT)</option>
            <option value="Europe/Paris">Paris (CET)</option>
            <option value="Asia/Kolkata">India (IST)</option>
            <option value="Asia/Tokyo">Tokyo (JST)</option>
          </select>
        </div>

        <Button onClick={handleSave} className="bg-violet-600 hover:bg-violet-700 text-white gap-2">
          <Save className="w-4 h-4" />
          {saved ? "Saved!" : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
