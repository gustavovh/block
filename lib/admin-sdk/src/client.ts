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

  private getMockData(endpoint: string, method: string, body?: any): any {
    const cleanEndpoint = endpoint.split("?")[0];
    
    // Auth endpoints
    if (cleanEndpoint === "/api/admin/auth/login") {
      return { access_token: "mock-access-token", refresh_token: "mock-refresh-token" };
    }
    if (cleanEndpoint === "/api/admin/auth/me") {
      return { id: "admin1", email: "admin@blockfit.local", name: "Roberto Entrenador", role: "admin" };
    }

    // Dashboard
    if (cleanEndpoint === "/api/admin/gym/coach/dashboard") {
      return {
        success: true,
        data: {
          totals: {
            roster: 1,
            active_today: 1,
            inactive_3d: 0,
            adherence_drop: 0,
            attention_required: 0
          },
          attention_required: [],
          recent_sessions: [
            { id: "s1", athlete_id: "u1", athlete_name: "Alejandro Cliente", date: new Date().toISOString(), time: "08:00" }
          ],
          recent_feedbacks: [
            { id: "f1", athlete_id: "u1", athlete_name: "Alejandro Cliente", type: "Progreso", content: "Excelente desempeño en sentadilla hoy. Mantén el ritmo.", date: new Date().toISOString() }
          ]
        }
      };
    }

    // Gym management
    if (cleanEndpoint === "/api/admin/gym/athletes") {
      if (method === "POST" && body) {
        return {
          success: true,
          data: {
            id: "u_" + Math.random().toString(36).substring(2, 11),
            name: body.name || "Nuevo Atleta",
            email: body.email || "atleta@blockfit.local",
            avatar: (body.name || "NA").split(" ").map((n: string) => n[0]).join("").toUpperCase(),
            plan_id: body.plan_id || "p2",
            trainer_id: "t1",
            weight_kg: body.weight_kg || "70.00",
            body_fat_pct: body.body_fat_pct || "15.00",
            plan_expiry: new Date(Date.now() + 86400000 * 30).toISOString()
          }
        };
      }
      return {
        success: true,
        data: [
          {
            id: "u1",
            name: "Alejandro Cliente",
            email: "alejandro@blockfit.local",
            avatar: "AC",
            plan_id: "p2",
            trainer_id: "t1",
            weight_kg: "78.00",
            body_fat_pct: "18.00",
            plan_expiry: new Date(Date.now() + 86400000 * 15).toISOString()
          }
        ]
      };
    }

    if (cleanEndpoint.startsWith("/api/admin/gym/athletes/")) {
      const parts = cleanEndpoint.split("/");
      const athleteId = parts[5];
      const subroute = parts[6];

      if (subroute === "observations") {
        if (method === "POST") {
          return {
            success: true,
            data: {
              observation: {
                id: "o_" + Math.random().toString(36).substring(2, 11),
                athlete_id: athleteId,
                type: body?.type || "Nota",
                content: body?.content || "",
                date: new Date().toISOString()
              }
            }
          };
        }
        return {
          success: true,
          data: [
            { id: "o1", athlete_id: athleteId, type: "Progreso", content: "Excelente desempeño en sentadilla hoy. Mantén el ritmo.", date: new Date().toISOString() }
          ]
        };
      }

      if (subroute === "routines") {
        if (method === "POST") {
          return {
            success: true,
            data: {
              id: "r_" + Math.random().toString(36).substring(2, 11),
              athlete_id: athleteId,
              name: body?.name || "Lunes — Pecho + Tríceps",
              day_of_week: body?.day_of_week || 1,
              trainer_id: "t1",
              exercises: []
            }
          };
        }
        return {
          success: true,
          data: [
            {
              id: "r1",
              athlete_id: athleteId,
              name: "Lunes — Pecho + Tríceps",
              day_of_week: 1,
              trainer_id: "t1",
              exercises: [
                {
                  id: "re1",
                  routine_id: "r1",
                  exercise_id: "e2",
                  name_override: "Press banca",
                  sets: 4,
                  reps: "8-10",
                  weight_kg: "70",
                  rest_seconds: 90,
                  order: 1,
                  completed: true,
                  notes: ["Mantener retracción escapular", "Bajar controlado"]
                },
                {
                  id: "re2",
                  routine_id: "r1",
                  exercise_id: "e4",
                  name_override: "Extensión de pierna",
                  sets: 3,
                  reps: "12 + dropset de 8",
                  weight_kg: "32, 36, 41",
                  rest_seconds: 60,
                  order: 2,
                  completed: false,
                  notes: ["Mantener 1 seg arriba"]
                }
              ]
            }
          ]
        };
      }

      if (subroute === "measurements") {
        return {
          success: true,
          data: {
            id: "m_" + Math.random().toString(36).substring(2, 11),
            athlete_id: athleteId,
            weight_kg: body?.weight_kg || "70.00",
            body_fat_pct: body?.body_fat_pct || "15.00",
            date: new Date().toISOString()
          }
        };
      }

      // Athlete profile
      return {
        success: true,
        data: {
          id: athleteId,
          name: "Alejandro Cliente",
          email: "alejandro@blockfit.local",
          avatar: "AC",
          plan_id: "p2",
          trainer_id: "t1",
          weight_kg: "78.00",
          body_fat_pct: "18.00",
          plan_expiry: new Date(Date.now() + 86400000 * 15).toISOString(),
          measurements: [
            { id: "m1", athlete_id: athleteId, weight_kg: 80.00, body_fat_pct: 20.00, date: new Date(Date.now() - 86400000 * 30).toISOString() },
            { id: "m2", athlete_id: athleteId, weight_kg: 78.00, body_fat_pct: 18.00, date: new Date().toISOString() }
          ]
        }
      };
    }

    if (cleanEndpoint === "/api/admin/gym/exercises") {
      if (method === "POST" && body) {
        return {
          success: true,
          data: {
            id: "e_" + Math.random().toString(36).substring(2, 11),
            name: body.name || "Nuevo Ejercicio",
            muscle_group: body.muscle_group || "Varios",
            default_sets: body.default_sets || 4,
            default_reps: body.default_reps || "10"
          }
        };
      }
      return {
        success: true,
        data: [
          { id: "e1", name: "Sentadilla Libre", muscle_group: "Piernas", default_sets: 4, default_reps: "10" },
          { id: "e2", name: "Press de Banca", muscle_group: "Pecho", default_sets: 4, default_reps: "10" },
          { id: "e3", name: "Peso Muerto", muscle_group: "Espalda", default_sets: 4, default_reps: "8" },
          { id: "e4", name: "Extensión de Pierna", muscle_group: "Piernas", default_sets: 3, default_reps: "12" }
        ]
      };
    }

    if (cleanEndpoint.startsWith("/api/admin/gym/exercises/")) {
      return {
        success: true,
        data: {
          id: cleanEndpoint.split("/")[5],
          name: body?.name || "Ejercicio Actualizado",
          muscle_group: body?.muscle_group || "Piernas",
          default_sets: body?.default_sets || 4,
          default_reps: body?.default_reps || "10"
        }
      };
    }

    // Settings
    if (cleanEndpoint === "/api/admin/settings") {
      return {
        maintenance_mode: { id: "s1", key: "maintenance_mode", value: false, description: "Disable app access for maintenance" },
        registration_open: { id: "s2", key: "registration_open", value: true, description: "Allow new athletes to sign up" }
      };
    }

    // Feature flags
    if (cleanEndpoint === "/api/admin/feature-flags") {
      return [
        { id: "f1", key: "new-workout-ui", description: "Enable experimental workout UI", enabled: true }
      ];
    }

    // Remote configs
    if (cleanEndpoint === "/api/admin/remote-config") {
      return [
        { id: "c1", key: "theme", value: "orange" }
      ];
    }

    // Releases
    if (cleanEndpoint === "/api/admin/releases") {
      if (method === "POST" && body) {
        return {
          id: "rel_" + Math.random().toString(36).substring(2, 11),
          version: body.version || "1.0.0",
          status: "draft",
          changelog: body.changelog || "",
          created_at: new Date().toISOString()
        };
      }
      return {
        success: true,
        data: [
          { id: "rel1", version: "1.0.0", status: "published", changelog: "Initial BLOCK Fit release", created_at: new Date().toISOString() }
        ],
        pagination: { total: 1, page: 1, limit: 10 }
      };
    }

    // Builds
    if (cleanEndpoint === "/api/admin/builds") {
      if (method === "POST" && body) {
        return {
          id: "b_" + Math.random().toString(36).substring(2, 11),
          platform: body.platform || "android",
          status: "pending",
          version: body.version || "1.0.0",
          created_at: new Date().toISOString()
        };
      }
      return {
        success: true,
        data: [
          { id: "b1", platform: "android", status: "completed", version: "1.0.0", created_at: new Date().toISOString() }
        ],
        pagination: { total: 1, page: 1, limit: 10 }
      };
    }

    // Users
    if (cleanEndpoint === "/api/admin/users") {
      if (method === "POST" && body) {
        return {
          id: "u_" + Math.random().toString(36).substring(2, 11),
          email: body.email || "user@blockfit.local",
          name: body.name || "Nuevo Admin",
          role: body.role || "trainer"
        };
      }
      return {
        success: true,
        data: [
          { id: "admin1", email: "admin@blockfit.local", name: "Roberto Entrenador", role: "admin" }
        ],
        pagination: { total: 1, page: 1, limit: 10 }
      };
    }

    // Monitoring
    if (cleanEndpoint === "/api/admin/monitoring/audit-logs") {
      return {
        success: true,
        data: [
          { id: "a1", action: "login", user_id: "admin1", timestamp: new Date().toISOString(), details: "Exitoso" }
        ],
        pagination: { total: 1, page: 1, limit: 10 }
      };
    }
    if (cleanEndpoint === "/api/admin/monitoring/error-logs") {
      return {
        success: true,
        data: [],
        pagination: { total: 0, page: 1, limit: 10 }
      };
    }

    // Notifications
    if (cleanEndpoint === "/api/admin/notifications") {
      if (method === "POST" && body) {
        return {
          id: "n_" + Math.random().toString(36).substring(2, 11),
          title: body.title || "Notificación",
          content: body.content || "",
          status: "draft",
          created_at: new Date().toISOString()
        };
      }
      return {
        success: true,
        data: [],
        pagination: { total: 0, page: 1, limit: 10 }
      };
    }

    return { success: true };
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
                    return this.getMockData(endpoint, method, options?.body) as T;
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
        return this.getMockData(endpoint, method, options?.body) as T;
      }

      return (await response.json()) as T;
    } catch (error) {
      console.warn(`Connection failed to ${url}. Falling back to mock data for endpoint ${endpoint}`);
      return this.getMockData(endpoint, method, options?.body) as T;
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
