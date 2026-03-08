import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { linkedinAccounts } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { decrypt } from '@/lib/crypto'
import { launchLinkedInBrowser, type SessionData } from '@/lib/browser'
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

        const { browser, context } = await launchLinkedInBrowser(accountId, sessionData, proxy)
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const page = await context.newPage() as any
            await page.goto('https://www.linkedin.com/feed/', {
                waitUntil: 'domcontentloaded',
                timeout: 30000,
            })

            const url = page.url()
            const title = await page.title()

            return NextResponse.json({
                loggedIn: url.includes('/feed'),
                pageTitle: title,
                url,
                proxyUsed: !!proxy ? 'yes' : 'no',
            })
        } finally {
            await browser.close()
        }
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}
