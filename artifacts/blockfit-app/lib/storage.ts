import AsyncStorage from "@react-native-async-storage/async-storage";
import { User, Trainer, Admin, Plan, Exercise, Routine, Measurement, Attendance, Payment, Notification, Observation } from "@/types";
import * as MockData from "./mockData";

const KEYS = {
  SEEDED: "blockfit_seeded",
  USERS: "blockfit_users",
  TRAINERS: "blockfit_trainers",
  ADMINS: "blockfit_admins",
  PLANS: "blockfit_plans",
  EXERCISES: "blockfit_exercises",
  ROUTINES: "blockfit_routines",
  MEASUREMENTS: "blockfit_measurements",
  ATTENDANCE: "blockfit_attendance",
  PAYMENTS: "blockfit_payments",
  NOTIFICATIONS: "blockfit_notifications",
  OBSERVATIONS: "blockfit_observations",
};

export async function initStorage() {
  const seeded = await AsyncStorage.getItem(KEYS.SEEDED);
  if (!seeded) {
    await AsyncStorage.multiSet([
      [KEYS.USERS, JSON.stringify(MockData.MOCK_USERS)],
      [KEYS.TRAINERS, JSON.stringify(MockData.MOCK_TRAINERS)],
      [KEYS.ADMINS, JSON.stringify([MockData.MOCK_ADMIN])],
      [KEYS.PLANS, JSON.stringify(MockData.MOCK_PLANS)],
      [KEYS.EXERCISES, JSON.stringify(MockData.MOCK_EXERCISES)],
      [KEYS.ROUTINES, JSON.stringify(MockData.MOCK_ROUTINES)],
      [KEYS.MEASUREMENTS, JSON.stringify(MockData.MOCK_MEASUREMENTS)],
      [KEYS.ATTENDANCE, JSON.stringify(MockData.MOCK_ATTENDANCE)],
      [KEYS.PAYMENTS, JSON.stringify(MockData.MOCK_PAYMENTS)],
      [KEYS.NOTIFICATIONS, JSON.stringify(MockData.MOCK_NOTIFICATIONS)],
      [KEYS.OBSERVATIONS, JSON.stringify(MockData.MOCK_OBSERVATIONS)],
      [KEYS.SEEDED, "true"],
    ]);
  }
}

async function get<T>(key: string): Promise<T[]> {
  const data = await AsyncStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

async function set<T>(key: string, data: T[]): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(data));
}

// Users
export const getUsers = () => get<User>(KEYS.USERS);
export const getUser = async (id: string) => (await getUsers()).find(u => u.id === id);
export const updateUser = async (id: string, patch: Partial<User>) => {
  const users = await getUsers();
  await set(KEYS.USERS, users.map(u => u.id === id ? { ...u, ...patch } : u));
};

// Trainers
export const getTrainers = () => get<Trainer>(KEYS.TRAINERS);

// Plans
export const getPlans = () => get<Plan>(KEYS.PLANS);

// Routines
export const getRoutines = () => get<Routine>(KEYS.ROUTINES);
export const getRoutinesForUser = async (userId: string) => (await getRoutines()).filter(r => r.userId === userId);
export const markExerciseComplete = async (routineId: string, exerciseId: string, completed: boolean) => {
  const routines = await getRoutines();
  await set(KEYS.ROUTINES, routines.map(r => {
    if (r.id === routineId) {
      return { ...r, exercises: r.exercises.map(e => e.id === exerciseId ? { ...e, completed } : e) };
    }
    return r;
  }));
};

// Measurements
export const getMeasurements = async (userId: string) => (await get<Measurement>(KEYS.MEASUREMENTS)).filter(m => m.userId === userId);
export const addMeasurement = async (measurement: Measurement) => {
  const measurements = await get<Measurement>(KEYS.MEASUREMENTS);
  await set(KEYS.MEASUREMENTS, [...measurements, measurement]);
};

// Attendance
export const getAttendance = () => get<Attendance>(KEYS.ATTENDANCE);
export const recordAttendance = async (attendance: Attendance) => {
  const records = await getAttendance();
  await set(KEYS.ATTENDANCE, [...records, attendance]);
};

// Payments
export const getPayments = () => get<Payment>(KEYS.PAYMENTS);

// Notifications
export const getNotifications = async (userId: string) => (await get<Notification>(KEYS.NOTIFICATIONS)).filter(n => n.userId === userId);

// Observations
export const getObservations = () => get<Observation>(KEYS.OBSERVATIONS);
export const addObservation = async (observation: Observation) => {
  const obs = await getObservations();
  await set(KEYS.OBSERVATIONS, [...obs, observation]);
};
