import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  pgEnum,
  integer,
  decimal,
  boolean,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { adminUsers } from "./auth";

// ============================================================================
// ENUMS
// ============================================================================

export const planStatusEnum = pgEnum("plan_status", [
  "activa",
  "por_vencer",
  "vencida",
  "cancelada",
]);

export const observationTypeEnum = pgEnum("observation_type", [
  "Nota",
  "Alerta",
  "Progreso",
]);

// ============================================================================
// TABLES
// ============================================================================

// Trainers (can be admin users or separate)
export const trainers = pgTable("trainers", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  specialty: varchar("specialty", { length: 255 }),
  avatar: varchar("avatar", { length: 10 }),
  email: varchar("email", { length: 255 }).unique(),
  gym_id: uuid("gym_id"),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Explicit and deterministic ownership bridge: authenticated admin user -> trainer profile.
export const adminUserTrainers = pgTable(
  "admin_user_trainers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    admin_user_id: uuid("admin_user_id")
      .notNull()
      .references(() => adminUsers.id, { onDelete: "cascade" }),
    trainer_id: uuid("trainer_id")
      .notNull()
      .references(() => trainers.id, { onDelete: "cascade" }),
    created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    adminUserUniqueIdx: uniqueIndex("admin_user_trainers_admin_user_id_uidx").on(table.admin_user_id),
    trainerUniqueIdx: uniqueIndex("admin_user_trainers_trainer_id_uidx").on(table.trainer_id),
    adminUserIdx: index("admin_user_trainers_admin_user_id_idx").on(table.admin_user_id),
    trainerIdx: index("admin_user_trainers_trainer_id_idx").on(table.trainer_id),
  })
);

// Plans
export const plans = pgTable("plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  duration_days: integer("duration_days").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  benefits: jsonb("benefits").$type<string[]>().notNull().default([]),
  featured: boolean("featured").notNull().default(false),
});

// Athletes (The main users of the mobile app)
export const athletes = pgTable("athletes", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password_hash: varchar("password_hash", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  avatar: varchar("avatar", { length: 10 }),
  plan_id: uuid("plan_id").references(() => plans.id),
  plan_status: planStatusEnum("plan_status").notNull().default("activa"),
  plan_expiry: timestamp("plan_expiry", { withTimezone: true }),
  trainer_id: uuid("trainer_id").notNull().references(() => trainers.id),
  weight_kg: decimal("weight_kg", { precision: 5, scale: 2 }),
  body_fat_pct: decimal("body_fat_pct", { precision: 4, scale: 2 }),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  emailIdx: index("athletes_email_idx").on(table.email),
  trainerIdx: index("athletes_trainer_id_idx").on(table.trainer_id),
  trainerCreatedIdx: index("athletes_trainer_created_idx").on(table.trainer_id, table.created_at),
}));

// Exercises (Library)
export const exercises = pgTable("exercises", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  muscle_group: varchar("muscle_group", { length: 100 }),
  description: text("description"),
  default_sets: integer("default_sets"),
  default_reps: varchar("default_reps", { length: 50 }),
  video_url: text("video_url"),
});

// Routines
export const routines = pgTable("routines", {
  id: uuid("id").primaryKey().defaultRandom(),
  athlete_id: uuid("athlete_id").notNull().references(() => athletes.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  day_of_week: integer("day_of_week").notNull(), // 1-7
  trainer_id: uuid("trainer_id").notNull().references(() => trainers.id),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  gym_id: uuid("gym_id"),
}, (table) => ({
  trainerAthleteDayIdx: index("routines_trainer_athlete_day_idx").on(
    table.trainer_id,
    table.athlete_id,
    table.day_of_week
  ),
}));

// Exercises in Routines
export const routineExercises = pgTable("routine_exercises", {
  id: uuid("id").primaryKey().defaultRandom(),
  routine_id: uuid("routine_id").notNull().references(() => routines.id, { onDelete: "cascade" }),
  exercise_id: uuid("exercise_id").notNull().references(() => exercises.id),
  name_override: varchar("name_override", { length: 255 }), // e.g. "Press banca inclinado"
  sets: integer("sets").notNull(),
  reps: varchar("reps", { length: 50 }).notNull(),
  weight_kg: varchar("weight_kg", { length: 100 }),
  rest_seconds: integer("rest_seconds"),
  notes: jsonb("notes").$type<string[]>().default([]),
  media_url: text("media_url"),
  media_type: varchar("media_type", { length: 20 }), // image, video
  order: integer("order").notNull().default(0),
  completed: boolean("completed").notNull().default(false),
});

// Measurements History
export const measurements = pgTable("measurements", {
  id: uuid("id").primaryKey().defaultRandom(),
  athlete_id: uuid("athlete_id").notNull().references(() => athletes.id, { onDelete: "cascade" }),
  date: timestamp("date", { withTimezone: true }).notNull().defaultNow(),
  weight_kg: decimal("weight_kg", { precision: 5, scale: 2 }).notNull(),
  body_fat_pct: decimal("body_fat_pct", { precision: 4, scale: 2 }),
  notes: text("notes"),
});

// Attendance
export const attendance = pgTable("attendance", {
  id: uuid("id").primaryKey().defaultRandom(),
  trainer_id: uuid("trainer_id").notNull().references(() => trainers.id),
  athlete_id: uuid("athlete_id").notNull().references(() => athletes.id, { onDelete: "cascade" }),
  date: timestamp("date", { withTimezone: true }).notNull().defaultNow(),
  time: varchar("time", { length: 10 }), // HH:mm
}, (table) => ({
  trainerDateIdx: index("attendance_trainer_date_idx").on(table.trainer_id, table.date),
  trainerAthleteDateIdx: index("attendance_trainer_athlete_date_idx").on(
    table.trainer_id,
    table.athlete_id,
    table.date
  ),
}));

// Observations/Notes from trainers
export const observations = pgTable("observations", {
  id: uuid("id").primaryKey().defaultRandom(),
  athlete_id: uuid("athlete_id").notNull().references(() => athletes.id, { onDelete: "cascade" }),
  trainer_id: uuid("trainer_id").notNull().references(() => trainers.id),
  type: observationTypeEnum("type").notNull().default("Nota"),
  content: text("content").notNull(),
  date: timestamp("date", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  trainerAthleteDateIdx: index("observations_trainer_athlete_date_idx").on(
    table.trainer_id,
    table.athlete_id,
    table.date
  ),
}));

// Password Reset Tokens
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  athlete_id: uuid("athlete_id").notNull().references(() => athletes.id, { onDelete: "cascade" }),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expires_at: timestamp("expires_at", { withTimezone: true }).notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  athleteIdx: index("password_reset_tokens_athlete_id_idx").on(table.athlete_id),
  tokenIdx: index("password_reset_tokens_token_idx").on(table.token),
}));

