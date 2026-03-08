import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ url: null, message: "Billing portal not available. Add STRIPE_SECRET_KEY to .env.local." });
    }

    // Production: get stripeCustomerId from DB, create portal session
    // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    // const session = await stripe.billingPortal.sessions.create({ customer: customerId, return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/billing` });
    // return NextResponse.json({ url: session.url });

    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  } catch (error) {
    console.error("[Billing/portal]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
