// Safety engine — Redis-backed action counters per LinkedIn account
// Uses Upstash Redis for persistent, TTL-based counters.

import { Redis } from '@upstash/redis'

const DAILY_LIMIT = 200
const WEEKLY_CONNECTION_LIMIT = 95

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Date key helpers
const todayKey = () => new Date().toISOString().slice(0, 10) // YYYY-MM-DD
const weekKey = () => {
  const d = new Date()
  const oneJan = new Date(d.getFullYear(), 0, 1)
  const weekNum = Math.ceil(
    ((d.getTime() - oneJan.getTime()) / 86400000 + oneJan.getDay() + 1) / 7
  )
  return `${d.getFullYear()}-W${weekNum}`
}

/**
 * Check if account can perform an action, and increment counter if allowed.
 * Returns true if allowed, false if daily limit reached.
 */
export async function checkAndIncrementAction(accountId: string): Promise<boolean> {
  const key = `acct:${accountId}:actions:${todayKey()}`
  const count = await redis.incr(key)
  if (count === 1) await redis.expire(key, 86400 + 3600) // expire next day + 1h buffer
  if (count > DAILY_LIMIT) {
    await redis.decr(key)
    return false
  }
  return true
}

/**
 * Check if account is under the weekly connection request cap.
 */
export async function checkConnectionCap(accountId: string): Promise<boolean> {
  const key = `acct:${accountId}:conns:${weekKey()}`
  const count = parseInt((await redis.get(key) as string) || '0')
  return count < WEEKLY_CONNECTION_LIMIT
}

/**
 * Increment connection request counter.
 */
export async function incrementConnection(accountId: string): Promise<number> {
  const key = `acct:${accountId}:conns:${weekKey()}`
  const count = await redis.incr(key)
  if (count === 1) {
    await redis.expire(key, 7 * 86400 + 3600) // 7 days + 1h buffer
  }
  return count
}

/**
 * Get current daily action count for an account.
 */
export async function getDailyCount(accountId: string): Promise<number> {
  return parseInt((await redis.get(`acct:${accountId}:actions:${todayKey()}`)) as string || '0')
}

/**
 * Get comprehensive safety status for an account.
 */
export async function getAccountSafetyStatus(accountId: string) {
  const [actions, conns] = await Promise.all([
    redis.get(`acct:${accountId}:actions:${todayKey()}`),
    redis.get(`acct:${accountId}:conns:${weekKey()}`),
  ])
  const actionsToday = parseInt((actions as string) || '0')
  const connsThisWeek = parseInt((conns as string) || '0')
  return {
    actionsToday,
    connsThisWeek,
    isFrozen: actionsToday >= DAILY_LIMIT,
    connsCapped: connsThisWeek >= WEEKLY_CONNECTION_LIMIT,
  }
}

/**
 * Reset action counter for an account (manual unfreeze).
 * Note: does NOT reset weekly connection count.
 */
export async function resetAccountCounters(accountId: string): Promise<void> {
  const actionKey = `acct:${accountId}:actions:${todayKey()}`
  await redis.set(actionKey, '0')
}

/**
 * Freeze an account — mark it in DB and stop all jobs for it.
 */
export async function freezeAccount(accountId: string, reason: string): Promise<void> {
  console.warn(`[Safety] Account ${accountId} FROZEN: ${reason}`)
  // DB update is handled by the caller (Inngest function)
}

/**
 * Check if current time is within working hours for a given timezone.
 * Returns false outside 8am–7pm to prevent bot-like 24/7 activity.
 */
export function isWorkingHours(timezone = 'America/New_York'): boolean {
  const now = new Date()
  const hour = parseInt(
    now.toLocaleString('en-US', { timeZone: timezone, hour: 'numeric', hour12: false }),
    10
  )
  return hour >= 8 && hour < 19
}

// Export Redis instance for test routes
export { redis }
