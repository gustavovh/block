import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, useWindowDimensions, RefreshControl } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";

import { useColors } from "@/hooks/useColors";
import { AppHeader } from "@/components/RoleHeader";
import { StatCard } from "@/components/StatCard";
import { SectionHeader } from "@/components/SectionHeader";
import { Card } from "@/components/Card";
import { ProgressRing } from "@/components/ProgressRing";
import { LineChart } from "@/components/LineChart";
import { AppIcon, AppIconName } from "@/components/AppIcon";
import {
  gymApi
} from "@/lib/api";
import { Routine, Measurement, User } from "@/types";
import { ActivityIndicator } from "react-native";

export default function Home() {
  const colors = useColors();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [user, setUser] = useState<User | undefined>();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHomeData = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const [profileRes, routinesRes, measurementsRes] = await Promise.all([
        gymApi.getMe(),
        gymApi.getRoutines(),
        gymApi.getMeasurements(),
      ]);

      if (profileRes.success) setUser(profileRes.data);
      if (routinesRes.success) setRoutines(routinesRes.data);
      if (measurementsRes.success) {
        setMeasurements(measurementsRes.data.slice().reverse());
      }
    } catch (err: any) {
      console.error("Failed to fetch home data:", err);
      const errMsg = err.message || "";
      if (errMsg.includes("Authentication required") || errMsg.includes("expired") || errMsg.includes("401") || errMsg.includes("Unauthorized")) {
        router.replace("/login");
      }
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomeData(true);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHomeData(false);
    setRefreshing(false);
  };

  const chartWidth = Math.max(220, width - 96);
  const quickActions = [
    { label: "Entrenamientos", icon: "barbell-outline", onPress: () => router.push("/(tabs)/training") as void },
    { label: "Calorías", icon: "flame-outline", onPress: () => router.push("/(tabs)/progress") as void },
    { label: "Mindfulness", icon: "moon-outline", onPress: () => router.push("/(tabs)/profile") as void },
  ] as const;

  const today = new Date();
  const dayOfWeek = ((today.getDay() + 6) % 7) + 1;
  const todayRoutine = routines.find((r) => r.dayOfWeek === dayOfWeek);
  const greeting = today.getHours() < 12 ? "Buenos días" : today.getHours() < 19 ? "Buenas tardes" : "Buenas noches";
  const weeklyTarget = 4;
  const completedSessions = routines.filter((routine) => routine.exercises.every((exercise) => exercise.completed)).length;
  const weeklyProgress = Math.min(completedSessions / weeklyTarget, 1);

  const measurementsDelta = useMemo(() => {
    if (measurements.length < 2) return null;
    const latest = measurements[measurements.length - 1];
    const previous = measurements[measurements.length - 2];
    return latest.weightKg - previous.weightKg;
  }, [measurements]);

  const weeklyActivity = useMemo(
    () => ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((label, index) => ({ label, x: index, y: [38, 64, 49, 82, 68, 91][index] })),
    []
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000" }}>
        <ActivityIndicator size="large" color="#ff4444" />
      </View>
    );
  }

  return (
    <LinearGradient colors={colors.gradientBackground} style={styles.screen}>
      <AppHeader
        greeting={greeting}
        title={user?.name?.split(" ")[0] || "Atleta"}
        subtitle={today.toLocaleDateString("es", { weekday: "long", day: "numeric", month: "long" })}
        initials={user?.avatar || "AC"}
        showLogo
      />
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        <Animated.View entering={FadeInDown.duration(350)}>
          <Pressable onPress={() => router.push("/(tabs)/training")}>
            <LinearGradient colors={colors.gradientHero} style={[styles.heroCard, { borderColor: colors.border }]}> 
              <View style={styles.heroTopRow}>
                <View>
                  <Text style={[styles.heroLabel, { color: colors.primary }]}>META DIARIA</Text>
                  <Text style={[styles.heroTitle, { color: colors.foreground }]}>{todayRoutine?.name || "Activa tu recuperación"}</Text>
                  <Text style={[styles.heroSubtitle, { color: colors.mutedForeground }]}>Diseñado para mantener consistencia, foco y carga progresiva.</Text>
                </View>
                <ProgressRing progress={weeklyProgress || 0.2} size={108} strokeWidth={10} centerText={`${Math.round((weeklyProgress || 0.2) * 100)}`} color={colors.primary} />
              </View>

              <View style={styles.heroMetrics}>
                <Metric icon="list-outline" label="Ejercicios" value={`${todayRoutine?.exercises.length || 0}`} colors={colors} />
                <Metric icon="time-outline" label="Duracion" value={`${Math.max((todayRoutine?.exercises.length || 4) * 8, 30)} min`} colors={colors} />
                <Metric icon="flag-outline" label="Meta" value={`${completedSessions}/${weeklyTarget}`} colors={colors} />
              </View>

              <View style={[styles.heroCTA, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                <Text style={[styles.heroCTAText, { color: colors.foreground }]}>{todayRoutine ? "Comenzar sesión" : "Revisar agenda"}</Text>
                <AppIcon name="arrow-forward-outline" size={18} active />
              </View>
            </LinearGradient>
          </Pressable>
        </Animated.View>

        <SectionHeader title="Actividad semanal" actionLabel="Detalles" onAction={() => router.push("/(tabs)/progress")} />
        <Animated.View entering={FadeInDown.delay(80).duration(350)}>
          <Card style={styles.activityCard}>
            <View style={styles.activityHeader}>
              <View>
                <Text style={[styles.activityTitle, { color: colors.foreground }]}>Actividad semanal</Text>
                <Text style={[styles.activitySubtitle, { color: colors.mutedForeground }]}>Tendencia de esfuerzo y cumplimiento.</Text>
              </View>
              <View style={[styles.activityBadge, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                <AppIcon name="stats-chart-outline" size={14} active />
                <Text style={[styles.activityBadgeText, { color: colors.primary }]}>+12%</Text>
              </View>
            </View>
            <LineChart data={weeklyActivity.map((item) => ({ x: item.x, y: item.y }))} width={chartWidth} height={148} color={colors.accent} />
            <View style={styles.chartLabels}>
              {weeklyActivity.map((item) => (
                <Text key={item.label} style={[styles.chartLabel, { color: colors.mutedForeground }]}>{item.label}</Text>
              ))}
            </View>
          </Card>
        </Animated.View>

        <SectionHeader title="Acciones rápidas" />
        <View style={styles.quickGrid}>
          {quickActions.map((action, index) => (
            <Animated.View key={action.label} entering={FadeInDown.delay(120 + index * 80).duration(320)} style={styles.quickItemWrap}>
              <Pressable onPress={action.onPress} style={({ pressed }) => [styles.quickAction, { opacity: pressed ? 0.88 : 1 }]}> 
                <LinearGradient colors={colors.gradientCard} style={[styles.quickActionFill, { borderColor: colors.border }]}> 
                  <View style={[styles.quickIconWrap, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                    <AppIcon name={action.icon} size={20} active glow />
                  </View>
                  <Text style={[styles.quickLabel, { color: colors.foreground }]}>{action.label}</Text>
                </LinearGradient>
              </Pressable>
            </Animated.View>
          ))}
        </View>

        <SectionHeader title="Panorama diario" />
        <View style={styles.statsRow}>
          <Animated.View entering={FadeInDown.delay(220).duration(320)} style={styles.flexOne}>
            <StatCard icon="footsteps-outline" label="Pasos" value="8,452" delta={{ value: "85% de meta", positive: true }} />
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(300).duration(320)} style={styles.flexOne}>
            <StatCard icon="flame-outline" label="Calorías" value="642" delta={{ value: "Muy activo", positive: true }} />
          </Animated.View>
        </View>

        <Animated.View entering={FadeInDown.delay(380).duration(320)}>
          <Card style={styles.focusCard}>
            <View style={styles.focusTop}>
              <View>
                <Text style={[styles.focusLabel, { color: colors.primary }]}>ATENCION PLENA</Text>
                <Text style={[styles.focusTitle, { color: colors.foreground }]}>30 minutos de hoy</Text>
              </View>
              <ProgressRing progress={0.6} size={84} strokeWidth={8} centerText="30" color={colors.accent} />
            </View>
            <View style={styles.focusFooter}>
              <MiniStat label="Peso" value={measurements.at(-1)?.weightKg ? `${measurements.at(-1)?.weightKg} kg` : "--"} detail={measurementsDelta == null ? "Sin cambio" : `${measurementsDelta > 0 ? "+" : ""}${measurementsDelta} kg`} colors={colors} />
              <MiniStat label="Cardio" value="52 min" detail="Zona media" colors={colors} />
              <MiniStat label="Sueño" value="7h 20m" detail="Recuperación sólida" colors={colors} />
            </View>
          </Card>
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
}

function Metric({ icon, label, value, colors }: { icon: AppIconName; label: string; value: string; colors: ReturnType<typeof useColors> }) {
  return (
    <View style={[styles.metricCard, { backgroundColor: colors.secondary, borderColor: colors.border }]}> 
      <AppIcon name={icon} size={15} active />
      <Text style={[styles.metricValue, { color: colors.foreground }]}>{value}</Text>
      <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

function MiniStat({ label, value, detail, colors }: { label: string; value: string; detail: string; colors: ReturnType<typeof useColors> }) {
  return (
    <View style={styles.miniStat}>
      <Text style={[styles.miniStatLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.miniStatValue, { color: colors.foreground }]}>{value}</Text>
      <Text style={[styles.miniStatDetail, { color: colors.primary }]}>{detail}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 120 },
  heroCard: {
    padding: 22,
    borderWidth: 1,
    borderRadius: 24,
    shadowOpacity: 0.22,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 16 },
    shadowColor: "#22C7FF",
  },
  heroTopRow: { flexDirection: "row", gap: 16, justifyContent: "space-between", alignItems: "center" },
  heroLabel: { fontSize: 11, fontFamily: "Inter_700Bold", letterSpacing: 1.3 },
  heroTitle: { fontSize: 28, fontFamily: "Inter_700Bold", marginTop: 8, maxWidth: 180 },
  heroSubtitle: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 8, lineHeight: 20, maxWidth: 220 },
  heroMetrics: { flexDirection: "row", gap: 10, marginTop: 20 },
  metricCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 18,
    padding: 12,
    gap: 4,
  },
  metricValue: { fontSize: 18, fontFamily: "Inter_700Bold" },
  metricLabel: { fontSize: 11, fontFamily: "Inter_500Medium", textTransform: "uppercase", letterSpacing: 0.5 },
  heroCTA: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginTop: 20,
    gap: 8,
    borderWidth: 1,
  },
  heroCTAText: { fontSize: 14, fontFamily: "Inter_700Bold", letterSpacing: 0.5, textTransform: "uppercase" },
  activityCard: { paddingBottom: 18 },
  activityHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 18 },
  activityTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  activitySubtitle: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 4 },
  activityBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  activityBadgeText: { fontSize: 12, fontFamily: "Inter_700Bold" },
  chartLabels: { flexDirection: "row", justifyContent: "space-between", marginTop: 12 },
  chartLabel: { fontSize: 12, fontFamily: "Inter_500Medium" },
  quickGrid: { flexDirection: "row", gap: 12 },
  quickItemWrap: { flex: 1 },
  quickAction: { borderRadius: 18 },
  quickActionFill: {
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  quickIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  quickLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold", textAlign: "center", lineHeight: 18 },
  statsRow: { flexDirection: "row", gap: 12 },
  flexOne: { flex: 1 },
  focusCard: { marginTop: 4 },
  focusTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  focusLabel: { fontSize: 11, fontFamily: "Inter_700Bold", letterSpacing: 1.2 },
  focusTitle: { fontSize: 22, fontFamily: "Inter_700Bold", marginTop: 6 },
  focusFooter: { flexDirection: "row", gap: 14, marginTop: 18 },
  miniStat: { flex: 1 },
  miniStatLabel: { fontSize: 11, fontFamily: "Inter_500Medium", textTransform: "uppercase", letterSpacing: 0.5 },
  miniStatValue: { fontSize: 20, fontFamily: "Inter_700Bold", marginTop: 6 },
  miniStatDetail: { fontSize: 12, fontFamily: "Inter_500Medium", marginTop: 4 },
});
