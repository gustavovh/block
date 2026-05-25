import React, { useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, Platform } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

import { useColors } from "@/hooks/useColors";
import { Card } from "@/components/Card";
import { SectionHeader } from "@/components/SectionHeader";
import { EmptyState } from "@/components/EmptyState";
import { MOCK_EXERCISES } from "@/lib/mockData";
import { Button } from "@/components/Button";
import { AppIcon, AppIconName } from "@/components/AppIcon";

export default function ExerciseDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const exercise = useMemo(() => MOCK_EXERCISES.find((e) => e.id === id), [id]);

  if (!exercise) {
    return <EmptyState icon="alert-circle-outline" title="Ejercicio no encontrado" subtitle="" />;
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: 20, paddingBottom: 24 + (Platform.OS === "web" ? 34 : insets.bottom) }}
    >
      <LinearGradient colors={colors.gradientBackground} style={styles.screenGlow}>
        <LinearGradient colors={colors.gradientHero} style={[styles.hero, { borderColor: colors.border }]}> 
          <View style={styles.heroMedia}>
            <View style={[styles.heroPlay, { backgroundColor: colors.secondary, borderColor: colors.border }]}> 
              <AppIcon name="play-outline" size={28} active glow />
            </View>
            <Text style={[styles.heroVideoLabel, { color: colors.mutedForeground }]}>DEMO / GIF</Text>
          </View>

          <Text style={[styles.exerciseTitle, { color: colors.foreground }]}>{exercise.name}</Text>
          <Text style={[styles.exerciseGroup, { color: colors.primary }]}>{exercise.muscleGroup}</Text>

          <View style={styles.metaRow}>
            <MetaStat icon="repeat-outline" label={`${exercise.defaultSets} series`} colors={colors} />
            <MetaStat icon="barbell-outline" label={`${exercise.defaultReps} reps`} colors={colors} />
            <MetaStat icon="time-outline" label="60 min" colors={colors} />
          </View>
        </LinearGradient>

        <View style={styles.tabsRow}>
          {[
            { label: "Ejecución", active: true },
            { label: "Músculos" },
            { label: "Consejos" },
            { label: "Historial" },
          ].map((tab) => (
            <View key={tab.label} style={[styles.tab, tab.active && { borderBottomColor: colors.primary }]}> 
              <Text style={[styles.tabText, { color: tab.active ? colors.primary : colors.mutedForeground }]}>{tab.label}</Text>
            </View>
          ))}
        </View>

        <SectionHeader title="Demostración" />
        <Card>
          <View style={[styles.demoFrame, { backgroundColor: colors.secondary, borderColor: colors.border }]}> 
            <AppIcon name="play-circle-outline" size={44} active glow />
          </View>
          <Text style={[styles.blockTitle, { color: colors.foreground }]}>Paso a paso</Text>
          <Step n={1} text="Acuéstate con apoyo completo y pies firmes en el suelo." colors={colors} />
          <Step n={2} text="Alinea manos y hombros para mantener control durante todo el rango." colors={colors} />
          <Step n={3} text="Desciende con pausa breve y sube manteniendo tensión constante." colors={colors} />
          <Step n={4} text="Finaliza cada repetición sin perder técnica ni recorrido." colors={colors} />
        </Card>

        <SectionHeader title="Músculos" />
        <Card>
          <View style={styles.muscleRow}>
            <View style={[styles.muscleCard, { backgroundColor: colors.secondary, borderColor: colors.border }]}> 
              <Text style={[styles.muscleTitle, { color: colors.foreground }]}>Inicio</Text>
              <View style={[styles.muscleFigure, { backgroundColor: colors.backgroundSecondary }]} />
            </View>
            <View style={[styles.muscleCard, { backgroundColor: colors.secondary, borderColor: colors.border }]}> 
              <Text style={[styles.muscleTitle, { color: colors.foreground }]}>Fin</Text>
              <View style={[styles.muscleFigure, { backgroundColor: colors.backgroundSecondary }]} />
            </View>
          </View>
        </Card>

        <SectionHeader title="Consejos clave" />
        <Card>
          <View style={styles.tipGrid}>
            {[
              "Mantén los pies firmes",
              "No arquees la espalda",
              "Controla la bajada y la subida",
            ].map((tip) => (
              <View key={tip} style={[styles.tipCard, { backgroundColor: colors.secondary, borderColor: colors.border }]}> 
                <AppIcon name="shield-outline" size={16} active />
                <Text style={[styles.tipCardText, { color: colors.secondaryForeground }]}>{tip}</Text>
              </View>
            ))}
          </View>
        </Card>

        <Button title="Add to Routine" onPress={() => {}} icon="add-circle-outline" style={{ marginTop: 20 }} />
      </LinearGradient>
    </ScrollView>
  );
}

function MetaStat({ icon, label, colors }: { icon: AppIconName; label: string; colors: ReturnType<typeof useColors> }) {
  return (
    <View style={[styles.metaPill, { backgroundColor: colors.secondary, borderColor: colors.border }]}> 
      <AppIcon name={icon} size={14} active />
      <Text style={[styles.metaPillText, { color: colors.foreground }]}>{label}</Text>
    </View>
  );
}

function Stat({ label, value, colors }: { label: string; value: number | string; colors: ReturnType<typeof useColors> }) {
  return (
    <View style={{ alignItems: "center" }}>
      <Text style={{ color: colors.foreground, fontFamily: "Inter_700Bold", fontSize: 24, fontVariant: ["tabular-nums"] }}>
        {value}
      </Text>
      <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_500Medium", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, marginTop: 4 }}>
        {label}
      </Text>
    </View>
  );
}

function Step({ n, text, colors }: { n: number; text: string; colors: ReturnType<typeof useColors> }) {
  return (
    <View style={{ flexDirection: "row", gap: 12, paddingVertical: 8 }}>
      <View
        style={{
          width: 24,
          height: 24,
          borderRadius: 12,
          backgroundColor: colors.primary,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ color: colors.primaryForeground, fontFamily: "Inter_700Bold", fontSize: 12 }}>{n}</Text>
      </View>
      <Text style={{ color: colors.foreground, fontFamily: "Inter_400Regular", fontSize: 14, flex: 1, lineHeight: 22 }}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screenGlow: {
    borderRadius: 28,
  },
  hero: {
    borderWidth: 1,
    borderRadius: 28,
    padding: 20,
  },
  heroMedia: {
    aspectRatio: 16 / 9,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  heroPlay: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  heroVideoLabel: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    marginTop: 12,
    letterSpacing: 0.8,
  },
  exerciseTitle: {
    fontSize: 30,
    fontFamily: "Inter_700Bold",
    marginTop: 18,
  },
  exerciseGroup: {
    fontSize: 12,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginTop: 6,
  },
  metaRow: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
    marginTop: 18,
  },
  metaPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  metaPillText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  tabsRow: {
    flexDirection: "row",
    marginTop: 18,
    marginBottom: 6,
  },
  tab: {
    marginRight: 20,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
  },
  demoFrame: {
    aspectRatio: 16 / 9,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  blockTitle: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    marginBottom: 8,
  },
  muscleRow: {
    flexDirection: "row",
    gap: 12,
  },
  muscleCard: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
  },
  muscleTitle: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    marginBottom: 12,
  },
  muscleFigure: {
    height: 120,
    borderRadius: 16,
  },
  tipGrid: {
    gap: 10,
  },
  tipCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  tipCardText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
});
