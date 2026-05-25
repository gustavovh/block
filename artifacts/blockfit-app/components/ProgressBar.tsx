import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useColors } from "@/hooks/useColors";

export function ProgressBar({ progress, label }: { progress: number; label?: string }) {
  const colors = useColors();

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { color: colors.foreground }]}>{label}</Text>}
      <View style={[styles.track, { backgroundColor: colors.secondary, borderRadius: colors.radius }]}>
        <View
          style={[
            styles.fill,
            { backgroundColor: colors.primary, width: `${Math.max(0, Math.min(100, progress * 100))}%` },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  label: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    marginBottom: 8,
  },
  track: {
    height: 8,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
  },
});
