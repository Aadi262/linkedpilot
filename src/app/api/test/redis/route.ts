import { NextResponse } from 'next/server'
import { redis, getAccountSafetyStatus } from '@/lib/safety'
import { db } from '@/db'
import { linkedinAccounts } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function GET() {
    try {
        // Test Redis connection with PING
        const pong = await redis.ping()

        // Test SET/GET
        await redis.set('linkedpilot:test', 'hello')
        const testValue = await redis.get('linkedpilot:test')

        // Get account safety statuses
        const accounts = await db
            .select({ id: linkedinAccounts.id, username: linkedinAccounts.username })
            .from(linkedinAccounts)

        const accountStatuses = await Promise.all(
            accounts.map(async (acc) => ({
                id: acc.id,
                username: acc.username,
                ...(await getAccountSafetyStatus(acc.id)),
            }))
        )

        return NextResponse.json({
            connected: true,
            ping: pong,
            testValue,
            message: `PING → ${pong} ✅`,
            accountStatuses,
        })
    } catch (error) {
        return NextResponse.json(
            { connected: false, error: String(error) },
            { status: 500 }
        )
    }
}
