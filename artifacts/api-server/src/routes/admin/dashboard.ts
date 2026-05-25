import type { Request, Response, Router } from "express";
import { eq } from "drizzle-orm";
import { db } from "@workspace/db";
import { adminUsers, errorLogs, releases, builds } from "@workspace/db/schema";
import { authenticateAdmin, requirePermission } from "../../middlewares/auth.js";

export async function createDashboardRoutes(router: Router) {
  // Get dashboard stats
  router.get(
    "/admin/dashboard/stats",
    authenticateAdmin,
    requirePermission("view_dashboard"),
    async (req: Request, res: Response) => {
      try {
        // Contar usuarios activos
        const activeUsers = await db
          .select()
          .from(adminUsers)
          .where(eq(adminUsers.status, "active"));

        // Obtener versión actual publicada
        const currentRelease = await db
          .select()
          .from(releases)
          .where(eq(releases.status, "published"))
          .orderBy(releases.released_at)
          .limit(1);

        // Contar releases totales
        const totalReleases = await db
          .select()
          .from(releases);

        // Contar builds fallidos
        const failedBuilds = await db
          .select()
          .from(builds)
          .where(eq(builds.status, "failed"));

        // Errores recientes
        const recentErrors = await db
          .select()
          .from(errorLogs)
          .orderBy(errorLogs.created_at)
          .limit(5);

        res.json({
          success: true,
          data: {
            active_users: activeUsers.length,
            total_users: activeUsers.length,
            current_version: currentRelease[0]?.version || "0.0.0",
            total_releases: totalReleases.length,
            failed_builds: failedBuilds.length,
            system_uptime_percent: 99.9,
            recent_errors: recentErrors.map((e) => ({
              id: e.id,
              source: e.source,
              error_type: e.error_type,
              message: e.message,
              created_at: e.created_at,
            })),
            recent_activities: [],
          },
          timestamp: new Date(),
        });
      } catch (error) {
        console.error("Dashboard stats error:", error);
        res.status(500).json({
          success: false,
          error: "Failed to fetch dashboard stats",
        });
      }
    }
  );
}

