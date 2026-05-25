import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { RoutineExercise, Exercise } from "@/types";
import { LinearGradient } from "expo-linear-gradient";
import { AppIcon, AppIconName } from "./AppIcon";

interface Props {
  routineExercise: RoutineExercise;
  exercise?: Exercise;
  onToggle: () => void;
  onDemo: () => void;
}

export const EXERCISE_NAMES: Record<string, string> = {
  "a6a51394-4bd2-40c0-961b-14bb185c693e": "Aperturas con Mancuernas",
  "e329cf10-db26-4ed7-87bf-e7a1b05a5996": "Cruces de Polea",
  "7377973f-82a1-4163-9668-d0d9af7a9474": "Crunches Abdominales",
  "3a5825b1-9875-406b-8429-c076560ad0f1": "Curl de Bíceps con Barra",
  "0f171866-d79f-441e-9e4c-9fe697a00a65": "Curl de Bíceps Martillo",
  "9cd1fcf4-99bd-486a-8bbc-06b68dbe8194": "Curl de Pierna Acostado",
  "512b9d1e-7ad3-4608-bec5-c68cdfd3e522": "Dominadas",
  "d9445b19-873c-449c-8b06-69090718ee26": "Elevación de Piernas Colgado",
  "4362d28b-9bb2-4cf4-92b2-3f9771a7006c": "Elevación de Talones de Pie",
  "486257b3-178e-417e-b679-16dbbbec2d05": "Elevaciones Laterales",
  "a2778d06-25b6-462e-a404-094a882f6c41": "Extension de Pierna",
  "aaa89866-9a47-46db-ae59-b396e5738841": "Extensión de Tríceps en Polea",
  "c162a2d5-f21f-4b68-b4d5-a0c21e34a361": "Flexiones de Pecho",
  "c1291c69-8a03-4028-b908-478b33317e8a": "Fondos en Paralelas",
  "6ba07b3c-998c-4503-9f4f-0927ecc79e4c": "Jalón al Pecho en Polea",
  "313b40db-4d5b-4cbf-9349-0fc83857dfdc": "Pájaros con Mancuernas",
  "633711a0-42f7-4cad-b83e-30d8e89ed06c": "Peso Muerto",
  "4b9d6a9c-b7dc-4e9a-b1d8-8dd8aa187f25": "Peso Muerto Rumano",
  "e298697b-08e1-4d68-9d6a-cbd35e665778": "Plancha Abdominal",
  "f37229fb-8013-42d8-93b2-4cc9fc0f3ca9": "Prensa de Piernas",
  "93e815d2-a66f-4c9c-bed2-fbfa992d2934": "Press de Banca",
  "97fec4e4-87ce-496f-b72a-a4fcb8c459ad": "Press de Banca Inclinado",
  "d04becd6-46a8-46d5-b71c-2c927fd61665": "Press Militar",
  "9c543a86-4d19-4565-be70-59b084484c16": "Remo con Barra",
  "81c8bf70-cd5d-4349-bfdd-f37913a1008c": "Remo con Mancuerna",
  "db43e59c-8e3b-45e4-a7d9-8cd49621d10b": "Sentadilla Libre",
  "cbd35d80-997d-4515-9c69-0d40e85282d7": "Zancadas con Mancuernas"
};

export function ExerciseCard({ routineExercise, exercise, onToggle, onDemo }: Props) {
  const colors = useColors();
  const re = routineExercise;
  const exerciseName = re.name || EXERCISE_NAMES[re.exerciseId] || exercise?.name || "Ejercicio";

  const getThumbForExercise = (name: string) => {
    const n = name.toLowerCase();
    
    // Chest / Pecho
    if (
      n.includes("pecho") || 
      n.includes("banca") || 
      n.includes("aperturas") || 
      n.includes("cruces") || 
      n.includes("flexiones")
    ) {
      return "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=400&auto=format&fit=crop";
    }
    
    // Legs / Pierna / Sentadilla
    if (
      n.includes("sentadilla") || 
      n.includes("pierna") || 
      n.includes("prensa") || 
      n.includes("zancada") || 
      n.includes("estocada") || 
      n.includes("talones") ||
      n.includes("femoral")
    ) {
      return "https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=400&auto=format&fit=crop";
    }
    
    // Back / Espalda / Peso Muerto
    if (
      n.includes("muerto") || 
      n.includes("espalda") || 
      n.includes("remo") || 
      n.includes("dominadas") || 
      n.includes("jalón") || 
      n.includes("lat pull")
    ) {
      return "https://images.unsplash.com/photo-1603252109303-2751441dd157?q=80&w=400&auto=format&fit=crop";
    }
    
    // Shoulders / Hombros
    if (
      n.includes("hombro") || 
      n.includes("militar") || 
      n.includes("laterales") || 
      n.includes("pájaros") ||
      n.includes("vuelos")
    ) {
      return "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=400&auto=format&fit=crop";
    }
    
    // Arms / Brazos / Bíceps / Tríceps
    if (
      n.includes("brazo") || 
      n.includes("bíceps") || 
      n.includes("biceps") || 
      n.includes("tríceps") || 
      n.includes("triceps") || 
      n.includes("fondos") ||
      n.includes("curl")
    ) {
      return "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=400&auto=format&fit=crop";
    }
    
    // Core / Abdomen
    if (
      n.includes("plancha") || 
      n.includes("crunch") || 
      n.includes("abdomen") || 
      n.includes("abdominal") || 
      n.includes("core")
    ) {
      return "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=400&auto=format&fit=crop";
    }

    return "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=400&auto=format&fit=crop";
  };

  const thumbUrl = re.media?.url || getThumbForExercise(exerciseName);


  return (
    <Pressable
      onPress={onDemo}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: re.completed ? colors.primary : colors.border,
          borderRadius: colors.radius,
          opacity: pressed ? 0.8 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
          shadowColor: re.completed ? colors.primary : colors.shadow,
        },
      ]}
    >
      <View style={styles.row}>
        <Image source={{ uri: thumbUrl }} style={styles.media} contentFit="cover" transition={200} />

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.kicker, { color: colors.primary }]}>EJERCICIO</Text>
              <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>
                {exerciseName}
              </Text>
            </View>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                onToggle();
              }}
              style={[
                styles.checkbox,
                {
                  backgroundColor: re.completed ? colors.primary : colors.secondary,
                  borderColor: re.completed ? colors.primary : colors.border,
                },
              ]}
            >
              {re.completed && (
                <AppIcon name="checkmark" size={16} color={colors.primaryForeground} />
              )}
            </Pressable>
          </View>

          <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>
            {`${re.sets} series x ${re.reps} repeticiones`}
          </Text>
          {(re.media || exercise?.videoUrl) && (
            <View style={styles.visualHint}>
              <AppIcon name="play-circle-outline" size={12} color={colors.accent} />
              <Text style={[styles.muscle, { color: colors.accent, marginTop: 0 }]}>Demo visual disponible</Text>
            </View>
          )}

          <View style={styles.metaRow}>
            <Meta icon="repeat-outline" label={`${re.sets}x${re.reps}`} colors={colors} />
            {re.weightKg != null && (
              <Meta icon="trending-up-outline" label={`${re.weightKg} kg`} colors={colors} />
            )}
            {re.restSeconds != null && (
              <Meta icon="time-outline" label={`${re.restSeconds}s`} colors={colors} />
            )}
          </View>

          {re.notes && re.notes.length > 0 && (
            <View style={styles.noteWrap}>
              <Text style={[styles.notes, { color: colors.mutedForeground }]} numberOfLines={2}>
                {re.notes[0]}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <Text style={[styles.footerText, { color: colors.primary }]}>Ver detalle</Text>
        <AppIcon name="chevron-forward-outline" size={16} />
      </View>
    </Pressable>
  );
}

function Meta({
  icon,
  label,
  colors,
}: {
  icon: AppIconName;
  label: string;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={styles.meta}>
      <AppIcon name={icon} size={13} />
      <Text style={[styles.metaText, { color: colors.foreground }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 14,
    borderWidth: 1,
    marginBottom: 14,
    position: "relative",
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
  },
  row: { flexDirection: "row", gap: 14, alignItems: "flex-start" },
  media: {
    width: 94,
    height: 114,
    borderRadius: 16,
  },
  mediaPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  content: { flex: 1 },
  titleRow: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  kicker: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1,
    marginBottom: 4,
  },
  name: { fontSize: 16, fontFamily: "Inter_600SemiBold", lineHeight: 22 },
  muscle: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  visualHint: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  metaRow: { flexDirection: "row", gap: 16, marginTop: 12, flexWrap: "wrap" },
  meta: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  noteWrap: {
    marginTop: 12,
    paddingTop: 12,
  },
  notes: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
    marginTop: 12,
  },
  footerText: {
    fontSize: 12,
    fontFamily: "Inter_700Bold",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
});
