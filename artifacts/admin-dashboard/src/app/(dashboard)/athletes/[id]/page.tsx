"use client";

import { useEffect, useState, use } from "react";
import { 
  ArrowLeft, 
  Activity, 
  Target, 
  Calendar, 
  Plus, 
  ChevronRight,
  TrendingUp,
  Weight,
  Dumbbell,
  MessageSquare,
  Trash2,
  Edit2,
  Save,
  X
} from "lucide-react";
import Link from "next/link";
import { useAdminApi } from "@/hooks/useApi";
import type { Athlete, Measurement, Routine, Exercise } from "@workspace/admin-sdk";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell
} from "recharts";

export default function AthleteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [athlete, setAthlete] = useState<(Athlete & { measurements: Measurement[] }) | null>(null);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [savingRoutine, setSavingRoutine] = useState(false);
  const [routineError, setRoutineError] = useState<string | null>(null);
  const [observations, setObservations] = useState<Array<{ id: string; type: string; content: string; date: string }>>([]);
  const [observationText, setObservationText] = useState("");
  const [observationType, setObservationType] = useState<"Nota" | "Alerta" | "Progreso">("Progreso");
  const [savingObservation, setSavingObservation] = useState(false);
  const [observationError, setObservationError] = useState<string | null>(null);
  
  // Measurement state
  const [showMeasurementModal, setShowMeasurementModal] = useState(false);
  const [savingMeasurement, setSavingMeasurement] = useState(false);
  const [measurementError, setMeasurementError] = useState<string | null>(null);
  const [measurementForm, setMeasurementForm] = useState({
    weight_kg: "",
    body_fat_pct: "",
  });

  const [routineForm, setRoutineForm] = useState({
    name: "",
    day_of_week: 1,
    exercises: [{ exercise_id: "", sets: 3, reps: "12" }],
  });

  // Manage and Edit Routines state
  const [showManageModal, setShowManageModal] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null);
  const [editRoutineForm, setEditRoutineForm] = useState<{
    id: string;
    name: string;
    day_of_week: number;
    exercises: Array<{ exercise_id: string; sets: number; reps: string; weight_kg?: string }>;
  }>({
    id: "",
    name: "",
    day_of_week: 1,
    exercises: [{ exercise_id: "", sets: 3, reps: "12" }],
  });
  const [savingEditRoutine, setSavingEditRoutine] = useState(false);
  const [deletingRoutineId, setDeletingRoutineId] = useState<string | null>(null);
  const [editRoutineError, setEditRoutineError] = useState<string | null>(null);

  // Update Plan feedback state
  const [updatingPlan, setUpdatingPlan] = useState(false);
  const [planSuccess, setPlanSuccess] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const api = useAdminApi();

  const updateEditRoutineExercise = (index: number, field: string, value: string) => {
    setEditRoutineForm((prev) => {
      const nextItems = [...prev.exercises];
      const current = { ...nextItems[index] } as any;
      current[field] = field === "sets" ? Number(value) : value;
      nextItems[index] = current;
      return { ...prev, exercises: nextItems };
    });
  };

  const addEditRoutineExercise = () => {
    setEditRoutineForm((prev) => ({
      ...prev,
      exercises: [...prev.exercises, { exercise_id: "", sets: 3, reps: "12" }],
    }));
  };

  const removeEditRoutineExercise = (index: number) => {
    setEditRoutineForm((prev) => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index),
    }));
  };

  const handleUpdateRoutine = async () => {
    try {
      setEditRoutineError(null);
      setSavingEditRoutine(true);

      if (!editRoutineForm.name.trim()) {
        setEditRoutineError("El nombre de la rutina es requerido");
        return;
      }

      if (editRoutineForm.exercises.some((x) => !x.exercise_id)) {
        setEditRoutineError("Selecciona un ejercicio para cada fila");
        return;
      }

      await api.updateAthleteRoutine(id, editRoutineForm.id, {
        name: editRoutineForm.name,
        day_of_week: Number(editRoutineForm.day_of_week),
        exercises: editRoutineForm.exercises.map((ex, idx) => ({
          exercise_id: ex.exercise_id,
          sets: Number(ex.sets),
          reps: ex.reps,
          weight_kg: ex.weight_kg || undefined,
          order: idx,
        })),
      } as any);

      // Refetch
      const routinesRes = await api.getAthleteRoutines(id);
      setRoutines((routinesRes as any).data || []);
      setEditingRoutine(null);
      
      // Auto-trigger sync notification
      setPlanSuccess(true);
      setTimeout(() => setPlanSuccess(false), 3000);
    } catch (err: any) {
      setEditRoutineError(err?.message || "No se pudo actualizar la rutina");
    } finally {
      setSavingEditRoutine(false);
    }
  };

  const handleDeleteRoutine = async (routineId: string) => {
    try {
      setEditRoutineError(null);
      setDeletingRoutineId(routineId);

      await api.deleteAthleteRoutine(id, routineId);

      // Refetch
      const routinesRes = await api.getAthleteRoutines(id);
      setRoutines((routinesRes as any).data || []);
      
      if (editingRoutine?.id === routineId) {
        setEditingRoutine(null);
      }

      // Auto-trigger sync notification
      setPlanSuccess(true);
      setTimeout(() => setPlanSuccess(false), 3000);
    } catch (err: any) {
      setEditRoutineError(err?.message || "No se pudo eliminar la rutina");
    } finally {
      setDeletingRoutineId(null);
    }
  };

  const handleUpdatePlan = async () => {
    try {
      setUpdatingPlan(true);
      const routinesRes = await api.getAthleteRoutines(id);
      setRoutines((routinesRes as any).data || []);
      
      setPlanSuccess(true);
      setTimeout(() => setPlanSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingPlan(false);
    }
  };


  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [athleteRes, routinesRes, exercisesRes, observationsRes] = await Promise.all([
          api.getAthlete(id),
          api.getAthleteRoutines(id),
          api.getExercises(),
          api.getAthleteObservations(id),
        ]);

        setAthlete((athleteRes as any).data || null);
        setRoutines((routinesRes as any).data || []);
        setExercises((exercisesRes as any).data || []);
        setObservations((observationsRes as any).data || []);
      } catch (err: any) {
        console.error("Failed to fetch athlete data:", err);
        setError(err.message || "Failed to load athlete profile");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [api, id]);

  const updateRoutineExercise = (index: number, field: string, value: string) => {
    setRoutineForm((prev) => {
      const nextItems = [...prev.exercises];
      const current = { ...nextItems[index] } as any;
      current[field] = field === "sets" ? Number(value) : value;
      nextItems[index] = current;
      return { ...prev, exercises: nextItems };
    });
  };

  const addRoutineExercise = () => {
    setRoutineForm((prev) => ({
      ...prev,
      exercises: [...prev.exercises, { exercise_id: "", sets: 3, reps: "12" }],
    }));
  };

  const removeRoutineExercise = (index: number) => {
    setRoutineForm((prev) => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index),
    }));
  };

  const handleAssignRoutine = async () => {
    try {
      setRoutineError(null);
      setSavingRoutine(true);

      if (!routineForm.name.trim()) {
        setRoutineError("Routine name is required");
        return;
      }

      if (routineForm.exercises.some((x) => !x.exercise_id)) {
        setRoutineError("Select an exercise for each row");
        return;
      }

      await api.createAthleteRoutine(id, {
        name: routineForm.name,
        day_of_week: Number(routineForm.day_of_week),
        exercises: routineForm.exercises.map((ex, idx) => ({
          exercise_id: ex.exercise_id,
          sets: Number(ex.sets),
          reps: ex.reps,
          order: idx,
        })),
      } as any);

      const routinesRes = await api.getAthleteRoutines(id);
      setRoutines((routinesRes as any).data || []);
      setRoutineForm({
        name: "",
        day_of_week: 1,
        exercises: [{ exercise_id: "", sets: 3, reps: "12" }],
      });
    } catch (err: any) {
      setRoutineError(err?.message || "Failed to assign routine");
    } finally {
      setSavingRoutine(false);
    }
  };

  const handleCreateObservation = async () => {
    try {
      if (!observationText.trim()) {
        setObservationError("Escribe una observacion para enviar feedback.");
        return;
      }

      setSavingObservation(true);
      setObservationError(null);

      await api.createAthleteObservation(id, {
        type: observationType,
        content: observationText.trim(),
      });

      const observationsRes = await api.getAthleteObservations(id);
      setObservations((observationsRes as any).data || []);
      setObservationText("");
      setObservationType("Progreso");
    } catch (err: any) {
      setObservationError(err?.message || "No se pudo enviar la observacion.");
    } finally {
      setSavingObservation(false);
    }
  };

  const handleAddMeasurement = async () => {
    try {
      if (!measurementForm.weight_kg) {
        setMeasurementError("El peso es requerido");
        return;
      }
      setSavingMeasurement(true);
      setMeasurementError(null);

      await api.addMeasurement(id, {
        weight_kg: parseFloat(measurementForm.weight_kg),
        body_fat_pct: measurementForm.body_fat_pct ? parseFloat(measurementForm.body_fat_pct) : undefined,
      } as any);

      const athleteRes = await api.getAthlete(id);
      setAthlete((athleteRes as any).data || null);
      
      setShowMeasurementModal(false);
      setMeasurementForm({ weight_kg: "", body_fat_pct: "" });
    } catch (err: any) {
      setMeasurementError(err?.message || "No se pudo guardar la medición");
    } finally {
      setSavingMeasurement(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 animate-pulse">Cargando perfil del atleta...</p>
        </div>
      </div>
    );
  }

  if (!athlete) {
    return (
      <div className="p-12 text-center">
        <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl inline-block">
          <p className="text-red-400 font-bold text-lg">Atleta no encontrado</p>
          <Link href="/athletes" className="text-primary hover:underline mt-4 inline-block">Volver a la lista</Link>
        </div>
      </div>
    );
  }

  // Format data for chart
  const chartData = athlete.measurements
    .map(m => ({
      date: new Date(m.date).toLocaleDateString("es-ES", { day: '2-digit', month: 'short' }),
      weight: parseFloat(m.weight_kg),
      fat: m.body_fat_pct ? parseFloat(m.body_fat_pct) : null
    }))
    .reverse();

  return (
    <div className="space-y-8 pb-12">
      {/* Top Bar */}
      <div className="flex items-center gap-4">
        <Link 
          href="/athletes" 
          className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors border border-transparent hover:border-slate-700"
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-white tracking-tight">{athlete.name}</h1>
            <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border ${
              athlete.plan_status === 'activa' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'
            }`}>
              {athlete.plan_status}
            </span>
          </div>
          <p className="text-slate-400 font-medium">{athlete.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Progress & Stats */}
        <div className="lg:col-span-2 space-y-8">
          {/* Progress Chart */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Progreso del Atleta
                </h3>
                <p className="text-sm text-slate-500">Historial de peso a lo largo del tiempo</p>
              </div>
              <button 
                onClick={() => setShowMeasurementModal(true)}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all border border-slate-700"
              >
                <Plus className="w-4 h-4" />
                Añadir Medición
              </button>
            </div>
            
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#64748b" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    dy={10}
                  />
                  <YAxis 
                    stroke="#64748b" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    domain={['dataMin - 2', 'dataMax + 2']}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#fff' }}
                    itemStyle={{ color: '#3b82f6' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorWeight)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Avance de Rutinas Chart */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Dumbbell className="w-5 h-5 text-yellow-400" />
                  Avance de Rutinas
                </h3>
                <p className="text-sm text-slate-500">Ejercicios completados por el alumno desde su app</p>
              </div>
            </div>

            {routines.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500 italic bg-slate-800/10 rounded-2xl border border-dashed border-slate-700/60">
                <Dumbbell className="w-8 h-8 text-slate-600 mb-2 animate-pulse" />
                <p className="text-sm">Asigna rutinas para ver el avance del atleta</p>
              </div>
            ) : (
              <>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={routines.map((r) => {
                        const total = r.exercises?.length || 0;
                        const completed = r.exercises?.filter((ex) => ex.completed).length || 0;
                        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
                        return {
                          name: r.name,
                          completed,
                          total,
                          percentage,
                        };
                      })}
                      layout="vertical"
                      margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                      <XAxis
                        type="number"
                        domain={[0, 100]}
                        stroke="#64748b"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        dataKey="name"
                        type="category"
                        stroke="#64748b"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        width={90}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1e293b',
                          border: '1px solid #334155',
                          borderRadius: '12px',
                          color: '#fff',
                        }}
                        formatter={(value: any, name: any, props: any) => {
                          const { completed, total } = props.payload;
                          return [`${value}% (${completed}/${total} ej)`, 'Progreso'];
                        }}
                      />
                      <Bar dataKey="percentage" radius={[0, 8, 8, 0]} barSize={16}>
                        {routines.map((r, index) => {
                          const total = r.exercises?.length || 0;
                          const completed = r.exercises?.filter((ex) => ex.completed).length || 0;
                          const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
                          return (
                            <Cell
                              key={`cell-${index}`}
                              fill={percentage === 100 ? '#10b981' : '#facc15'}
                            />
                          );
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Micro-metrics grid */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-800/80">
                  <div className="bg-slate-800/30 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Consistencia Promedio</p>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-xl font-black text-white">
                        {Math.round(
                          routines.reduce((acc, r) => {
                            const total = r.exercises?.length || 0;
                            const completed = r.exercises?.filter((ex) => ex.completed).length || 0;
                            return acc + (total > 0 ? (completed / total) * 100 : 0);
                          }, 0) / routines.length
                        )}
                      </span>
                      <span className="text-xs text-slate-500 font-bold">%</span>
                    </div>
                  </div>

                  <div className="bg-slate-800/30 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ejercicios Realizados</p>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-xl font-black text-white">
                        {routines.reduce((acc, r) => acc + (r.exercises?.filter((ex) => ex.completed).length || 0), 0)}
                      </span>
                      <span className="text-xs text-slate-500 font-bold">ej</span>
                    </div>
                  </div>

                  <div className="bg-slate-800/30 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Rutinas Completas</p>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-xl font-black text-white">
                        {routines.filter((r) => r.exercises?.length > 0 && r.exercises.every((ex) => ex.completed)).length}
                      </span>
                      <span className="text-xs text-slate-500 font-bold">/ {routines.length}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl backdrop-blur-sm">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Peso</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-white">{athlete.weight_kg || "--"}</span>
                <span className="text-xs text-slate-500 font-bold">kg</span>
              </div>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl backdrop-blur-sm">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Grasa Corporal</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-white">{athlete.body_fat_pct || "--"}</span>
                <span className="text-xs text-slate-500 font-bold">%</span>
              </div>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl backdrop-blur-sm">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Estado</p>
              <span className="text-sm font-bold text-green-400 capitalize">{athlete.plan_status}</span>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl backdrop-blur-sm">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Inscripción</p>
              <span className="text-sm font-bold text-white">{new Date(athlete.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Routines */}
        <div className="space-y-6">
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-purple-500" />
                Rutinas
              </h3>
              <button 
                onClick={() => setShowManageModal(true)}
                className="text-primary hover:text-blue-300 text-sm font-bold transition-colors"
              >
                Administrar
              </button>
            </div>

            <div className="space-y-4 flex-1 overflow-y-auto pr-2">
              {routines.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-slate-500 italic">No hay rutinas asignadas</p>
                  <button className="mt-4 bg-primary/20 text-primary px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border border-primary/30">
                    Crear Rutina
                  </button>
                </div>
              ) : (
                routines.map((r) => (
                  <div key={r.id} className="bg-slate-800/50 border border-slate-700/50 p-5 rounded-2xl hover:border-primary/50 transition-all group">
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-bold text-white group-hover:text-primary transition-colors">{r.name}</p>
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Día {r.day_of_week}</span>
                    </div>
                    <div className="space-y-2">
                      {r.exercises.slice(0, 3).map((ex) => (
                        <div key={ex.id} className="flex items-center justify-between text-xs">
                          <span className="text-slate-400 truncate max-w-[120px]">{ex.name}</span>
                          <span className="text-slate-500 font-mono">{ex.sets}x{ex.reps}</span>
                        </div>
                      ))}
                      {r.exercises.length > 3 && (
                        <p className="text-[10px] text-slate-600 font-bold italic pt-1">
                          + {r.exercises.length - 3} ejercicios más
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <button 
              onClick={handleUpdatePlan}
              disabled={updatingPlan}
              className={`w-full mt-6 py-4 rounded-2xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 text-primary-foreground ${
                planSuccess 
                  ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20' 
                  : 'bg-primary hover:bg-primary/90 shadow-primary/20'
              }`}
            >
              {updatingPlan ? (
                <span>Actualizando...</span>
              ) : planSuccess ? (
                <span>✓ ¡Plan de Entrenamiento Actualizado!</span>
              ) : (
                <span>Actualizar Plan de Entrenamiento</span>
              )}
            </button>

            <div className="mt-6 border-t border-slate-700/60 pt-6 space-y-4">
              <h4 className="text-sm font-black tracking-widest uppercase text-slate-400">Asignar Nueva Rutina</h4>

              {routineError && (
                <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-red-400 text-xs font-semibold">
                  {routineError}
                </div>
              )}

              <input
                value={routineForm.name}
                onChange={(e) => setRoutineForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Nombre de la rutina"
                className="w-full bg-slate-800/70 border border-slate-700 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-primary"
              />

              <select
                value={routineForm.day_of_week}
                onChange={(e) => setRoutineForm((prev) => ({ ...prev, day_of_week: Number(e.target.value) }))}
                className="w-full bg-slate-800/70 border border-slate-700 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-primary"
              >
                <option value={1}>Lunes</option>
                <option value={2}>Martes</option>
                <option value={3}>Miércoles</option>
                <option value={4}>Jueves</option>
                <option value={5}>Viernes</option>
                <option value={6}>Sábado</option>
                <option value={7}>Domingo</option>
              </select>

              <div className="space-y-2">
                {routineForm.exercises.map((row, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-center">
                    <select
                      value={row.exercise_id}
                      onChange={(e) => updateRoutineExercise(index, "exercise_id", e.target.value)}
                      className="col-span-6 bg-slate-800/70 border border-slate-700 rounded-xl py-2 px-2 text-xs text-white"
                    >
                      <option value="">Seleccionar ejercicio</option>
                      {exercises.map((exercise) => (
                        <option key={exercise.id} value={exercise.id}>
                          {exercise.name}
                        </option>
                      ))}
                    </select>
                    <input
                      value={row.sets}
                      type="number"
                      min={1}
                      onChange={(e) => updateRoutineExercise(index, "sets", e.target.value)}
                      className="col-span-2 bg-slate-800/70 border border-slate-700 rounded-xl py-2 px-2 text-xs text-white"
                      placeholder="Series"
                    />
                    <input
                      value={row.reps}
                      onChange={(e) => updateRoutineExercise(index, "reps", e.target.value)}
                      className="col-span-3 bg-slate-800/70 border border-slate-700 rounded-xl py-2 px-2 text-xs text-white"
                      placeholder="Reps"
                    />
                    <button
                      type="button"
                      onClick={() => removeRoutineExercise(index)}
                      className="col-span-1 text-xs text-red-400 hover:text-red-300"
                      disabled={routineForm.exercises.length === 1}
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addRoutineExercise}
                className="w-full py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold border border-slate-700 hover:bg-slate-700"
              >
                Añadir Ejercicio
              </button>

              <button
                type="button"
                onClick={handleAssignRoutine}
                disabled={savingRoutine}
                className="w-full py-3 rounded-xl bg-primary hover:bg-blue-700 disabled:bg-blue-900/40 text-white text-sm font-bold"
              >
                {savingRoutine ? "Guardando..." : "Asignar Rutina"}
              </button>
            </div>

            <div className="mt-8 border-t border-slate-700/60 pt-6 space-y-4">
              <h4 className="text-sm font-black tracking-widest uppercase text-slate-400 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Feedback del Entrenador
              </h4>

              {observationError && (
                <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-red-400 text-xs font-semibold">
                  {observationError}
                </div>
              )}

              <select
                value={observationType}
                onChange={(e) => setObservationType(e.target.value as "Nota" | "Alerta" | "Progreso")}
                className="w-full bg-slate-800/70 border border-slate-700 rounded-xl py-2.5 px-3 text-sm text-white"
              >
                <option value="Progreso">Progreso</option>
                <option value="Nota">Nota</option>
                <option value="Alerta">Alerta</option>
              </select>

              <textarea
                value={observationText}
                onChange={(e) => setObservationText(e.target.value)}
                placeholder="Ej: Muy buen ritmo hoy. Mantener tecnica y subir 2.5kg la proxima sesion."
                className="w-full h-24 bg-slate-800/70 border border-slate-700 rounded-xl py-2.5 px-3 text-sm text-white"
              />

              <button
                type="button"
                onClick={handleCreateObservation}
                disabled={savingObservation}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-900/40 text-white text-sm font-bold"
              >
                {savingObservation ? "Enviando..." : "Enviar Observacion"}
              </button>

              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {observations.map((observation) => (
                  <div key={observation.id} className="bg-slate-800/60 border border-slate-700 rounded-xl p-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase tracking-widest text-blue-300">{observation.type}</span>
                      <span className="text-[11px] text-slate-500">{new Date(observation.date).toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-slate-200 mt-1">{observation.content}</p>
                  </div>
                ))}
                {!observations.length && (
                  <p className="text-xs text-slate-500">Sin feedbacks enviados para este atleta.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showMeasurementModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-sm w-full relative shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-6">Añadir Medición</h3>
            
            {measurementError && (
              <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-red-400 text-xs font-semibold mb-4">
                {measurementError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Peso (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={measurementForm.weight_kg}
                  onChange={(e) => setMeasurementForm(prev => ({ ...prev, weight_kg: e.target.value }))}
                  placeholder="Ej: 75.5"
                  className="w-full bg-slate-800/70 border border-slate-700 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Grasa Corporal (%) (Opcional)</label>
                <input
                  type="number"
                  step="0.1"
                  value={measurementForm.body_fat_pct}
                  onChange={(e) => setMeasurementForm(prev => ({ ...prev, body_fat_pct: e.target.value }))}
                  placeholder="Ej: 15.2"
                  className="w-full bg-slate-800/70 border border-slate-700 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowMeasurementModal(false)}
                className="flex-1 py-3 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddMeasurement}
                disabled={savingMeasurement}
                className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {savingMeasurement ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showManageModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto relative shadow-2xl space-y-6">
            <button
              onClick={() => {
                setShowManageModal(false);
                setEditingRoutine(null);
              }}
              className="absolute top-6 right-6 text-slate-400 hover:text-white p-2 hover:bg-slate-800 rounded-xl transition-all border border-transparent hover:border-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            {!editingRoutine ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Dumbbell className="w-6 h-6 text-purple-500" />
                    Administrar Rutinas
                  </h3>
                  <p className="text-sm text-slate-400 mt-1">
                    Edita o elimina las rutinas asignadas a {athlete.name}
                  </p>
                </div>

                {editRoutineError && (
                  <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl text-red-400 text-sm font-semibold">
                    {editRoutineError}
                  </div>
                )}

                <div className="space-y-4">
                  {routines.length === 0 ? (
                    <div className="text-center py-12 bg-slate-800/20 border border-slate-800/80 rounded-2xl">
                      <p className="text-slate-500 italic">No hay rutinas asignadas a este atleta</p>
                    </div>
                  ) : (
                    routines.map((r) => (
                      <div
                        key={r.id}
                        className="bg-slate-800/30 border border-slate-800 p-5 rounded-2xl flex items-center justify-between hover:border-slate-700 transition-all group"
                      >
                        <div className="space-y-1">
                          <p className="font-bold text-white text-lg group-hover:text-primary transition-colors">
                            {r.name}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-slate-400">
                            <span className="bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700/50 uppercase font-black tracking-wider text-[10px]">
                              Día {r.day_of_week}
                            </span>
                            <span>•</span>
                            <span>{r.exercises.length} Ejercicios</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditingRoutine(r);
                              setEditRoutineForm({
                                id: r.id,
                                name: r.name,
                                day_of_week: r.day_of_week,
                                exercises: r.exercises.map((ex) => ({
                                  exercise_id: ex.exercise_id,
                                  sets: ex.sets,
                                  reps: ex.reps,
                                  weight_kg: ex.weight_kg || "",
                                })),
                              });
                            }}
                            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-blue-300 rounded-xl transition-all border border-slate-700"
                            title="Editar Rutina"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`¿Estás seguro de que deseas eliminar la rutina "${r.name}"?`)) {
                                handleDeleteRoutine(r.id);
                              }
                            }}
                            disabled={deletingRoutineId === r.id}
                            className="p-2.5 bg-red-950/20 hover:bg-red-900/30 text-red-400 hover:text-red-300 border border-red-900/30 rounded-xl transition-all disabled:opacity-50"
                            title="Eliminar Rutina"
                          >
                            {deletingRoutineId === r.id ? (
                              <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => {
                      setShowManageModal(false);
                    }}
                    className="w-full py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-all border border-slate-700"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 text-primary text-xs font-black uppercase tracking-widest">
                    <span>Editar Rutina</span>
                    <span>/</span>
                    <span className="text-slate-400 font-normal">{editingRoutine.name}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mt-1">Configurar Rutina</h3>
                </div>

                {editRoutineError && (
                  <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl text-red-400 text-sm font-semibold">
                    {editRoutineError}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                      Nombre de la rutina
                    </label>
                    <input
                      value={editRoutineForm.name}
                      onChange={(e) => setEditRoutineForm((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Ej: Piernas A"
                      className="w-full bg-slate-800/70 border border-slate-700 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                      Día de la semana
                    </label>
                    <select
                      value={editRoutineForm.day_of_week}
                      onChange={(e) => setEditRoutineForm((prev) => ({ ...prev, day_of_week: Number(e.target.value) }))}
                      className="w-full bg-slate-800/70 border border-slate-700 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:border-primary"
                    >
                      <option value={1}>Lunes (Día 1)</option>
                      <option value={2}>Martes (Día 2)</option>
                      <option value={3}>Miércoles (Día 3)</option>
                      <option value={4}>Jueves (Día 4)</option>
                      <option value={5}>Viernes (Día 5)</option>
                      <option value={6}>Sábado (Día 6)</option>
                      <option value={7}>Domingo (Día 7)</option>
                    </select>
                  </div>

                  <div className="space-y-3 pt-2">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Ejercicios de la rutina
                    </label>

                    <div className="space-y-3 max-h-[30vh] overflow-y-auto pr-1">
                      {editRoutineForm.exercises.map((row, index) => (
                        <div key={index} className="grid grid-cols-12 gap-3 items-center bg-slate-800/20 border border-slate-850 p-3 rounded-2xl">
                          <div className="col-span-6">
                            <select
                              value={row.exercise_id}
                              onChange={(e) => updateEditRoutineExercise(index, "exercise_id", e.target.value)}
                              className="w-full bg-slate-850 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-primary"
                            >
                              <option value="">Seleccionar ejercicio</option>
                              {exercises.map((exercise) => (
                                <option key={exercise.id} value={exercise.id}>
                                  {exercise.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          
                          <div className="col-span-2">
                            <input
                              value={row.sets}
                              type="number"
                              min={1}
                              onChange={(e) => updateEditRoutineExercise(index, "sets", e.target.value)}
                              className="w-full bg-slate-855 border border-slate-700 rounded-xl py-2 px-2 text-xs text-center text-white focus:outline-none focus:border-primary"
                              placeholder="Series"
                            />
                          </div>

                          <div className="col-span-2">
                            <input
                              value={row.reps}
                              onChange={(e) => updateEditRoutineExercise(index, "reps", e.target.value)}
                              className="w-full bg-slate-855 border border-slate-700 rounded-xl py-2 px-2 text-xs text-center text-white focus:outline-none focus:border-primary"
                              placeholder="Reps"
                            />
                          </div>

                          <div className="col-span-2 flex items-center gap-2">
                            <input
                              value={row.weight_kg || ""}
                              onChange={(e) => updateEditRoutineExercise(index, "weight_kg", e.target.value)}
                              className="w-full bg-slate-855 border border-slate-700 rounded-xl py-2 px-1 text-[10px] text-center text-white focus:outline-none focus:border-primary"
                              placeholder="Kg"
                            />
                            <button
                              type="button"
                              onClick={() => removeEditRoutineExercise(index)}
                              className="text-red-400 hover:text-red-300 p-1 hover:bg-red-500/10 rounded-lg transition-colors"
                              disabled={editRoutineForm.exercises.length === 1}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={addEditRoutineExercise}
                      className="w-full py-2.5 rounded-xl bg-slate-800/80 text-slate-200 text-xs font-bold border border-slate-700 hover:bg-slate-750 transition-colors"
                    >
                      + Añadir Ejercicio
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-800">
                  <button
                    onClick={() => {
                      setEditingRoutine(null);
                      setEditRoutineError(null);
                    }}
                    className="flex-1 py-3.5 rounded-2xl bg-slate-800 text-white font-bold hover:bg-slate-750 transition-colors border border-slate-700"
                  >
                    Atrás
                  </button>
                  <button
                    onClick={handleUpdateRoutine}
                    disabled={savingEditRoutine}
                    className="flex-1 py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold hover:bg-primary/95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {savingEditRoutine ? (
                      <>
                        <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                        <span>Guardando...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Guardar Cambios</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
