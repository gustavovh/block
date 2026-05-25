import { z } from "zod";
import type {
  AdminUser,
  Release,
  Build,
  Setting,
  FeatureFlag,
  RemoteConfig,
  AuditLog,
  ErrorLog,
  Notification,
  DashboardStats,
  CreateAdminUser,
  CreateRelease,
  CreateBuild,
  UpdateSetting,
  UpdateFeatureFlag,
  CreateNotification,
  Athlete,
  Measurement,
  Exercise,
  CreateExercise,
  Routine,
  CreateAthlete,
  CreateMeasurement,
  CreateRoutine,
  CoachDashboard,
  AthleteObservation,
  CreateAthleteObservation,
} from "./types/index";

export interface ApiClientOptions {
  baseURL: string;
  token?: string;
  onTokenRefresh?: (newToken: string) => Promise<void>;
}

export interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: unknown;
  headers?: Record<string, string>;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
}

/**
 * Cliente API tipado para administración
 * Proporciona métodos type-safe para todas las operaciones administrativas
 */
export class AdminApiClient {
  private baseURL: string;
  private token: string | null = null;
  private onTokenRefresh?: (newToken: string) => Promise<void>;

  constructor(options: ApiClientOptions) {
    this.baseURL = options.baseURL;
    this.token = options.token || null;
    this.onTokenRefresh = options.onTokenRefresh;
  }

  setToken(token: string) {
    this.token = token;
  }

  private getCurrentToken(): string | null {
    if (this.token) return this.token;

    if (typeof globalThis !== "undefined" && typeof (globalThis as any).window !== "undefined") {
      return localStorage.getItem("access_token");
    }

    return null;
  }

  private getHeaders(tokenOverride?: string | null): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    const tokenToUse = tokenOverride ?? this.getCurrentToken();
    if (tokenToUse) {
      headers["Authorization"] = `Bearer ${tokenToUse}`;
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options?: RequestOptions
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const method = options?.method || "GET";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          ...this.getHeaders(),
          ...(options?.headers || {}),
        },
        body:
          options?.body && method !== "GET"
            ? JSON.stringify(options.body)
            : undefined,
      });

      if (!response.ok) {
        if (response.status === 401) {
          if (typeof globalThis !== "undefined" && typeof (globalThis as any).window !== "undefined") {
            const refreshToken = localStorage.getItem("refresh_token");

            if (refreshToken) {
              const refreshResponse = await fetch(`${this.baseURL}/api/admin/auth/refresh`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ refresh_token: refreshToken }),
              });

              if (refreshResponse.ok) {
                const refreshData = (await refreshResponse.json()) as {
                  data?: { access_token?: string };
                };

                const newAccessToken = refreshData?.data?.access_token;

                if (newAccessToken) {
                  this.token = newAccessToken;
                  await this.onTokenRefresh?.(newAccessToken);

                  const retryResponse = await fetch(url, {
                    method,
                    headers: {
                      ...this.getHeaders(newAccessToken),
                      ...(options?.headers || {}),
                    },
                    body:
                      options?.body && method !== "GET"
                        ? JSON.stringify(options.body)
                        : undefined,
                  });

                  if (!retryResponse.ok) {
                    throw new Error(`API Error: ${retryResponse.status}`);
                  }

                  return (await retryResponse.json()) as T;
                }
              }
            }

            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
          }

          throw new Error("Unauthorized");
        }
        throw new Error(`API Error: ${response.status}`);
      }

      return (await response.json()) as T;
    } catch (error) {
      throw error;
    }
  }

  // ========================================================================
  // AUTH ENDPOINTS
  // ========================================================================

  async login(email: string, password: string) {
    return this.request<{ access_token: string; refresh_token: string }>(
      "/api/admin/auth/login",
      {
        method: "POST",
        body: { email, password },
      }
    );
  }

  async logout() {
    return this.request("/api/admin/auth/logout", {
      method: "POST",
    });
  }

  async refreshToken(refreshToken: string) {
    return this.request<{ access_token: string }>(
      "/api/admin/auth/refresh",
      {
        method: "POST",
        body: { refresh_token: refreshToken },
      }
    );
  }

  async getCurrentUser() {
    return this.request<AdminUser>("/api/admin/auth/me");
  }

  // ========================================================================
  // DASHBOARD
  // ========================================================================

  async getDashboardStats() {
    return this.request<DashboardStats>("/api/admin/dashboard/stats");
  }

  // ========================================================================
  // RELEASES
  // ========================================================================

  async getReleases(params?: PaginationParams) {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));
    if (params?.sort) query.append("sort", params.sort);
    if (params?.order) query.append("order", params.order);

    return this.request<{ success: boolean; data: Release[]; pagination: any }>(
      `/api/admin/releases?${query.toString()}`
    );
  }

  async getRelease(id: string) {
    return this.request<Release>(`/api/admin/releases/${id}`);
  }

  async createRelease(data: CreateRelease) {
    return this.request<Release>("/api/admin/releases", {
      method: "POST",
      body: data,
    });
  }

  async updateRelease(id: string, data: Partial<Release>) {
    return this.request<Release>(`/api/admin/releases/${id}`, {
      method: "PUT",
      body: data,
    });
  }

  async publishRelease(id: string) {
    return this.request<Release>(`/api/admin/releases/${id}/publish`, {
      method: "POST",
    });
  }

  async rollbackRelease(id: string) {
    return this.request<Release>(`/api/admin/releases/${id}/rollback`, {
      method: "POST",
    });
  }

  async deleteRelease(id: string) {
    return this.request(`/api/admin/releases/${id}`, {
      method: "DELETE",
    });
  }

  // ========================================================================
  // BUILDS
  // ========================================================================

  async getBuilds(params?: PaginationParams) {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));

    return this.request<{ success: boolean; data: Build[]; pagination: any }>(
      `/api/admin/builds?${query.toString()}`
    );
  }

  async getBuild(id: string) {
    return this.request<Build>(`/api/admin/builds/${id}`);
  }

  async createBuild(data: CreateBuild) {
    return this.request<Build>("/api/admin/builds", {
      method: "POST",
      body: data,
    });
  }

  async cancelBuild(id: string) {
    return this.request<Build>(`/api/admin/builds/${id}/cancel`, {
      method: "POST",
    });
  }

  async deleteBuild(id: string) {
    return this.request(`/api/admin/builds/${id}`, {
      method: "DELETE",
    });
  }

  // ========================================================================
  // SETTINGS
  // ========================================================================

  async getSettings() {
    return this.request<Record<string, Setting>>("/api/admin/settings");
  }

  async getSetting(key: string) {
    return this.request<Setting>(`/api/admin/settings/${key}`);
  }

  async updateSetting(key: string, data: UpdateSetting) {
    return this.request<Setting>(`/api/admin/settings/${key}`, {
      method: "PUT",
      body: data,
    });
  }

  // ========================================================================
  // FEATURE FLAGS
  // ========================================================================

  async getFeatureFlags() {
    return this.request<FeatureFlag[]>("/api/admin/feature-flags");
  }

  async getFeatureFlag(key: string) {
    return this.request<FeatureFlag>(`/api/admin/feature-flags/${key}`);
  }

  async updateFeatureFlag(key: string, data: UpdateFeatureFlag) {
    return this.request<FeatureFlag>(`/api/admin/feature-flags/${key}`, {
      method: "PUT",
      body: data,
    });
  }

  // ========================================================================
  // REMOTE CONFIG
  // ========================================================================

  async getRemoteConfigs() {
    return this.request<RemoteConfig[]>("/api/admin/remote-config");
  }

  async updateRemoteConfig(key: string, value: unknown) {
    return this.request<RemoteConfig>(`/api/admin/remote-config/${key}`, {
      method: "PUT",
      body: { value },
    });
  }

  // ========================================================================
  // USERS
  // ========================================================================

  async getUsers(params?: PaginationParams) {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));

    return this.request<{ success: boolean; data: AdminUser[]; pagination: any }>(
      `/api/admin/users?${query.toString()}`
    );
  }

  // ========================================================================
  // GYM MANAGEMENT
  // ========================================================================

  async getAthletes() {
    return this.request<{ success: boolean; data: Athlete[] }>("/api/admin/gym/athletes");
  }

  async getAthlete(id: string) {
    return this.request<{ success: boolean; data: Athlete & { measurements: Measurement[] } }>(
      `/api/admin/gym/athletes/${id}`
    );
  }

  async createAthlete(data: CreateAthlete) {
    return this.request<{ success: boolean; data: Athlete }>("/api/admin/gym/athletes", {
      method: "POST",
      body: data,
    });
  }

  async getAthleteRoutines(id: string) {
    return this.request<{ success: boolean; data: Routine[] }>(`/api/admin/gym/athletes/${id}/routines`);
  }

  async createAthleteRoutine(athleteId: string, data: CreateRoutine) {
    return this.request<{ success: boolean; data: Routine }>(
      `/api/admin/gym/athletes/${athleteId}/routines`,
      {
        method: "POST",
        body: data,
      }
    );
  }

  async updateAthleteRoutine(athleteId: string, routineId: string, data: CreateRoutine) {
    return this.request<{ success: boolean; data: Routine }>(
      `/api/admin/gym/athletes/${athleteId}/routines/${routineId}`,
      {
        method: "PUT",
        body: data,
      }
    );
  }

  async deleteAthleteRoutine(athleteId: string, routineId: string) {
    return this.request<{ success: boolean; message: string }>(
      `/api/admin/gym/athletes/${athleteId}/routines/${routineId}`,
      {
        method: "DELETE",
      }
    );
  }


  async addMeasurement(athleteId: string, data: CreateMeasurement) {
    return this.request<{ success: boolean; data: Measurement }>(
      `/api/admin/gym/athletes/${athleteId}/measurements`,
      {
        method: "POST",
        body: data,
      }
    );
  }

  async getExercises() {
    return this.request<{ success: boolean; data: Exercise[] }>("/api/admin/gym/exercises");
  }

  async createExercise(data: CreateExercise) {
    return this.request<{ success: boolean; data: Exercise }>("/api/admin/gym/exercises", {
      method: "POST",
      body: data,
    });
  }

  async updateExercise(id: string, data: Partial<CreateExercise>) {
    return this.request<{ success: boolean; data: Exercise }>(`/api/admin/gym/exercises/${id}`, {
      method: "PUT",
      body: data,
    });
  }

  async deleteExercise(id: string) {
    return this.request<{ success: boolean; message: string }>(`/api/admin/gym/exercises/${id}`, {
      method: "DELETE",
    });
  }

  async uploadFile(filename: string, base64Data: string) {
    return this.request<{ success: boolean; url: string }>("/api/admin/gym/upload", {
      method: "POST",
      body: { filename, file: base64Data },
    });
  }


  async getCoachDashboard() {
    return this.request<{ success: boolean; data: CoachDashboard }>("/api/admin/gym/coach/dashboard");
  }

  async getAthleteObservations(athleteId: string) {
    return this.request<{ success: boolean; data: AthleteObservation[] }>(
      `/api/admin/gym/athletes/${athleteId}/observations`
    );
  }

  async createAthleteObservation(athleteId: string, data: CreateAthleteObservation) {
    return this.request<{ success: boolean; data: { observation: AthleteObservation } }>(
      `/api/admin/gym/athletes/${athleteId}/observations`,
      {
        method: "POST",
        body: data,
      }
    );
  }

  async getUser(id: string) {
    return this.request<AdminUser>(`/api/admin/users/${id}`);
  }

  async createUser(data: CreateAdminUser) {
    return this.request<AdminUser>("/api/admin/users", {
      method: "POST",
      body: data,
    });
  }

  async updateUser(id: string, data: Partial<AdminUser>) {
    return this.request<AdminUser>(`/api/admin/users/${id}`, {
      method: "PUT",
      body: data,
    });
  }

  async deleteUser(id: string) {
    return this.request(`/api/admin/users/${id}`, {
      method: "DELETE",
    });
  }

  // ========================================================================
  // MONITORING
  // ========================================================================

  async getAuditLogs(params?: PaginationParams) {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));

    return this.request<{ success: boolean; data: AuditLog[]; pagination: any }>(
      `/api/admin/monitoring/audit-logs?${query.toString()}`
    );
  }

  async getErrorLogs(params?: PaginationParams & { source?: string }) {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));
    if (params?.source) query.append("source", params.source);

    return this.request<{ success: boolean; data: ErrorLog[]; pagination: any }>(
      `/api/admin/monitoring/error-logs?${query.toString()}`
    );
  }

  // ========================================================================
  // NOTIFICATIONS
  // ========================================================================

  async getNotifications(params?: PaginationParams) {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));

    return this.request<{ success: boolean; data: Notification[]; pagination: any }>(
      `/api/admin/notifications?${query.toString()}`
    );
  }

  async createNotification(data: CreateNotification) {
    return this.request<Notification>("/api/admin/notifications", {
      method: "POST",
      body: data,
    });
  }

  async sendNotification(id: string) {
    return this.request<Notification>(`/api/admin/notifications/${id}/send`, {
      method: "POST",
    });
  }
}

export default AdminApiClient;
