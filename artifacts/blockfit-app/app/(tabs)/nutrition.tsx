import React from "react";
import { View, Text, ScrollView } from "react-native";
import { useColors } from "@/hooks/useColors";
import { AppHeader } from "@/components/RoleHeader";
import { SectionHeader } from "@/components/SectionHeader";
import { Card } from "@/components/Card";
import { StatCard } from "@/components/StatCard";

export default function NutritionScreen() {
  const colors = useColors();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <AppHeader
        title="Nutrición"
        subtitle="Controla tus macros y calorías"
        initials="AC"
      />
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View style={{ flexDirection: "row", gap: 12 }}>
          <StatCard
            icon="flame-outline"
            label="Calorías"
            value="2,400"
            delta={{ value: "de 2,500", positive: true }}
          />
          <StatCard
            icon="nutrition-outline"
            label="Objetivo"
            value="Volumen"
          />
        </View>

        <SectionHeader title="Macros del día" />
        <Card>
          <View style={{ gap: 16 }}>
            <MacroRow label="Proteína" value="180g" target="200g" color="#FF4D4F" percent={0.9} />
            <MacroRow label="Carbohidratos" value="300g" target="350g" color="#D4AF37" percent={0.85} />
            <MacroRow label="Grasas" value="65g" target="80g" color="#8A8A8E" percent={0.8} />
          </View>
        </Card>

        <SectionHeader title="Comidas registradas" />
        <Card>
          <Text style={{ color: colors.mutedForeground, textAlign: "center", padding: 20 }}>
            Próximamente: Integración con registro de comidas
          </Text>
        </Card>
      </ScrollView>
    </View>
  );
}

function MacroRow({ label, value, target, color, percent }: any) {
  const colors = useColors();
  return (
    <View>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
        <Text style={{ color: colors.foreground, fontFamily: "Inter_500Medium" }}>{label}</Text>
        <Text style={{ color: colors.mutedForeground, fontSize: 12 }}>{value} / {target}</Text>
      </View>
      <View style={{ height: 6, backgroundColor: colors.secondary, borderRadius: 3, overflow: "hidden" }}>
        <View style={{ height: "100%", width: `${percent * 100}%`, backgroundColor: color }} />
      </View>
    </View>
  );
}
