#!/usr/bin/env npx ts-node
/**
 * LinkedPilot — Live Environment Verification Script
 * Run: npx ts-node scripts/verify-live.ts
 *
 * Checks all services are connected and healthy before going live.
 */

import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const GREEN = '\x1b[32m'
const RED = '\x1b[31m'
const YELLOW = '\x1b[33m'
const RESET = '\x1b[0m'
const BOLD = '\x1b[1m'

let passed = 0
let failed = 0

function pass(msg: string) {
    console.log(`${GREEN}  ✅ ${msg}${RESET}`)
    passed++
}

function fail(msg: string) {
    console.log(`${RED}  ❌ ${msg}${RESET}`)
    failed++
}

function warn(msg: string) {
    console.log(`${YELLOW}  ⚠️  ${msg}${RESET}`)
}

function header(msg: string) {
    console.log(`\n${BOLD}${msg}${RESET}`)
}

async function main() {
    console.log(`\n${BOLD}════════════════════════════════════════${RESET}`)
    console.log(`${BOLD}  LinkedPilot — Live Verification${RESET}`)
    console.log(`${BOLD}════════════════════════════════════════${RESET}`)

    // 1. ENCRYPTION_KEY
    header('1. Encryption Key')
    const key = process.env.ENCRYPTION_KEY
    if (key && key.length === 64 && /^[0-9a-fA-F]+$/.test(key)) {
        pass(`ENCRYPTION_KEY is set (${key.length} hex chars)`)
    } else {
        fail(`ENCRYPTION_KEY must be exactly 64 hex chars. Got ${key?.length ?? 0} chars`)
    }

    // 2. Crypto self-test
    header('2. Crypto Self-Test')
    try {
        const crypto = await import('../src/lib/crypto')
        const original = 'linkedpilot-test-2024'
        const encrypted = crypto.encrypt(original)
        const decrypted = crypto.decrypt(encrypted)
        if (decrypted === original) {
            pass('Encrypt/decrypt round-trip passed')
        } else {
            fail(`Crypto round-trip failed: expected "${original}", got "${decrypted}"`)
        }
    } catch (e) {
        fail(`Crypto error: ${e}`)
    }

    // 3. DATABASE
    header('3. Database Connection')
    const dbUrl = process.env.DATABASE_URL
    if (!dbUrl) {
        fail('DATABASE_URL not set')
    } else {
        pass(`DATABASE_URL is set (${dbUrl.split('@')[1]?.split('/')[0] || 'configured'})`)
        try {
            const { neon } = await import('@neondatabase/serverless')
            const sql = neon(dbUrl)
            const result = await sql`SELECT 1 as ok`
            if (result[0]?.ok === 1) {
                pass('Database connection successful (SELECT 1)')
            } else {
                fail('Database query returned unexpected result')
            }
        } catch (e) {
            fail(`Database connection failed: ${e}`)
        }
    }

    // 4. REDIS
    header('4. Redis (Upstash)')
    const redisUrl = process.env.UPSTASH_REDIS_REST_URL
    const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN
    if (!redisUrl || redisUrl.includes('PASTE_YOUR')) {
        fail('UPSTASH_REDIS_REST_URL not configured')
    } else if (!redisToken || redisToken.includes('PASTE_YOUR')) {
        fail('UPSTASH_REDIS_REST_TOKEN not configured')
    } else {
        pass('Redis env vars are set')
        try {
            const { Redis } = await import('@upstash/redis')
            const redis = new Redis({ url: redisUrl, token: redisToken })
            const pong = await redis.ping()
            if (pong === 'PONG') {
                pass('Redis PING → PONG')
            } else {
                fail(`Redis PING returned: ${pong}`)
            }
            await redis.set('linkedpilot:verify-test', 'hello')
            const val = await redis.get('linkedpilot:verify-test')
            if (val === 'hello') {
                pass('Redis SET/GET round-trip passed')
            } else {
                fail(`Redis GET returned: ${val}`)
            }
            await redis.del('linkedpilot:verify-test')
        } catch (e) {
            fail(`Redis error: ${e}`)
        }
    }

    // 5. BROWSERLESS
    header('5. Browserless.io')
    const blessToken = process.env.BLESS_TOKEN || process.env.BROWSERLESS_API_KEY
    if (!blessToken || blessToken.includes('PASTE_YOUR')) {
        fail('Browserless token not configured (BLESS_TOKEN or BROWSERLESS_API_KEY)')
    } else {
        pass('Browserless token is set')
        try {
            const res = await fetch(`https://chrome.browserless.io/json/version?token=${blessToken}`)
            if (res.ok) {
                const data = await res.json()
                pass(`Browserless connected: ${data.Browser || 'OK'}`)
            } else {
                fail(`Browserless returned HTTP ${res.status}`)
            }
        } catch (e) {
            warn(`Browserless check skipped (network): ${e}`)
        }
    }

    // 6. PROXY CONFIG
    header('6. Proxy Configuration')
    if (process.env.PROXY_ENABLED === 'true') {
        const requiredVars = ['BRIGHTDATA_HOST', 'BRIGHTDATA_PORT', 'BRIGHTDATA_USERNAME', 'BRIGHTDATA_PASSWORD']
        const missing = requiredVars.filter(v => !process.env[v])
        if (missing.length === 0) {
            pass(`All proxy env vars set (${process.env.BRIGHTDATA_HOST})`)
        } else {
            fail(`Missing proxy vars: ${missing.join(', ')}`)
        }
    } else {
        warn('PROXY_ENABLED is not true — proxies disabled (OK for local dev)')
    }

    // 7. INNGEST
    header('7. Inngest')
    const eventKey = process.env.INNGEST_EVENT_KEY
    const signingKey = process.env.INNGEST_SIGNING_KEY
    if (!eventKey || eventKey.includes('PASTE_YOUR')) {
        warn('INNGEST_EVENT_KEY not configured (use Inngest dev server locally)')
    } else {
        pass('INNGEST_EVENT_KEY is set')
    }
    if (!signingKey || signingKey.includes('PASTE_YOUR')) {
        warn('INNGEST_SIGNING_KEY not configured (use Inngest dev server locally)')
    } else {
        pass('INNGEST_SIGNING_KEY is set')
    }

    // 8. STUB_MODE
    header('8. STUB_MODE')
    if (process.env.STUB_MODE === 'true') {
        fail('STUB_MODE is still "true" — set to "false" in .env.local')
    } else {
        pass(`STUB_MODE is "${process.env.STUB_MODE || 'unset'}" (correct)`)
    }

    // Final summary
    console.log(`\n${BOLD}════════════════════════════════════════${RESET}`)
    if (failed === 0) {
        console.log(`${GREEN}${BOLD}  ✅ ALL SYSTEMS GO — LinkedPilot is ready for live LinkedIn automation${RESET}`)
    } else {
        console.log(`${RED}${BOLD}  ❌ ${failed} CHECK(S) FAILED — Fix the above before running live campaigns${RESET}`)
    }
    console.log(`  ${GREEN}${passed} passed${RESET}  ${failed > 0 ? `${RED}${failed} failed${RESET}` : ''}`)
    console.log(`${BOLD}════════════════════════════════════════${RESET}\n`)

    process.exit(failed > 0 ? 1 : 0)
}

main().catch((e) => {
    console.error('Verification script error:', e)
    process.exit(1)
})
