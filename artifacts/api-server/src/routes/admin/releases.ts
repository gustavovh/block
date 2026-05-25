import type { Request, Response, Router } from "express";
import { db } from "@workspace/db";
import { releases } from "@workspace/db/schema";
import { authenticateAdmin, requirePermission } from "../../middlewares/auth.js";
import { eq, desc, sql } from "drizzle-orm";

export async function createReleaseRoutes(router: Router) {
  // Get all releases with pagination
  router.get(
    "/admin/releases",
    authenticateAdmin,
    requirePermission("view_releases"),
    async (req: Request, res: Response) => {
      try {
        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const limit = Math.min(100, parseInt(req.query.limit as string) || 20);
        const offset = (page - 1) * limit;

        const [releaseList, totalResult] = await Promise.all([
          db
            .select()
            .from(releases)
            .orderBy(desc(releases.created_at))
            .limit(limit)
            .offset(offset),
          db
            .select({ count: sql<number>`count(*)` })
            .from(releases),
        ]);

        const total = totalResult[0]?.count || 0;
        const total_pages = Math.ceil(total / limit);

        res.json({
          success: true,
          data: releaseList,
          pagination: {
            page,
            limit,
            total,
            total_pages,
          },
          timestamp: new Date(),
        });
      } catch (error) {
        console.error("Get releases error:", error);
        res.status(500).json({
          success: false,
          error: "Failed to fetch releases",
        });
      }
    }
  );

  // Get single release
  router.get(
    "/admin/releases/:id",
    authenticateAdmin,
    requirePermission("view_releases"),
    async (req: Request, res: Response) => {
      try {
        const [release] = await db
          .select()
          .from(releases)
          .where(eq(releases.id, req.params.id));

        if (!release) {
          return res.status(404).json({
            success: false,
            error: "Release not found",
          });
        }

        res.json({
          success: true,
          data: release,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error("Get release error:", error);
        res.status(500).json({
          success: false,
          error: "Failed to fetch release",
        });
      }
    }
  );

  // Create release
  router.post(
    "/admin/releases",
    authenticateAdmin,
    requirePermission("create_release"),
    async (req: Request, res: Response) => {
      try {
        const { version, changelog, release_notes, platforms, mandatory } =
          req.body;

        if (!version || !changelog || !platforms) {
          return res.status(400).json({
            success: false,
            error: "Missing required fields",
          });
        }

        // Validar semver
        if (!/^\d+\.\d+\.\d+/.test(version)) {
          return res.status(400).json({
            success: false,
            error: "Invalid version format (use semver: X.Y.Z)",
          });
        }

        const platformObj = platforms.reduce(
          (acc: Record<string, any>, p: string) => {
            acc[p] = { available: false };
            return acc;
          },
          {}
        );

        const [newRelease] = await db
          .insert(releases)
          .values({
            version,
            changelog,
            release_notes: release_notes || changelog,
            platforms: platformObj,
            mandatory: !!mandatory,
            created_by: req.admin!.id,
          })
          .returning();

        res.status(201).json({
          success: true,
          data: newRelease,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error("Create release error:", error);
        res.status(500).json({
          success: false,
          error: "Failed to create release",
        });
      }
    }
  );

  // Publish release
  router.post(
    "/admin/releases/:id/publish",
    authenticateAdmin,
    requirePermission("publish_release"),
    async (req: Request, res: Response) => {
      try {
        const [updated] = await db
          .update(releases)
          .set({
            status: "published",
            released_at: new Date(),
            updated_at: new Date(),
          })
          .where(eq(releases.id, req.params.id))
          .returning();

        if (!updated) {
          return res.status(404).json({
            success: false,
            error: "Release not found",
          });
        }

        res.json({
          success: true,
          data: updated,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error("Publish release error:", error);
        res.status(500).json({
          success: false,
          error: "Failed to publish release",
        });
      }
    }
  );

  // Delete release
  router.delete(
    "/admin/releases/:id",
    authenticateAdmin,
    requirePermission("delete_release"),
    async (req: Request, res: Response) => {
      try {
        const [release] = await db
          .select()
          .from(releases)
          .where(eq(releases.id, req.params.id));

        if (!release) {
          return res.status(404).json({
            success: false,
            error: "Release not found",
          });
        }

        if (release.status === "published") {
          return res.status(400).json({
            success: false,
            error: "Cannot delete published release",
          });
        }

        await db.delete(releases).where(eq(releases.id, req.params.id));

        res.json({
          success: true,
          message: "Release deleted successfully",
          timestamp: new Date(),
        });
      } catch (error) {
        console.error("Delete release error:", error);
        res.status(500).json({
          success: false,
          error: "Failed to delete release",
        });
      }
    }
  );
}

