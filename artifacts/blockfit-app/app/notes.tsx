import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { Tag } from "@/components/Tag";
import { SelectField } from "@/components/SelectField";
import { Card } from "@/components/Card";
import { SectionHeader } from "@/components/SectionHeader";
import { EmptyState } from "@/components/EmptyState";
import { addObservation, getObservations } from "@/lib/storage";
import { Observation } from "@/types";
import { MOCK_USERS } from "@/lib/mockData";

const TRAINER_ID = "t1";
const TYPES: Observation["type"][] = ["Nota", "Lesión", "Avance"];

const TYPE_ICONS: Record<Observation["type"], keyof typeof Feather.glyphMap> = {
  Nota: "edit-3",
  Lesión: "alert-triangle",
  Avance: "trending-up",
};

function fmt(d: string) {
  return new Date(d).toLocaleString("es", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function Notes() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<Observation[]>([]);
  const [type, setType] = useState<Observation["type"]>("Nota");
  const [client, setClient] = useState<string | undefined>("u1");
  const [content, setContent] = useState("");

  const load = async () => {
    const all = await getObservations();
    setItems(all.filter((o) => o.trainerId === TRAINER_ID).sort((a, b) => +new Date(b.date) - +new Date(a.date)));
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = async () => {
    if (!client || !content.trim()) {
      Alert.alert("Faltan datos", "Selecciona cliente y escribe la observación.");
      return;
    }
    await addObservation({
      id: `o${Date.now()}`,
      trainerId: TRAINER_ID,
      userId: client,
      type,
      content: content.trim(),
      date: new Date().toISOString(),
    });
    setContent("");
    await load();
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: 20, paddingBottom: 24 + (Platform.OS === "web" ? 34 : insets.bottom) }}
    >
      <SectionHeader title="Nueva observación" />
      <SelectField
        label="Cliente"
        value={client}
        options={MOCK_USERS.map((u) => ({ label: u.name, value: u.id }))}
        onSelect={setClient}
      />
      <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_500Medium", fontSize: 14, marginBottom: 8 }}>
        Tipo
      </Text>
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
        {TYPES.map((t) => (
          <Tag key={t} label={t} active={t === type} onPress={() => setType(t)} />
        ))}
      </View>
      <Input
        label="Observación"
        value={content}
        onChangeText={setContent}
        placeholder="Escribe…"
        multiline
        numberOfLines={4}
        style={{ minHeight: 100, textAlignVertical: "top" }}
      />
      <Button title="Guardar observación" onPress={handleSave} />

      <SectionHeader title="Historial" />
      {items.length === 0 ? (
        <EmptyState icon="document-text-outline" title="Sin observaciones" subtitle="Aún no has registrado ninguna nota." />
      ) : (
        items.map((o) => {
          const u = MOCK_USERS.find((m) => m.id === o.userId);
          return (
            <Card key={o.id} style={{ marginBottom: 10 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <View style={[styles.typeChip, { backgroundColor: colors.secondary }]}>
                  <Feather name={TYPE_ICONS[o.type]} size={12} color={colors.primary} />
                  <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold", fontSize: 11 }}>
                    {o.type}
                  </Text>
                </View>
                <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_500Medium", fontSize: 11, flex: 1 }}>
                  {u?.name || ""} · {fmt(o.date)}
                </Text>
              </View>
              <Text style={{ color: colors.foreground, fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 20 }}>
                {o.content}
              </Text>
            </Card>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  typeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
});
