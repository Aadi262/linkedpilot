import { db } from '@/db'
import { proxies, linkedinAccounts } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { encrypt, decrypt, isEncrypted } from '@/lib/crypto'

export interface ProxyConfig {
    host: string
    port: number
    username: string
    password: string
}

/**
 * Assign a BrightData static residential proxy to an account.
 * Uses a stable session string derived from accountId for dedicated IP.
 */
export async function assignProxy(accountId: string): Promise<ProxyConfig | null> {
    if (process.env.PROXY_ENABLED !== 'true') {
        return null // dev mode — no proxy
    }

    const host = process.env.BRIGHTDATA_HOST || 'brd.superproxy.io'
    const port = parseInt(process.env.BRIGHTDATA_PORT || '22225')
    const baseUsername = process.env.BRIGHTDATA_USERNAME
    const password = process.env.BRIGHTDATA_PASSWORD

    if (!baseUsername || !password) {
        console.warn('[Proxy] BrightData credentials not set')
        return null
    }

    // Session string in username = dedicated IP per account
    const config: ProxyConfig = {
        host,
        port,
        username: `${baseUsername}-session-${accountId.slice(0, 12)}`,
        password,
    }

    const encryptedConfig = encrypt(JSON.stringify(config))

    // Look up the workspaceId from the account
    const [account] = await db
        .select({ workspaceId: linkedinAccounts.workspaceId })
        .from(linkedinAccounts)
        .where(eq(linkedinAccounts.id, accountId))
        .limit(1)

    const workspaceId = account?.workspaceId || ''

    // Store in proxies table
    await db.insert(proxies).values({
        workspaceId,
        linkedinAccountId: accountId,
        provider: 'brightdata',
        ip: host,
        port,
        credentials: encryptedConfig,
        status: 'active',
    })

    // Also update the account's proxyConfig
    await db
        .update(linkedinAccounts)
        .set({ proxyConfig: encryptedConfig })
        .where(eq(linkedinAccounts.id, accountId))

    return config
}

/**
 * Convert ProxyConfig to Playwright proxy format.
 */
export function proxyToPlaywright(
    proxy: ProxyConfig | null
): { server: string; username: string; password: string } | undefined {
    if (!proxy) return undefined
    return {
        server: `http://${proxy.host}:${proxy.port}`,
        username: proxy.username,
        password: proxy.password,
    }
}

/**
 * Get the proxy for an account. Uses existing proxy if one is assigned,
 * otherwise assigns a new one.
 */
export async function getProxyForAccount(accountId: string): Promise<ProxyConfig | null> {
    if (process.env.PROXY_ENABLED !== 'true') return null

    // Check if proxy already exists
    const existing = await db
        .select()
        .from(proxies)
        .where(eq(proxies.linkedinAccountId, accountId))
        .limit(1)

    if (existing.length > 0 && existing[0].credentials) {
        try {
            const creds = existing[0].credentials as string
            const decrypted = isEncrypted(creds) ? decrypt(creds) : creds
            return JSON.parse(decrypted) as ProxyConfig
        } catch {
            console.warn('[Proxy] Failed to decrypt existing proxy, reassigning')
        }
    }

    // Assign new proxy
    return assignProxy(accountId)
}
