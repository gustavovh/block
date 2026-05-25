import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions } from "react-native";
import { Image } from "expo-image";
import { useColors } from "@/hooks/useColors";
import { RoutineExercise } from "@/types";
import { BottomSheet } from "./BottomSheet";
import { Button } from "./Button";
import { Card } from "./Card";
import { LinearGradient } from "expo-linear-gradient";
import { AppIcon, AppIconName } from "./AppIcon";

import { EXERCISE_NAMES } from "./ExerciseCard";

interface Props {
  visible: boolean;
  onClose: () => void;
  exercise: RoutineExercise | null;
  onToggleComplete: () => void;
}

export function ExerciseDetail({ visible, onClose, exercise, onToggleComplete }: Props) {
  const colors = useColors();

  if (!exercise) return null;

  const SCREEN_WIDTH = Dimensions.get("window").width;
  const MEDIA_WIDTH = SCREEN_WIDTH - 48; // Account for modal padding

  const resolvedName = exercise.name || EXERCISE_NAMES[exercise.exerciseId] || "Ejercicio";

  const getSlidesForExercise = (name: string, customUrl?: string) => {
    const n = name.toLowerCase();
    let slides = [
      "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800&auto=format&fit=crop", // Prep
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop", // Execution
      "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=800&auto=format&fit=crop"  // Finish
    ];
    
    // Chest / Pecho
    if (n.includes("pecho") || n.includes("banca") || n.includes("aperturas") || n.includes("cruces") || n.includes("flexiones")) {
      slides = [
        "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=800&auto=format&fit=crop", // Prep
        "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop", // Execution
        "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=800&auto=format&fit=crop"  // Finish
      ];
    }
    
    // Legs / Pierna
    else if (n.includes("sentadilla") || n.includes("pierna") || n.includes("prensa") || n.includes("zancada") || n.includes("estocada") || n.includes("talones") || n.includes("femoral")) {
      slides = [
        "https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=800&auto=format&fit=crop", // Prep
        "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop", // Execution (Leg power)
        "https://images.unsplash.com/photo-1434608519344-49d77a699e1d?q=80&w=800&auto=format&fit=crop"  // Finish
      ];
    }
    
    // Back / Espalda / Peso Muerto
    else if (n.includes("muerto") || n.includes("espalda") || n.includes("remo") || n.includes("dominadas") || n.includes("jalón") || n.includes("lat pull")) {
      slides = [
        "https://images.unsplash.com/photo-1603252109303-2751441dd157?q=80&w=800&auto=format&fit=crop", // Prep
        "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop", // Execution
        "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800&auto=format&fit=crop"  // Finish
      ];
    }
    
    // Shoulders & Arms
    else if (n.includes("hombro") || n.includes("militar") || n.includes("laterales") || n.includes("brazo") || n.includes("bíceps") || n.includes("tríceps") || n.includes("triceps") || n.includes("fondos") || n.includes("curl")) {
      slides = [
        "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800&auto=format&fit=crop", // Prep
        "https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=800&auto=format&fit=crop", // Execution
        "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=800&auto=format&fit=crop"  // Finish
      ];
    }
    
    // Core / Abdomen
    else if (n.includes("plancha") || n.includes("crunch") || n.includes("abdomen") || n.includes("abdominal") || n.includes("core")) {
      slides = [
        "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800&auto=format&fit=crop", // Prep
        "https://images.unsplash.com/photo-1508215887398-c4781290f26f?q=80&w=800&auto=format&fit=crop", // Execution
        "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=800&auto=format&fit=crop"  // Finish
      ];
    }

    if (customUrl) {
      return [customUrl, slides[1], slides[2]];
    }

    return slides;
  };

  const slideImages = getSlidesForExercise(resolvedName, exercise.media?.url);

  return (
    <BottomSheet visible={visible} onClose={onClose} title={resolvedName}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        <View style={styles.mediaContainer}>
          <ScrollView 
            horizontal 
            pagingEnabled 
            showsHorizontalScrollIndicator={false}
            snapToInterval={MEDIA_WIDTH}
            decelerationRate="fast"
          >
            {slideImages.map((img, i) => (
              <View key={i} style={{ width: MEDIA_WIDTH, height: 200, borderRadius: colors.radius, overflow: "hidden" }}>
                <Image
                  source={{ uri: img }}
                  style={[styles.media, { borderRadius: colors.radius }]}
                  contentFit="cover"
                  transition={200}
                />
                <LinearGradient colors={["transparent", colors.overlay]} style={styles.mediaOverlay} />
                <View style={styles.mediaBadge}>
                  <AppIcon name={i === 0 ? "play-circle-outline" : "film-outline"} size={18} active />
                  <Text style={[styles.mediaBadgeText, { color: colors.foreground }]}>Paso {i + 1} de 3</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={styles.statsGrid}>
          <StatBox icon="repeat-outline" label="Series" value={exercise.sets.toString()} colors={colors} />
          <StatBox icon="barbell-outline" label="Reps" value={exercise.reps} colors={colors} />
          <StatBox icon="trending-up-outline" label="Peso" value={exercise.weightKg ? `${exercise.weightKg} kg` : "Libre"} colors={colors} />
          <StatBox icon="time-outline" label="Descanso" value={`${exercise.restSeconds || 60}s`} colors={colors} />
        </View>

        <Card style={styles.executionCard}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Ejecucion guiada</Text>
          <Step index={1} text="Ajusta la postura y estabiliza el tronco antes de cada repeticion." colors={colors} />
          <Step index={2} text="Mantén una cadencia controlada en la fase de subida y bajada." colors={colors} />
          <Step index={3} text="Exhala al esfuerzo y evita perder la tecnica por velocidad." colors={colors} />
        </Card>

        {exercise.notes && exercise.notes.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <AppIcon name="chatbubble-ellipses-outline" size={18} active />
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Indicaciones del Coach</Text>
            </View>
            <Card style={styles.notesCard}>
              {exercise.notes.map((note, index) => (
                <View key={index} style={styles.noteRow}>
                   <View style={[styles.noteDot, { backgroundColor: colors.secondary, borderColor: colors.border }]}> 
                     <AppIcon name={note.includes("Descanso") ? "time-outline" : "checkmark-outline"} size={12} active />
                   </View>
                   <Text style={[styles.noteText, { color: colors.foreground }]}>{note}</Text>
                </View>
              ))}
            </Card>
          </View>
        )}

        <View style={styles.tipRow}>
          {[
            "Controla la bajada",
            "No arquees la espalda",
            "Activa el core",
          ].map((tip) => (
            <View key={tip} style={[styles.tipChip, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
              <Text style={[styles.tipText, { color: colors.secondaryForeground }]}>{tip}</Text>
            </View>
          ))}
        </View>

        <View style={{ marginTop: 24 }}>
          <Button
            title={exercise.completed ? "Marcado como Completado" : "Marcar como Completado"}
            onPress={onToggleComplete}
            variant={exercise.completed ? "outline" : "default"}
            icon={exercise.completed ? "checkmark-circle-outline" : "ellipse-outline"}
          />
        </View>
      </ScrollView>
    </BottomSheet>
  );
}

function StatBox({ icon, label, value, colors }: { icon: AppIconName, label: string, value: string, colors: any }) {
  return (
    <LinearGradient colors={colors.gradientCard} style={[styles.statBox, { borderColor: colors.border }]}> 
      <AppIcon name={icon} size={16} active />
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.statValue, { color: colors.foreground }]}>{value}</Text>
    </LinearGradient>
  );
}

function Step({ index, text, colors }: { index: number; text: string; colors: ReturnType<typeof useColors> }) {
  return (
    <View style={styles.stepRow}>
      <View style={[styles.stepIndex, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
        <Text style={[styles.stepIndexText, { color: colors.primary }]}>{index}</Text>
      </View>
      <Text style={[styles.stepText, { color: colors.foreground }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  mediaContainer: {
    width: "100%",
    height: 200,
    marginBottom: 20,
  },
  media: {
    width: "100%",
    height: "100%",
  },
  mediaOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  mediaBadge: {
    position: "absolute",
    left: 16,
    bottom: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  mediaBadgeText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  mediaPlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    minWidth: "45%",
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    gap: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  statValue: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  section: {
    marginBottom: 20,
  },
  executionCard: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  notesCard: {
    gap: 12,
  },
  noteRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
  noteDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  noteText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    flex: 1,
    lineHeight: 20,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginTop: 14,
  },
  stepIndex: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  stepIndexText: {
    fontSize: 12,
    fontFamily: "Inter_700Bold",
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    lineHeight: 22,
  },
  tipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  tipChip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  tipText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
});
