import type { Request, Response, NextFunction } from "express";
import { jwtVerify } from "./jwt.js";
import type { JwtPayload } from "@workspace/admin-sdk";

declare global {
  namespace Express {
    interface Request {
      admin?: {
        id: string;
        email: string;
        role: string;
        permissions: string[];
      };
      adminToken?: string;
      athlete?: {
        id: string;
        email: string;
        role: string;
        permissions: string[];
      };
      athleteToken?: string;
    }
  }
}

export function authenticateAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      error: "Missing or invalid authorization header",
    });
  }

  const token = authHeader.substring(7);

  try {
    const payload = jwtVerify(token) as JwtPayload;

    req.admin = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      permissions: payload.permissions,
    };

    req.adminToken = token;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: "Invalid or expired token",
    });
  }
}

export function requirePermission(permission: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    if (!req.admin.permissions.includes(permission)) {
      return res.status(403).json({
        success: false,
        error: `Permission denied: ${permission}`,
      });
    }

    next();
  };
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    if (!roles.includes(req.admin.role)) {
      return res.status(403).json({
        success: false,
        error: "Insufficient role",
      });
    }

    next();
  };
}

export function authenticateAthlete(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      error: "Missing or invalid authorization header",
    });
  }

  const token = authHeader.substring(7);

  try {
    const payload = jwtVerify(token) as JwtPayload;

    if (payload.role !== "athlete") {
      return res.status(403).json({
        success: false,
        error: "Athlete role required",
      });
    }

    req.athlete = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      permissions: payload.permissions,
    };

    req.athleteToken = token;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: "Invalid or expired token",
    });
  }
}
