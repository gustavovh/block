import type { Router } from "express";
import { createAuthRoutes } from "./auth.js";
import { createDashboardRoutes } from "./dashboard.js";
import { createReleaseRoutes } from "./releases.js";
import { createBuildRoutes } from "./builds.js";
import { createSettingsRoutes } from "./configs.js";
import { createUserRoutes } from "./users.js";
import { createMonitoringRoutes } from "./monitoring.js";

export async function registerAdminRoutes(router: Router) {
  console.log("📊 Registering admin routes...");

  // Auth routes
  await createAuthRoutes(router);
  console.log("✅ Auth routes registered");

  // Dashboard routes
  await createDashboardRoutes(router);
  console.log("✅ Dashboard routes registered");

  // Release routes
  await createReleaseRoutes(router);
  console.log("✅ Release routes registered");

  // Build routes
  await createBuildRoutes(router);
  console.log("✅ Build routes registered");

  // Settings/Config routes
  await createSettingsRoutes(router);
  console.log("✅ Settings routes registered");

  // User routes
  await createUserRoutes(router);
  console.log("✅ User routes registered");

  // Monitoring routes
  await createMonitoringRoutes(router);
  console.log("✅ Monitoring routes registered");

  // Gym Management routes
  const { createAdminGymRoutes } = await import("./gym.js");
  await createAdminGymRoutes(router);
  console.log("✅ Gym routes registered");
}

