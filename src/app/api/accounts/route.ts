import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

const STUB_ACCOUNTS = [
  {
    id: "acc_1",
    username: "Sarah Kim",
    profileUrl: "https://linkedin.com/in/sarah-kim",
    displayName: "Sarah Kim",
    status: "active",
    dailyActionCount: 124,
    weeklyConnectionCount: 67,
    proxyProtected: true,
    proxyIp: "192.168.45.x",
    lastActiveAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
  },
  {
    id: "acc_2",
    username: "Mike Rodriguez",
    profileUrl: "https://linkedin.com/in/mike-rodriguez",
    displayName: "Mike Rodriguez",
    status: "active",
    dailyActionCount: 67,
    weeklyConnectionCount: 23,
    proxyProtected: true,
    proxyIp: "192.168.12.x",
    lastActiveAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: "acc_3",
    username: "Alex Thompson",
    profileUrl: "https://linkedin.com/in/alex-thompson",
    displayName: "Alex Thompson",
    status: "frozen",
    dailyActionCount: 195,
    weeklyConnectionCount: 88,
    proxyProtected: true,
    proxyIp: "192.168.78.x",
    lastActiveAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
];

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (process.env.STUB_MODE === "true") {
      return NextResponse.json({ data: STUB_ACCOUNTS });
    }

    // Production: query DB filtered by workspaceId
    return NextResponse.json({ data: [] });
  } catch (error) {
    console.error("[Accounts]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
