import { z } from "zod";

export const AthleteStatusEnum = z.enum(["activa", "por_vencer", "vencida", "cancelada"]);
export type AthleteStatus = z.infer<typeof AthleteStatusEnum>;

export const AthleteSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
  avatar: z.string().optional(),
  plan_status: AthleteStatusEnum,
  plan_expiry: z.date().nullable().optional(),
  weight_kg: z.string().nullable().optional(),
  body_fat_pct: z.string().nullable().optional(),
  created_at: z.date(),
});

export type Athlete = z.infer<typeof AthleteSchema>;

export const MeasurementSchema = z.object({
  id: z.string().uuid(),
  athlete_id: z.string().uuid(),
  date: z.date(),
  weight_kg: z.string(),
  body_fat_pct: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export type Measurement = z.infer<typeof MeasurementSchema>;

export const ExerciseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  muscle_group: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  video_url: z.string().nullable().optional(),
});

export type Exercise = z.infer<typeof ExerciseSchema>;

export const CreateExerciseSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  muscle_group: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  video_url: z.string().nullable().optional(),
});

export type CreateExercise = z.infer<typeof CreateExerciseSchema>;

export const RoutineExerciseSchema = z.object({
  id: z.string().uuid(),
  exercise_id: z.string().uuid(),
  name: z.string(),
  muscle_group: z.string().nullable().optional(),
  sets: z.number(),
  reps: z.string(),
  weight_kg: z.string().nullable().optional(),
  completed: z.boolean(),
  order: z.number(),
});

export type RoutineExercise = z.infer<typeof RoutineExerciseSchema>;

export const RoutineSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  day_of_week: z.number(),
  exercises: z.array(RoutineExerciseSchema),
});

export type Routine = z.infer<typeof RoutineSchema>;

export const CreateAthleteSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  plan_id: z.string().uuid().optional(),
  trainer_id: z.string().uuid().optional(),
});

export type CreateAthlete = z.infer<typeof CreateAthleteSchema>;

export const CreateMeasurementSchema = z.object({
  weight_kg: z.number(),
  body_fat_pct: z.number().optional(),
  notes: z.string().optional(),
});

export type CreateMeasurement = z.infer<typeof CreateMeasurementSchema>;

export const CreateRoutineExerciseSchema = z.object({
  exercise_id: z.string().uuid(),
  sets: z.number().min(1),
  reps: z.string().min(1),
  weight_kg: z.string().optional(),
  rest_seconds: z.number().min(0).optional(),
  order: z.number().min(0).optional(),
  name_override: z.string().optional(),
});

export type CreateRoutineExercise = z.infer<typeof CreateRoutineExerciseSchema>;

export const CreateRoutineSchema = z.object({
  name: z.string().min(2),
  day_of_week: z.number().min(1).max(7),
  exercises: z.array(CreateRoutineExerciseSchema).min(1),
});

export type CreateRoutine = z.infer<typeof CreateRoutineSchema>;

export const ObservationTypeEnum = z.enum(["Nota", "Alerta", "Progreso"]);

export const AthleteObservationSchema = z.object({
  id: z.string().uuid(),
  athlete_id: z.string().uuid(),
  trainer_id: z.string().uuid(),
  type: ObservationTypeEnum,
  content: z.string(),
  date: z.date(),
});

export type AthleteObservation = z.infer<typeof AthleteObservationSchema>;

export const CreateAthleteObservationSchema = z.object({
  type: ObservationTypeEnum.default("Nota"),
  content: z.string().min(1),
});

export type CreateAthleteObservation = z.infer<typeof CreateAthleteObservationSchema>;

export const CoachDashboardSchema = z.object({
  totals: z.object({
    roster: z.number(),
    active_today: z.number(),
    inactive_3d: z.number(),
    adherence_drop: z.number(),
    attention_required: z.number(),
  }),
  active_today: z.array(
    z.object({
      id: z.string().uuid(),
      name: z.string(),
      email: z.string().email(),
      plan_status: AthleteStatusEnum,
      updated_at: z.date(),
    })
  ),
  inactive_3d: z.array(
    z.object({
      id: z.string().uuid(),
      name: z.string(),
      email: z.string().email(),
      plan_status: AthleteStatusEnum,
      updated_at: z.date(),
    })
  ),
  adherence_drop: z.array(
    z.object({
      athlete_id: z.string().uuid(),
      athlete_name: z.string(),
      current_week_sessions: z.number(),
      previous_week_sessions: z.number(),
      has_drop: z.boolean(),
    })
  ),
  attention_required: z.array(
    z.object({
      id: z.string().uuid(),
      name: z.string(),
      reason: z.string(),
    })
  ),
  recent_sessions: z.array(
    z.object({
      id: z.string().uuid(),
      athlete_id: z.string().uuid(),
      athlete_name: z.string(),
      date: z.date(),
      time: z.string().nullable().optional(),
    })
  ),
  recent_feedbacks: z.array(
    z.object({
      id: z.string().uuid(),
      athlete_id: z.string().uuid(),
      athlete_name: z.string(),
      type: ObservationTypeEnum,
      content: z.string(),
      date: z.date(),
    })
  ),
});

export type CoachDashboard = z.infer<typeof CoachDashboardSchema>;
