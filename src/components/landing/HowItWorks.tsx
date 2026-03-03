import { UserPlus, LayoutTemplate, MessageSquare } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    step: "01",
    title: "Connect LinkedIn Accounts",
    description: "Add your LinkedIn accounts. Each one gets a dedicated residential proxy IP — assigned automatically.",
  },
  {
    icon: LayoutTemplate,
    step: "02",
    title: "Build Your Sequence",
    description: "Create connection requests, messages, and follow-ups. Use variables like {{firstName}} and set smart delays.",
  },
  {
    icon: MessageSquare,
    step: "03",
    title: "Replies Come to Your Inbox",
    description: "All replies land in your unified inbox. Reply from the platform. Track everything in one place.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-6 bg-white/[0.02] border-y border-white/10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            From setup to booked meetings in 3 steps
          </h2>
          <p className="text-gray-400 text-lg">
            Most teams are running campaigns within 15 minutes of signing up.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-10 left-[33%] right-[33%] h-px bg-gradient-to-r from-violet-600/50 to-transparent" />
          {steps.map(({ icon: Icon, step, title, description }) => (
            <div key={title} className="relative text-center">
              <div className="w-20 h-20 rounded-2xl bg-violet-600/20 border border-violet-600/30 flex items-center justify-center mx-auto mb-6">
                <Icon className="w-8 h-8 text-violet-400" />
              </div>
              <div className="text-xs font-mono text-violet-500 mb-2">STEP {step}</div>
              <h3 className="font-semibold text-white text-lg mb-2">{title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
