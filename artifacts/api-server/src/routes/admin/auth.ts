import type { Request, Response, Router } from "express";
import { eq, and, gt } from "drizzle-orm";
import { db } from "@workspace/db";
import { adminUsers, adminSessions } from "@workspace/db/schema";
import { jwtSign, jwtSignRefreshToken, jwtVerify } from "../../middlewares/jwt.js";
import { authenticateAdmin } from "../../middlewares/auth.js";
import { ROLE_PERMISSIONS } from "@workspace/admin-sdk";
import bcrypt from "bcrypt";

export async function createAdminUser(
  email: string,
  password: string,
  name: string,
  role: string = "admin"
) {
  const hashedPassword = await bcrypt.hash(password, 10);

  const [user] = await db
    .insert(adminUsers)
    .values({
      email,
      name,
      password_hash: hashedPassword,
      role,
    })
    .returning();

  return user;
}

export async function verifyPassword(hash: string, password: string) {
  return bcrypt.compare(password, hash);
}

export async function createAuthRoutes(router: Router) {
  // Login
  router.post("/admin/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: "Email and password are required",
        });
      }

      const [user] = await db
        .select()
        .from(adminUsers)
        .where(eq(adminUsers.email, email));

      if (!user) {
        return res.status(401).json({
          success: false,
          error: "Invalid credentials",
        });
      }

      const isValid = await verifyPassword(user.password_hash, password);

      if (!isValid) {
        return res.status(401).json({
          success: false,
          error: "Invalid credentials",
        });
      }

      if (user.status !== "active") {
        return res.status(403).json({
          success: false,
          error: "User account is not active",
        });
      }

      // Actualizar último login
      await db
        .update(adminUsers)
        .set({ last_login: new Date() })
        .where(eq(adminUsers.id, user.id));

      // Crear tokens
      const permissions = ROLE_PERMISSIONS[user.role] || [];
      const accessToken = jwtSign({
        sub: user.id,
        email: user.email,
        role: user.role,
        permissions,
      });

      const refreshToken = jwtSignRefreshToken();

      // Guardar sesión
      await db.insert(adminSessions).values({
        user_id: user.id,
        token_hash: Buffer.from(accessToken).toString("base64"),
        refresh_token_hash: Buffer.from(refreshToken).toString("base64"),
        expires_at: new Date(Date.now() + 15 * 60 * 1000), // 15 minutos
        refresh_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
        ip_address: req.ip,
        user_agent: req.headers["user-agent"],
      });

      res.json({
        success: true,
        data: {
          access_token: accessToken,
          refresh_token: refreshToken,
          expires_in: 900, // 15 minutos en segundos
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
        },
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  });

  // Refresh token
  router.post("/admin/auth/refresh", async (req: Request, res: Response) => {
    try {
      const { refresh_token } = req.body;

      if (!refresh_token) {
        return res.status(400).json({
          success: false,
          error: "Refresh token is required",
        });
      }

      try {
        jwtVerify(refresh_token);
      } catch {
        return res.status(401).json({
          success: false,
          error: "Invalid refresh token",
        });
      }

      const refreshTokenHash = Buffer.from(refresh_token).toString("base64");

      const [session] = await db
        .select()
        .from(adminSessions)
        .where(
          and(
            eq(adminSessions.refresh_token_hash, refreshTokenHash),
            gt(adminSessions.refresh_expires_at, new Date())
          )
        );

      if (!session) {
        return res.status(401).json({
          success: false,
          error: "Refresh session not found or expired",
        });
      }

      const [user] = await db
        .select()
        .from(adminUsers)
        .where(eq(adminUsers.id, session.user_id));

      if (!user || user.status !== "active") {
        return res.status(401).json({
          success: false,
          error: "User not found or inactive",
        });
      }

      const permissions = ROLE_PERMISSIONS[user.role] || [];
      const newAccessToken = jwtSign({
        sub: user.id,
        email: user.email,
        role: user.role,
        permissions,
      });

      await db
        .update(adminSessions)
        .set({
          token_hash: Buffer.from(newAccessToken).toString("base64"),
          expires_at: new Date(Date.now() + 15 * 60 * 1000),
        })
        .where(eq(adminSessions.id, session.id));

      res.json({
        success: true,
        data: {
          access_token: newAccessToken,
          expires_in: 900,
        },
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Refresh error:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  });

  // Get current user
  router.get(
    "/admin/auth/me",
    authenticateAdmin,
    async (req: Request, res: Response) => {
      try {
        const user = await db
          .select()
          .from(adminUsers)
          .where(eq(adminUsers.id, req.admin!.id));

        if (!user[0]) {
          return res.status(404).json({
            success: false,
            error: "User not found",
          });
        }

        res.json({
          success: true,
          data: {
            id: user[0].id,
            email: user[0].email,
            name: user[0].name,
            role: user[0].role,
            status: user[0].status,
            mfa_enabled: user[0].mfa_enabled,
            last_login: user[0].last_login,
            created_at: user[0].created_at,
            updated_at: user[0].updated_at,
          },
          timestamp: new Date(),
        });
      } catch (error) {
        console.error("Get user error:", error);
        res.status(500).json({
          success: false,
          error: "Internal server error",
        });
      }
    }
  );

  // Logout
  router.post(
    "/admin/auth/logout",
    authenticateAdmin,
    async (req: Request, res: Response) => {
      try {
        // Eliminar sesión
        await db
          .delete(adminSessions)
          .where(eq(adminSessions.user_id, req.admin!.id));

        res.json({
          success: true,
          message: "Logged out successfully",
          timestamp: new Date(),
        });
      } catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({
          success: false,
          error: "Internal server error",
        });
      }
    }
  );
}

