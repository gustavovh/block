import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  pgEnum,
  boolean,
  index,
  uniqueIndex,
  json,
} from "drizzle-orm/pg-core";
import { adminUsers } from "./auth";

// ============================================================================
// ENUMS
// ============================================================================

export const releaseStatusEnum = pgEnum("release_status", [
  "draft",
  "published",
  "deprecated",
  "blocked",
]);

export const platformEnum = pgEnum("platform", ["android", "ios", "web"]);

// ============================================================================
// TABLES
// ============================================================================

export const releases = pgTable(
  "releases",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    version: varchar("version", { length: 20 }).notNull().unique(),
    changelog: text("changelog").notNull(),
    release_notes: text("release_notes").notNull(),
    platforms: json("platforms")
      .$type<Record<string, { available: boolean; build_id?: string }>>()
      .notNull(),
    status: releaseStatusEnum("status").notNull().default("draft"),
    mandatory: boolean("mandatory").notNull().default(false),
    rollback_available: boolean("rollback_available").notNull().default(false),
    released_at: timestamp("released_at", { withTimezone: true }),
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
    versionIdx: uniqueIndex("releases_version_idx").on(table.version),
    statusIdx: index("releases_status_idx").on(table.status),
    releasedAtIdx: index("releases_released_at_idx").on(table.released_at),
    createdByIdx: index("releases_created_by_idx").on(table.created_by),
  })
);

