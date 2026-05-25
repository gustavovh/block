import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  json,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";
import { adminUsers } from "./auth";

// ============================================================================
// ENUMS
// ============================================================================

export const auditActionEnum = pgEnum("audit_action", [
  "create",
  "read",
  "update",
  "delete",
  "publish",
  "approve",
  "reject",
]);

export const errorSourceEnum = pgEnum("error_source", [
  "frontend",
  "backend",
  "mobile",
]);

// ============================================================================
// TABLES
// ============================================================================

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: uuid("user_id")
      .notNull()
      .references(() => adminUsers.id, { onDelete: "restrict" }),
    action: auditActionEnum("action").notNull(),
    resource_type: varchar("resource_type", { length: 100 }).notNull(),
    resource_id: varchar("resource_id", { length: 100 }),
    changes: json("changes").$type<Record<string, any>>().notNull(),
    ip_address: varchar("ip_address", { length: 45 }),
    user_agent: text("user_agent"),
    created_at: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    userIdIdx: index("audit_logs_user_id_idx").on(table.user_id),
    actionIdx: index("audit_logs_action_idx").on(table.action),
    resourceTypeIdx: index("audit_logs_resource_type_idx").on(
      table.resource_type
    ),
    createdAtIdx: index("audit_logs_created_at_idx").on(table.created_at),
  })
);

export const errorLogs = pgTable(
  "error_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    source: errorSourceEnum("source").notNull(),
    error_type: varchar("error_type", { length: 255 }).notNull(),
    message: text("message").notNull(),
    stack_trace: text("stack_trace"),
    user_id: uuid("user_id").references(() => adminUsers.id, {
      onDelete: "set null",
    }),
    metadata: json("metadata").$type<Record<string, any>>().notNull().default({}),
    created_at: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    sourceIdx: index("error_logs_source_idx").on(table.source),
    errorTypeIdx: index("error_logs_error_type_idx").on(table.error_type),
    userIdIdx: index("error_logs_user_id_idx").on(table.user_id),
    createdAtIdx: index("error_logs_created_at_idx").on(table.created_at),
  })
);

