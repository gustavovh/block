import AsyncStorage from "@react-native-async-storage/async-storage";
import { Measurement, Notification, Routine, User } from "@/types";
import { enqueueSyncAction, flushSyncQueue, getSyncQueueLength } from "@/lib/syncQueue";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? (__DEV__ ? "http://localhost:3001" : "");
const REQUEST_TIMEOUT_MS = 20000; // Increased to 20 seconds to robustly support Render cold starts


if (!BASE_URL) {
  throw new Error("EXPO_PUBLIC_API_URL is required for production builds");
}

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  error?: string;
  timestamp?: string;
};

type RawUser = {
  id: string;
  name: string;
  email?: string;
  avatar?: string | null;
  plan_status?: User["planStatus"];
  plan_expiry?: string | null;
  trainer_id?: string | null;
  plan_id?: string | null;
  weight_kg?: string | number | null;
  body_fat_pct?: string | number | null;
};

type RawRoutine = {
  id: string;
  athlete_id?: string;
  day_of_week?: number;
  dayOfWeek?: number;
  name: string;
  trainer_id?: string;
  trainerId?: string;
  exercises: Array<{
    id: string;
    exerciseId: string;
    name?: string | null;
    sets: number;
    reps: string;
    weightKg?: string | null;
    restSeconds?: number | null;
    notes?: string[] | null;
    completed: boolean;
    media?: {
      url?: string | null;
      type?: "image" | "video" | null;
    } | null;
  }>;
};

type RawMeasurement = {
  id: string;
  athlete_id?: string;
  date: string;
  weight_kg: string | number;
  body_fat_pct?: string | number | null;
};

type RawNotification = {
  id: string;
  type: "Nota" | "Alerta" | "Progreso";
  content: string;
  date: string;
  trainer_name?: string | null;
};

function normalizeNumber(value?: string | number | null): number | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }

  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function mapUser(raw: RawUser): User {
  return {
    id: raw.id,
    name: raw.name,
    avatar: raw.avatar ?? undefined,
    planStatus: raw.plan_status ?? "activa",
    planExpiry: raw.plan_expiry ?? undefined,
    trainerId: raw.trainer_id ?? undefined,
    planId: raw.plan_id ?? undefined,
    weightKg: normalizeNumber(raw.weight_kg),
    bodyFatPct: normalizeNumber(raw.body_fat_pct),
  };
}

function mapRoutine(raw: RawRoutine): Routine {
  return {
    id: raw.id,
    name: raw.name,
    userId: raw.athlete_id ?? "",
    dayOfWeek: Number(raw.dayOfWeek ?? raw.day_of_week ?? 1),
    trainerId: raw.trainerId ?? raw.trainer_id ?? "",
    exercises: raw.exercises.map((exercise) => ({
      id: exercise.id,
      exerciseId: exercise.exerciseId,
      name: exercise.name ?? undefined,
      sets: exercise.sets,
      reps: exercise.reps,
      weightKg: exercise.weightKg ?? undefined,
      restSeconds: exercise.restSeconds ?? undefined,
      notes: exercise.notes ?? undefined,
      completed: Boolean(exercise.completed),
      media: exercise.media?.url
        ? {
            type: (exercise.media.type ?? "image") as "image" | "video",
            url: (() => {
              let url = exercise.media.url;
              if (url.startsWith("http") && url.includes("localhost")) {
                url = url.replace(/localhost:\d+/, BASE_URL.replace("http://", "").replace("https://", ""));
              }
              // Force HTTPS for non-localhost/non-IP URLs to bypass mobile cleartext blocks (especially on iOS/Android for Render domains)
              if (url.startsWith("http:") && !url.includes("localhost") && !url.includes("127.0.0.1") && !url.includes("192.168.")) {
                url = url.replace(/^http:/i, "https:");
              }
              return url;
            })(),
          }
        : undefined,
    })),
  };
}

function mapMeasurement(raw: RawMeasurement): Measurement {
  return {
    id: raw.id,
    userId: raw.athlete_id ?? "",
    date: raw.date,
    weightKg: normalizeNumber(raw.weight_kg) ?? 0,
    bodyFatPct: normalizeNumber(raw.body_fat_pct) ?? 0,
  };
}

function mapNotification(raw: RawNotification): Notification {
  const typeMap: Record<RawNotification["type"], Notification["type"]> = {
    Nota: "routine",
    Alerta: "alert",
    Progreso: "progress",
  };

  const titleMap: Record<RawNotification["type"], string> = {
    Nota: "Tu entrenador dejo una nota",
    Alerta: "Recordatorio de seguimiento",
    Progreso: "Tu entrenador reviso tu sesion",
  };

  const trainerName = raw.trainer_name ? `${raw.trainer_name}: ` : "";

  return {
    id: raw.id,
    userId: "",
    type: typeMap[raw.type],
    title: titleMap[raw.type],
    message: `${trainerName}${raw.content}`,
    date: raw.date,
    read: false,
  };
}

async function rawRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const token = await AsyncStorage.getItem("atleta_token");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await rawRequest(endpoint, options);
  const text = await response.text();
  const data = text
    ? (() => {
        try {
          return JSON.parse(text);
        } catch {
          return { error: text };
        }
      })()
    : {};

  if (!response.ok) {
    if (response.status === 401) {
      // Clear storage keys on unauthorized access to force re-login instead of staying stuck
      AsyncStorage.multiRemove(["atleta_token", "atleta_id", "atleta_user"]).catch(() => {});
    }
    throw new Error(data.error || "API Error");
  }

  return data;
}

function isNetworkFailure(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();
  return (
    message.includes("network") ||
    message.includes("abort") ||
    message.includes("timeout") ||
    message.includes("failed to fetch")
  );
}

type OfflineMutationResult<T> = T & { queued?: boolean; queue_size?: number };

async function mutationWithOfflineQueue<T extends ApiEnvelope<unknown>>(
  endpoint: string,
  method: "POST" | "PUT" | "PATCH" | "DELETE",
  body?: unknown
): Promise<OfflineMutationResult<T>> {
  try {
    const response = await apiFetch<T>(endpoint, {
      method,
      body: body ? JSON.stringify(body) : undefined,
    });

    return response;
  } catch (error) {
    if (!isNetworkFailure(error)) {
      throw error;
    }

    await enqueueSyncAction(endpoint, method, body);
    const pending = await getSyncQueueLength();

    return {
      success: true,
      data: null,
      queued: true,
      queue_size: pending,
    } as unknown as OfflineMutationResult<T>;
  }
}

export const gymApi = {
  login: (email: string, password: string) =>
    apiFetch<ApiEnvelope<{ access_token: string; user: { id: string; name: string } }>>(
      "/api/atleta/auth/login",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }
    ),

  forgotPassword: (email: string) =>
    apiFetch<ApiEnvelope<{ message: string }>>("/api/atleta/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token: string, newPassword: string) =>
    apiFetch<ApiEnvelope<{ message: string }>>("/api/atleta/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, newPassword }),
    }),

  getMe: async () => {
    const response = await apiFetch<ApiEnvelope<RawUser>>("/api/atleta/me");
    return {
      ...response,
      data: mapUser(response.data),
    };
  },

  getRoutines: async () => {
    const response = await apiFetch<ApiEnvelope<RawRoutine[]>>("/api/atleta/routines");
    return {
      ...response,
      data: response.data.map(mapRoutine),
    };
  },

  getProfile: async () => gymApi.getMe(),

  getMeasurements: async () => {
    const response = await apiFetch<ApiEnvelope<RawMeasurement[]>>(
      "/api/atleta/measurements"
    );
    return {
      ...response,
      data: response.data.map(mapMeasurement),
    };
  },

  getProgress: () => apiFetch<ApiEnvelope<unknown>>("/api/atleta/progress"),

  getNotifications: async () => {
    const response = await apiFetch<ApiEnvelope<RawNotification[]>>(
      "/api/atleta/notifications"
    );
    return {
      ...response,
      data: response.data.map(mapNotification),
    };
  },

  markComplete: (routineExerciseId: string, completed: boolean) =>
    mutationWithOfflineQueue<ApiEnvelope<null>>("/api/atleta/routines/complete", "POST", {
      routineExerciseId,
      completed,
    }),

  flushPendingSync: () => flushSyncQueue(BASE_URL),
};
