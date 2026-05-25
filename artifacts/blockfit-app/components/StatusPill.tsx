import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useColors } from "@/hooks/useColors";
import { Feather } from "@expo/vector-icons";

interface StatusPillProps {
  status: "activa" | "por_vencer" | "vencida" | "cancelada" | "paid" | "pending" | "overdue";
}

export function StatusPill({ status }: StatusPillProps) {
  const colors = useColors();

  const getStatusConfig = () => {
    switch (status) {
      case "activa":
      case "paid":
        return { label: status === "activa" ? "Activa" : "Pagado", color: colors.accent, bg: `${colors.accent}20` };
      case "por_vencer":
      case "pending":
        return { label: status === "por_vencer" ? "Por vencer" : "Pendiente", color: colors.primary, bg: `${colors.primary}20` };
      case "vencida":
      case "overdue":
        return { label: status === "vencida" ? "Vencida" : "Atrasado", color: colors.destructive, bg: `${colors.destructive}20` };
      case "cancelada":
        return { label: "Cancelada", color: colors.destructive, bg: `${colors.destructive}20` };
      default:
        return { label: status, color: colors.mutedForeground, bg: colors.muted };
    }
  };

  const config = getStatusConfig();

  return (
    <View style={[styles.container, { backgroundColor: config.bg }]}>
      <Text style={[styles.text, { color: config.color }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  text: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
});
