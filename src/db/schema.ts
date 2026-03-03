import {
  mysqlTable,
  varchar,
  text,
  int,
  timestamp,
  mysqlEnum,
  json,
  boolean,
  index,
  uniqueIndex,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

export const workspaces = mysqlTable("workspaces", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  plan: mysqlEnum("plan", ["starter", "agency", "scale"]).default("starter").notNull(),
  ownerId: varchar("owner_id", { length: 255 }).notNull(),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
  whitelabelConfig: json("whitelabel_config"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const workspaceMembers = mysqlTable(
  "workspace_members",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
    workspaceId: varchar("workspace_id", { length: 36 }).notNull(),
    userId: varchar("user_id", { length: 255 }).notNull(),
    role: mysqlEnum("role", ["admin", "manager", "member"]).default("member").notNull(),
    status: mysqlEnum("status", ["active", "pending", "revoked"]).default("pending").notNull(),
    inviteToken: varchar("invite_token", { length: 255 }),
    inviteEmail: varchar("invite_email", { length: 255 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    workspaceUserIdx: uniqueIndex("workspace_user_idx").on(t.workspaceId, t.userId),
  })
);

export const linkedinAccounts = mysqlTable("linkedin_accounts", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  workspaceId: varchar("workspace_id", { length: 36 }).notNull(),
  username: varchar("username", { length: 255 }).notNull(),
  profileUrl: varchar("profile_url", { length: 500 }),
  displayName: varchar("display_name", { length: 255 }),
  profilePhoto: varchar("profile_photo", { length: 500 }),
  // Store encrypted in production
  sessionCookies: text("session_cookies"),
  proxyId: varchar("proxy_id", { length: 36 }),
  proxyConfig: json("proxy_config"),
  status: mysqlEnum("status", ["connecting", "active", "frozen", "flagged", "disconnected"]).default("connecting").notNull(),
  dailyActionCount: int("daily_action_count").default(0).notNull(),
  weeklyConnectionCount: int("weekly_connection_count").default(0).notNull(),
  lastActiveAt: timestamp("last_active_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const proxies = mysqlTable("proxies", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  workspaceId: varchar("workspace_id", { length: 36 }).notNull(),
  linkedinAccountId: varchar("linkedin_account_id", { length: 36 }),
  provider: varchar("provider", { length: 50 }).default("brightdata").notNull(),
  ip: varchar("ip", { length: 45 }).notNull(),
  port: int("port").notNull(),
  credentials: json("credentials"),
  status: mysqlEnum("status", ["active", "banned"]).default("active").notNull(),
  assignedAt: timestamp("assigned_at").defaultNow(),
});

// Waitlist table
export const waitlist = mysqlTable("waitlist", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  email: varchar("email", { length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
