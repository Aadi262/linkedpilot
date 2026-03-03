import { Star } from "lucide-react";

const testimonials = [
  {
    name: "James Whitfield",
    title: "Head of Sales, GrowthLab",
    avatar: "JW",
    quote: "We went from 50 to 800 LinkedIn connections per week using LinkedPilot. The account rotation and safety engine means we've never had an account flagged.",
    rating: 5,
  },
  {
    name: "Priya Mehta",
    title: "Founder, OutreachHQ Agency",
    avatar: "PM",
    quote: "Running campaigns for 12 clients from one dashboard. The white-label feature lets us sell this as our own product. Best $149 we spend each month.",
    rating: 5,
  },
  {
    name: "Carlos Reyes",
    title: "SDR Manager, Velocity CRM",
    avatar: "CR",
    quote: "The Unibox is the killer feature. Our whole SDR team replies from one place, we track every conversation, and acceptance rates are up 40% vs manual outreach.",
    rating: 5,
  },
];

export function Testimonials() {
  return (
    <section className="py-24 px-6 bg-white/[0.02] border-y border-white/10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Loved by sales teams worldwide</h2>
          <p className="text-gray-400 text-lg">Join 50,000+ teams who&apos;ve replaced manual LinkedIn outreach.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map(({ name, title, avatar, quote, rating }) => (
            <div key={name} className="rounded-xl border border-white/10 bg-white/5 p-6">
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-300 text-sm leading-relaxed mb-6">&ldquo;{quote}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-violet-600/30 border border-violet-600/40 flex items-center justify-center text-xs font-semibold text-violet-300">
                  {avatar}
                </div>
                <div>
                  <div className="text-sm font-medium text-white">{name}</div>
                  <div className="text-xs text-gray-500">{title}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
