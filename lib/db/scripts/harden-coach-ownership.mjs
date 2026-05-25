import pg from "pg";

const { Client } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  try {
    await client.query("BEGIN");

    // Pre-migration safety: ensure required structures exist before enforcing NOT NULL via drizzle push.
    await client.query("CREATE EXTENSION IF NOT EXISTS pgcrypto;");

    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_user_trainers (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        admin_user_id uuid NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
        trainer_id uuid NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
        created_at timestamptz NOT NULL DEFAULT now(),
        UNIQUE (admin_user_id),
        UNIQUE (trainer_id)
      );
    `);

    await client.query(`
      ALTER TABLE athletes
      ADD COLUMN IF NOT EXISTS trainer_id uuid;
    `);

    await client.query(`
      ALTER TABLE routines
      ADD COLUMN IF NOT EXISTS trainer_id uuid;
    `);

    await client.query(`
      ALTER TABLE attendance
      ADD COLUMN IF NOT EXISTS trainer_id uuid;
    `);

    // Ensure explicit admin_user -> trainer ownership mapping exists.
    await client.query(`
      INSERT INTO admin_user_trainers (admin_user_id, trainer_id)
      SELECT au.id, t.id
      FROM admin_users au
      JOIN trainers t ON lower(t.email) = lower(au.email)
      WHERE NOT EXISTS (
        SELECT 1 FROM admin_user_trainers aut WHERE aut.admin_user_id = au.id
      )
      ON CONFLICT DO NOTHING;
    `);

    // Deterministic fallback: map unmapped admins to synthetic trainer identities.
    await client.query(`
      INSERT INTO trainers (name, email, specialty, avatar)
      SELECT
        coalesce(au.name, 'Coach') AS name,
        concat('coach+', au.id::text, '@internal.local') AS email,
        'Coach' AS specialty,
        substring(coalesce(au.name, 'CO') from 1 for 2) AS avatar
      FROM admin_users au
      LEFT JOIN admin_user_trainers aut ON aut.admin_user_id = au.id
      WHERE aut.id IS NULL
      ON CONFLICT (email) DO NOTHING;
    `);

    await client.query(`
      INSERT INTO admin_user_trainers (admin_user_id, trainer_id)
      SELECT au.id, t.id
      FROM admin_users au
      JOIN trainers t ON t.email = concat('coach+', au.id::text, '@internal.local')
      LEFT JOIN admin_user_trainers aut ON aut.admin_user_id = au.id
      WHERE aut.id IS NULL
      ON CONFLICT DO NOTHING;
    `);

    // Ensure there is at least one trainer for dataset fallback paths.
    await client.query(`
      INSERT INTO trainers (name, email, specialty, avatar)
      SELECT 'Default Coach', 'default.coach@internal.local', 'Coach', 'DC'
      WHERE NOT EXISTS (SELECT 1 FROM trainers)
      ON CONFLICT (email) DO NOTHING;
    `);

    // Backfill athletes without trainer using deterministic ownership from first available trainer.
    await client.query(`
      WITH fallback_trainer AS (
        SELECT id FROM trainers ORDER BY created_at ASC LIMIT 1
      )
      UPDATE athletes a
      SET trainer_id = (SELECT id FROM fallback_trainer)
      WHERE a.trainer_id IS NULL;
    `);

    // Backfill routines without trainer from owning athlete.
    await client.query(`
      UPDATE routines r
      SET trainer_id = a.trainer_id
      FROM athletes a
      WHERE r.athlete_id = a.id AND r.trainer_id IS NULL;
    `);

    // Backfill attendance trainer ownership from athlete.
    await client.query(`
      UPDATE attendance att
      SET trainer_id = a.trainer_id
      FROM athletes a
      WHERE att.athlete_id = a.id AND att.trainer_id IS NULL;
    `);

    // Add foreign keys if they are not present yet.
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_constraint
          WHERE conname = 'athletes_trainer_id_trainers_id_fk'
        ) THEN
          ALTER TABLE athletes
            ADD CONSTRAINT athletes_trainer_id_trainers_id_fk
            FOREIGN KEY (trainer_id) REFERENCES trainers(id);
        END IF;

        IF NOT EXISTS (
          SELECT 1
          FROM pg_constraint
          WHERE conname = 'routines_trainer_id_trainers_id_fk'
        ) THEN
          ALTER TABLE routines
            ADD CONSTRAINT routines_trainer_id_trainers_id_fk
            FOREIGN KEY (trainer_id) REFERENCES trainers(id);
        END IF;

        IF NOT EXISTS (
          SELECT 1
          FROM pg_constraint
          WHERE conname = 'attendance_trainer_id_trainers_id_fk'
        ) THEN
          ALTER TABLE attendance
            ADD CONSTRAINT attendance_trainer_id_trainers_id_fk
            FOREIGN KEY (trainer_id) REFERENCES trainers(id);
        END IF;
      END
      $$;
    `);

    // Integrity checks before commit.
    const checks = [
      ["athletes_without_trainer", "SELECT count(*)::int AS c FROM athletes WHERE trainer_id IS NULL"],
      ["routines_without_trainer", "SELECT count(*)::int AS c FROM routines WHERE trainer_id IS NULL"],
      ["attendance_without_trainer", "SELECT count(*)::int AS c FROM attendance WHERE trainer_id IS NULL"],
      ["admin_users_without_trainer_map", "SELECT count(*)::int AS c FROM admin_users au LEFT JOIN admin_user_trainers aut ON aut.admin_user_id = au.id WHERE aut.id IS NULL"],
    ];

    for (const [label, sql] of checks) {
      const result = await client.query(sql);
      const count = result.rows[0]?.c ?? 0;
      if (count > 0) {
        throw new Error(`${label}=${count}`);
      }
    }

    await client.query("COMMIT");
    console.log("Coach ownership hardening completed successfully.");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error("Coach ownership hardening failed:", error);
  process.exit(1);
});
