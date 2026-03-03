import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "LinkedIn email is required" }, { status: 400 });
    }

    // Extract username from email for display
    const username = email.split("@")[0];

    // In stub mode: simulate proxy assignment + return mock account
    if (process.env.STUB_MODE === "true") {
      await new Promise((r) => setTimeout(r, 1500)); // Simulate async work

      const account = {
        id: `acc_${Date.now()}`,
        username,
        status: "active",
        ip: `192.168.${Math.floor(Math.random() * 255)}.x`,
        proxyAssigned: true,
      };

      console.log(`[LinkedIn] Connected account (stub): ${username}`);
      return NextResponse.json({ account });
    }

    // Production: save encrypted credentials, call BrightData API, trigger Inngest
    // const { getDb, schema } = await import("@/db");
    // const db = getDb(); ...

    return NextResponse.json({ account: { username, status: "connecting" } });
  } catch (error) {
    console.error("[LinkedIn/connect]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
