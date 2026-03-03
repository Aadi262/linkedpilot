import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

const inter = Inter({ subsets: ["latin"] });

const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
const hasRealClerkKey =
  clerkKey.startsWith("pk_live_") ||
  (clerkKey.startsWith("pk_test_") && clerkKey.length > 30 && !clerkKey.includes("ZXhhbXBsZS"));

export const metadata: Metadata = {
  title: "LinkedPilot — Scale LinkedIn Outreach",
  description: "Connect 10, 50, or 100+ LinkedIn accounts. Run automated sequences. Watch replies come in — all from one dashboard.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const content = (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#0D0D1A] text-white antialiased`}>
        {children}
      </body>
    </html>
  );

  if (!hasRealClerkKey) return content;

  return <ClerkProvider>{content}</ClerkProvider>;
}
