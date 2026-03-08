import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { linkedinAccounts } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { decrypt } from '@/lib/crypto'
import { launchLinkedInBrowser, type SessionData, checkForCheckpoint } from '@/lib/browser'
import { getProxyForAccount } from '@/lib/proxy'
import { sendConnectionRequest, scrapeProfileData } from '@/lib/linkedin-actions'
import { checkAndIncrementAction, getAccountSafetyStatus } from '@/lib/safety'

export async function POST(req: NextRequest) {
    try {
        const { accountId, profileUrl, actionType } = await req.json()

        if (!accountId || !profileUrl) {
            return NextResponse.json({ error: 'accountId and profileUrl required' }, { status: 400 })
        }

        const [account] = await db
            .select()
            .from(linkedinAccounts)
            .where(eq(linkedinAccounts.id, accountId))
            .limit(1)

        if (!account || !account.sessionCookies) {
            return NextResponse.json({ error: 'Account not found or no session' }, { status: 404 })
        }

        // Safety check
        const canAct = await checkAndIncrementAction(accountId)
        if (!canAct) {
            return NextResponse.json({ error: 'Daily action limit reached' }, { status: 429 })
        }

        const sessionData: SessionData = JSON.parse(decrypt(account.sessionCookies))
        const proxy = await getProxyForAccount(accountId)

        const { browser, context } = await launchLinkedInBrowser(accountId, sessionData, proxy)
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const page = await context.newPage() as any

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (await checkForCheckpoint(page as any)) {
                return NextResponse.json({ error: 'Checkpoint detected', checkpoint: true }, { status: 403 })
            }

            let result
            if (actionType === 'view_profile') {
                result = await scrapeProfileData(page, profileUrl)
            } else if (actionType === 'connection_request') {
                result = await sendConnectionRequest(page, profileUrl)
            } else {
                result = await scrapeProfileData(page, profileUrl)
            }

            const safety = await getAccountSafetyStatus(accountId)

            return NextResponse.json({ result, safety })
        } finally {
            await browser.close()
        }
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}
