import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { db } from "@/db";
import { workspaces } from "@/db/schema";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await getAuthUser();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name } = await req.json();
    if (!name?.trim()) {
      return NextResponse.json({ error: "Workspace name is required" }, { status: 400 });
    }

    const slug = slugify(name) + "-" + Math.random().toString(36).slice(2, 7);

    const result = await db.insert(workspaces).values({
      name: name.trim(),
      slug,
      plan: "starter",
      ownerId: userId,
    }).returning({ id: workspaces.id });

    return NextResponse.json({ data: { id: result[0].id, slug } });
  } catch (error) {
    console.error("[Onboarding/workspace]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
