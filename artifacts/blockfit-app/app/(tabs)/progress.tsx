import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useColors } from "@/hooks/useColors";
import { AppHeader } from "@/components/RoleHeader";
import { SectionHeader } from "@/components/SectionHeader";
import { Card } from "@/components/Card";
import { StatCard } from "@/components/StatCard";
import { LineChart } from "@/components/LineChart";
import { gymApi } from "@/lib/api";
import { Measurement } from "@/types";

export default function Progress() {
  const colors = useColors();
  const [measurements, setMeasurements] = useState<Measurement[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await gymApi.getMeasurements();
        if (res.success) {
          setMeasurements(res.data.slice().reverse());
        }
      } catch (error) {
        console.error("Failed to fetch measurements:", error);
      }
    })();
  }, []);

  const weightData = measurements.map((m, i) => ({ x: i, y: m.weightKg }));
  const bodyFatData = measurements.map((m, i) => ({ x: i, y: m.bodyFatPct }));

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <AppHeader
        title="Progreso"
        subtitle="Analiza tu evolución física"
        initials="AC"
      />
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flexDirection: "row", gap: 12 }}>
          <StatCard
            icon="trending-down-outline"
            label="Peso Inicial"
            value="85.0 kg"
          />
          <StatCard
            icon="flag-outline"
            label="Meta"
            value="78.0 kg"
          />
        </View>

        <SectionHeader title="Evolución de Peso" />
        <Card>
          <View style={{ height: 200, justifyContent: "center" }}>
            {weightData.length > 1 ? (
              <LineChart data={weightData} width={300} height={180} color={colors.primary} />
            ) : (
              <Text style={{ color: colors.mutedForeground, textAlign: "center" }}>
                Cargando datos históricos...
              </Text>
            )}
          </View>
        </Card>

        <SectionHeader title="Composición Corporal" />
        <View style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}>
          <StatCard
            icon="pulse-outline"
            label="Grasa Corporal"
            value={`${measurements[measurements.length - 1]?.bodyFatPct || "--"}%`}
            delta={{ value: "-1.5%", positive: true }}
          />
          <StatCard
            icon="barbell-outline"
            label="Masa Muscular"
            value="34.2 kg"
          />
        </View>
        
        <Card>
           <View style={{ height: 150, justifyContent: "center" }}>
            {bodyFatData.length > 1 ? (
              <LineChart data={bodyFatData} width={300} height={120} color={colors.accent} />
            ) : (
              <Text style={{ color: colors.mutedForeground, textAlign: "center" }}>
                No hay suficientes datos de grasa corporal.
              </Text>
            )}
          </View>
        </Card>

        <SectionHeader title="Historial de Mediciones" />
        {measurements.slice().reverse().map((m) => (
          <Card key={m.id} style={{ marginBottom: 8 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold" }}>
                {new Date(m.date).toLocaleDateString("es", { day: "numeric", month: "short", year: "numeric" })}
              </Text>
              <View style={{ flexDirection: "row", gap: 12 }}>
                <Text style={{ color: colors.primary, fontFamily: "Inter_700Bold" }}>{m.weightKg}kg</Text>
                <Text style={{ color: colors.mutedForeground }}>{m.bodyFatPct}% GC</Text>
              </View>
            </View>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
}
