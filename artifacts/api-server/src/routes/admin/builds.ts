import type { Request, Response, Router } from "express";
import { eq, desc, sql } from "drizzle-orm";
import { db } from "@workspace/db";
import { builds } from "@workspace/db/schema";
import { authenticateAdmin, requirePermission } from "../../middlewares/auth.js";

export async function createBuildRoutes(router: Router) {
  // Get all builds with pagination
  router.get(
    "/admin/builds",
    authenticateAdmin,
    requirePermission("view_builds"),
    async (req: Request, res: Response) => {
      try {
        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const limit = Math.min(100, parseInt(req.query.limit as string) || 20);
        const offset = (page - 1) * limit;

        const [buildList, totalResult] = await Promise.all([
          db
            .select()
            .from(builds)
            .orderBy(desc(builds.created_at))
            .limit(limit)
            .offset(offset),
          db
            .select({ count: sql<number>`count(*)` })
            .from(builds),
        ]);

        const total = totalResult[0]?.count || 0;
        const total_pages = Math.ceil(total / limit);

        res.json({
          success: true,
          data: buildList,
          pagination: {
            page,
            limit,
            total,
            total_pages,
          },
          timestamp: new Date(),
        });
      } catch (error) {
        console.error("Get builds error:", error);
        res.status(500).json({
          success: false,
          error: "Failed to fetch builds",
        });
      }
    }
  );

  // Get single build
  router.get(
    "/admin/builds/:id",
    authenticateAdmin,
    requirePermission("view_builds"),
    async (req: Request, res: Response) => {
      try {
        const [build] = await db
          .select()
          .from(builds)
          .where(eq(builds.id, req.params.id));

        if (!build) {
          return res.status(404).json({
            success: false,
            error: "Build not found",
          });
        }

        res.json({
          success: true,
          data: build,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error("Get build error:", error);
        res.status(500).json({
          success: false,
          error: "Failed to fetch build",
        });
      }
    }
  );

  // Create build
  router.post(
    "/admin/builds",
    authenticateAdmin,
    requirePermission("create_build"),
    async (req: Request, res: Response) => {
      try {
        const { platform, environment, version, release_id } = req.body;

        if (!platform || !environment || !version) {
          return res.status(400).json({
            success: false,
            error: "Missing required fields",
          });
        }

        const [newBuild] = await db
          .insert(builds)
          .values({
            platform,
            environment,
            version,
            release_id,
            status: "pending",
            created_by: req.admin!.id,
          })
          .returning();

        res.status(201).json({
          success: true,
          data: newBuild,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error("Create build error:", error);
        res.status(500).json({
          success: false,
          error: "Failed to create build",
        });
      }
    }
  );

  // Cancel build
  router.post(
    "/admin/builds/:id/cancel",
    authenticateAdmin,
    requirePermission("cancel_build"),
    async (req: Request, res: Response) => {
      try {
        const [updated] = await db
          .update(builds)
          .set({
            status: "cancelled",
            updated_at: new Date(),
          })
          .where(eq(builds.id, req.params.id))
          .returning();

        if (!updated) {
          return res.status(404).json({
            success: false,
            error: "Build not found",
          });
        }

        res.json({
          success: true,
          data: updated,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error("Cancel build error:", error);
        res.status(500).json({
          success: false,
          error: "Failed to cancel build",
        });
      }
    }
  );

  // Delete build
  router.delete(
    "/api/admin/builds/:id",
    authenticateAdmin,
    requirePermission("delete_build"),
    async (req: Request, res: Response) => {
      try {
        const [build] = await db
          .select()
          .from(builds)
          .where(eq(builds.id, req.params.id));

        if (!build) {
          return res.status(404).json({
            success: false,
            error: "Build not found",
          });
        }

        await db.delete(builds).where(eq(builds.id, req.params.id));

        res.json({
          success: true,
          message: "Build deleted successfully",
          timestamp: new Date(),
        });
      } catch (error) {
        console.error("Delete build error:", error);
        res.status(500).json({
          success: false,
          error: "Failed to delete build",
        });
      }
    }
  );
}

