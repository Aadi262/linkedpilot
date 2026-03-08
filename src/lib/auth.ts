/**
 * Auth helper — returns userId from Clerk in prod, or DEV_USER_ID in local dev.
 * Clerk is disabled locally (proxy.ts bypasses it). Re-enable by restoring ClerkProvider.
 */
export async function getAuthUser(): Promise<{ userId: string | null }> {
  // Dev mode — Clerk disabled, use fixed userId from env
  if (process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith('pk_live')) {
    return { userId: process.env.DEV_USER_ID || 'dev_user_001' }
  }
  const { auth } = await import('@clerk/nextjs/server')
  return auth()
}
