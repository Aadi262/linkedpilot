"use client";
import Link from "next/link";
import { ArrowRight, Play, Shield, Zap, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Hero() {
  return (
    <section className="pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        {/* Left */}
        <div>
          <Badge className="mb-6 bg-violet-600/20 text-violet-400 border-violet-600/30 hover:bg-violet-600/20">
            <Zap className="w-3 h-3 mr-1" />
            The #1 LinkedIn Automation Tool
          </Badge>
          <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6 text-white">
            Scale LinkedIn Outreach Across{" "}
            <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
              Unlimited Accounts
            </span>
          </h1>
          <p className="text-xl text-gray-400 mb-8 leading-relaxed">
            Connect 10, 50, or 100+ LinkedIn accounts. Run automated sequences.
            Watch replies come in — all from one dashboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/sign-up">
              <Button size="lg" className="bg-violet-600 hover:bg-violet-700 text-white px-8 h-12">
                Start Free — No card required
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-white/20 text-gray-300 hover:text-white hover:border-white/40 h-12">
              <Play className="w-4 h-4 mr-2" />
              See how it works
            </Button>
          </div>
          <div className="flex items-center gap-6 mt-8 text-sm text-gray-500">
            <div className="flex items-center gap-1"><Shield className="w-4 h-4 text-green-500" /> Safety-first engine</div>
            <div className="flex items-center gap-1"><Users className="w-4 h-4 text-blue-500" /> 50,000+ teams</div>
          </div>
        </div>

        {/* Right — Dashboard Mockup */}
        <div className="relative hidden lg:block">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-1 shadow-2xl shadow-violet-900/20">
            <div className="rounded-xl bg-[#0D0D1A] p-4 space-y-3">
              {/* Mockup header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-sm font-medium text-white">Campaign Overview</span>
                <span className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded-full">● Active</span>
              </div>
              {/* Mockup stats */}
              <div className="grid grid-cols-3 gap-3">
                {[["1,247", "Connections"], ["89%", "Accept Rate"], ["312", "Replies"]].map(([val, label]) => (
                  <div key={label} className="bg-white/5 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-white">{val}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{label}</div>
                  </div>
                ))}
              </div>
              {/* Mockup accounts */}
              <div className="space-y-2">
                {[
                  { name: "Sarah K.", used: 124, total: 200, status: "active" },
                  { name: "Mike R.", used: 67, total: 200, status: "active" },
                  { name: "Alex T.", used: 195, total: 200, status: "frozen" },
                ].map((acc) => (
                  <div key={acc.name} className="flex items-center gap-3 bg-white/5 rounded-lg p-2.5">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${acc.status === "active" ? "bg-green-400" : "bg-yellow-400"}`} />
                    <span className="text-xs text-gray-300 flex-1">{acc.name}</span>
                    <div className="flex-1 bg-white/10 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${acc.used / acc.total > 0.9 ? "bg-yellow-400" : "bg-violet-500"}`}
                        style={{ width: `${(acc.used / acc.total) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 w-16 text-right">{acc.used}/{acc.total}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Glow */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-violet-600/20 to-indigo-600/20 blur-3xl rounded-2xl" />
        </div>
      </div>
    </section>
  );
}
