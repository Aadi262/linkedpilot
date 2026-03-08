import {
  pgTable,
  varchar,
  text,
  integer,
  timestamp,
  jsonb,
  boolean,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

export const workspaces = pgTable('workspaces', {
  id: varchar('id', { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  plan: varchar('plan', { length: 50 }).default('starter').notNull(),
  ownerId: varchar('owner_id', { length: 255 }).notNull(),
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
  whitelabelConfig: jsonb('whitelabel_config'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const workspaceMembers = pgTable(
  'workspace_members',
  {
    id: varchar('id', { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    workspaceId: varchar('workspace_id', { length: 36 }).notNull(),
    userId: varchar('user_id', { length: 255 }).notNull(),
    role: varchar('role', { length: 50 }).default('member').notNull(),
    status: varchar('status', { length: 50 }).default('pending').notNull(),
    inviteToken: varchar('invite_token', { length: 255 }),
    inviteEmail: varchar('invite_email', { length: 255 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => ({
    workspaceUserIdx: uniqueIndex('workspace_user_idx').on(t.workspaceId, t.userId),
  })
)

export const linkedinAccounts = pgTable('linkedin_accounts', {
  id: varchar('id', { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  workspaceId: varchar('workspace_id', { length: 36 }).notNull(),
  username: varchar('username', { length: 255 }).notNull(),
  profileUrl: varchar('profile_url', { length: 500 }),
  displayName: varchar('display_name', { length: 255 }),
  profilePhoto: varchar('profile_photo', { length: 500 }),
  sessionCookies: text('session_cookies'),
  proxyId: varchar('proxy_id', { length: 36 }),
  proxyConfig: jsonb('proxy_config'),
  status: varchar('status', { length: 50 }).default('connecting').notNull(),
  dailyActionCount: integer('daily_action_count').default(0).notNull(),
  weeklyConnectionCount: integer('weekly_connection_count').default(0).notNull(),
  lastActiveAt: timestamp('last_active_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const proxies = pgTable('proxies', {
  id: varchar('id', { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  workspaceId: varchar('workspace_id', { length: 36 }).notNull(),
  linkedinAccountId: varchar('linkedin_account_id', { length: 36 }),
  provider: varchar('provider', { length: 50 }).default('brightdata').notNull(),
  ip: varchar('ip', { length: 45 }).notNull(),
  port: integer('port').notNull(),
  credentials: jsonb('credentials'),
  status: varchar('status', { length: 50 }).default('active').notNull(),
  assignedAt: timestamp('assigned_at').defaultNow(),
})

export const waitlist = pgTable('waitlist', {
  id: varchar('id', { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  email: varchar('email', { length: 255 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const campaigns = pgTable('campaigns', {
  id: varchar('id', { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  workspaceId: varchar('workspace_id', { length: 36 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  status: varchar('status', { length: 50 }).default('draft').notNull(),
  goal: varchar('goal', { length: 50 }).default('generate_leads'),
  sequenceSteps: jsonb('sequence_steps'),
  senderAccountIds: jsonb('sender_account_ids'),
  dailyLimit: integer('daily_limit').default(30).notNull(),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  stats: jsonb('stats'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const leads = pgTable(
  'leads',
  {
    id: varchar('id', { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    workspaceId: varchar('workspace_id', { length: 36 }).notNull(),
    campaignId: varchar('campaign_id', { length: 36 }),
    linkedinProfileUrl: varchar('linkedin_profile_url', { length: 500 }).notNull(),
    firstName: varchar('first_name', { length: 100 }),
    lastName: varchar('last_name', { length: 100 }),
    company: varchar('company', { length: 255 }),
    title: varchar('title', { length: 255 }),
    profilePhoto: varchar('profile_photo', { length: 500 }),
    connectionStatus: varchar('connection_status', { length: 50 }).default('pending').notNull(),
    currentStep: integer('current_step').default(0).notNull(),
    lastContactedAt: timestamp('last_contacted_at'),
    tags: jsonb('tags'),
    customFields: jsonb('custom_fields'),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => ({
    workspaceProfileIdx: uniqueIndex('workspace_profile_idx').on(t.workspaceId, t.linkedinProfileUrl),
  })
)

export const messages = pgTable('messages', {
  id: varchar('id', { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  workspaceId: varchar('workspace_id', { length: 36 }).notNull(),
  campaignId: varchar('campaign_id', { length: 36 }),
  leadId: varchar('lead_id', { length: 36 }).notNull(),
  linkedinAccountId: varchar('linkedin_account_id', { length: 36 }).notNull(),
  direction: varchar('direction', { length: 10 }).notNull(),
  content: text('content').notNull(),
  messageType: varchar('message_type', { length: 50 }).default('message').notNull(),
  sentAt: timestamp('sent_at').defaultNow().notNull(),
  readAt: timestamp('read_at'),
})

export const campaignEvents = pgTable('campaign_events', {
  id: varchar('id', { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  campaignId: varchar('campaign_id', { length: 36 }).notNull(),
  leadId: varchar('lead_id', { length: 36 }).notNull(),
  linkedinAccountId: varchar('linkedin_account_id', { length: 36 }).notNull(),
  eventType: varchar('event_type', { length: 100 }).notNull(),
  metadata: jsonb('metadata'),
  occurredAt: timestamp('occurred_at').defaultNow().notNull(),
})

export const automationRules = pgTable('automation_rules', {
  id: varchar('id', { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  workspaceId: varchar('workspace_id', { length: 36 }).notNull(),
  campaignId: varchar('campaign_id', { length: 36 }),
  trigger: varchar('trigger', { length: 100 }).notNull(),
  action: varchar('action', { length: 100 }).notNull(),
  config: jsonb('config'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const webhooks = pgTable('webhooks', {
  id: varchar('id', { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  workspaceId: varchar('workspace_id', { length: 36 }).notNull(),
  url: varchar('url', { length: 500 }).notNull(),
  events: jsonb('events').notNull(),
  secret: varchar('secret', { length: 64 }).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  lastDeliveredAt: timestamp('last_delivered_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const notifications = pgTable('notifications', {
  id: varchar('id', { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  workspaceId: varchar('workspace_id', { length: 36 }).notNull(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  message: text('message').notNull(),
  isRead: boolean('is_read').default(false).notNull(),
  channel: varchar('channel', { length: 50 }).default('in_app').notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ─── Types ────────────────────────────────────────────────────────────────────
export type Workspace = typeof workspaces.$inferSelect
export type WorkspaceMember = typeof workspaceMembers.$inferSelect
export type LinkedinAccount = typeof linkedinAccounts.$inferSelect
export type Proxy = typeof proxies.$inferSelect
export type Campaign = typeof campaigns.$inferSelect
export type Lead = typeof leads.$inferSelect
export type Message = typeof messages.$inferSelect
export type CampaignEvent = typeof campaignEvents.$inferSelect
export type AutomationRule = typeof automationRules.$inferSelect
export type Webhook = typeof webhooks.$inferSelect
export type Notification = typeof notifications.$inferSelect
