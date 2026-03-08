import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

const PRICE_IDS: Record<string, string> = {
  starter: process.env.STRIPE_PRICE_STARTER || "price_stub_starter",
  agency: process.env.STRIPE_PRICE_AGENCY || "price_stub_agency",
  scale: process.env.STRIPE_PRICE_SCALE || "price_stub_scale",
};

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { plan } = await req.json();
    if (!PRICE_IDS[plan]) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({
        url: `/?stub=stripe_checkout&plan=${plan}`,
        message: "Stripe not configured. Add STRIPE_SECRET_KEY to .env.local for real billing.",
      });
    }

    const stripe = (await import("stripe")).default;
    const client = new stripe(process.env.STRIPE_SECRET_KEY);

    // Production: look up stripeCustomerId from workspace in DB
    const session = await client.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: PRICE_IDS[plan], quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/billing?success=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/billing`,
      metadata: { userId, plan },
    });

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("[Billing/checkout]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
