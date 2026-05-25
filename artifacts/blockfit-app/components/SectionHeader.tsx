import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useColors } from "@/hooks/useColors";
import { AppIcon } from "./AppIcon";

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function SectionHeader({ title, actionLabel, onAction }: SectionHeaderProps) {
  const colors = useColors();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
      {actionLabel && onAction && (
        <Pressable onPress={onAction} style={[styles.action, { backgroundColor: colors.secondary, borderColor: colors.border }] }>
          <Text style={[styles.actionLabel, { color: colors.primary }]}>{actionLabel}</Text>
          <AppIcon name="chevron-forward-outline" size={16} active />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    marginTop: 24,
  },
  title: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  action: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  actionLabel: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  }
});
