import { NextRequest, NextResponse } from 'next/server'
import { redis, resetAccountCounters, getAccountSafetyStatus } from '@/lib/safety'

export async function POST(req: NextRequest) {
    try {
        const { accountId, counterType, value } = await req.json()

        if (!accountId) {
            return NextResponse.json({ error: 'accountId required' }, { status: 400 })
        }

        if (counterType === 'reset') {
            await resetAccountCounters(accountId)
        } else if (counterType === 'actions') {
            const today = new Date().toISOString().slice(0, 10)
            await redis.set(`acct:${accountId}:actions:${today}`, String(value || 0))
        } else if (counterType === 'connections') {
            const d = new Date()
            const oneJan = new Date(d.getFullYear(), 0, 1)
            const weekNum = Math.ceil(((d.getTime() - oneJan.getTime()) / 86400000 + oneJan.getDay() + 1) / 7)
            const weekKey = `${d.getFullYear()}-W${weekNum}`
            await redis.set(`acct:${accountId}:conns:${weekKey}`, String(value || 0))
        }

        const status = await getAccountSafetyStatus(accountId)

        return NextResponse.json({
            success: true,
            accountId,
            ...status,
        })
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}
