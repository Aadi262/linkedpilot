import { NextRequest, NextResponse } from "next/server";

// Stripe webhook handler — receives events when subscriptions change
// Register this URL in Stripe dashboard: /api/billing/webhook
export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    console.warn("[Billing/webhook] Stripe keys not configured — skipping");
    return NextResponse.json({ received: true });
  }

  try {
    const stripe = (await import("stripe")).default;
    const client = new stripe(process.env.STRIPE_SECRET_KEY);

    const body = await req.text();
    const sig = req.headers.get("stripe-signature")!;
    const event = client.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const { userId, plan } = session.metadata || {};
        console.log(`[Billing/webhook] Checkout completed: userId=${userId}, plan=${plan}`);
        // Production: db.update(workspaces).set({ plan }).where(eq(ownerId, userId))
        break;
      }
      case "customer.subscription.updated": {
        const sub = event.data.object;
        console.log("[Billing/webhook] Subscription updated:", sub.id, sub.status);
        // Production: update workspace plan based on sub.items.data[0].price.id
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object;
        console.log("[Billing/webhook] Subscription cancelled:", sub.id);
        // Production: downgrade workspace to free/starter
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (e) {
    console.error("[Billing/webhook] Error:", e);
    return NextResponse.json({ error: "Webhook error" }, { status: 400 });
  }
}
