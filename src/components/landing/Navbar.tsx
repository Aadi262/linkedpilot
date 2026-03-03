"use client";
import { useState } from "react";
import Link from "next/link";
import { Menu, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#0D0D1A]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-xl bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
            LinkedPilot
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="#features" className="text-gray-400 hover:text-white text-sm transition-colors">Features</Link>
          <Link href="#pricing" className="text-gray-400 hover:text-white text-sm transition-colors">Pricing</Link>
          <Link href="#how-it-works" className="text-gray-400 hover:text-white text-sm transition-colors">How It Works</Link>
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/sign-in">
            <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">Sign In</Button>
          </Link>
          <Link href="/sign-up">
            <Button size="sm" className="bg-violet-600 hover:bg-violet-700 text-white">Start Free Trial</Button>
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button className="md:hidden text-gray-400 hover:text-white" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#0D0D1A] px-6 py-4 flex flex-col gap-4">
          <Link href="#features" className="text-gray-400 hover:text-white text-sm">Features</Link>
          <Link href="#pricing" className="text-gray-400 hover:text-white text-sm">Pricing</Link>
          <Link href="#how-it-works" className="text-gray-400 hover:text-white text-sm">How It Works</Link>
          <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
            <Link href="/sign-in"><Button variant="ghost" size="sm" className="w-full justify-start text-gray-300">Sign In</Button></Link>
            <Link href="/sign-up"><Button size="sm" className="w-full bg-violet-600 hover:bg-violet-700 text-white">Start Free Trial</Button></Link>
          </div>
        </div>
      )}
    </nav>
  );
}
