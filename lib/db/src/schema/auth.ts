import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  pgEnum,
  boolean,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

// ============================================================================
// ENUMS
// ============================================================================

export const roleEnum = pgEnum("role", [
  "super_admin",
  "admin",
  "support",
  "editor",
  "viewer",
]);

export const userStatusEnum = pgEnum("user_status", [
  "active",
  "inactive",
  "blocked",
]);

// ============================================================================
// TABLES
// ============================================================================

export const adminUsers = pgTable(
  "admin_users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    password_hash: varchar("password_hash", { length: 255 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    role: roleEnum("role").notNull().default("viewer"),
    status: userStatusEnum("status").notNull().default("active"),
    mfa_enabled: boolean("mfa_enabled").notNull().default(false),
    mfa_secret: varchar("mfa_secret", { length: 255 }),
    last_login: timestamp("last_login"),
    created_at: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    emailIdx: uniqueIndex("admin_users_email_idx").on(table.email),
    roleIdx: index("admin_users_role_idx").on(table.role),
    statusIdx: index("admin_users_status_idx").on(table.status),
  })
);

export const adminSessions = pgTable(
  "admin_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: uuid("user_id")
      .notNull()
      .references(() => adminUsers.id, { onDelete: "cascade" }),
    token_hash: text("token_hash").notNull().unique(),
    refresh_token_hash: text("refresh_token_hash").notNull(),
    expires_at: timestamp("expires_at", { withTimezone: true }).notNull(),
    refresh_expires_at: timestamp("refresh_expires_at", { withTimezone: true })
      .notNull(),
    ip_address: varchar("ip_address", { length: 45 }),
    user_agent: text("user_agent"),
    created_at: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    userIdIdx: index("admin_sessions_user_id_idx").on(table.user_id),
    expiresAtIdx: index("admin_sessions_expires_at_idx").on(table.expires_at),
  })
);

export const adminPermissions = pgTable("admin_permissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: varchar("key", { length: 255 }).notNull().unique(),
  description: text("description").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  created_at: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

