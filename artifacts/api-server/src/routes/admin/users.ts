import type { Request, Response, Router } from "express";
import { db } from "@workspace/db";
import { adminUsers } from "@workspace/db/schema";
import { authenticateAdmin, requirePermission, requireRole } from "../../middlewares/auth.js";
import { eq, desc, sql } from "drizzle-orm";
import { createAdminUser, verifyPassword } from "./auth.js";

export async function createUserRoutes(router: Router) {
  // Get all admin users
  router.get(
    "/admin/users",
    authenticateAdmin,
    requirePermission("view_users"),
    async (req: Request, res: Response) => {
      try {
        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const limit = Math.min(100, parseInt(req.query.limit as string) || 20);
        const offset = (page - 1) * limit;

        const [userList, totalResult] = await Promise.all([
          db
            .select()
            .from(adminUsers)
            .orderBy(desc(adminUsers.created_at))
            .limit(limit)
            .offset(offset),
          db
            .select({ count: sql<number>`count(*)` })
            .from(adminUsers),
        ]);

        const total = totalResult[0]?.count || 0;
        const total_pages = Math.ceil(total / limit);

        // No incluir password_hash en respuesta
        const safeUsers = userList.map(({ password_hash, ...user }) => user);

        res.json({
          success: true,
          data: safeUsers,
          pagination: {
            page,
            limit,
            total,
            total_pages,
          },
          timestamp: new Date(),
        });
      } catch (error) {
        console.error("Get users error:", error);
        res.status(500).json({
          success: false,
          error: "Failed to fetch users",
        });
      }
    }
  );

  // Get single user
  router.get(
    "/admin/users/:id",
    authenticateAdmin,
    requirePermission("view_users"),
    async (req: Request, res: Response) => {
      try {
        const [user] = await db
          .select()
          .from(adminUsers)
          .where(eq(adminUsers.id, req.params.id));

        if (!user) {
          return res.status(404).json({
            success: false,
            error: "User not found",
          });
        }

        const { password_hash, ...safeUser } = user;

        res.json({
          success: true,
          data: safeUser,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error("Get user error:", error);
        res.status(500).json({
          success: false,
          error: "Failed to fetch user",
        });
      }
    }
  );

  // Create user
  router.post(
    "/admin/users",
    authenticateAdmin,
    requirePermission("create_user"),
    requireRole("super_admin", "admin"),
    async (req: Request, res: Response) => {
      try {
        const { email, name, role, password } = req.body;
        const allowedRoles = ["super_admin", "admin", "support", "editor", "viewer"];

        if (!email || !name || !role || !password) {
          return res.status(400).json({
            success: false,
            error: "Missing required fields",
          });
        }

        if (!allowedRoles.includes(role)) {
          return res.status(400).json({
            success: false,
            error: "Invalid role",
          });
        }

        // Validar que no sea super_admin si no es super_admin
        if (role === "super_admin" && req.admin!.role !== "super_admin") {
          return res.status(403).json({
            success: false,
            error: "Only super admins can create super admins",
          });
        }

        const newUser = await createAdminUser(email, password, name, role);

        const { password_hash, ...safeUser } = newUser;

        res.status(201).json({
          success: true,
          data: safeUser,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error("Create user error:", error);
        if (typeof error === "object" && error !== null && "cause" in error) {
          const cause = (error as { cause?: { code?: string } }).cause;

          if (cause?.code === "23505") {
            return res.status(409).json({
              success: false,
              error: "Email already exists",
            });
          }

          if (cause?.code === "22P02") {
            return res.status(400).json({
              success: false,
              error: "Invalid role",
            });
          }
        }

        res.status(500).json({
          success: false,
          error: "Failed to create user",
        });
      }
    }
  );

  // Update user
  router.put(
    "/admin/users/:id",
    authenticateAdmin,
    requirePermission("edit_user"),
    async (req: Request, res: Response) => {
      try {
        const { name, status, role } = req.body;

        // Solo super_admin puede cambiar roles
        if (role && req.admin!.role !== "super_admin") {
          return res.status(403).json({
            success: false,
            error: "Only super admins can change roles",
          });
        }

        const updates: any = {};
        if (name) updates.name = name;
        if (status) updates.status = status;
        if (role) updates.role = role;

        if (Object.keys(updates).length === 0) {
          return res.status(400).json({
            success: false,
            error: "No fields to update",
          });
        }

        const [updated] = await db
          .update(adminUsers)
          .set(updates)
          .where(eq(adminUsers.id, req.params.id))
          .returning();

        if (!updated) {
          return res.status(404).json({
            success: false,
            error: "User not found",
          });
        }

        const { password_hash, ...safeUser } = updated;

        res.json({
          success: true,
          data: safeUser,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error("Update user error:", error);
        res.status(500).json({
          success: false,
          error: "Failed to update user",
        });
      }
    }
  );

  // Delete user
  router.delete(
    "/admin/users/:id",
    authenticateAdmin,
    requirePermission("delete_user"),
    requireRole("super_admin"),
    async (req: Request, res: Response) => {
      try {
        // No permitir auto-eliminarse
        if (req.params.id === req.admin!.id) {
          return res.status(400).json({
            success: false,
            error: "Cannot delete your own account",
          });
        }

        const [user] = await db
          .select()
          .from(adminUsers)
          .where(eq(adminUsers.id, req.params.id));

        if (!user) {
          return res.status(404).json({
            success: false,
            error: "User not found",
          });
        }

        await db.delete(adminUsers).where(eq(adminUsers.id, req.params.id));

        res.json({
          success: true,
          message: "User deleted successfully",
          timestamp: new Date(),
        });
      } catch (error) {
        console.error("Delete user error:", error);
        res.status(500).json({
          success: false,
          error: "Failed to delete user",
        });
      }
    }
  );
}

