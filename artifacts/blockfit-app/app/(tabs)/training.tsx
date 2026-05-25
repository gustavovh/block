import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, RefreshControl } from "react-native";
import Animated, { FadeInRight } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

import { useColors } from "@/hooks/useColors";
import { AppHeader } from "@/components/RoleHeader";
import { SectionHeader } from "@/components/SectionHeader";
import { Card } from "@/components/Card";
import { gymApi } from "@/lib/api";
import { ExerciseCard } from "@/components/ExerciseCard";
import { ExerciseDetail } from "@/components/ExerciseDetail";
import { Routine, RoutineExercise } from "@/types";
import { AppIcon, AppIconName } from "@/components/AppIcon";
import { ActivityIndicator } from "react-native";

export default function Training() {
  const colors = useColors();
  const router = useRouter();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [selectedDay, setSelectedDay] = useState<number>(((new Date().getDay() + 6) % 7) + 1);
  const [activeRoutineId, setActiveRoutineId] = useState<string | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<RoutineExercise | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const fetchRoutines = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const res = await gymApi.getRoutines();
      if (res.success) {
        setRoutines(res.data);
        
        // Auto-select active routine ID
        const currentSelectedDay = ((new Date().getDay() + 6) % 7) + 1;
        const matchingRoutines = res.data.filter((r: any) => r.dayOfWeek === currentSelectedDay);
        if (matchingRoutines.length > 0) {
          setActiveRoutineId(matchingRoutines[0].id);
        }
      }
    } catch (err: any) {
      console.error("Failed to fetch routines:", err);
      const errMsg = err.message || "";
      if (errMsg.includes("Authentication required") || errMsg.includes("expired") || errMsg.includes("401") || errMsg.includes("Unauthorized")) {
        router.replace("/login");
      }
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutines(true);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRoutines(false);
    setRefreshing(false);
  };

  const handleSelectDay = (dayNum: number) => {
    setSelectedDay(dayNum);
    const routinesForDay = routines.filter(r => r.dayOfWeek === dayNum);
    if (routinesForDay.length > 0) {
      setActiveRoutineId(routinesForDay[0].id);
    } else {
      setActiveRoutineId(null);
    }
  };

  const routinesForSelectedDay = routines.filter(r => r.dayOfWeek === selectedDay);
  const activeRoutine = routines.find(r => r.id === activeRoutineId) || routinesForSelectedDay[0];

  const toggleExercise = async (exerciseId: string) => {
    if (!activeRoutine) return;
    
    const exercise = activeRoutine.exercises.find(e => e.id === exerciseId);
    if (!exercise) return;

    const newStatus = !exercise.completed;

    // Optimistic update
    setRoutines(prev => prev.map(r => 
      r.id === activeRoutine.id ? {
        ...r,
        exercises: r.exercises.map(ex => ex.id === exerciseId ? { ...ex, completed: newStatus } : ex)
      } : r
    ));
    
    if (selectedExercise?.id === exerciseId) {
      setSelectedExercise(activeRoutine.exercises.find(ex => ex.id === exerciseId) ? { ...selectedExercise, completed: newStatus } : null);
    }

    // API Call
    try {
      const response = await gymApi.markComplete(exerciseId, newStatus);
      if (response.queued) {
        setSyncStatus("Sin conexión: cambio guardado y pendiente de sincronización.");
      } else {
        setSyncStatus("Sincronizado");
      }
    } catch (err) {
      console.error("Failed to sync exercise status:", err);
      // Revert in case of error
      setRoutines(prev => prev.map(r => 
        r.id === activeRoutine.id ? {
          ...r,
          exercises: r.exercises.map(ex => ex.id === exerciseId ? { ...ex, completed: !newStatus } : ex)
        } : r
      ));
      setSyncStatus("No se pudo guardar el cambio. Intenta de nuevo.");
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000" }}>
        <ActivityIndicator size="large" color="#ff4444" />
      </View>
    );
  }

  const handleOpenDetail = (exercise: RoutineExercise) => {
    setSelectedExercise(exercise);
    setDetailVisible(true);
  };

  const completedExercises = activeRoutine?.exercises.filter((exercise) => exercise.completed).length || 0;
  const totalExercises = activeRoutine?.exercises.length || 0;

  return (
    <LinearGradient colors={colors.gradientBackground} style={styles.screen}>
      <AppHeader
        title="Entrenamiento"
        subtitle={loading ? "Cargando..." : (activeRoutine?.name || "Día de descanso")}
        initials="AC"
      />
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        <LinearGradient colors={colors.gradientHero} style={[styles.routineHero, { borderColor: colors.border }]}> 
          <View style={styles.heroHeader}>
            <View>
              <Text style={[styles.heroKicker, { color: colors.primary }]}>RUTINA DEL DIA</Text>
              <Text style={[styles.heroTitle, { color: colors.foreground }]}>{activeRoutine?.name || "Día de descanso"}</Text>
              <Text style={[styles.heroSubtitle, { color: colors.mutedForeground }]}>
                {activeRoutine ? "Progresión inteligente con foco en ejecución y recuperación." : "Aprovecha para recuperar energía."}
              </Text>
            </View>
            <View style={[styles.heroBadge, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
              <Text style={[styles.heroBadgeValue, { color: colors.foreground }]}>{completedExercises}/{totalExercises}</Text>
              <Text style={[styles.heroBadgeLabel, { color: colors.mutedForeground }]}>completados</Text>
            </View>
          </View>

          <View style={styles.heroMetaRow}>
            <MetaPill icon="time-outline" label={`${Math.max(totalExercises * 8, 30)} min`} colors={colors} />
            <MetaPill icon="speedometer-outline" label="Intermedio" colors={colors} />
            <MetaPill icon="list-outline" label={`${totalExercises} ejercicios`} colors={colors} />
          </View>

          {syncStatus ? (
            <Text style={[styles.syncStatus, { color: colors.mutedForeground }]}>{syncStatus}</Text>
          ) : null}
        </LinearGradient>

        <View style={styles.dayPicker}>
          {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((day, index) => {
            const dayNum = index + 1;
            const isActive = selectedDay === dayNum;
            return (
              <Pressable
                key={day}
                onPress={() => handleSelectDay(dayNum)}
                style={[
                  styles.dayButton,
                  { backgroundColor: isActive ? colors.secondary : colors.card, borderColor: isActive ? colors.primary : colors.border, shadowColor: isActive ? colors.primary : colors.shadow }
                ]}
              >
                <Text style={[styles.dayText, { color: isActive ? colors.primary : colors.mutedForeground }]}> 
                  {day}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <SectionHeader title="Ejercicios" actionLabel="Hoy" onAction={() => handleSelectDay(((new Date().getDay() + 6) % 7) + 1)} />
        
        {activeRoutine?.exercises.map((exercise, index) => (
          <Animated.View
            key={exercise.id}
            entering={FadeInRight.delay(index * 100).duration(400)}
          >
            <ExerciseCard
              routineExercise={exercise}
              onToggle={() => toggleExercise(exercise.id)}
              onDemo={() => handleOpenDetail(exercise)}
            />
          </Animated.View>
        ))}

        <SectionHeader title="Otras rutinas" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20, paddingHorizontal: 20 }}>
          {routines.filter(r => r.id !== activeRoutine?.id).map((r) => (
            <Pressable key={r.id} onPress={() => { setSelectedDay(r.dayOfWeek); setActiveRoutineId(r.id); }}>
              <Card style={styles.miniCard} variant="gold">
                <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold", fontSize: 16 }}>{r.name}</Text>
                <Text style={{ color: colors.mutedForeground, fontSize: 12, marginTop: 6 }}>
                  {r.exercises.length} ejercicios
                </Text>
                <Text style={{ color: colors.primary, fontSize: 12, marginTop: 14, fontFamily: "Inter_700Bold", textTransform: "uppercase", letterSpacing: 0.6 }}>
                  Cambiar rutina
                </Text>
              </Card>
            </Pressable>
          ))}
        </ScrollView>
      </ScrollView>

      <ExerciseDetail
        visible={detailVisible}
        onClose={() => setDetailVisible(false)}
        exercise={selectedExercise}
        onToggleComplete={() => selectedExercise && toggleExercise(selectedExercise.id)}
      />
    </LinearGradient>
  );
}

function MetaPill({ icon, label, colors }: { icon: AppIconName; label: string; colors: ReturnType<typeof useColors> }) {
  return (
    <View style={[styles.metaPill, { backgroundColor: colors.secondary, borderColor: colors.border }]}> 
      <AppIcon name={icon} size={14} active />
      <Text style={[styles.metaPillText, { color: colors.foreground }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  routineHero: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
  },
  syncStatus: {
    marginTop: 12,
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  heroHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
    alignItems: "flex-start",
  },
  heroKicker: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1.1,
  },
  heroTitle: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    marginTop: 8,
    maxWidth: 220,
  },
  heroSubtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: 8,
    lineHeight: 20,
    maxWidth: 220,
  },
  heroBadge: {
    minWidth: 88,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  heroBadgeValue: { fontSize: 20, fontFamily: "Inter_700Bold" },
  heroBadgeLabel: { fontSize: 11, fontFamily: "Inter_500Medium", marginTop: 3, textTransform: "uppercase" },
  heroMetaRow: { flexDirection: "row", gap: 10, marginTop: 18, flexWrap: "wrap" },
  metaPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  metaPillText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  miniCard: { width: 170, marginRight: 12 },
  dayPicker: { flexDirection: "row", gap: 8, marginBottom: 24 },
  dayButton: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    shadowOpacity: 0.16,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
  },
  dayText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
});
