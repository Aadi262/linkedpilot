import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

// Stub: in production this would queue a Playwright scrape job against Sales Navigator
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { url } = await req.json();
    if (!url || !url.includes("linkedin.com")) {
      return NextResponse.json({ error: "Invalid LinkedIn URL" }, { status: 400 });
    }

    // Stub: return mock leads
    const mockLeads = [
      { linkedinProfileUrl: "https://linkedin.com/in/stub-lead-1", firstName: "Alex", lastName: "Johnson", company: "TechCorp", title: "VP Sales" },
      { linkedinProfileUrl: "https://linkedin.com/in/stub-lead-2", firstName: "Maria", lastName: "Garcia", company: "GrowthCo", title: "CEO" },
      { linkedinProfileUrl: "https://linkedin.com/in/stub-lead-3", firstName: "James", lastName: "Lee", company: "StartupXYZ", title: "Founder" },
    ];

    console.log("[Leads/salesnav] Scrape queued for URL:", url);
    return NextResponse.json({ success: true, leads: mockLeads, count: mockLeads.length });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
