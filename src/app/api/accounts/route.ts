import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { getOrCreateWorkspace } from '@/lib/workspace'
import { db } from '@/db'
import { linkedinAccounts } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function GET() {
  try {
    const { userId } = await getAuthUser()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const workspaceId = await getOrCreateWorkspace(userId)

    const accounts = await db
      .select()
      .from(linkedinAccounts)
      .where(eq(linkedinAccounts.workspaceId, workspaceId))

    return NextResponse.json({
      data: accounts.map((a) => ({
        id: a.id,
        username: a.username,
        displayName: a.displayName,
        profileUrl: a.profileUrl,
        profilePhoto: a.profilePhoto,
        status: a.status,
        dailyActionCount: a.dailyActionCount,
        weeklyConnectionCount: a.weeklyConnectionCount,
        proxyProtected: !!a.proxyConfig,
        lastActiveAt: a.lastActiveAt?.toISOString() ?? new Date().toISOString(),
      })),
    })
  } catch (error) {
    console.error('[Accounts]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
