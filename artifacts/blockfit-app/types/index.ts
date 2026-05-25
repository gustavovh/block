export interface User {
  id: string;
  name: string;
  role?: "user";
  avatar?: string;
  trainerId?: string;
  planId?: string;
  planStatus: "activa" | "por_vencer" | "vencida" | "cancelada";
  planExpiry?: string;
  weightKg?: number;
  bodyFatPct?: number;
}

export interface Trainer {
  id: string;
  name: string;
  role: "trainer";
  avatar?: string;
  specialty?: string;
}

export interface Admin {
  id: string;
  name: string;
  role: "admin";
  avatar?: string;
}

export interface Plan {
  id: string;
  name: string;
  durationDays: number;
  price: number;
  benefits: string[];
  featured?: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  defaultSets: number;
  defaultReps: number;
  videoUrl?: string;
}

export interface RoutineExercise {
  id: string;
  exerciseId: string;
  name?: string;
  sets: number;
  reps: string; // Changed to string to support "12 + dropset of 8"
  weightKg?: string; // Changed to string to support "32 / 36 / 41 kg"
  restSeconds?: number;
  notes?: string[];
  completed: boolean;
  media?: {
    type: "image" | "video";
    url: string;
  };
}

export interface Routine {
  id: string;
  userId: string;
  name: string;
  dayOfWeek: number; // 1 = Monday, 7 = Sunday
  exercises: RoutineExercise[];
  trainerId: string;
}

export interface Measurement {
  id: string;
  userId: string;
  date: string;
  weightKg: number;
  bodyFatPct: number;
  muscleMassKg?: number;
  waistCm?: number;
  chestCm?: number;
  armCm?: number;
  legCm?: number;
}

export interface Attendance {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
}

export interface Payment {
  id: string;
  userId: string;
  amount: number;
  date: string;
  dueDate: string;
  status: "paid" | "pending" | "overdue";
  planId: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: "alert" | "payment" | "routine" | "progress" | "reminder";
  title: string;
  message: string;
  date: string;
  read: boolean;
}

export interface Observation {
  id: string;
  trainerId: string;
  userId: string;
  type: "Nota" | "Lesión" | "Avance";
  content: string;
  date: string;
}
