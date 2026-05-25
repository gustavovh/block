import { z } from "zod";
export * from "./gym";

// ============================================================================
// ROLES Y PERMISOS
// ============================================================================

export const RoleEnum = z.enum([
  "super_admin",
  "admin",
  "support",
  "editor",
  "viewer",
]);

export type Role = z.infer<typeof RoleEnum>;

export const PermissionEnum = z.enum([
  // Dashboard
  "view_dashboard",
  
  // Versioning
  "view_releases",
  "create_release",
  "edit_release",
  "publish_release",
  "delete_release",
  "rollback_release",
  
  // Builds
  "view_builds",
  "create_build",
  "cancel_build",
  "delete_build",
  
  // Configuration
  "view_settings",
  "edit_settings",
  "view_feature_flags",
  "edit_feature_flags",
  "view_remote_config",
  "edit_remote_config",
  
  // Users
  "view_users",
  "create_user",
  "edit_user",
  "delete_user",
  "manage_roles",
  
  // Monitoring
  "view_logs",
  "view_error_logs",
  "export_logs",
  "view_audit_logs",
  "view_monitoring",
  
  // Notifications
  "view_notifications",
  "create_notification",
  "edit_notification",
  "send_notification",
  
  // System
  "manage_system",
  "view_analytics",
]);

export type Permission = z.infer<typeof PermissionEnum>;

// ============================================================================
// USER SCHEMA
// ============================================================================

export const AdminUserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
  role: RoleEnum,
  status: z.enum(["active", "inactive", "blocked"]),
  mfa_enabled: z.boolean(),
  last_login: z.date().nullable(),
  created_at: z.date(),
  updated_at: z.date(),
});

export type AdminUser = z.infer<typeof AdminUserSchema>;

export const CreateAdminUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100),
  role: RoleEnum,
  password: z.string().min(10),
});

export type CreateAdminUser = z.infer<typeof CreateAdminUserSchema>;

// ============================================================================
// RELEASES
// ============================================================================

export const PlatformEnum = z.enum(["android", "ios", "web"]);
export type Platform = z.infer<typeof PlatformEnum>;

export const ReleaseStatusEnum = z.enum([
  "draft",
  "published",
  "deprecated",
  "blocked",
]);
export type ReleaseStatus = z.infer<typeof ReleaseStatusEnum>;

export const ReleaseSchema = z.object({
  id: z.string().uuid(),
  version: z.string().regex(/^\d+\.\d+\.\d+$/), // semver
  changelog: z.string(),
  platforms: z.record(PlatformEnum, z.object({
    available: z.boolean(),
    build_id: z.string().uuid().optional(),
  })),
  status: ReleaseStatusEnum,
  mandatory: z.boolean(),
  release_notes: z.string(),
  rollback_available: z.boolean(),
  released_at: z.date().nullable(),
  created_at: z.date(),
  updated_at: z.date(),
  created_by: z.string().uuid(),
});

export type Release = z.infer<typeof ReleaseSchema>;

export const CreateReleaseSchema = z.object({
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  changelog: z.string().min(10),
  release_notes: z.string().min(10),
  platforms: z.array(PlatformEnum).min(1),
  mandatory: z.boolean().default(false),
});

export type CreateRelease = z.infer<typeof CreateReleaseSchema>;

// ============================================================================
// BUILDS
// ============================================================================

export const BuildStatusEnum = z.enum([
  "pending",
  "building",
  "success",
  "failed",
  "cancelled",
]);
export type BuildStatus = z.infer<typeof BuildStatusEnum>;

export const EnvironmentEnum = z.enum(["development", "staging", "production"]);
export type Environment = z.infer<typeof EnvironmentEnum>;

export const BuildSchema = z.object({
  id: z.string().uuid(),
  release_id: z.string().uuid().optional(),
  platform: PlatformEnum,
  environment: EnvironmentEnum,
  status: BuildStatusEnum,
  version: z.string(),
  file_size: z.number().optional(), // en bytes
  hash: z.string().optional(), // SHA256 checksum
  download_url: z.string().url().optional(),
  build_logs: z.string(),
  error_message: z.string().optional(),
  duration_seconds: z.number().optional(),
  created_at: z.date(),
  updated_at: z.date(),
  created_by: z.string().uuid(),
});

export type Build = z.infer<typeof BuildSchema>;

export const CreateBuildSchema = z.object({
  platform: PlatformEnum,
  environment: EnvironmentEnum,
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  release_id: z.string().uuid().optional(),
});

export type CreateBuild = z.infer<typeof CreateBuildSchema>;

// ============================================================================
// SETTINGS / CONFIGURATION
// ============================================================================

export const SettingSchema = z.object({
  id: z.string().uuid(),
  key: z.string(),
  value: z.unknown(), // JSON value
  type: z.enum(["string", "number", "boolean", "json"]),
  description: z.string(),
  updated_at: z.date(),
  updated_by: z.string().uuid().optional(),
});

export type Setting = z.infer<typeof SettingSchema>;

export const UpdateSettingSchema = z.object({
  value: z.unknown(),
});

export type UpdateSetting = z.infer<typeof UpdateSettingSchema>;

// ============================================================================
// FEATURE FLAGS
// ============================================================================

export const FeatureFlagSchema = z.object({
  id: z.string().uuid(),
  key: z.string(),
  enabled: z.boolean(),
  percentage: z.number().min(0).max(100), // Para rollout gradual
  platforms: z.array(PlatformEnum),
  version_min: z.string().optional(),
  version_max: z.string().optional(),
  updated_at: z.date(),
  updated_by: z.string().uuid().optional(),
});

export type FeatureFlag = z.infer<typeof FeatureFlagSchema>;

export const UpdateFeatureFlagSchema = z.object({
  enabled: z.boolean().optional(),
  percentage: z.number().min(0).max(100).optional(),
  platforms: z.array(PlatformEnum).optional(),
  version_min: z.string().optional(),
  version_max: z.string().optional(),
});

export type UpdateFeatureFlag = z.infer<typeof UpdateFeatureFlagSchema>;

// ============================================================================
// REMOTE CONFIG
// ============================================================================

export const RemoteConfigSchema = z.object({
  id: z.string().uuid(),
  key: z.string(),
  value: z.unknown(),
  version_min: z.string().optional(),
  version_max: z.string().optional(),
  updated_at: z.date(),
});

export type RemoteConfig = z.infer<typeof RemoteConfigSchema>;

// ============================================================================
// MONITORING / LOGS
// ============================================================================

export const AuditLogSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  action: z.string(),
  resource_type: z.string(),
  resource_id: z.string().optional(),
  changes: z.record(z.unknown()), // JSON diff
  ip_address: z.string(),
  user_agent: z.string().optional(),
  created_at: z.date(),
});

export type AuditLog = z.infer<typeof AuditLogSchema>;

export const ErrorLogSchema = z.object({
  id: z.string().uuid(),
  source: z.enum(["frontend", "backend", "mobile"]),
  error_type: z.string(),
  message: z.string(),
  stack_trace: z.string().optional(),
  user_id: z.string().uuid().optional(),
  metadata: z.record(z.unknown()), // JSON metadata
  created_at: z.date(),
});

export type ErrorLog = z.infer<typeof ErrorLogSchema>;

// ============================================================================
// NOTIFICATIONS
// ============================================================================

export const NotificationStatusEnum = z.enum([
  "draft",
  "scheduled",
  "sent",
  "failed",
]);
export type NotificationStatus = z.infer<typeof NotificationStatusEnum>;

export const NotificationSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  content: z.string(),
  type: z.enum(["announcement", "system", "alert"]),
  target_roles: z.array(RoleEnum),
  status: NotificationStatusEnum,
  sent_at: z.date().nullable(),
  scheduled_at: z.date().nullable(),
  created_at: z.date(),
  updated_at: z.date(),
  created_by: z.string().uuid(),
});

export type Notification = z.infer<typeof NotificationSchema>;

export const CreateNotificationSchema = z.object({
  title: z.string().min(5).max(200),
  content: z.string().min(10).max(2000),
  type: z.enum(["announcement", "system", "alert"]),
  target_roles: z.array(RoleEnum).min(1),
  scheduled_at: z.date().optional(),
});

export type CreateNotification = z.infer<typeof CreateNotificationSchema>;

// ============================================================================
// DASHBOARD STATS
// ============================================================================

export const DashboardStatsSchema = z.object({
  active_users: z.number(),
  total_users: z.number(),
  current_version: z.string(),
  total_releases: z.number(),
  failed_builds: z.number(),
  system_uptime_percent: z.number(),
  recent_errors: z.array(ErrorLogSchema),
  recent_activities: z.array(AuditLogSchema),
});

export type DashboardStats = z.infer<typeof DashboardStatsSchema>;

// ============================================================================
// API RESPONSES
// ============================================================================

export const ApiResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z.string().optional(),
    timestamp: z.date(),
  });

export const PaginatedResponseSchema = <T extends z.ZodType>(
  dataSchema: T
) =>
  z.object({
    success: z.boolean(),
    data: z.array(dataSchema),
    pagination: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      total_pages: z.number(),
    }),
    timestamp: z.date(),
  });
