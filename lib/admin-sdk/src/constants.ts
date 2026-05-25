// Roles y permisos
export const ROLES = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  SUPPORT: "support",
  EDITOR: "editor",
  VIEWER: "viewer",
} as const;

export const ROLE_PERMISSIONS: Record<string, string[]> = {
  [ROLES.SUPER_ADMIN]: [
    "view_dashboard",
    "view_releases",
    "create_release",
    "edit_release",
    "publish_release",
    "delete_release",
    "rollback_release",
    "view_builds",
    "create_build",
    "cancel_build",
    "delete_build",
    "view_settings",
    "edit_settings",
    "view_feature_flags",
    "edit_feature_flags",
    "view_remote_config",
    "edit_remote_config",
    "view_users",
    "create_user",
    "edit_user",
    "delete_user",
    "manage_roles",
    "view_logs",
    "view_error_logs",
    "export_logs",
    "view_audit_logs",
    "view_monitoring",
    "view_notifications",
    "create_notification",
    "edit_notification",
    "send_notification",
    "manage_system",
    "view_analytics",
  ],
  [ROLES.ADMIN]: [
    "view_dashboard",
    "view_releases",
    "create_release",
    "edit_release",
    "publish_release",
    "rollback_release",
    "view_builds",
    "create_build",
    "cancel_build",
    "view_settings",
    "edit_settings",
    "view_feature_flags",
    "edit_feature_flags",
    "view_remote_config",
    "edit_remote_config",
    "view_users",
    "create_user",
    "edit_user",
    "view_logs",
    "view_error_logs",
    "export_logs",
    "view_audit_logs",
    "view_monitoring",
    "view_notifications",
    "create_notification",
    "edit_notification",
    "send_notification",
    "view_analytics",
  ],
  [ROLES.SUPPORT]: [
    "view_dashboard",
    "view_releases",
    "view_builds",
    "view_settings",
    "view_feature_flags",
    "view_remote_config",
    "view_users",
    "view_logs",
    "view_error_logs",
    "export_logs",
    "view_audit_logs",
    "view_monitoring",
    "view_notifications",
    "view_analytics",
  ],
  [ROLES.EDITOR]: [
    "view_dashboard",
    "view_releases",
    "view_builds",
    "view_settings",
    "edit_settings",
    "view_feature_flags",
    "edit_feature_flags",
    "view_remote_config",
    "edit_remote_config",
    "view_logs",
    "view_monitoring",
    "view_notifications",
    "create_notification",
    "edit_notification",
    "view_analytics",
  ],
  [ROLES.VIEWER]: [
    "view_dashboard",
    "view_releases",
    "view_builds",
    "view_settings",
    "view_feature_flags",
    "view_remote_config",
    "view_logs",
    "view_monitoring",
    "view_notifications",
    "view_analytics",
  ],
};

// Ambientes de build
export const BUILD_ENVIRONMENTS = {
  DEVELOPMENT: "development",
  STAGING: "staging",
  PRODUCTION: "production",
} as const;

// Plataformas
export const PLATFORMS = {
  ANDROID: "android",
  IOS: "ios",
  WEB: "web",
} as const;

// Estados
export const RELEASE_STATUS = {
  DRAFT: "draft",
  PUBLISHED: "published",
  DEPRECATED: "deprecated",
  BLOCKED: "blocked",
} as const;

export const BUILD_STATUS = {
  PENDING: "pending",
  BUILDING: "building",
  SUCCESS: "success",
  FAILED: "failed",
  CANCELLED: "cancelled",
} as const;

export const USER_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  BLOCKED: "blocked",
} as const;

// Tipos de notificación
export const NOTIFICATION_TYPES = {
  ANNOUNCEMENT: "announcement",
  SYSTEM: "system",
  ALERT: "alert",
} as const;

export const NOTIFICATION_STATUS = {
  DRAFT: "draft",
  SCHEDULED: "scheduled",
  SENT: "sent",
  FAILED: "failed",
} as const;
