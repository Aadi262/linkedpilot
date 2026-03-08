import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { getOrCreateWorkspace } from '@/lib/workspace'
import { db } from '@/db'
import { linkedinAccounts } from '@/db/schema'
import { encrypt } from '@/lib/crypto'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await getAuthUser()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { email, password } = await req.json()
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const workspaceId = await getOrCreateWorkspace(userId)
    const username = email.split('@')[0]

    // Attempt real LinkedIn login via Playwright + Browserless
    // Falls back to stub if BLESS_TOKEN is not set
    let sessionCookies: string | null = null
    let displayName = username
    let profileUrl: string | null = null

    if (process.env.BLESS_TOKEN && process.env.BLESS_TOKEN !== 'PASTE_YOUR_BROWSERLESS_TOKEN_HERE') {
      try {
        const playwrightModule = 'playwright-core'
        const { chromium } = await import(/* webpackIgnore: true */ playwrightModule as never)

        const browser = await chromium.connect(
          `wss://production-sfo.browserless.io?token=${process.env.BLESS_TOKEN}`
        )
        const context = await browser.newContext()
        const page = await context.newPage()

        // Navigate to LinkedIn login
        await page.goto('https://www.linkedin.com/login')
        await page.fill('#username', email)
        await page.fill('#password', password)
        await page.click('[type="submit"]')

        // Wait for redirect (either home or checkpoint)
        await page.waitForURL(/linkedin\.com\/(feed|checkpoint|home)/, { timeout: 15000 })

        const url = page.url()
        if (url.includes('checkpoint')) {
          await browser.close()
          return NextResponse.json({ error: 'LinkedIn requires verification. Check your email for a code.' }, { status: 400 })
        }

        // Grab the li_at session cookie
        const cookies = await context.cookies()
        const liAt = cookies.find((c: { name: string }) => c.name === 'li_at')
        if (!liAt) {
          await browser.close()
          return NextResponse.json({ error: 'Login failed. Check your credentials.' }, { status: 400 })
        }

        sessionCookies = JSON.stringify(cookies)

        // Grab profile name
        const nameEl = await page.$('.global-nav__me-content')
        displayName = nameEl ? (await nameEl.innerText()).trim().split('\n')[0] : username

        profileUrl = `https://www.linkedin.com/in/${username}`

        await browser.close()
      } catch (err) {
        console.error('[LinkedIn/connect] Browser error:', err)
        return NextResponse.json({ error: 'Failed to connect. Check credentials and try again.' }, { status: 500 })
      }
    } else {
      // Stub mode — simulate successful connection
      console.log('[LinkedIn/connect] No Browserless token — using stub connection')
      sessionCookies = JSON.stringify([{ name: 'li_at', value: 'stub_session_cookie' }])
      profileUrl = `https://www.linkedin.com/in/${username}`
    }

    // Encrypt cookies before storing
    const encryptedCookies = encrypt(sessionCookies)

    // Save account to DB
    const result = await db
      .insert(linkedinAccounts)
      .values({
        workspaceId,
        username,
        displayName,
        profileUrl,
        sessionCookies: encryptedCookies,
        status: 'active',
        dailyActionCount: 0,
        weeklyConnectionCount: 0,
        lastActiveAt: new Date(),
      })
      .returning({ id: linkedinAccounts.id })

    return NextResponse.json({
      account: {
        id: result[0].id,
        username,
        displayName,
        status: 'active',
        proxyProtected: false,
      },
    })
  } catch (error) {
    console.error('[LinkedIn/connect]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
