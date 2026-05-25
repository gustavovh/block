import type { Request, Response, Router } from "express";
import { db } from "@workspace/db";
import { auditLogs, errorLogs } from "@workspace/db/schema";
import { authenticateAdmin, requirePermission } from "../../middlewares/auth.js";
import { eq, desc, sql } from "drizzle-orm";

export async function createMonitoringRoutes(router: Router) {
  // Get audit logs
  router.get(
    "/admin/monitoring/audit-logs",
    authenticateAdmin,
    requirePermission("view_audit_logs"),
    async (req: Request, res: Response) => {
      try {
        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const limit = Math.min(100, parseInt(req.query.limit as string) || 20);
        const offset = (page - 1) * limit;

        const [logs, totalResult] = await Promise.all([
          db
            .select()
            .from(auditLogs)
            .orderBy(desc(auditLogs.created_at))
            .limit(limit)
            .offset(offset),
          db
            .select({ count: sql<number>`count(*)` })
            .from(auditLogs),
        ]);

        const total = totalResult[0]?.count || 0;
        const total_pages = Math.ceil(total / limit);

        res.json({
          success: true,
          data: logs,
          pagination: {
            page,
            limit,
            total,
            total_pages,
          },
          timestamp: new Date(),
        });
      } catch (error) {
        console.error("Get audit logs error:", error);
        res.status(500).json({
          success: false,
          error: "Failed to fetch audit logs",
        });
      }
    }
  );

  // Get error logs
  router.get(
    "/admin/monitoring/error-logs",
    authenticateAdmin,
    requirePermission("view_error_logs"),
    async (req: Request, res: Response) => {
      try {
        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const limit = Math.min(100, parseInt(req.query.limit as string) || 20);
        const offset = (page - 1) * limit;
        const source = req.query.source as string | undefined;

        const query = db.select().from(errorLogs);

        if (source) {
          query.where(eq(errorLogs.source, source as any));
        }

        const [logs, totalResult] = await Promise.all([
          query
            .orderBy(desc(errorLogs.created_at))
            .limit(limit)
            .offset(offset),
          db
            .select({ count: sql<number>`count(*)` })
            .from(errorLogs),
        ]);

        const total = totalResult[0]?.count || 0;
        const total_pages = Math.ceil(total / limit);

        res.json({
          success: true,
          data: logs,
          pagination: {
            page,
            limit,
            total,
            total_pages,
          },
          timestamp: new Date(),
        });
      } catch (error) {
        console.error("Get error logs error:", error);
        res.status(500).json({
          success: false,
          error: "Failed to fetch error logs",
        });
      }
    }
  );

  // Create error log (para que frontend/mobile reporte errores)
  router.post(
    "/admin/monitoring/error-logs",
    async (req: Request, res: Response) => {
      try {
        const { source, error_type, message, stack_trace, metadata } = req.body;

        if (!source || !error_type || !message) {
          return res.status(400).json({
            success: false,
            error: "Missing required fields",
          });
        }

        const [newLog] = await db
          .insert(errorLogs)
          .values({
            source,
            error_type,
            message,
            stack_trace,
            metadata: metadata || {},
          })
          .returning();

        res.status(201).json({
          success: true,
          data: newLog,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error("Create error log error:", error);
        res.status(500).json({
          success: false,
          error: "Failed to create error log",
        });
      }
    }
  );

  // Get system health
  router.get(
    "/api/admin/monitoring/health",
    authenticateAdmin,
    async (req: Request, res: Response) => {
      try {
        // Verificar conexión a BD
        const dbCheck = await db.select().from(errorLogs).limit(1);

        res.json({
          success: true,
          data: {
            status: "healthy",
            database: "connected",
            timestamp: new Date(),
          },
        });
      } catch (error) {
        console.error("Health check error:", error);
        res.status(503).json({
          success: false,
          error: "Service unavailable",
        });
      }
    }
  );
}

