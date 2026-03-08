import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { linkedinAccounts } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { encrypt } from '@/lib/crypto'
import { inngest } from '@/inngest/functions'

// POST — receive session cookies from Chrome extension
export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { li_at, jsessionid, liap, li_gc, userAgent, accountId } = body

        if (!li_at || typeof li_at !== 'string' || li_at.length < 20) {
            return NextResponse.json(
                { error: 'Invalid li_at cookie. Must be a non-empty string (min 20 chars).' },
                { status: 400 }
            )
        }

        if (!accountId) {
            return NextResponse.json({ error: 'accountId is required' }, { status: 400 })
        }

        // Build session data object
        const sessionData = { li_at, jsessionid, liap, li_gc, userAgent }

        // Encrypt session cookies
        const encryptedSession = encrypt(JSON.stringify(sessionData))

        // Update account in DB
        await db
            .update(linkedinAccounts)
            .set({ sessionCookies: encryptedSession, status: 'connecting' })
            .where(eq(linkedinAccounts.id, accountId))

        // Trigger Inngest to verify the session
        try {
            await inngest.send({
                name: 'linkedin/session.verify',
                data: { accountId },
            })
        } catch (err) {
            console.warn('[Session/Ingest] Inngest send failed (may not be configured):', err)
        }

        return NextResponse.json({
            success: true,
            accountId,
            message: 'Session received. Verifying...',
        })
    } catch (error) {
        console.error('[Session/Ingest POST]', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// GET — polling endpoint for session verification status
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const accountId = searchParams.get('accountId')

        if (!accountId) {
            return NextResponse.json({ error: 'accountId query param is required' }, { status: 400 })
        }

        const [account] = await db
            .select({ id: linkedinAccounts.id, status: linkedinAccounts.status })
            .from(linkedinAccounts)
            .where(eq(linkedinAccounts.id, accountId))
            .limit(1)

        if (!account) {
            return NextResponse.json({ error: 'Account not found' }, { status: 404 })
        }

        return NextResponse.json({
            accountId: account.id,
            status: account.status,
        })
    } catch (error) {
        console.error('[Session/Ingest GET]', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
