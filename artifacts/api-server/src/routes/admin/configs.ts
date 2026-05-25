import type { Request, Response, Router } from "express";
import { db } from "@workspace/db";
import { settings, featureFlags, remoteConfigs } from "@workspace/db/schema";
import { authenticateAdmin, requirePermission } from "../../middlewares/auth.js";
import { eq } from "drizzle-orm";
import { getIO } from "../../lib/socket.js";

export async function createSettingsRoutes(router: Router) {
  // Get all settings
  router.get(
    "/admin/settings",
    authenticateAdmin,
    requirePermission("view_settings"),
    async (req: Request, res: Response) => {
      try {
        const allSettings = await db.select().from(settings);

        const settingsMap = allSettings.reduce(
          (acc, setting) => {
            acc[setting.key] = setting;
            return acc;
          },
          {} as Record<string, any>
        );

        res.json({
          success: true,
          data: settingsMap,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error("Get settings error:", error);
        res.status(500).json({
          success: false,
          error: "Failed to fetch settings",
        });
      }
    }
  );

  // Get single setting
  router.get(
    "/admin/settings/:key",
    authenticateAdmin,
    requirePermission("view_settings"),
    async (req: Request, res: Response) => {
      try {
        const [setting] = await db
          .select()
          .from(settings)
          .where(eq(settings.key, req.params.key));

        if (!setting) {
          return res.status(404).json({
            success: false,
            error: "Setting not found",
          });
        }

        res.json({
          success: true,
          data: setting,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error("Get setting error:", error);
        res.status(500).json({
          success: false,
          error: "Failed to fetch setting",
        });
      }
    }
  );

  // Update setting
  router.put(
    "/admin/settings/:key",
    authenticateAdmin,
    requirePermission("edit_settings"),
    async (req: Request, res: Response) => {
      try {
        const { value } = req.body;

        if (value === undefined) {
          return res.status(400).json({
            success: false,
            error: "Value is required",
          });
        }

        const [updated] = await db
          .update(settings)
          .set({
            value,
            updated_at: new Date(),
            updated_by: req.admin!.id,
          })
          .where(eq(settings.key, req.params.key))
          .returning();

        if (!updated) {
          return res.status(404).json({
            success: false,
            error: "Setting not found",
          });
        }

        getIO().emit("setting_updated", updated);

        res.json({
          success: true,
          data: updated,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error("Update setting error:", error);
        res.status(500).json({
          success: false,
          error: "Failed to update setting",
        });
      }
    }
  );

  // Get feature flags
  router.get(
    "/admin/feature-flags",
    authenticateAdmin,
    requirePermission("view_feature_flags"),
    async (req: Request, res: Response) => {
      try {
        const flags = await db.select().from(featureFlags);

        res.json({
          success: true,
          data: flags,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error("Get feature flags error:", error);
        res.status(500).json({
          success: false,
          error: "Failed to fetch feature flags",
        });
      }
    }
  );

  // Update feature flag
  router.put(
    "/admin/feature-flags/:key",
    authenticateAdmin,
    requirePermission("edit_feature_flags"),
    async (req: Request, res: Response) => {
      try {
        const { enabled, percentage, platforms, version_min, version_max } = req.body;

        const updates: any = { updated_at: new Date(), updated_by: req.admin!.id };
        if (enabled !== undefined) updates.enabled = enabled;
        if (percentage !== undefined) updates.percentage = percentage;
        if (platforms) updates.platforms = platforms;
        if (version_min !== undefined) updates.version_min = version_min;
        if (version_max !== undefined) updates.version_max = version_max;

        const [updated] = await db
          .update(featureFlags)
          .set(updates)
          .where(eq(featureFlags.key, req.params.key))
          .returning();

        if (!updated) {
          return res.status(404).json({
            success: false,
            error: "Feature flag not found",
          });
        }

        getIO().emit("feature_flag_updated", updated);

        res.json({
          success: true,
          data: updated,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error("Update feature flag error:", error);
        res.status(500).json({
          success: false,
          error: "Failed to update feature flag",
        });
      }
    }
  );

  // Get remote config
  router.get(
    "/api/admin/remote-config",
    authenticateAdmin,
    requirePermission("view_remote_config"),
    async (req: Request, res: Response) => {
      try {
        const configs = await db.select().from(remoteConfigs);

        res.json({
          success: true,
          data: configs,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error("Get remote config error:", error);
        res.status(500).json({
          success: false,
          error: "Failed to fetch remote config",
        });
      }
    }
  );

  // Update remote config
  router.put(
    "/api/admin/remote-config/:key",
    authenticateAdmin,
    requirePermission("edit_remote_config"),
    async (req: Request, res: Response) => {
      try {
        const { value, version_min, version_max } = req.body;

        if (value === undefined) {
          return res.status(400).json({
            success: false,
            error: "Value is required",
          });
        }

        const [updated] = await db
          .update(remoteConfigs)
          .set({
            value,
            version_min,
            version_max,
            updated_at: new Date(),
          })
          .where(eq(remoteConfigs.key, req.params.key))
          .returning();

        if (!updated) {
          return res.status(404).json({
            success: false,
            error: "Config not found",
          });
        }

        getIO().emit("remote_config_updated", updated);

        res.json({
          success: true,
          data: updated,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error("Update remote config error:", error);
        res.status(500).json({
          success: false,
          error: "Failed to update remote config",
        });
      }
    }
  );
}

