import type { Request, Response, Router } from "express";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@workspace/db";
import {
  athletes,
  measurements,
  observations,
  routines,
  routineExercises,
  trainers,
} from "@workspace/db/schema";
import { jwtSign, jwtSignRefreshToken } from "../../middlewares/jwt.js";
import { authenticateAthlete } from "../../middlewares/auth.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { passwordResetTokens } from "@workspace/db/schema";

export async function createAthleteRoutes(router: Router) {
  // Athlete Login
  router.post("/atleta/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: "Email and password are required",
        });
      }

      const [athlete] = await db
        .select()
        .from(athletes)
        .where(eq(athletes.email, email));

      if (!athlete) {
        return res.status(401).json({
          success: false,
          error: "Invalid credentials",
        });
      }

      const isValid = await bcrypt.compare(password, athlete.password_hash);

      if (!isValid) {
        return res.status(401).json({
          success: false,
          error: "Invalid credentials",
        });
      }

      // Crear tokens
      const accessToken = jwtSign({
        sub: athlete.id,
        email: athlete.email,
        role: "athlete",
        permissions: ["athlete:read", "athlete:write"],
      });

      const refreshToken = jwtSignRefreshToken();

      res.json({
        success: true,
        data: {
          access_token: accessToken,
          refresh_token: refreshToken,
          user: {
            id: athlete.id,
            email: athlete.email,
            name: athlete.name,
            role: "athlete",
            avatar: athlete.avatar,
          },
        },
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Athlete login error:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  });

  // Forgot Password
  router.post("/atleta/auth/forgot-password", async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ success: false, error: "El email es requerido" });
      }

      const [athlete] = await db.select().from(athletes).where(eq(athletes.email, email));
      if (!athlete) {
        // Obfuscate si existe o no por seguridad, pero devolvemos success
        return res.json({ success: true, message: "Si el correo existe, enviaremos un enlace." });
      }

      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 3600000); // 1 hora

      await db.insert(passwordResetTokens).values({
        athlete_id: athlete.id,
        token,
        expires_at: expiresAt,
      });

      console.log(`\n==============================================`);
      console.log(`[PASSWORD RECOVERY LINK GENERATED]`);
      console.log(`Email: ${email}`);
      console.log(`Token: ${token}`);
      console.log(`==============================================\n`);

      res.json({
        success: true,
        message: "Si el correo existe, enviaremos un enlace.",
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ success: false, error: "Error interno del servidor" });
    }
  });

  // Reset Password
  router.post("/atleta/auth/reset-password", async (req: Request, res: Response) => {
    try {
      const { token, newPassword } = req.body;
      if (!token || !newPassword) {
        return res.status(400).json({ success: false, error: "Token y nueva contraseña son requeridos" });
      }

      const [resetToken] = await db
        .select()
        .from(passwordResetTokens)
        .where(eq(passwordResetTokens.token, token));

      if (!resetToken || resetToken.expires_at < new Date()) {
        return res.status(400).json({ success: false, error: "El token es inválido o ha expirado" });
      }

      const passwordHash = await bcrypt.hash(newPassword, 10);

      await db.update(athletes)
        .set({ password_hash: passwordHash, updated_at: new Date() })
        .where(eq(athletes.id, resetToken.athlete_id));

      await db.delete(passwordResetTokens).where(eq(passwordResetTokens.id, resetToken.id));

      res.json({
        success: true,
        message: "Contraseña actualizada exitosamente",
      });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ success: false, error: "Error interno del servidor" });
    }
  });

  // Current athlete profile (preferred endpoint)
  router.get("/atleta/me", authenticateAthlete, async (req: Request, res: Response) => {
    try {
      const athleteId = req.athlete?.id;

      if (!athleteId) {
        return res.status(401).json({
          success: false,
          error: "Authentication required",
        });
      }

      const [athlete] = await db
        .select()
        .from(athletes)
        .where(eq(athletes.id, athleteId));

      if (!athlete) {
        return res.status(404).json({
          success: false,
          error: "Athlete not found",
        });
      }

      return res.json({
        success: true,
        data: athlete,
        timestamp: new Date(),
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  });

  // Recent measurements for progress charting
  router.get(
    "/atleta/measurements",
    authenticateAthlete,
    async (req: Request, res: Response) => {
      try {
        const athleteId = req.athlete?.id;

        if (!athleteId) {
          return res.status(401).json({
            success: false,
            error: "Authentication required",
          });
        }

        const rows = await db
          .select()
          .from(measurements)
          .where(eq(measurements.athlete_id, athleteId))
          .orderBy(desc(measurements.date))
          .limit(50);

        return res.json({
          success: true,
          data: rows,
          timestamp: new Date(),
        });
      } catch (error) {
        return res.status(500).json({
          success: false,
          error: "Internal server error",
        });
      }
    }
  );

  // Lightweight progress summary for home dashboard
  router.get("/atleta/progress", authenticateAthlete, async (req: Request, res: Response) => {
    try {
      const athleteId = req.athlete?.id;

      if (!athleteId) {
        return res.status(401).json({
          success: false,
          error: "Authentication required",
        });
      }

      const athleteMeasurements = await db
        .select()
        .from(measurements)
        .where(eq(measurements.athlete_id, athleteId))
        .orderBy(desc(measurements.date))
        .limit(12);

      const athleteRoutines = await db
        .select({ id: routines.id })
        .from(routines)
        .where(eq(routines.athlete_id, athleteId));

      const routineIds = athleteRoutines.map((routine) => routine.id);
      const completedRows = routineIds.length
        ? await Promise.all(
            routineIds.map((routineId) =>
              db
                .select({ id: routineExercises.id })
                .from(routineExercises)
                .where(
                  and(
                    eq(routineExercises.routine_id, routineId),
                    eq(routineExercises.completed, true)
                  )
                )
            )
          )
        : [];

      const completedCount = completedRows.flat().length;
      const latest = athleteMeasurements[0];
      const previous = athleteMeasurements[1];

      return res.json({
        success: true,
        data: {
          completed_exercises: completedCount,
          latest_measurement: latest ?? null,
          previous_measurement: previous ?? null,
          measurement_points: athleteMeasurements,
        },
        timestamp: new Date(),
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  });

  // Trainer notes feed for athlete engagement
  router.get(
    "/atleta/notifications",
    authenticateAthlete,
    async (req: Request, res: Response) => {
      try {
        const athleteId = req.athlete?.id;

        if (!athleteId) {
          return res.status(401).json({
            success: false,
            error: "Authentication required",
          });
        }

        const rows = await db
          .select({
            id: observations.id,
            type: observations.type,
            content: observations.content,
            date: observations.date,
            trainer_name: trainers.name,
          })
          .from(observations)
          .leftJoin(trainers, eq(observations.trainer_id, trainers.id))
          .where(eq(observations.athlete_id, athleteId))
          .orderBy(desc(observations.date))
          .limit(30);

        return res.json({
          success: true,
          data: rows,
          timestamp: new Date(),
        });
      } catch (error) {
        return res.status(500).json({
          success: false,
          error: "Internal server error",
        });
      }
    }
  );
}
