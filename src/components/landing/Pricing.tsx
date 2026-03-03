"use client";
import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const plans = [
  {
    name: "Starter",
    monthlyPrice: 49,
    annualPrice: 39,
    description: "Perfect for individual sales reps",
    features: [
      "5 LinkedIn accounts",
      "3 active campaigns",
      "Basic analytics",
      "CSV lead import",
      "Email support",
    ],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    name: "Agency",
    monthlyPrice: 149,
    annualPrice: 119,
    description: "For agencies and growing sales teams",
    features: [
      "25 LinkedIn accounts",
      "Unlimited campaigns",
      "Unified Inbox (Unibox)",
      "Full analytics + funnel",
      "API + Webhooks",
      "Team workspaces",
      "Priority support",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Scale",
    monthlyPrice: 299,
    annualPrice: 239,
    description: "Unlimited scale for enterprise teams",
    features: [
      "Unlimited LinkedIn accounts",
      "White-label (custom domain + logo)",
      "Dedicated account manager",
      "Custom proxy configuration",
      "SLA + uptime guarantee",
      "SSO / SAML",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

export function Pricing() {
  const [annual, setAnnual] = useState(false);

  return (
    <section id="pricing" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">Simple, transparent pricing</h2>
          <p className="text-gray-400 text-lg mb-8">Start free. Scale as you grow. No setup fees.</p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-3 bg-white/5 rounded-lg p-1 border border-white/10">
            <button
              onClick={() => setAnnual(false)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${!annual ? "bg-violet-600 text-white" : "text-gray-400 hover:text-white"}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${annual ? "bg-violet-600 text-white" : "text-gray-400 hover:text-white"}`}
            >
              Annual
              <span className="text-xs bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">-20%</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border p-8 flex flex-col ${
                plan.popular
                  ? "border-violet-500 bg-violet-600/10"
                  : "border-white/10 bg-white/5"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-violet-600 text-white border-0 px-3 py-1">Most Popular</Badge>
                </div>
              )}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                <p className="text-gray-400 text-sm">{plan.description}</p>
              </div>
              <div className="mb-6">
                <span className="text-5xl font-bold text-white">
                  ${annual ? plan.annualPrice : plan.monthlyPrice}
                </span>
                <span className="text-gray-400 text-sm">/mo</span>
                {annual && (
                  <div className="text-xs text-green-400 mt-1">Billed annually (${(annual ? plan.annualPrice : plan.monthlyPrice) * 12}/yr)</div>
                )}
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-gray-300">
                    <Check className="w-4 h-4 text-violet-400 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href="/sign-up">
                <Button
                  className={`w-full h-11 ${plan.popular ? "bg-violet-600 hover:bg-violet-700 text-white" : "border-white/20 text-gray-300 hover:text-white hover:border-white/40"}`}
                  variant={plan.popular ? "default" : "outline"}
                >
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
