import { db } from "@workspace/db";

import {
  adminUsers,
  adminUserTrainers,
  athletes,
  trainers,
  plans,
  exercises,
  routines,
  routineExercises,
  measurements,
  attendance
} from "@workspace/db/schema";

import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";

async function seedGym() {
  console.log("🏋️ Iniciando seeder Gym...\n");

  try {

    /*
      PLANES
    */

    console.log("💳 Verificando planes...");

    const existingPlans = await db
      .select()
      .from(plans);

    let p1;
    let p2;
    let p3;

    if (existingPlans.length === 0) {

      [p1, p2, p3] = await db
        .insert(plans)
        .values([
          {
            name: "Mensual",
            duration_days: 30,
            price: "50.00",
            benefits: [
              "Acceso libre",
              "Rutina básica"
            ]
          },

          {
            name: "Trimestral",
            duration_days: 90,
            price: "135.00",
            featured: true,
            benefits: [
              "Acceso libre",
              "Rutina personalizada",
              "Medición mensual"
            ]
          },

          {
            name: "Anual",
            duration_days: 365,
            price: "450.00",
            benefits: [
              "Acceso ilimitado",
              "Nutrición",
              "Seguimiento semanal"
            ]
          }
        ])
        .returning();

      console.log("✅ Planes creados");

    } else {

      [p1, p2, p3] = existingPlans;

      console.log("ℹ️ Planes existentes");
    }

    /*
      TRAINERS
    */

    console.log("\n👨‍🏫 Buscando entrenadores...");

    let trainer =
      (
        await db
        .select()
        .from(trainers)
        .where(
          eq(
            trainers.email,
            "roberto@blockfit.local"
          )
        )
        .limit(1)
      )[0];

    if (!trainer) {

      [trainer] = await db
        .insert(trainers)
        .values([
          {
            name: "Roberto Entrenador",
            specialty: "Hipertrofia",
            avatar: "RE",
            email: "roberto@blockfit.local"
          }
        ])
        .returning();

      console.log(
        "✅ Trainer creado"
      );

    } else {

      console.log(
        "ℹ️ Trainer existente"
      );
    }

    /*
      ADMIN
    */

    console.log(
      "\n👤 Buscando admin..."
    );

    const admin =
      (
        await db
        .select({
          id: adminUsers.id
        })
        .from(adminUsers)
        .where(
          eq(
            adminUsers.email,
            "admin@blockfit.local"
          )
        )
        .limit(1)
      )[0];

    console.log(
      "ADMIN:",
      admin
    );

    console.log(
      "TRAINER:",
      trainer.id
    );

    /*
      LINK ADMIN -> TRAINER
    */

    if (
      admin &&
      trainer
    ) {

      await db
        .insert(
          adminUserTrainers
        )
        .values({
          admin_user_id:
            admin.id,

          trainer_id:
            trainer.id
        })
        .onConflictDoNothing();

      console.log(
        "✅ ADMIN LINKED"
      );
    }

    /*
      ATHLETE
    */

    console.log(
      "\n🏃 Verificando atleta..."
    );

    let athlete =
      (
        await db
        .select()
        .from(athletes)
        .where(
          eq(
            athletes.email,
            "alejandro@blockfit.local"
          )
        )
        .limit(1)
      )[0];

    if (!athlete) {

      const hash =
        await bcrypt.hash(
          "atleta123",
          10
        );

      [athlete] =
        await db
        .insert(
          athletes
        )
        .values([
          {
            name:
              "Alejandro Cliente",

            email:
              "alejandro@blockfit.local",

            password_hash:
              hash,

            avatar:
              "AC",

            trainer_id:
              trainer.id,

            plan_id:
              p2.id,

            weight_kg:
              "78.00",

            body_fat_pct:
              "18.00",

            plan_status:
              "active",

            plan_expiry:
              new Date(
                Date.now() +
                15 *
                86400000
              )
          }
        ])
        .returning();

      console.log(
        "✅ Atleta creado"
      );

    } else {

      console.log(
        "ℹ️ Atleta existente"
      );
    }

    /*
      EJERCICIOS
    */

    console.log(
      "\n💪 Verificando ejercicios..."
    );

    const existingExercises =
      await db
      .select()
      .from(exercises);

    if (
      existingExercises.length === 0
    ) {

      await db
      .insert(exercises)
      .values([
        {
          name:
            "Press banca",

          muscle_group:
            "Pecho",

          default_sets:
            4,

          default_reps:
            "10"
        },

        {
          name:
            "Extensión de pierna",

          muscle_group:
            "Piernas",

          default_sets:
            3,

          default_reps:
            "12"
        }
      ]);

      console.log(
        "✅ Ejercicios creados"
      );
    }

    /*
      RUTINA
    */

    const routine =
      (
        await db
        .select()
        .from(routines)
        .where(
          eq(
            routines.athlete_id,
            athlete.id
          )
        )
        .limit(1)
      )[0];

    if (!routine) {

      await db
      .insert(routines)
      .values([
        {
          athlete_id:
            athlete.id,

          trainer_id:
            trainer.id,

          name:
            "Lunes — Pecho + Tríceps",

          day_of_week:
            1
        }
      ]);

      console.log(
        "✅ Rutina creada"
      );
    }

    /*
      HISTORIAL
    */

    await db
      .insert(
        measurements
      )
      .values([
        {
          athlete_id:
            athlete.id,

          weight_kg:
            "78",

          body_fat_pct:
            "18",

          date:
            new Date()
        }
      ])
      .onConflictDoNothing();

    await db
      .insert(
        attendance
      )
      .values([
        {
          athlete_id:
            athlete.id,

          trainer_id:
            trainer.id,

          date:
            new Date(),

          time:
            "08:00"
        }
      ])
      .onConflictDoNothing();

    console.log(
      "\n🎉 Seeder terminado"
    );

  }

  catch (err) {

    console.error(
      err
    );

    process.exit(1);

  }

}

seedGym()
.then(
  () =>
  process.exit(0)
);