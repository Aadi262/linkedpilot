import { db } from '@/db'
import { workspaces } from '@/db/schema'
import { eq } from 'drizzle-orm'

/**
 * Get the workspace for a user. Creates one automatically in dev mode if missing.
 */
export async function getOrCreateWorkspace(userId: string): Promise<string> {
  const existing = await db
    .select({ id: workspaces.id })
    .from(workspaces)
    .where(eq(workspaces.ownerId, userId))
    .limit(1)

  if (existing.length > 0) return existing[0].id

  // Auto-create workspace (dev mode or first-time user)
  const slug = `workspace-${userId.slice(0, 8)}-${Math.random().toString(36).slice(2, 6)}`
  const result = await db
    .insert(workspaces)
    .values({ name: 'My Workspace', slug, plan: 'starter', ownerId: userId })
    .returning({ id: workspaces.id })

  return result[0].id
}
