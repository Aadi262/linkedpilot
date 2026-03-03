import { NextRequest, NextResponse } from "next/server";

// Simple in-memory store for stub mode; replace with DB in production
const waitlistEmails = new Set<string>();

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (waitlistEmails.has(normalizedEmail)) {
      return NextResponse.json({ success: true, message: "Already on the list!" });
    }

    waitlistEmails.add(normalizedEmail);

    // In production: save to DB and send welcome email via Resend
    // const stub = process.env.STUB_MODE === "true";
    // if (!stub) {
    //   await db.insert(waitlist).values({ email: normalizedEmail, createdAt: new Date() });
    //   await resend.emails.send({ to: normalizedEmail, subject: "You're on the LinkedPilot waitlist!", ... });
    // }

    console.log(`[Waitlist] New signup: ${normalizedEmail}`);

    return NextResponse.json({ success: true, message: "You're on the list!" });
  } catch (error) {
    console.error("[Waitlist] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
