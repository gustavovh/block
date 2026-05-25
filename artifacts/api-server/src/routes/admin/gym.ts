import { Router, type Request, type Response } from "express";
import fs from "fs";
import path from "path";
import { db } from "@workspace/db";
import {
  athletes,
  measurements,
  routines,
  routineExercises,
  exercises,
  attendance,
  observations,
} from "@workspace/db/schema";
import { and, desc, eq, inArray } from "drizzle-orm";
import { authenticateAdmin, requirePermission } from "../../middlewares/auth.js";
import {
  requireCoachAthleteOr404,
  requireCoachTrainerOr403,
} from "../../lib/coach-scope.js";
import bcrypt from "bcrypt";
import { getIO } from "../../lib/socket.js";

export async function createAdminGymRoutes(router: Router) {
  // COACH OPERATIONS DASHBOARD
  router.get(
    "/admin/gym/coach/dashboard",
    authenticateAdmin,
    requirePermission("view_users"),
    async (req: Request, res: Response) => {
      try {
        const trainerId = await requireCoachTrainerOr403(req, res);
        if (!trainerId) return;

        const roster = await db
          .select({
            id: athletes.id,
            name: athletes.name,
            email: athletes.email,
            plan_status: athletes.plan_status,
            updated_at: athletes.updated_at,
          })
          .from(athletes)
          .where(eq(athletes.trainer_id, trainerId))
          .orderBy(desc(athletes.updated_at));

        const athleteIds = roster.map((item) => item.id);
        const now = new Date();
        const startToday = new Date(now);
        startToday.setHours(0, 0, 0, 0);
        const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

        const attendanceRows = athleteIds.length
          ? await db
              .select({
                athlete_id: attendance.athlete_id,
                date: attendance.date,
              })
              .from(attendance)
              .where(
                and(
                  eq(attendance.trainer_id, trainerId),
                  inArray(attendance.athlete_id, athleteIds)
                )
              )
              .orderBy(desc(attendance.date))
          : [];

        const attendanceByAthlete = new Map<string, Date[]>();
        for (const row of attendanceRows) {
          const bucket = attendanceByAthlete.get(row.athlete_id) ?? [];
          bucket.push(new Date(row.date));
          attendanceByAthlete.set(row.athlete_id, bucket);
        }

        const activeToday = roster.filter((athlete) => {
          const dates = attendanceByAthlete.get(athlete.id) ?? [];
          return dates.some((date) => date >= startToday);
        });

        const inactiveThreeDays = roster.filter((athlete) => {
          const dates = attendanceByAthlete.get(athlete.id) ?? [];
          const last = dates[0];
          return !last || last < threeDaysAgo;
        });

        const adherenceDrop = roster
          .map((athlete) => {
            const dates = attendanceByAthlete.get(athlete.id) ?? [];
            const currentWeek = dates.filter((date) => date >= sevenDaysAgo).length;
            const previousWeek = dates.filter(
              (date) => date >= fourteenDaysAgo && date < sevenDaysAgo
            ).length;
            const hasDrop = previousWeek >= 2 && currentWeek <= Math.floor(previousWeek * 0.7);

            return {
              athlete_id: athlete.id,
              athlete_name: athlete.name,
              current_week_sessions: currentWeek,
              previous_week_sessions: previousWeek,
              has_drop: hasDrop,
            };
          })
          .filter((item) => item.has_drop);

        const recentSessions = athleteIds.length
          ? await db
              .select({
                id: attendance.id,
                athlete_id: attendance.athlete_id,
                athlete_name: athletes.name,
                date: attendance.date,
                time: attendance.time,
              })
              .from(attendance)
              .innerJoin(athletes, eq(attendance.athlete_id, athletes.id))
              .where(eq(athletes.trainer_id, trainerId))
              .orderBy(desc(attendance.date))
              .limit(20)
          : [];

        const recentFeedbacks = await db
          .select({
            id: observations.id,
            athlete_id: observations.athlete_id,
            athlete_name: athletes.name,
            type: observations.type,
            content: observations.content,
            date: observations.date,
          })
          .from(observations)
          .innerJoin(athletes, eq(observations.athlete_id, athletes.id))
          .where(eq(observations.trainer_id, trainerId))
          .orderBy(desc(observations.date))
          .limit(20);

        const attentionAthletes = roster
          .filter((athlete) => {
            const isInactive = inactiveThreeDays.some((item) => item.id === athlete.id);
            const isDropping = adherenceDrop.some((item) => item.athlete_id === athlete.id);
            return isInactive || isDropping;
          })
          .map((athlete) => ({
            id: athlete.id,
            name: athlete.name,
            reason: inactiveThreeDays.some((item) => item.id === athlete.id)
              ? "Sin entrenar hace 3+ dias"
              : "Caida de adherencia semanal",
          }));

        return res.json({
          success: true,
          data: {
            totals: {
              roster: roster.length,
              active_today: activeToday.length,
              inactive_3d: inactiveThreeDays.length,
              adherence_drop: adherenceDrop.length,
              attention_required: attentionAthletes.length,
            },
            active_today: activeToday,
            inactive_3d: inactiveThreeDays,
            adherence_drop: adherenceDrop,
            attention_required: attentionAthletes,
            recent_sessions: recentSessions,
            recent_feedbacks: recentFeedbacks,
          },
          timestamp: new Date(),
        });
      } catch (error) {
        console.error("Failed to fetch coach dashboard:", error);
        return res.status(500).json({ success: false, error: "Internal server error" });
      }
    }
  );

  // ATHLETES
  // List all athletes
  router.get(
    "/admin/gym/athletes",
    authenticateAdmin,
    requirePermission("view_users"), // Using existing permission for now
    async (req: Request, res: Response) => {
      try {
        const trainerId = await requireCoachTrainerOr403(req, res);
        if (!trainerId) return;

        const data = await db
          .select({
            id: athletes.id,
            email: athletes.email,
            name: athletes.name,
            trainer_id: athletes.trainer_id,
            plan_status: athletes.plan_status,
            plan_expiry: athletes.plan_expiry,
            weight_kg: athletes.weight_kg,
            body_fat_pct: athletes.body_fat_pct,
            created_at: athletes.created_at,
          })
          .from(athletes)
          .where(eq(athletes.trainer_id, trainerId))
          .orderBy(desc(athletes.created_at));

        res.json({
          success: true,
          data,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error("Failed to fetch athletes:", error);
        res.status(500).json({ success: false, error: "Internal server error" });
      }
    }
  );

  // Get single athlete details
  router.get(
    "/admin/gym/athletes/:id",
    authenticateAdmin,
    requirePermission("view_users"),
    async (req: Request, res: Response) => {
      try {
        const trainerId = await requireCoachTrainerOr403(req, res);
        if (!trainerId) return;

        const { id } = req.params;
        const [athlete] = await db
          .select()
          .from(athletes)
          .where(and(eq(athletes.id, id), eq(athletes.trainer_id, trainerId)));

        if (!athlete) {
          return res.status(404).json({ success: false, error: "Athlete not found" });
        }

        // Get latest measurements
        const recentMeasurements = await db
          .select()
          .from(measurements)
          .where(eq(measurements.athlete_id, id))
          .orderBy(desc(measurements.date))
          .limit(10);

        res.json({
          success: true,
          data: {
            ...athlete,
            measurements: recentMeasurements,
          },
          timestamp: new Date(),
        });
      } catch (error) {
        console.error("Failed to fetch athlete details:", error);
        res.status(500).json({ success: false, error: "Internal server error" });
      }
    }
  );

  // Create new athlete
  router.post(
    "/admin/gym/athletes",
    authenticateAdmin,
    requirePermission("create_user"),
    async (req: Request, res: Response) => {
      try {
        const trainerId = await requireCoachTrainerOr403(req, res);
        if (!trainerId) return;

        const { email, password, name, plan_id } = req.body;

        if (!email || !password || !name) {
          return res.status(400).json({ success: false, error: "Missing required fields" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [newAthlete] = await db
          .insert(athletes)
          .values({
            email,
            password_hash: hashedPassword,
            name,
            plan_id,
            trainer_id: trainerId,
            plan_status: "activa",
          })
          .returning();

        getIO().emit("athlete_created", newAthlete);

        res.status(201).json({
          success: true,
          data: newAthlete,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error("Failed to create athlete:", error);
        if (
          typeof error === "object" &&
          error !== null &&
          "cause" in error
        ) {
          const cause = (error as { cause?: { code?: string; detail?: string } }).cause;
          if (cause?.code === "23505") {
            return res.status(409).json({
              success: false,
              error: "Email already exists",
            });
          }
        }

        res.status(500).json({ success: false, error: "Internal server error" });
      }
    }
  );

  // MEASUREMENTS
  // Add measurement for athlete
  router.post(
    "/admin/gym/athletes/:id/measurements",
    authenticateAdmin,
    requirePermission("edit_user"),
    async (req: Request, res: Response) => {
      try {
        const trainerId = await requireCoachTrainerOr403(req, res);
        if (!trainerId) return;

        const { id } = req.params;
        const { weight_kg, body_fat_pct, notes } = req.body;

        if (!weight_kg) {
          return res.status(400).json({ success: false, error: "El peso es obligatorio" });
        }

        const weight = parseFloat(weight_kg);
        if (isNaN(weight) || weight <= 0 || weight > 500) {
          return res.status(400).json({ success: false, error: "El peso no es válido" });
        }

        let bf: string | null = null;
        if (body_fat_pct !== undefined && body_fat_pct !== null && body_fat_pct !== "") {
          const bfFloat = parseFloat(body_fat_pct);
          if (isNaN(bfFloat) || bfFloat < 0 || bfFloat > 99.99) {
            return res.status(400).json({ success: false, error: "El porcentaje de grasa debe estar entre 0 y 99.99" });
          }
          bf = bfFloat.toString();
        }

        if (!(await requireCoachAthleteOr404(id, trainerId, res))) return;

        const [newMeasurement] = await db
          .insert(measurements)
          .values({
            athlete_id: id,
            weight_kg: weight.toString(),
            body_fat_pct: bf,
            notes,
          })
          .returning();

        // Update athlete current state
        await db
          .update(athletes)
          .set({
            weight_kg: weight.toString(),
            body_fat_pct: bf,
            updated_at: new Date(),
          })
          .where(eq(athletes.id, id));

        getIO().emit(`athlete_update_${id}`, { type: "measurement", data: newMeasurement });

        res.status(201).json({
          success: true,
          data: newMeasurement,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error("Failed to add measurement:", error);
        res.status(500).json({ success: false, error: "Internal server error" });
      }
    }
  );

  // ROUTINES
  // Get routines for athlete
  router.get(
    "/admin/gym/athletes/:id/routines",
    authenticateAdmin,
    requirePermission("view_users"),
    async (req: Request, res: Response) => {
      try {
        const trainerId = await requireCoachTrainerOr403(req, res);
        if (!trainerId) return;

        const { id } = req.params;

        if (!(await requireCoachAthleteOr404(id, trainerId, res))) return;

        const athleteRoutines = await db
          .select()
          .from(routines)
          .where(and(eq(routines.athlete_id, id), eq(routines.trainer_id, trainerId)))
          .orderBy(routines.day_of_week);

        // Fetch exercises for each routine
        const detailedRoutines = await Promise.all(
          athleteRoutines.map(async (r) => {
            const exercisesInRoutine = await db
              .select({
                id: routineExercises.id,
                exercise_id: routineExercises.exercise_id,
                name: exercises.name,
                muscle_group: exercises.muscle_group,
                sets: routineExercises.sets,
                reps: routineExercises.reps,
                weight_kg: routineExercises.weight_kg,
                completed: routineExercises.completed,
                order: routineExercises.order,
              })
              .from(routineExercises)
              .leftJoin(exercises, eq(routineExercises.exercise_id, exercises.id))
              .where(eq(routineExercises.routine_id, r.id))
              .orderBy(routineExercises.order);

            return { ...r, exercises: exercisesInRoutine };
          })
        );

        res.json({
          success: true,
          data: detailedRoutines,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error("Failed to fetch routines:", error);
        res.status(500).json({ success: false, error: "Internal server error" });
      }
    }
  );

  // Assign routine to athlete
  router.post(
    "/admin/gym/athletes/:id/routines",
    authenticateAdmin,
    requirePermission("edit_user"),
    async (req: Request, res: Response) => {
      try {
        const trainerId = await requireCoachTrainerOr403(req, res);
        if (!trainerId) return;

        const { id } = req.params;
        const { name, day_of_week, exercises: routineItems } = req.body;

        if (!name || day_of_week === undefined || !Array.isArray(routineItems) || routineItems.length === 0) {
          return res.status(400).json({
            success: false,
            error: "name, day_of_week and at least one exercise are required",
          });
        }

        const day = Number(day_of_week);
        if (Number.isNaN(day) || day < 1 || day > 7) {
          return res.status(400).json({
            success: false,
            error: "day_of_week must be between 1 and 7",
          });
        }

        const [athlete] = await db
          .select({ id: athletes.id })
          .from(athletes)
          .where(and(eq(athletes.id, id), eq(athletes.trainer_id, trainerId)));

        if (!athlete) {
          return res.status(404).json({
            success: false,
            error: "Athlete not found",
          });
        }

        const [newRoutine] = await db
          .insert(routines)
          .values({
            athlete_id: id,
            trainer_id: trainerId,
            name,
            day_of_week: day,
          })
          .returning();

        const mappedExercises = routineItems.map((item: any, index: number) => ({
          routine_id: newRoutine.id,
          exercise_id: item.exercise_id,
          sets: Number(item.sets) || 3,
          reps: String(item.reps || "12"),
          weight_kg: item.weight_kg ? String(item.weight_kg) : null,
          rest_seconds: item.rest_seconds ? Number(item.rest_seconds) : null,
          order: item.order !== undefined ? Number(item.order) : index,
          name_override: item.name_override || null,
        }));

        const createdExercises = await db
          .insert(routineExercises)
          .values(mappedExercises)
          .returning();

        getIO().emit(`athlete_update_${id}`, { type: "routine", data: newRoutine });

        res.status(201).json({
          success: true,
          data: {
            ...newRoutine,
            exercises: createdExercises,
          },
          timestamp: new Date(),
        });
      } catch (error) {
        console.error("Failed to assign routine:", error);
        res.status(500).json({ success: false, error: "Internal server error" });
      }
    }
  );

  // Update a routine
  router.put(
    "/admin/gym/athletes/:id/routines/:routineId",
    authenticateAdmin,
    requirePermission("edit_user"),
    async (req: Request, res: Response) => {
      try {
        const trainerId = await requireCoachTrainerOr403(req, res);
        if (!trainerId) return;

        const { id, routineId } = req.params;
        const { name, day_of_week, exercises: routineItems } = req.body;

        if (!name || day_of_week === undefined || !Array.isArray(routineItems)) {
          return res.status(400).json({
            success: false,
            error: "name, day_of_week and exercises list are required",
          });
        }

        const day = Number(day_of_week);
        if (Number.isNaN(day) || day < 1 || day > 7) {
          return res.status(400).json({
            success: false,
            error: "day_of_week must be between 1 and 7",
          });
        }

        if (!(await requireCoachAthleteOr404(id, trainerId, res))) return;

        // Check if the routine exists and belongs to this athlete
        const [existingRoutine] = await db
          .select()
          .from(routines)
          .where(and(
            eq(routines.id, routineId),
            eq(routines.athlete_id, id),
            eq(routines.trainer_id, trainerId)
          ));

        if (!existingRoutine) {
          return res.status(404).json({
            success: false,
            error: "Routine not found",
          });
        }

        // Update the routine metadata
        const [updatedRoutine] = await db
          .update(routines)
          .set({
            name,
            day_of_week: day,
          })
          .where(eq(routines.id, routineId))
          .returning();

        // Delete existing exercises associated with the routine
        await db
          .delete(routineExercises)
          .where(eq(routineExercises.routine_id, routineId));

        // Insert updated exercises
        let createdExercises: any[] = [];
        if (routineItems.length > 0) {
          const mappedExercises = routineItems.map((item: any, index: number) => ({
            routine_id: routineId,
            exercise_id: item.exercise_id,
            sets: Number(item.sets) || 3,
            reps: String(item.reps || "12"),
            weight_kg: item.weight_kg ? String(item.weight_kg) : null,
            rest_seconds: item.rest_seconds ? Number(item.rest_seconds) : null,
            order: item.order !== undefined ? Number(item.order) : index,
            name_override: item.name_override || null,
          }));

          createdExercises = await db
            .insert(routineExercises)
            .values(mappedExercises)
            .returning();
        }

        getIO().emit(`athlete_update_${id}`, { type: "routine", data: updatedRoutine });

        res.json({
          success: true,
          data: {
            ...updatedRoutine,
            exercises: createdExercises,
          },
          timestamp: new Date(),
        });
      } catch (error) {
        console.error("Failed to update routine:", error);
        res.status(500).json({ success: false, error: "Internal server error" });
      }
    }
  );

  // Delete a routine
  router.delete(
    "/admin/gym/athletes/:id/routines/:routineId",
    authenticateAdmin,
    requirePermission("edit_user"),
    async (req: Request, res: Response) => {
      try {
        const trainerId = await requireCoachTrainerOr403(req, res);
        if (!trainerId) return;

        const { id, routineId } = req.params;

        if (!(await requireCoachAthleteOr404(id, trainerId, res))) return;

        const [deletedRoutine] = await db
          .delete(routines)
          .where(and(
            eq(routines.id, routineId),
            eq(routines.athlete_id, id),
            eq(routines.trainer_id, trainerId)
          ))
          .returning();

        if (!deletedRoutine) {
          return res.status(404).json({
            success: false,
            error: "Routine not found",
          });
        }

        getIO().emit(`athlete_update_${id}`, { type: "routine_delete", data: { id: routineId } });

        res.json({
          success: true,
          message: "Routine deleted successfully",
          timestamp: new Date(),
        });
      } catch (error) {
        console.error("Failed to delete routine:", error);
        res.status(500).json({ success: false, error: "Internal server error" });
      }
    }
  );


  // OBSERVATIONS / FEEDBACK
  router.get(
    "/admin/gym/athletes/:id/observations",
    authenticateAdmin,
    requirePermission("view_users"),
    async (req: Request, res: Response) => {
      try {
        const trainerId = await requireCoachTrainerOr403(req, res);
        if (!trainerId) return;

        const { id } = req.params;
        if (!(await requireCoachAthleteOr404(id, trainerId, res))) return;

        const rows = await db
          .select()
          .from(observations)
          .where(and(eq(observations.athlete_id, id), eq(observations.trainer_id, trainerId)))
          .orderBy(desc(observations.date))
          .limit(100);

        return res.json({ success: true, data: rows, timestamp: new Date() });
      } catch (error) {
        console.error("Failed to fetch observations:", error);
        return res.status(500).json({ success: false, error: "Internal server error" });
      }
    }
  );

  router.post(
    "/admin/gym/athletes/:id/observations",
    authenticateAdmin,
    requirePermission("edit_user"),
    async (req: Request, res: Response) => {
      try {
        const trainerId = await requireCoachTrainerOr403(req, res);
        if (!trainerId) return;

        const { id } = req.params;
        const { type = "Nota", content } = req.body;

        if (!content || typeof content !== "string") {
          return res.status(400).json({ success: false, error: "content is required" });
        }

        if (!(await requireCoachAthleteOr404(id, trainerId, res))) return;

        const [created] = await db
          .insert(observations)
          .values({
            athlete_id: id,
            trainer_id: trainerId,
            type,
            content: content.trim(),
          })
          .returning();

        getIO().emit(`athlete_update_${id}`, { type: "observation", data: created });

        return res.status(201).json({
          success: true,
          data: {
            observation: created,
            notification: {
              title: "Tu entrenador dejo una observacion",
              message: content.trim(),
              type,
            },
          },
          timestamp: new Date(),
        });
      } catch (error) {
        console.error("Failed to create observation:", error);
        return res.status(500).json({ success: false, error: "Internal server error" });
      }
    }
  );

  // EXERCISES
  // Upload an exercise media file (image/gif)
  router.post(
    "/admin/gym/upload",
    authenticateAdmin,
    async (req: Request, res: Response) => {
      try {
        const { filename, file } = req.body;
        if (!filename || !file) {
          return res.status(400).json({ success: false, error: "filename and base64 file are required" });
        }

        // Check if uploads folder exists, if not, create it
        const uploadsDir = path.join(process.cwd(), "uploads");
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }

        // Clean up base64 header if present
        const base64Data = file.replace(/^data:image\/\w+;base64,/, "").replace(/^data:video\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, "base64");

        // Generate unique filename to avoid collision
        const ext = path.extname(filename) || ".png";
        const base = path.basename(filename, ext).replace(/[^a-zA-Z0-9]/g, "-");
        const uniqueFilename = `${base}-${Date.now()}${ext}`;
        const filePath = path.join(uploadsDir, uniqueFilename);

        // Write file
        fs.writeFileSync(filePath, buffer);

        // Get base server URL
        const protocol = req.headers["x-forwarded-proto"] || req.protocol;
        const host = req.get("host");
        const fileUrl = `${protocol}://${host}/uploads/${uniqueFilename}`;

        return res.status(201).json({
          success: true,
          url: fileUrl,
        });
      } catch (error) {
        console.error("Failed to upload file:", error);
        return res.status(500).json({ success: false, error: "Internal server error" });
      }
    }
  );

  // List all available exercises
  router.get(
    "/admin/gym/exercises",
    authenticateAdmin,
    async (req: Request, res: Response) => {
      try {
        const data = await db.select().from(exercises);
        res.json({ success: true, data, timestamp: new Date() });
      } catch (error) {
        console.error("Failed to fetch exercises:", error);
        res.status(500).json({ success: false, error: "Internal server error" });
      }
    }
  );

  // Create a new exercise
  router.post(
    "/admin/gym/exercises",
    authenticateAdmin,
    async (req: Request, res: Response) => {
      try {
        const { name, muscle_group, description, video_url } = req.body;
        if (!name) {
          return res.status(400).json({ success: false, error: "El nombre es requerido" });
        }

        const [newExercise] = await db
          .insert(exercises)
          .values({
            name,
            muscle_group,
            description,
            video_url,
          })
          .returning();

        return res.status(201).json({ success: true, data: newExercise, timestamp: new Date() });
      } catch (error) {
        console.error("Failed to create exercise:", error);
        return res.status(500).json({ success: false, error: "Internal server error" });
      }
    }
  );

  // Update an existing exercise
  router.put(
    "/admin/gym/exercises/:id",
    authenticateAdmin,
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const { name, muscle_group, description, video_url } = req.body;
        
        if (!name) {
          return res.status(400).json({ success: false, error: "El nombre es requerido" });
        }

        const [updatedExercise] = await db
          .update(exercises)
          .set({
            name,
            muscle_group,
            description,
            video_url,
          })
          .where(eq(exercises.id, id))
          .returning();

        if (!updatedExercise) {
          return res.status(404).json({ success: false, error: "Ejercicio no encontrado" });
        }

        return res.json({ success: true, data: updatedExercise, timestamp: new Date() });
      } catch (error) {
        console.error("Failed to update exercise:", error);
        return res.status(500).json({ success: false, error: "Internal server error" });
      }
    }
  );

  // Delete an exercise
  router.delete(
    "/admin/gym/exercises/:id",
    authenticateAdmin,
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        
        await db.delete(exercises).where(eq(exercises.id, id));
        return res.json({ success: true, message: "Exercise deleted successfully", timestamp: new Date() });
      } catch (error) {
        console.error("Failed to delete exercise:", error);
        return res.status(500).json({ success: false, error: "Internal server error" });
      }
    }
  );
}
