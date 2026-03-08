// LinkedIn Playwright automation actions — Real implementations
// All functions receive an already-open Playwright page with session + proxy configured.

import { jitter, checkForCheckpoint, humanType, shortJitter } from './browser'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Page = any

export interface ActionResult {
  success: boolean
  action: string
  reason?: string
  metadata?: Record<string, unknown>
  error?: string
}

export interface InboxMessage {
  from: string
  profileUrl: string
  content: string
  timestamp: string
}

/**
 * Send a LinkedIn connection request to a profile.
 */
export async function sendConnectionRequest(
  page: Page,
  profileUrl: string,
  note?: string
): Promise<ActionResult> {
  try {
    await page.goto(profileUrl, { waitUntil: 'domcontentloaded', timeout: 30000 })
    await jitter(1500, 3500)

    if (await checkForCheckpoint(page)) {
      return { success: false, action: 'connection_sent', reason: 'checkpoint' }
    }

    // Try multiple selectors — LinkedIn changes DOM frequently
    let connectBtn = null

    // Try A: aria-label based
    try {
      connectBtn = page.locator('button[aria-label^="Invite"][aria-label*="connect"]').first()
      if (!(await connectBtn.isVisible({ timeout: 2000 }))) connectBtn = null
    } catch { connectBtn = null }

    // Try B: text-based
    if (!connectBtn) {
      try {
        connectBtn = page.locator('button:has-text("Connect")').first()
        if (!(await connectBtn.isVisible({ timeout: 2000 }))) connectBtn = null
      } catch { connectBtn = null }
    }

    // Try C: Open More actions dropdown first
    if (!connectBtn) {
      try {
        const moreBtn = page.locator('button[aria-label="More actions"]').first()
        if (await moreBtn.isVisible({ timeout: 2000 })) {
          await moreBtn.click()
          await jitter(500, 1000)
          connectBtn = page.locator('[role="menuitem"]:has-text("Connect")').first()
          if (!(await connectBtn.isVisible({ timeout: 2000 }))) connectBtn = null
        }
      } catch { connectBtn = null }
    }

    if (!connectBtn) {
      return { success: false, action: 'connection_sent', reason: 'already_connected_or_pending' }
    }

    await connectBtn.click()
    await jitter(800, 1800)

    if (note) {
      try {
        const addNoteBtn = page.locator('button:has-text("Add a note")').first()
        if (await addNoteBtn.isVisible({ timeout: 3000 })) {
          await addNoteBtn.click()
          await jitter(400, 900)
          await humanType(page, 'textarea[name="message"]', note)
          await jitter(600, 1200)
        }
      } catch {
        console.warn('[LinkedIn] Could not add note to connection request')
      }
    }

    // Click Send
    try {
      const sendBtn = page.locator('button[aria-label="Send now"]').first()
      if (await sendBtn.isVisible({ timeout: 2000 })) {
        await sendBtn.click()
      } else {
        const sendBtn2 = page.locator('button:has-text("Send")').first()
        await sendBtn2.click()
      }
    } catch {
      // Try generic submit
      await page.locator('button[type="submit"]').first().click()
    }

    await jitter(1000, 2000)
    return { success: true, action: 'connection_sent', metadata: { profileUrl, hasNote: !!note } }
  } catch (error) {
    return { success: false, action: 'connection_sent', error: String(error) }
  }
}

/**
 * Send a message to a LinkedIn connection.
 */
export async function sendMessage(
  page: Page,
  profileUrl: string,
  message: string
): Promise<ActionResult> {
  try {
    await page.goto(profileUrl, { waitUntil: 'domcontentloaded', timeout: 30000 })
    await jitter(1500, 3000)

    if (await checkForCheckpoint(page)) {
      return { success: false, action: 'message_sent', reason: 'checkpoint' }
    }

    // Find and click Message button
    const messageBtn = page.locator('button:has-text("Message")').first()
    if (!(await messageBtn.isVisible({ timeout: 5000 }))) {
      return { success: false, action: 'message_sent', reason: 'message_button_not_found' }
    }

    await messageBtn.click()
    await jitter(1000, 2000)

    // Wait for message dialog and type
    const msgInput = page.locator('.msg-form__contenteditable, div[role="textbox"]').first()
    await msgInput.waitFor({ state: 'visible', timeout: 5000 })
    await msgInput.click()
    await shortJitter()

    // Type character by character
    for (const char of message) {
      const delay = 40 + Math.random() * 140
      await page.keyboard.type(char, { delay })
    }

    await jitter(800, 1600)

    // Click Send
    const sendBtn = page.locator('button[type="submit"].msg-form__send-button, button:has-text("Send")').first()
    await sendBtn.click()
    await jitter(600, 1200)

    return { success: true, action: 'message_sent', metadata: { profileUrl, messageLength: message.length } }
  } catch (error) {
    return { success: false, action: 'message_sent', error: String(error) }
  }
}

/**
 * Check LinkedIn messaging inbox for new unread messages.
 */
export async function checkNewMessages(page: Page): Promise<InboxMessage[]> {
  try {
    await page.goto('https://www.linkedin.com/messaging/', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    })
    await jitter(1200, 2500)

    const messages: InboxMessage[] = []
    const conversations = page.locator('.msg-conversation-listitem')
    const count = await conversations.count()

    for (let i = 0; i < Math.min(count, 10); i++) {
      try {
        const item = conversations.nth(i)

        // Check if unread
        const isUnread = await item.locator('.msg-conversation-card__unread-count').isVisible({ timeout: 500 }).catch(() => false)
        if (!isUnread) continue

        const senderName = await item.locator('.msg-conversation-card__participant-names').textContent().catch(() => 'Unknown')
        const preview = await item.locator('.msg-conversation-card__message-snippet').textContent().catch(() => '')
        const timestamp = await item.locator('time').getAttribute('datetime').catch(() => new Date().toISOString())

        // Click to open conversation
        await item.click()
        await jitter(800, 1500)

        // Get full message text
        const lastMsg = page.locator('.msg-s-event-listitem__body').last()
        const fullText = await lastMsg.textContent().catch(() => preview)

        // Get profile URL from conversation header
        const profileLink = await page.locator('.msg-thread__link-to-profile').getAttribute('href').catch(() => '')

        messages.push({
          from: senderName?.trim() || 'Unknown',
          profileUrl: profileLink ? `https://www.linkedin.com${profileLink}` : '',
          content: fullText?.trim() || preview?.trim() || '',
          timestamp: timestamp || new Date().toISOString(),
        })
      } catch {
        continue // Skip errored conversations
      }
    }

    return messages
  } catch {
    return []
  }
}

/**
 * Scrape profile data from a LinkedIn profile page.
 */
export async function scrapeProfileData(
  page: Page,
  profileUrl: string
): Promise<{ name: string; headline: string; company: string; location: string }> {
  await page.goto(profileUrl, { waitUntil: 'domcontentloaded', timeout: 30000 })
  await jitter(1000, 2000)

  const name = await page.locator('h1.text-heading-xlarge').textContent().catch(() => '') || ''
  const headline = await page.locator('.text-body-medium.break-words').first().textContent().catch(() => '') || ''
  const company = await page.locator('[aria-label^="Current company"]').textContent().catch(() => '') || ''
  const location = await page.locator('.text-body-small.inline').first().textContent().catch(() => '') || ''

  return {
    name: name.trim(),
    headline: headline.trim(),
    company: company.trim(),
    location: location.trim(),
  }
}

/**
 * Withdraw stale pending connection requests (older than 21 days).
 */
export async function withdrawStaleConnections(
  page: Page,
  maxToWithdraw = 5
): Promise<{ withdrawn: number }> {
  try {
    await page.goto('https://www.linkedin.com/mynetwork/invitation-manager/sent/', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    })
    await jitter(1500, 3000)

    let withdrawn = 0
    const items = page.locator('.invitation-card')
    const count = await items.count()

    for (let i = 0; i < count && withdrawn < maxToWithdraw; i++) {
      try {
        const item = items.nth(i)
        const timeText = await item.locator('time').textContent().catch(() => '')

        // Check if older than 21 days
        if (timeText && (timeText.includes('week') || timeText.includes('month'))) {
          const weeks = timeText.match(/(\d+)\s*week/)
          const months = timeText.match(/(\d+)\s*month/)

          const isStale =
            (weeks && parseInt(weeks[1]) >= 3) ||
            (months && parseInt(months[1]) >= 1)

          if (isStale) {
            const withdrawBtn = item.locator('button:has-text("Withdraw")').first()
            if (await withdrawBtn.isVisible({ timeout: 1000 })) {
              await withdrawBtn.click()
              await jitter(500, 1000)

              // Confirm withdraw
              const confirmBtn = page.locator('button:has-text("Withdraw")').last()
              if (await confirmBtn.isVisible({ timeout: 2000 })) {
                await confirmBtn.click()
              }

              withdrawn++
              await jitter(1000, 2500)
            }
          }
        }
      } catch {
        continue
      }
    }

    return { withdrawn }
  } catch {
    return { withdrawn: 0 }
  }
}

/**
 * Substitute template variables in a message with lead data.
 */
export function substituteVariables(
  template: string,
  lead: { firstName?: string; lastName?: string; company?: string; title?: string }
): string {
  return template
    .replace(/\{\{firstName\}\}/g, lead.firstName || 'there')
    .replace(/\{\{lastName\}\}/g, lead.lastName || '')
    .replace(/\{\{company\}\}/g, lead.company || 'your company')
    .replace(/\{\{title\}\}/g, lead.title || 'your role')
}

// Re-export browser utilities used by other modules
export { launchLinkedInBrowser } from './browser'
