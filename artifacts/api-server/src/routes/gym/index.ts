import type { Router } from "express";
import { createAthleteRoutes } from "./athletes.js";
import { createRoutineRoutes } from "./routines.js";

export async function registerGymRoutes(router: Router) {
  console.log("🏋️ Registering gym routes...");

  // Athlete Auth & Profile
  await createAthleteRoutes(router);
  
  // Routines & Training
  await createRoutineRoutes(router);

  console.log("✅ Gym routes registered");
}
