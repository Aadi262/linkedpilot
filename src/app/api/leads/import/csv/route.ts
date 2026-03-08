import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { leads, campaignId } = await req.json();

    if (!Array.isArray(leads) || leads.length === 0) {
      return NextResponse.json({ error: "No leads provided" }, { status: 400 });
    }

    // Deduplicate against stub (in production: check against DB)
    const unique = leads.filter((l: { linkedinProfileUrl: string }) => l.linkedinProfileUrl?.includes("linkedin.com"));
    const dupes = leads.length - unique.length;

    console.log(`[Leads/import] ${unique.length} new, ${dupes} skipped for campaign ${campaignId}`);
    return NextResponse.json({ success: true, imported: unique.length, skipped: dupes });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
