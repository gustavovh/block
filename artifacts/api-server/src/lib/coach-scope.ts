import type { Request, Response } from "express";
import { and, eq } from "drizzle-orm";
import { db } from "@workspace/db";
import { adminUserTrainers, athletes } from "@workspace/db/schema";

export async function resolveCoachTrainerId(req: Request): Promise<string | null> {
  const adminId = req.admin?.id;
  if (!adminId) {
    return null;
  }

  const [mapping] = await db
    .select({ trainer_id: adminUserTrainers.trainer_id })
    .from(adminUserTrainers)
    .where(eq(adminUserTrainers.admin_user_id, adminId));

  return mapping?.trainer_id ?? null;
}

export async function ensureCoachAthleteOwnership(
  athleteId: string,
  trainerId: string
): Promise<boolean> {
  const [ownedAthlete] = await db
    .select({ id: athletes.id })
    .from(athletes)
    .where(and(eq(athletes.id, athleteId), eq(athletes.trainer_id, trainerId)))
    .limit(1);

  return Boolean(ownedAthlete);
}

export async function requireCoachTrainerOr403(
  req: Request,
  res: Response
): Promise<string | null> {
  const trainerId = await resolveCoachTrainerId(req);
  if (!trainerId) {
    res.status(403).json({
      success: false,
      error: "Trainer context not found for authenticated user",
    });
    return null;
  }

  return trainerId;
}

export async function requireCoachAthleteOr404(
  athleteId: string,
  trainerId: string,
  res: Response
): Promise<boolean> {
  const ownedAthlete = await ensureCoachAthleteOwnership(athleteId, trainerId);
  if (!ownedAthlete) {
    res.status(404).json({
      success: false,
      error: "Athlete not found",
    });
    return false;
  }

  return true;
}
