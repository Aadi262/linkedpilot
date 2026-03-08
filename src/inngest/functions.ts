import { Inngest } from 'inngest'
import { db } from '@/db'
import { linkedinAccounts, campaigns, leads, campaignEvents } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { decrypt, encrypt } from '@/lib/crypto'
import {
  checkAndIncrementAction,
  checkConnectionCap,
  incrementConnection,
  freezeAccount,
  isWorkingHours,
} from '@/lib/safety'
import {
  sendConnectionRequest,
  sendMessage,
  checkNewMessages,
  substituteVariables,
  withdrawStaleConnections,
} from '@/lib/linkedin-actions'
import {
  launchLinkedInBrowser,
  verifyLinkedInSession as verifySession,
  checkForCheckpoint,
  jitter,
  type SessionData,
} from '@/lib/browser'
import { getProxyForAccount } from '@/lib/proxy'

export const inngest = new Inngest({ id: 'linkedpilot' })

// ─── Verify LinkedIn Session ─────────────────────────────────────────────────

export const verifyLinkedInSession = inngest.createFunction(
  { id: 'verify-linkedin-session' },
  { event: 'linkedin/session.verify' },
  async ({ event, step }) => {
    const { accountId } = event.data as { accountId: string }

    // 1. Load account from DB
    const [account] = await step.run('load-account', () =>
      db.select().from(linkedinAccounts).where(eq(linkedinAccounts.id, accountId)).limit(1)
    )
    if (!account || !account.sessionCookies) {
      return { status: 'error', reason: 'account_not_found_or_no_cookies' }
    }

    // 2. Decrypt session
    const sessionData: SessionData = await step.run('decrypt-session', () => {
      const decrypted = decrypt(account.sessionCookies!)
      return JSON.parse(decrypted) as SessionData
    })

    // 3. Get or assign proxy
    const proxy = await step.run('get-proxy', () => getProxyForAccount(accountId))

    // 4. Verify session
    const result = await step.run('verify-session', () =>
      verifySession(accountId, sessionData, proxy)
    )

    // 5. Update account status based on result
    await step.run('update-status', async () => {
      if (result.valid) {
        const updateData: Record<string, unknown> = { status: 'active' }
        if (proxy) {
          updateData.proxyConfig = encrypt(JSON.stringify(proxy))
        }
        await db.update(linkedinAccounts).set(updateData).where(eq(linkedinAccounts.id, accountId))
      } else if (result.reason === 'checkpoint_detected') {
        await db
          .update(linkedinAccounts)
          .set({ status: 'flagged' })
          .where(eq(linkedinAccounts.id, accountId))
        console.warn(`[Session] Account ${accountId} flagged: checkpoint detected`)
      } else {
        await db
          .update(linkedinAccounts)
          .set({ status: 'disconnected' })
          .where(eq(linkedinAccounts.id, accountId))
        console.warn(`[Session] Account ${accountId} disconnected: ${result.reason}`)
      }
    })

    return { status: result.valid ? 'active' : 'failed', ...result }
  }
)

// ─── Run a single campaign sequence step ──────────────────────────────────────

export const runCampaignStep = inngest.createFunction(
  { id: 'run-campaign-step', concurrency: { limit: 5 } },
  { event: 'campaign/step.run' },
  async ({ event, step }) => {
    const {
      campaignId, leadId, stepIndex, accountId,
      stepType, content, profileUrl, firstName, company, timezone,
    } = event.data as {
      campaignId: string; leadId: string; stepIndex: number; accountId: string
      stepType: 'connection_request' | 'message' | 'follow_up'
      content: string; profileUrl: string
      firstName?: string; company?: string; timezone?: string
    }

    // 1. Working hours check
    const inHours = await step.run('working-hours-check', () => isWorkingHours(timezone))
    if (!inHours) return { status: 'deferred', reason: 'outside_working_hours' }

    // 2. Daily action safety check
    const canAct = await step.run('safety-check-daily', () => checkAndIncrementAction(accountId))
    if (!canAct) {
      await step.run('freeze-account', async () => {
        await freezeAccount(accountId, 'daily_limit_reached')
        await db.update(linkedinAccounts).set({ status: 'frozen' }).where(eq(linkedinAccounts.id, accountId))
      })
      return { status: 'frozen', reason: 'daily_limit_reached' }
    }

    // 3. Connection cap check
    if (stepType === 'connection_request') {
      const underCap = await step.run('safety-check-weekly', () => checkConnectionCap(accountId))
      if (!underCap) return { status: 'skipped', reason: 'weekly_connection_cap_reached' }
    }

    // 4. Load account and decrypt session
    const [account] = await step.run('load-account', () =>
      db.select().from(linkedinAccounts).where(eq(linkedinAccounts.id, accountId)).limit(1)
    )
    if (!account) return { status: 'error', reason: 'account_not_found' }

    const sessionData: SessionData = await step.run('decrypt-session', () => {
      const decrypted = account.sessionCookies ? decrypt(account.sessionCookies) : '{}'
      return JSON.parse(decrypted) as SessionData
    })

    // 5. Substitute variables in content
    const finalContent = await step.run('substitute-vars', () =>
      substituteVariables(content, { firstName, company })
    )

    // 6. Get proxy
    const proxy = await step.run('get-proxy', () => getProxyForAccount(accountId))

    // 7. Execute action
    const result = await step.run('execute-action', async () => {
      const { browser, context } = await launchLinkedInBrowser(accountId, sessionData, proxy)
      try {
        const page = await context.newPage()
        await jitter(800, 2500)

        // Check for checkpoint immediately
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (await checkForCheckpoint(page as any)) {
          await db.update(linkedinAccounts).set({ status: 'flagged' }).where(eq(linkedinAccounts.id, accountId))
          return { success: false, action: stepType, reason: 'checkpoint_detected' }
        }

        let actionResult
        if (stepType === 'connection_request') {
          actionResult = await sendConnectionRequest(page, profileUrl, finalContent || undefined)
          if (actionResult.success) {
            await incrementConnection(accountId)
            await db.update(linkedinAccounts)
              .set({ weeklyConnectionCount: account.weeklyConnectionCount + 1, lastActiveAt: new Date() })
              .where(eq(linkedinAccounts.id, accountId))
          }
        } else {
          actionResult = await sendMessage(page, profileUrl, finalContent)
          if (actionResult.success) {
            await db.update(linkedinAccounts).set({ lastActiveAt: new Date() }).where(eq(linkedinAccounts.id, accountId))
          }
        }

        return actionResult
      } finally {
        await browser.close()
      }
    })

    // 8. Log campaign event
    await step.run('log-event', async () => {
      await db.insert(campaignEvents).values({
        campaignId, leadId, linkedinAccountId: accountId,
        eventType: stepType === 'connection_request' ? 'connection_sent' : 'message_sent',
        metadata: { stepIndex, result },
        occurredAt: new Date(),
      })
      await db.update(leads)
        .set({ currentStep: stepIndex + 1, lastContactedAt: new Date() })
        .where(eq(leads.id, leadId))
    })

    return { status: 'completed', result, stepIndex }
  }
)

// ─── Campaign scheduler — runs every 5 minutes ────────────────────────────────

export const campaignScheduler = inngest.createFunction(
  { id: 'campaign-scheduler' },
  { cron: '*/5 * * * *' },
  async ({ step }) => {
    const activeCampaigns = await step.run('fetch-active-campaigns', () =>
      db.select().from(campaigns).where(eq(campaigns.status, 'active'))
    )

    for (const campaign of activeCampaigns) {
      await step.run(`queue-campaign-${campaign.id}`, async () => {
        const pendingLeads = await db.select().from(leads)
          .where(and(eq(leads.campaignId, campaign.id), eq(leads.connectionStatus, 'pending')))
          .limit(campaign.dailyLimit)

        const accountIds = (campaign.senderAccountIds as string[]) || []
        if (accountIds.length === 0) return { skipped: true, reason: 'no_accounts' }

        const steps = (campaign.sequenceSteps as Array<{ type: string; messageTemplate: string; delayDays: number }>) || []

        for (let i = 0; i < pendingLeads.length; i++) {
          const lead = pendingLeads[i]
          const accountId = accountIds[i % accountIds.length]
          const currentStep = steps[lead.currentStep]
          if (!currentStep) continue

          await inngest.send({
            name: 'campaign/step.run',
            data: {
              campaignId: campaign.id, leadId: lead.id, stepIndex: lead.currentStep,
              accountId, stepType: currentStep.type, content: currentStep.messageTemplate || '',
              profileUrl: lead.linkedinProfileUrl, firstName: lead.firstName || '', company: lead.company || '',
            },
          })
        }
        return { queued: pendingLeads.length }
      })
    }

    return { processed: activeCampaigns.length }
  }
)

// ─── Reset daily counters at midnight UTC ─────────────────────────────────────

export const resetDailyCounters = inngest.createFunction(
  { id: 'reset-daily-counters' },
  { cron: '0 0 * * *' },
  async ({ step }) => {
    await step.run('unfreeze-daily-limit-accounts', async () => {
      await db.update(linkedinAccounts)
        .set({ status: 'active', dailyActionCount: 0 })
        .where(eq(linkedinAccounts.status, 'frozen'))
    })
    return { status: 'done' }
  }
)

// ─── Message sync — runs every 10 minutes ─────────────────────────────────────

export const syncMessages = inngest.createFunction(
  { id: 'sync-messages' },
  { cron: '*/10 * * * *' },
  async ({ step }) => {
    const accounts = await step.run('get-active-accounts', () =>
      db.select().from(linkedinAccounts).where(eq(linkedinAccounts.status, 'active'))
    )

    for (const account of accounts) {
      await step.run(`sync-${account.id}`, async () => {
        if (!account.sessionCookies) return { synced: 0 }

        const sessionData: SessionData = JSON.parse(decrypt(account.sessionCookies))
        const proxy = await getProxyForAccount(account.id)

        const { browser, context } = await launchLinkedInBrowser(account.id, sessionData, proxy)
        try {
          const page = await context.newPage()
          const newMessages = await checkNewMessages(page)
          return { synced: newMessages.length }
        } finally {
          await browser.close()
        }
      })
    }

    return { accountsSynced: accounts.length }
  }
)

// ─── Weekly stale connection cleanup — every Monday at 3am UTC ────────────────

export const weeklyStaleCleanup = inngest.createFunction(
  { id: 'weekly-stale-cleanup' },
  { cron: '0 3 * * 1' },
  async ({ step }) => {
    const accounts = await step.run('get-active-accounts', () =>
      db.select().from(linkedinAccounts).where(eq(linkedinAccounts.status, 'active'))
    )

    for (const account of accounts) {
      await step.run(`cleanup-${account.id}`, async () => {
        if (!account.sessionCookies) return { withdrawn: 0 }

        const sessionData: SessionData = JSON.parse(decrypt(account.sessionCookies))
        const proxy = await getProxyForAccount(account.id)

        const { browser, context } = await launchLinkedInBrowser(account.id, sessionData, proxy)
        try {
          const page = await context.newPage()
          const result = await withdrawStaleConnections(page, 10)
          console.log(`[Cleanup] Account ${account.id}: withdrew ${result.withdrawn} stale connections`)
          return result
        } finally {
          await browser.close()
        }
      })
    }

    return { accountsProcessed: accounts.length }
  }
)
