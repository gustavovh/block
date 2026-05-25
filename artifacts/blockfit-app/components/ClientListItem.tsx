import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { Avatar } from "./Avatar";
import { StatusPill } from "./StatusPill";
import { User } from "@/types";

export function ClientListItem({
  user,
  progress,
  onPress,
}: {
  user: User;
  progress?: number;
  onPress?: () => void;
}) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.container,
        { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius },
      ]}
    >
      <Avatar initials={user.avatar || user.name.slice(0, 2).toUpperCase()} size={44} />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>
          {user.name}
        </Text>
        <View style={styles.metaRow}>
          <StatusPill status={user.planStatus} />
          {progress != null && (
            <View style={styles.progressContainer}>
              <View style={[styles.progressTrack, { backgroundColor: colors.secondary }]}>
                <View
                  style={{
                    width: `${Math.min(100, Math.max(0, progress * 100))}%`,
                    height: "100%",
                    backgroundColor: colors.primary,
                  }}
                />
              </View>
              <Text style={[styles.progressText, { color: colors.mutedForeground }]}>
                {Math.round(progress * 100)}%
              </Text>
            </View>
          )}
        </View>
      </View>
      <Feather name="chevron-right" size={20} color={colors.mutedForeground} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  name: { fontSize: 15, fontFamily: "Inter_600SemiBold", marginBottom: 6 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  progressContainer: { flex: 1, flexDirection: "row", alignItems: "center", gap: 6 },
  progressTrack: { flex: 1, height: 4, borderRadius: 2, overflow: "hidden", maxWidth: 100 },
  progressText: { fontSize: 11, fontFamily: "Inter_500Medium" },
});
