import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { useColors } from "@/hooks/useColors";
import { AppHeader } from "@/components/RoleHeader";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { SelectField } from "@/components/SelectField";
import { Card } from "@/components/Card";
import { BottomSheet } from "@/components/BottomSheet";
import { SectionHeader } from "@/components/SectionHeader";
import { MOCK_EXERCISES } from "@/lib/mockData";
import { Exercise } from "@/types";

const DAYS = [
  { v: "1", l: "Lunes" },
  { v: "2", l: "Martes" },
  { v: "3", l: "Miércoles" },
  { v: "4", l: "Jueves" },
  { v: "5", l: "Viernes" },
  { v: "6", l: "Sábado" },
  { v: "7", l: "Domingo" },
];

interface DraftExercise {
  exercise: Exercise;
  sets: number;
  reps: number;
  weightKg: number;
}

export default function CustomWorkout() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState("");
  const [day, setDay] = useState<string | undefined>("1");
  const [drafts, setDrafts] = useState<DraftExercise[]>([]);
  const [libraryOpen, setLibraryOpen] = useState(false);

  const addExercise = (e: Exercise) => {
    setDrafts((d) => [...d, { exercise: e, sets: e.defaultSets, reps: e.defaultReps, weightKg: 0 }]);
    setLibraryOpen(false);
  };

  const removeExercise = (i: number) => {
    setDrafts((d) => d.filter((_, idx) => idx !== i));
  };

  const handleSave = () => {
    if (!name || drafts.length === 0) {
      Alert.alert("Faltan datos", "Completa el nombre y agrega al menos un ejercicio.");
      return;
    }
    Alert.alert("Éxito", "Tu rutina personalizada ha sido guardada.");
    router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <AppHeader 
        greeting="CREADOR DE RUTINAS" 
        title="Personalizar" 
        subtitle="Crea tu propia sesión de entrenamiento" 
      />
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 200 + (Platform.OS === "web" ? 0 : insets.bottom) }}
        showsVerticalScrollIndicator={false}
      >
        <Input label="Nombre de la rutina" value={name} onChangeText={setName} placeholder="Ej: Mi rutina de pecho" />
        <SelectField
          label="Día sugerido"
          value={day}
          options={DAYS.map((d) => ({ label: d.l, value: d.v }))}
          onSelect={setDay}
        />

        <SectionHeader title="Ejercicios Seleccionados" />
        {drafts.length === 0 ? (
          <Card>
            <Text style={{ color: colors.mutedForeground, textAlign: "center", paddingVertical: 10 }}>
              No has añadido ejercicios aún.
            </Text>
          </Card>
        ) : (
          drafts.map((d, i) => (
            <View
              key={i}
              style={[
                styles.draft,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderRadius: colors.radius,
                },
              ]}
            >
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold", fontSize: 15, flex: 1 }}>
                  {d.exercise.name}
                </Text>
                <Pressable onPress={() => removeExercise(i)}>
                  <Feather name="trash-2" size={16} color={colors.destructive} />
                </Pressable>
              </View>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <Field label="Sets" value={String(d.sets)} colors={colors} />
                <Field label="Reps" value={String(d.reps)} colors={colors} />
                <Field label="Peso (kg)" value={String(d.weightKg)} colors={colors} />
              </View>
            </View>
          ))
        )}

        <Button
          title="+ Añadir Ejercicio"
          variant="secondary"
          onPress={() => setLibraryOpen(true)}
          style={{ marginTop: 12 }}
        />

        <Button title="Guardar Rutina" onPress={handleSave} style={{ marginTop: 24 }} />
      </ScrollView>

      <BottomSheet visible={libraryOpen} onClose={() => setLibraryOpen(false)} title="Biblioteca de Ejercicios">
        <ScrollView style={{ maxHeight: 400 }}>
          {MOCK_EXERCISES.map((e) => (
            <Pressable
              key={e.id}
              onPress={() => addExercise(e)}
              style={[styles.libRow, { borderBottomColor: colors.border }]}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold", fontSize: 14 }}>
                  {e.name}
                </Text>
                <Text style={{ color: colors.mutedForeground, fontSize: 12, marginTop: 2 }}>
                  {e.muscleGroup}
                </Text>
              </View>
              <Feather name="plus-circle" size={20} color={colors.primary} />
            </Pressable>
          ))}
        </ScrollView>
      </BottomSheet>
    </View>
  );
}

function Field({ label, value, colors }: any) {
  return (
    <View style={[styles.field, { backgroundColor: colors.input, borderColor: colors.border }]}>
      <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_500Medium", fontSize: 10, textTransform: "uppercase" }}>
        {label}
      </Text>
      <Text style={{ color: colors.foreground, fontFamily: "Inter_700Bold", fontSize: 16, marginTop: 2 }}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  draft: { padding: 14, borderWidth: 1, marginBottom: 10 },
  field: { flex: 1, padding: 10, borderWidth: 1, borderRadius: 10 },
  libRow: { flexDirection: "row", alignItems: "center", paddingVertical: 14, borderBottomWidth: 1, gap: 12 },
});
