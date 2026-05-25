import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  pgEnum,
  integer,
  index,
  uniqueIndex,
  bigint,
} from "drizzle-orm/pg-core";
import { adminUsers } from "./auth";
import { releases } from "./versions";

// ============================================================================
// ENUMS
// ============================================================================

export const buildStatusEnum = pgEnum("build_status", [
  "pending",
  "building",
  "success",
  "failed",
  "cancelled",
]);

export const environmentEnum = pgEnum("environment", [
  "development",
  "staging",
  "production",
]);

export const platformBuildEnum = pgEnum("platform_build", [
  "android",
  "ios",
  "web",
]);

// ============================================================================
// TABLES
// ============================================================================

export const builds = pgTable(
  "builds",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    release_id: uuid("release_id").references(() => releases.id, {
      onDelete: "set null",
    }),
    platform: platformBuildEnum("platform").notNull(),
    environment: environmentEnum("environment").notNull(),
    version: varchar("version", { length: 20 }).notNull(),
    status: buildStatusEnum("status").notNull().default("pending"),
    file_size: bigint("file_size", { mode: "number" }), // en bytes
    hash: varchar("hash", { length: 64 }), // SHA256
    download_url: varchar("download_url", { length: 1024 }),
    build_logs: text("build_logs").notNull().default(""),
    error_message: text("error_message"),
    duration_seconds: integer("duration_seconds"),
    created_by: uuid("created_by")
      .notNull()
      .references(() => adminUsers.id, { onDelete: "restrict" }),
    created_at: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    releaseIdIdx: index("builds_release_id_idx").on(table.release_id),
    platformIdx: index("builds_platform_idx").on(table.platform),
    environmentIdx: index("builds_environment_idx").on(table.environment),
    statusIdx: index("builds_status_idx").on(table.status),
    versionIdx: index("builds_version_idx").on(table.version),
    createdByIdx: index("builds_created_by_idx").on(table.created_by),
  })
);

