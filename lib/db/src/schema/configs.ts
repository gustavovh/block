import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  json,
  pgEnum,
  index,
  uniqueIndex,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { adminUsers } from "./auth";

// ============================================================================
// ENUMS
// ============================================================================

export const settingTypeEnum = pgEnum("setting_type", [
  "string",
  "number",
  "boolean",
  "json",
]);

// ============================================================================
// TABLES
// ============================================================================

export const settings = pgTable(
  "settings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    key: varchar("key", { length: 255 }).notNull().unique(),
    value: json("value").notNull(),
    type: settingTypeEnum("type").notNull().default("string"),
    description: text("description").notNull(),
    updated_by: uuid("updated_by").references(() => adminUsers.id, {
      onDelete: "set null",
    }),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    created_at: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    keyIdx: uniqueIndex("settings_key_idx").on(table.key),
  })
);

export const featureFlags = pgTable(
  "feature_flags",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    key: varchar("key", { length: 255 }).notNull().unique(),
    enabled: boolean("enabled").notNull().default(false),
    percentage: integer("percentage").notNull().default(100), // 0-100
    platforms: json("platforms").$type<string[]>().notNull().default([]),
    version_min: varchar("version_min", { length: 20 }),
    version_max: varchar("version_max", { length: 20 }),
    updated_by: uuid("updated_by").references(() => adminUsers.id, {
      onDelete: "set null",
    }),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    created_at: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    keyIdx: uniqueIndex("feature_flags_key_idx").on(table.key),
    enabledIdx: index("feature_flags_enabled_idx").on(table.enabled),
  })
);

export const remoteConfigs = pgTable(
  "remote_configs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    key: varchar("key", { length: 255 }).notNull().unique(),
    value: json("value").notNull(),
    version_min: varchar("version_min", { length: 20 }),
    version_max: varchar("version_max", { length: 20 }),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    created_at: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    keyIdx: uniqueIndex("remote_configs_key_idx").on(table.key),
  })
);

