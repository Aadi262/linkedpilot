// src/lib/browser.ts — Real Browser Launcher with Full Anti-Detection
// Uses playwright-extra stealth + fingerprint-suite for LinkedIn automation

import { ProxyConfig, proxyToPlaywright } from './proxy'

export interface SessionData {
    li_at: string
    jsessionid?: string
    liap?: string
    li_gc?: string
    userAgent?: string
}

/**
 * Launch a stealthy browser connected to Browserless.io with session cookies injected.
 * This is the most critical function — it sets up anti-detection fingerprinting.
 */
export async function launchLinkedInBrowser(
    accountId: string,
    session: SessionData,
    proxy: ProxyConfig | null
) {
    // Dynamic imports to avoid bundling issues with Next.js
    const playwrightExtraModule = 'playwright-extra'
    const stealthModule = 'puppeteer-extra-plugin-stealth'

    const { chromium } = await import(/* webpackIgnore: true */ playwrightExtraModule as never) as {
        chromium: {
            use: (plugin: unknown) => void
            connect: (wsEndpoint: string) => Promise<unknown>
        }
    }

    // Load and register stealth plugin
    const StealthPlugin = (await import(/* webpackIgnore: true */ stealthModule as never) as { default: () => unknown }).default
    try {
        chromium.use(StealthPlugin())
    } catch {
        // Plugin may already be registered — safe to ignore
    }

    // Connect to Browserless
    const token = process.env.BLESS_TOKEN || process.env.BROWSERLESS_API_KEY
    const browserlessUrl = process.env.BROWSERLESS_URL || 'wss://chrome.browserless.io'
    const wsEndpoint = `${browserlessUrl}?token=${token}&stealth=true`

    const browser = await chromium.connect(wsEndpoint) as {
        newContext: (opts?: Record<string, unknown>) => Promise<{
            addCookies: (cookies: Array<Record<string, unknown>>) => Promise<void>
            newPage: () => Promise<unknown>
        }>
        close: () => Promise<void>
    }

    // Generate fingerprint for this account
    let userAgent = session.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    try {
        const fpModule = 'fingerprint-generator'
        const { FingerprintGenerator } = await import(/* webpackIgnore: true */ fpModule as never) as {
            FingerprintGenerator: new (opts: Record<string, unknown>) => {
                getFingerprint: () => { fingerprint: { navigator: { userAgent: string } } }
            }
        }
        const generator = new FingerprintGenerator({
            browsers: ['chrome'],
            operatingSystems: ['windows'],
            devices: ['desktop'],
        })
        const { fingerprint } = generator.getFingerprint()
        if (!session.userAgent) {
            userAgent = fingerprint.navigator.userAgent
        }
    } catch (err) {
        console.warn('[Browser] Fingerprint generation failed, using default UA:', err)
    }

    // Create browser context with proxy and fingerprint settings
    const contextOptions: Record<string, unknown> = {
        userAgent,
        viewport: {
            width: 1280 + Math.floor(Math.random() * 200),
            height: 720 + Math.floor(Math.random() * 100),
        },
        locale: 'en-US',
        timezoneId: 'America/New_York',
        extraHTTPHeaders: {
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'sec-ch-ua': '"Chromium";v="120", "Google Chrome";v="120"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
        },
    }

    if (proxy) {
        contextOptions.proxy = proxyToPlaywright(proxy)
    }

    const context = await browser.newContext(contextOptions)

    // Inject fingerprint if available
    try {
        const fiModule = 'fingerprint-injector'
        const { FingerprintInjector } = await import(/* webpackIgnore: true */ fiModule as never) as {
            FingerprintInjector: new () => {
                attachFingerprintToPlaywright: (ctx: unknown, opts: Record<string, unknown>) => Promise<void>
            }
        }
        const injector = new FingerprintInjector()
        await injector.attachFingerprintToPlaywright(context, {})
    } catch (err) {
        console.warn('[Browser] Fingerprint injection failed:', err)
    }

    // Inject LinkedIn session cookies
    const cookies: Array<Record<string, unknown>> = [
        {
            name: 'li_at',
            value: session.li_at,
            domain: '.linkedin.com',
            path: '/',
            httpOnly: true,
            secure: true,
            sameSite: 'None' as const,
        },
    ]
    if (session.jsessionid) {
        cookies.push({
            name: 'JSESSIONID',
            value: session.jsessionid,
            domain: '.linkedin.com',
            path: '/',
        })
    }
    if (session.li_gc) {
        cookies.push({
            name: 'li_gc',
            value: session.li_gc,
            domain: '.linkedin.com',
            path: '/',
        })
    }
    if (session.liap) {
        cookies.push({
            name: 'liap',
            value: session.liap,
            domain: '.linkedin.com',
            path: '/',
        })
    }
    await context.addCookies(cookies)

    return { browser, context }
}

/**
 * Verify that a LinkedIn session is still valid by navigating to /feed/.
 */
export async function verifyLinkedInSession(
    accountId: string,
    session: SessionData,
    proxy: ProxyConfig | null
): Promise<{ valid: boolean; reason?: string }> {
    let browser: { close: () => Promise<void> } | null = null
    try {
        const result = await launchLinkedInBrowser(accountId, session, proxy)
        browser = result.browser

        const page = await result.context.newPage() as {
            goto: (url: string, opts?: Record<string, unknown>) => Promise<void>
            url: () => string
            waitForURL: (pattern: RegExp, opts?: Record<string, unknown>) => Promise<void>
        }

        await page.goto('https://www.linkedin.com/feed/', { waitUntil: 'domcontentloaded', timeout: 30000 })

        try {
            await page.waitForURL(/linkedin\.com\/(feed|login|checkpoint|uas)/, { timeout: 15000 })
        } catch {
            // Timeout is OK, check current URL
        }

        const currentUrl = page.url()

        if (currentUrl.includes('/feed')) {
            return { valid: true }
        }
        if (currentUrl.includes('checkpoint') || currentUrl.includes('challenge')) {
            return { valid: false, reason: 'checkpoint_detected' }
        }
        if (currentUrl.includes('/login') || currentUrl.includes('/uas')) {
            return { valid: false, reason: 'session_expired' }
        }

        return { valid: false, reason: `unexpected_url: ${currentUrl}` }
    } catch (error) {
        return { valid: false, reason: `error: ${String(error)}` }
    } finally {
        if (browser) {
            try {
                await browser.close()
            } catch {
                // ignore close errors
            }
        }
    }
}

/**
 * Check if LinkedIn is showing a checkpoint/verification page.
 */
export async function checkForCheckpoint(page: {
    url: () => string
    locator?: (selector: string) => { isVisible: (opts?: Record<string, unknown>) => Promise<boolean> }
}): Promise<boolean> {
    const url = page.url()
    if (url.includes('checkpoint') || url.includes('challenge')) {
        return true
    }

    if (page.locator) {
        try {
            const visible = await page.locator('h1:has-text("Security Verification")').isVisible({ timeout: 1000 })
            if (visible) return true
        } catch {
            // Element not found — no checkpoint
        }
    }

    return false
}

/**
 * Human-like jitter delay between Playwright actions.
 */
export const jitter = (min = 800, max = 3500): Promise<void> =>
    new Promise((r) => setTimeout(r, min + Math.random() * (max - min)))

export const shortJitter = (): Promise<void> => jitter(200, 800)

/**
 * Type text character by character with random delays to simulate human typing.
 */
export async function humanType(
    page: { click: (selector: string) => Promise<void>; keyboard: { type: (char: string, opts?: Record<string, unknown>) => Promise<void> } },
    selector: string,
    text: string
): Promise<void> {
    await page.click(selector)
    await shortJitter()

    let charsSinceBreak = 0
    const breakInterval = 8 + Math.floor(Math.random() * 7) // pause every 8-15 chars

    for (const char of text) {
        const delay = 40 + Math.random() * 140 // 40-180ms per char
        await page.keyboard.type(char, { delay })

        charsSinceBreak++
        if (charsSinceBreak >= breakInterval) {
            await jitter(200, 500) // thinking pause
            charsSinceBreak = 0
        }
    }
}
