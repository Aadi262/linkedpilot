import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, useCase } = await req.json();
    if (!name?.trim()) {
      return NextResponse.json({ error: "Workspace name is required" }, { status: 400 });
    }

    const slug = slugify(name) + "-" + Math.random().toString(36).slice(2, 7);

    // In stub mode, return mock workspace
    if (process.env.STUB_MODE === "true") {
      const workspace = { id: `ws_${Date.now()}`, name: name.trim(), slug, plan: "starter", ownerId: userId };
      console.log(`[Onboarding] Created workspace (stub):`, workspace);
      return NextResponse.json({ data: workspace });
    }

    // Production: save to DB
    const { getDb, schema } = await import("@/db");
    const db = getDb();
    if (!db) throw new Error("DB not available");

    await db.insert(schema.workspaces).values({
      name: name.trim(),
      slug,
      plan: "starter",
      ownerId: userId,
    });

    return NextResponse.json({ data: { slug } });
  } catch (error) {
    console.error("[Onboarding/workspace]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
