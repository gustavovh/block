import { User, Trainer, Admin, Plan, Exercise, Routine, Measurement, Attendance, Payment, Notification, Observation } from "@/types";

export const MOCK_ADMIN: Admin = { id: "a1", name: "blockfit", role: "admin", avatar: "BF" };

export const MOCK_TRAINERS: Trainer[] = [
  { id: "t1", name: "Roberto Entrenador", role: "trainer", avatar: "RE", specialty: "Hipertrofia" },
  { id: "t2", name: "Laura Fit", role: "trainer", avatar: "LF", specialty: "Crossfit" },
];

export const MOCK_PLANS: Plan[] = [
  { id: "p1", name: "Mensual", durationDays: 30, price: 50, benefits: ["Acceso libre", "Rutina básica"] },
  { id: "p2", name: "Trimestral", durationDays: 90, price: 135, benefits: ["Acceso libre", "Rutina personalizada", "1 Medición mensual"], featured: true },
  { id: "p3", name: "Anual", durationDays: 365, price: 450, benefits: ["Acceso ilimitado", "Nutrición", "Seguimiento semanal"] },
];

export const MOCK_USERS: User[] = [
  { id: "u1", name: "Alejandro Cliente", role: "user", avatar: "AC", planId: "p2", planStatus: "activa", planExpiry: new Date(Date.now() + 86400000 * 15).toISOString(), trainerId: "t1", weightKg: 78, bodyFatPct: 18 },
  { id: "u2", name: "Sofía Martínez", role: "user", avatar: "SM", planId: "p1", planStatus: "por_vencer", planExpiry: new Date(Date.now() + 86400000 * 2).toISOString(), trainerId: "t2", weightKg: 62, bodyFatPct: 22 },
  { id: "u3", name: "Diego López", role: "user", avatar: "DL", planId: "p3", planStatus: "activa", planExpiry: new Date(Date.now() + 86400000 * 200).toISOString(), trainerId: "t1", weightKg: 85, bodyFatPct: 15 },
  { id: "u4", name: "Valentina Gómez", role: "user", avatar: "VG", planId: "p1", planStatus: "vencida", planExpiry: new Date(Date.now() - 86400000 * 5).toISOString(), trainerId: "t2", weightKg: 58, bodyFatPct: 20 },
  { id: "u5", name: "Mateo Rodríguez", role: "user", avatar: "MR", planId: "p2", planStatus: "activa", planExpiry: new Date(Date.now() + 86400000 * 45).toISOString(), trainerId: "t1", weightKg: 70, bodyFatPct: 16 },
  { id: "u6", name: "Isabella Fernández", role: "user", avatar: "IF", planId: "p1", planStatus: "activa", planExpiry: new Date(Date.now() + 86400000 * 20).toISOString(), trainerId: "t2", weightKg: 65, bodyFatPct: 24 },
  { id: "u7", name: "Joaquín Pérez", role: "user", avatar: "JP", planId: "p3", planStatus: "activa", planExpiry: new Date(Date.now() + 86400000 * 150).toISOString(), trainerId: "t1", weightKg: 90, bodyFatPct: 12 },
  { id: "u8", name: "Camila Sánchez", role: "user", avatar: "CS", planId: "p2", planStatus: "por_vencer", planExpiry: new Date(Date.now() + 86400000 * 4).toISOString(), trainerId: "t2", weightKg: 55, bodyFatPct: 19 },
];

export const MOCK_EXERCISES: Exercise[] = [
  { id: "e1", name: "Sentadilla Libre", muscleGroup: "Piernas", defaultSets: 4, defaultReps: 10 },
  { id: "e2", name: "Press de Banca", muscleGroup: "Pecho", defaultSets: 4, defaultReps: 10 },
  { id: "e3", name: "Peso Muerto", muscleGroup: "Espalda", defaultSets: 4, defaultReps: 8 },
  { id: "e4", name: "Dominadas", muscleGroup: "Espalda", defaultSets: 4, defaultReps: 10 },
  { id: "e5", name: "Press Militar", muscleGroup: "Hombros", defaultSets: 3, defaultReps: 12 },
  { id: "e6", name: "Curl de Bíceps", muscleGroup: "Brazos", defaultSets: 3, defaultReps: 15 },
  { id: "e7", name: "Extensión de Tríceps", muscleGroup: "Brazos", defaultSets: 3, defaultReps: 15 },
  { id: "e8", name: "Zancadas", muscleGroup: "Piernas", defaultSets: 3, defaultReps: 12 },
  { id: "e9", name: "Elevación de Talones", muscleGroup: "Piernas", defaultSets: 4, defaultReps: 20 },
  { id: "e10", name: "Plancha", muscleGroup: "Core", defaultSets: 3, defaultReps: 60 },
];

// Seed routines for u1
export const MOCK_ROUTINES: Routine[] = [
  {
    id: "r1",
    userId: "u1",
    name: "Lunes — Pecho + Tríceps",
    dayOfWeek: 1,
    trainerId: "t1",
    exercises: [
      { 
        id: "re1", 
        exerciseId: "e1", 
        name: "Press banca",
        sets: 4, 
        reps: "8-10", 
        weightKg: "70", 
        restSeconds: 90, 
        completed: true, 
        notes: ["Mantener retracción escapular", "Bajar controlado"],
        media: { type: "image", url: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=400&auto=format&fit=crop" }
      },
      { 
        id: "re2", 
        exerciseId: "e2", 
        name: "EXTENSION DE PIERNA",
        sets: 3, 
        reps: "12 + dropset de 8", 
        weightKg: "32, 36, 41", 
        restSeconds: 60, 
        completed: false,
        notes: [
          "Mantener 1 seg arriba",
          "Última parte sin descanso (bajar peso)",
          "Descanso: 60 seg",
          "En la descarga sin descanso"
        ],
        media: { type: "image", url: "https://images.unsplash.com/photo-1590239926044-245803274294?q=80&w=400&auto=format&fit=crop" }
      },
    ],
  },
  {
    id: "r2",
    userId: "u1",
    name: "Día de Pecho",
    dayOfWeek: 2,
    trainerId: "t1",
    exercises: [
      { id: "re3", exerciseId: "e2", sets: 4, reps: "10", weightKg: "80", restSeconds: 90, completed: false },
      { id: "re4", exerciseId: "e7", sets: 3, reps: "15", weightKg: "20", restSeconds: 60, completed: false },
    ],
  }
];

export const MOCK_MEASUREMENTS: Measurement[] = [
  { id: "m1", userId: "u1", date: new Date(Date.now() - 86400000 * 30).toISOString(), weightKg: 80, bodyFatPct: 20 },
  { id: "m2", userId: "u1", date: new Date().toISOString(), weightKg: 78, bodyFatPct: 18 },
];

export const MOCK_ATTENDANCE: Attendance[] = [
  { id: "at1", userId: "u1", date: new Date().toISOString().split("T")[0], time: "08:00" },
  { id: "at2", userId: "u1", date: new Date(Date.now() - 86400000).toISOString().split("T")[0], time: "09:00" },
];

export const MOCK_PAYMENTS: Payment[] = [
  { id: "py1", userId: "u1", amount: 50, date: new Date(Date.now() - 86400000 * 15).toISOString(), dueDate: new Date(Date.now() - 86400000 * 15).toISOString(), status: "paid", planId: "p1" },
  { id: "py2", userId: "u2", amount: 50, date: "", dueDate: new Date(Date.now() + 86400000 * 2).toISOString(), status: "pending", planId: "p1" },
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: "n1", userId: "u1", type: "alert", title: "Bienvenido", message: "Tu membresía está activa en el centro de BLOCK.", date: new Date().toISOString(), read: false },
];

export const MOCK_OBSERVATIONS: Observation[] = [
  { id: "o1", trainerId: "t1", userId: "u1", type: "Nota", content: "Buen progreso en sentadilla.", date: new Date().toISOString() },
];
