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
  attendance,
  observations
} from "@workspace/db/schema";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";

async function seedGym() {
  console.log("🏋️ Comenzando seeder de GYM...\n");

  try {
    // 1. Planes
    console.log("💳 Creando planes...");
    const [p1, p2, p3] = await db.insert(plans).values([
      { name: "Mensual", duration_days: 30, price: "50.00", benefits: ["Acceso libre", "Rutina básica"] },
      { name: "Trimestral", duration_days: 90, price: "135.00", benefits: ["Acceso libre", "Rutina personalizada", "1 Medición mensual"], featured: true },
      { name: "Anual", duration_days: 365, price: "450.00", benefits: ["Acceso ilimitado", "Nutrición", "Seguimiento semanal"] },
    ]).returning();
    console.log("✅ Planes creados");

    // 2. Entrenadores
    console.log("👨‍🏫 Creando entrenadores...");
    const [t1, t2] = await db.insert(trainers).values([
      { name: "Roberto Entrenador", specialty: "Hipertrofia", avatar: "RE", email: "roberto@blockfit.local" },
      { name: "Laura Fit", specialty: "Crossfit", avatar: "LF", email: "laura@blockfit.local" },
    ]).returning();
    console.log("✅ Entrenadores creados");

    // 2.1 Vinculo explicito admin_user -> trainer
    const [admin] = await db
      .select({ id: adminUsers.id })
      .from(adminUsers)
      .where(eq(adminUsers.email, "admin@blockfit.local"))
      .limit(1);

    if (admin) {
      await db
        .insert(adminUserTrainers)
        .values({
          admin_user_id: admin.id,
          trainer_id: t1.id,
        })
        .onConflictDoNothing();
      console.log("✅ Vinculo admin_user -> trainer creado");
    }

    // 3. Atletas
    console.log("🏃 Creando atletas...");
    const hashedPassword = await bcrypt.hash("atleta123", 10);
    const [u1] = await db.insert(athletes).values([
      { 
        name: "Alejandro Cliente", 
        email: "alejandro@blockfit.local", 
        password_hash: hashedPassword, 
        avatar: "AC", 
        plan_id: p2.id, 
        trainer_id: t1.id,
        weight_kg: "78.00",
        body_fat_pct: "18.00",
        plan_expiry: new Date(Date.now() + 86400000 * 15)
      },
    ]).returning();
    console.log("✅ Atleta creado:", u1.email);

    // 4. Ejercicios
    console.log("💪 Creando ejercicios...");
    const [e1, e2, e3, e4] = await db.insert(exercises).values([
      { name: "Sentadilla Libre", muscle_group: "Piernas", default_sets: 4, default_reps: "10" },
      { name: "Press de Banca", muscle_group: "Pecho", default_sets: 4, default_reps: "10" },
      { name: "Peso Muerto", muscle_group: "Espalda", default_sets: 4, default_reps: "8" },
      { name: "Extension de Pierna", muscle_group: "Piernas", default_sets: 3, default_reps: "12" },
    ]).returning();
    console.log("✅ Ejercicios creados");

    // 5. Rutinas
    console.log("📋 Creando rutinas...");
    const [r1] = await db.insert(routines).values([
      { athlete_id: u1.id, name: "Lunes — Pecho + Tríceps", day_of_week: 1, trainer_id: t1.id },
    ]).returning();

    await db.insert(routineExercises).values([
      { 
        routine_id: r1.id, 
        exercise_id: e2.id, 
        name_override: "Press banca", 
        sets: 4, 
        reps: "8-10", 
        weight_kg: "70", 
        rest_seconds: 90, 
        order: 1, 
        completed: true,
        notes: ["Mantener retracción escapular", "Bajar controlado"],
        media_url: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=400&auto=format&fit=crop",
        media_type: "image"
      },
      { 
        routine_id: r1.id, 
        exercise_id: e4.id, 
        name_override: "EXTENSION DE PIERNA", 
        sets: 3, 
        reps: "12 + dropset de 8", 
        weight_kg: "32, 36, 41", 
        rest_seconds: 60, 
        order: 2, 
        completed: false,
        notes: ["Mantener 1 seg arriba", "Última parte sin descanso (bajar peso)"]
      },
    ]);
    console.log("✅ Rutinas creadas");

    // 6. Mediciones y Asistencia
    console.log("📊 Creando historial...");
    await db.insert(measurements).values([
      { athlete_id: u1.id, weight_kg: "80.00", body_fat_pct: "20.00", date: new Date(Date.now() - 86400000 * 30) },
      { athlete_id: u1.id, weight_kg: "78.00", body_fat_pct: "18.00", date: new Date() },
    ]);
    
    await db.insert(attendance).values([
      { trainer_id: t1.id, athlete_id: u1.id, date: new Date(), time: "08:00" },
      { trainer_id: t1.id, athlete_id: u1.id, date: new Date(Date.now() - 86400000), time: "09:00" },
    ]);
    console.log("✅ Historial creado");

    console.log("\n✨ Seeding de Gym completado!");
  } catch (error) {
    console.error("❌ Error durante seeding:", error);
    process.exit(1);
  }
}

seedGym().then(() => process.exit(0));
