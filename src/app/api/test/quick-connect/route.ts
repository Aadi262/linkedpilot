import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { linkedinAccounts } from '@/db/schema'
import { encrypt } from '@/lib/crypto'
import { getAuthUser } from '@/lib/auth'
import { getOrCreateWorkspace } from '@/lib/workspace'

/**
 * Quick-connect: create a LinkedIn account directly with a li_at cookie.
 * For dev/testing only — skips the Chrome extension flow.
 */
export async function POST(req: NextRequest) {
    try {
        const { userId } = await getAuthUser()
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { li_at, displayName } = await req.json()
        if (!li_at || typeof li_at !== 'string' || li_at.length < 20) {
            return NextResponse.json({ error: 'li_at cookie must be at least 20 chars' }, { status: 400 })
        }

        const workspaceId = await getOrCreateWorkspace(userId)

        const sessionData = { li_at }
        const encryptedSession = encrypt(JSON.stringify(sessionData))

        const result = await db.insert(linkedinAccounts).values({
            workspaceId,
            username: displayName || 'test-account',
            displayName: displayName || 'Test Account',
            sessionCookies: encryptedSession,
            status: 'active',
            dailyActionCount: 0,
            weeklyConnectionCount: 0,
            lastActiveAt: new Date(),
        }).returning({ id: linkedinAccounts.id })

        return NextResponse.json({
            success: true,
            accountId: result[0].id,
            message: 'Account created. Ready for smoke test.',
        })
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}
