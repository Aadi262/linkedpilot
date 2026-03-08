import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { linkedinAccounts } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { decrypt } from '@/lib/crypto'
import { verifyLinkedInSession, type SessionData } from '@/lib/browser'
import { getProxyForAccount } from '@/lib/proxy'

export async function POST(req: NextRequest) {
    try {
        const { accountId } = await req.json()
        if (!accountId) {
            return NextResponse.json({ error: 'accountId required' }, { status: 400 })
        }

        const [account] = await db
            .select()
            .from(linkedinAccounts)
            .where(eq(linkedinAccounts.id, accountId))
            .limit(1)

        if (!account || !account.sessionCookies) {
            return NextResponse.json({ error: 'Account not found or no session' }, { status: 404 })
        }

        const sessionData: SessionData = JSON.parse(decrypt(account.sessionCookies))
        const proxy = await getProxyForAccount(accountId)
        const result = await verifyLinkedInSession(accountId, sessionData, proxy)

        return NextResponse.json({
            accountId,
            ...result,
            proxyUsed: !!proxy,
        })
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}
