import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";

interface AlertBannerProps {
  title: string;
  message?: string;
  variant?: "info" | "warning" | "error";
  dismissible?: boolean;
}

export function AlertBanner({ title, message, variant = "info", dismissible = false }: AlertBannerProps) {
  const colors = useColors();
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case "warning":
        return { bg: `${colors.primary}15`, border: colors.primary, icon: colors.primary, iconName: "alert-triangle" as const };
      case "error":
        return { bg: `${colors.destructive}15`, border: colors.destructive, icon: colors.destructive, iconName: "alert-circle" as const };
      case "info":
      default:
        return { bg: `${colors.accent}15`, border: colors.accent, icon: colors.accent, iconName: "info" as const };
    }
  };

  const v = getVariantStyles();

  return (
    <View style={[styles.container, { backgroundColor: v.bg, borderColor: v.border, borderRadius: colors.radius }]}>
      <View style={styles.content}>
        <Feather name={v.iconName} size={20} color={v.icon} style={styles.icon} />
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
          {message && <Text style={[styles.message, { color: colors.mutedForeground }]}>{message}</Text>}
        </View>
      </View>
      {dismissible && (
        <Pressable onPress={() => setVisible(false)} style={styles.closeBtn}>
          <Feather name="x" size={20} color={colors.mutedForeground} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  content: {
    flexDirection: "row",
    flex: 1,
  },
  icon: {
    marginRight: 12,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 2,
  },
  message: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  closeBtn: {
    marginLeft: 12,
  }
});
