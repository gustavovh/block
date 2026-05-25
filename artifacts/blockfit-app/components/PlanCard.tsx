import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { Plan } from "@/types";

export function PlanCard({
  plan,
  onEdit,
  onDelete,
}: {
  plan: Plan;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const colors = useColors();
  const featured = plan.featured;
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: featured ? colors.primary : colors.border,
          borderRadius: colors.radius,
          borderWidth: featured ? 2 : 1,
        },
      ]}
    >
      {featured && (
        <View style={[styles.featuredTag, { backgroundColor: colors.primary }]}>
          <Text style={[styles.featuredText, { color: colors.primaryForeground }]}>
            POPULAR
          </Text>
        </View>
      )}
      <Text style={[styles.name, { color: colors.foreground }]}>{plan.name}</Text>
      <Text style={[styles.duration, { color: colors.mutedForeground }]}>
        {plan.durationDays} días
      </Text>
      <View style={styles.priceRow}>
        <Text style={[styles.priceCurrency, { color: colors.mutedForeground }]}>$</Text>
        <Text style={[styles.price, { color: colors.foreground }]}>{plan.price}</Text>
      </View>
      <View style={{ marginTop: 16, gap: 8 }}>
        {plan.benefits.map((b, i) => (
          <View key={i} style={styles.benefitRow}>
            <Feather name="check" size={14} color={colors.accent} />
            <Text style={[styles.benefitText, { color: colors.foreground }]}>{b}</Text>
          </View>
        ))}
      </View>
      {(onEdit || onDelete) && (
        <View style={styles.actions}>
          {onEdit && (
            <Pressable onPress={onEdit} style={[styles.actionBtn, { backgroundColor: colors.secondary }]}>
              <Feather name="edit-2" size={14} color={colors.foreground} />
              <Text style={[styles.actionText, { color: colors.foreground }]}>Editar</Text>
            </Pressable>
          )}
          {onDelete && (
            <Pressable onPress={onDelete} style={[styles.actionBtn, { backgroundColor: colors.secondary }]}>
              <Feather name="trash-2" size={14} color={colors.destructive} />
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 20, marginBottom: 12, position: "relative" },
  featuredTag: {
    position: "absolute",
    top: -1,
    right: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
  },
  featuredText: { fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },
  name: { fontSize: 22, fontFamily: "Inter_700Bold" },
  duration: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    marginTop: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  priceRow: { flexDirection: "row", alignItems: "flex-start", marginTop: 12 },
  priceCurrency: { fontSize: 16, fontFamily: "Inter_500Medium", marginTop: 8 },
  price: { fontSize: 40, fontFamily: "Inter_700Bold", fontVariant: ["tabular-nums"], lineHeight: 44 },
  benefitRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  benefitText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  actions: { flexDirection: "row", gap: 8, marginTop: 16 },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionText: { fontSize: 13, fontFamily: "Inter_500Medium" },
});
