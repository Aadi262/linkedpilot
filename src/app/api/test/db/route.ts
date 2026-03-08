import { NextResponse } from 'next/server'
import { db } from '@/db'
import { sql } from 'drizzle-orm'

export async function GET() {
    try {
        // Test DB connection with simple SELECT 1
        await db.execute(sql`SELECT 1 as ok`)

        // Count rows in key tables using raw SQL that returns scalar values
        const accountsResult = await db.execute(sql`SELECT count(*)::int as cnt FROM linkedin_accounts`)
        const campaignsResult = await db.execute(sql`SELECT count(*)::int as cnt FROM campaigns`)
        const leadsResult = await db.execute(sql`SELECT count(*)::int as cnt FROM leads`)

        return NextResponse.json({
            connected: true,
            message: 'Database connected ✅',
            tables: {
                linkedin_accounts: (accountsResult as unknown as Array<{ cnt: number }>)[0]?.cnt ?? 0,
                campaigns: (campaignsResult as unknown as Array<{ cnt: number }>)[0]?.cnt ?? 0,
                leads: (leadsResult as unknown as Array<{ cnt: number }>)[0]?.cnt ?? 0,
            },
        })
    } catch (error) {
        return NextResponse.json(
            { connected: false, error: String(error) },
            { status: 500 }
        )
    }
}
