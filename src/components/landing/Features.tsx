import { RefreshCw, Inbox, Shield, Layout, Webhook, Paintbrush } from "lucide-react";

const features = [
  {
    icon: RefreshCw,
    title: "Multi-Account Rotation",
    description: "Automatically rotate sending across 10–100+ LinkedIn accounts. Each account gets a dedicated residential proxy.",
  },
  {
    icon: Inbox,
    title: "Unified Inbox",
    description: "All replies from all accounts in one inbox. Reply from the platform — no need to switch between LinkedIn tabs.",
  },
  {
    icon: Shield,
    title: "Safety Engine",
    description: "Hard daily limits (200/day), weekly connection caps (100/week), auto-freeze, and human-like pacing to protect every account.",
  },
  {
    icon: Layout,
    title: "Campaign Builder",
    description: "Visual sequence builder: connection request → message → follow-up → InMail. With variable substitution and smart delays.",
  },
  {
    icon: Webhook,
    title: "API + Webhooks",
    description: "Outbound webhooks for every event. Full REST API to integrate with your CRM, Slack, or any automation tool.",
  },
  {
    icon: Paintbrush,
    title: "White-Label Agency Mode",
    description: "Custom domain, logo, and colors. Sell the platform to your clients as your own branded LinkedIn automation tool.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Everything you need to scale LinkedIn outreach
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Built for agencies and sales teams who need to move fast without getting accounts banned.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="group rounded-xl border border-white/10 bg-white/5 p-6 hover:border-violet-500/50 hover:bg-violet-600/5 transition-all duration-200"
            >
              <div className="w-10 h-10 rounded-lg bg-violet-600/20 flex items-center justify-center mb-4 group-hover:bg-violet-600/30 transition-colors">
                <Icon className="w-5 h-5 text-violet-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">{title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
