import Link from "next/link";
import { Zap, Twitter, Linkedin, Github } from "lucide-react";

const footerLinks = {
  Product: ["Features", "Pricing", "Changelog", "Roadmap"],
  Company: ["About", "Blog", "Careers", "Press"],
  Legal: ["Privacy Policy", "Terms of Service", "Cookie Policy", "GDPR"],
};

export function Footer() {
  return (
    <footer className="border-t border-white/10 py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                LinkedPilot
              </span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
              Scale LinkedIn outreach across unlimited accounts — safely, automatically, and at scale.
            </p>
            <div className="flex gap-4 mt-4">
              <Twitter className="w-4 h-4 text-gray-600 hover:text-gray-400 cursor-pointer transition-colors" />
              <Linkedin className="w-4 h-4 text-gray-600 hover:text-gray-400 cursor-pointer transition-colors" />
              <Github className="w-4 h-4 text-gray-600 hover:text-gray-400 cursor-pointer transition-colors" />
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="text-white text-sm font-semibold mb-4">{heading}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link}>
                    <span className="text-gray-500 text-sm hover:text-gray-300 cursor-pointer transition-colors">{link}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-600 text-sm">© 2026 LinkedPilot. All rights reserved.</p>
          <p className="text-gray-700 text-xs">Built with Next.js · Deployed on Vercel</p>
        </div>
      </div>
    </footer>
  );
}
