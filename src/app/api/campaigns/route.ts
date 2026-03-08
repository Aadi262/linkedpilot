import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { getOrCreateWorkspace } from '@/lib/workspace'
import { db } from '@/db'
import { campaigns } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function GET() {
  try {
    const { userId } = await getAuthUser()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const workspaceId = await getOrCreateWorkspace(userId)

    const data = await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.workspaceId, workspaceId))

    return NextResponse.json({ data })
  } catch (error) {
    console.error('[Campaigns GET]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await getAuthUser()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const workspaceId = await getOrCreateWorkspace(userId)
    const body = await req.json()

    const { name, goal, sequenceSteps, senderAccountIds, dailyLimit } = body
    if (!name?.trim()) return NextResponse.json({ error: 'Campaign name is required' }, { status: 400 })

    const result = await db
      .insert(campaigns)
      .values({
        workspaceId,
        name: name.trim(),
        status: 'draft',
        goal: goal || 'generate_leads',
        sequenceSteps: sequenceSteps || [],
        senderAccountIds: senderAccountIds || [],
        dailyLimit: dailyLimit || 30,
      })
      .returning({ id: campaigns.id })

    return NextResponse.json({ success: true, id: result[0].id })
  } catch (error) {
    console.error('[Campaigns POST]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await getAuthUser()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id, status } = await req.json()
    if (!id || !status) return NextResponse.json({ error: 'id and status required' }, { status: 400 })

    await db
      .update(campaigns)
      .set({ status, updatedAt: new Date() })
      .where(eq(campaigns.id, id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Campaigns PATCH]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
