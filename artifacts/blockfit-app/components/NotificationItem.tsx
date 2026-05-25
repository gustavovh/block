import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { Notification } from "@/types";

const ICONS: Record<Notification["type"], keyof typeof Feather.glyphMap> = {
  alert: "alert-circle",
  payment: "credit-card",
  routine: "activity",
  progress: "trending-up",
  reminder: "bell",
};

function fmtTime(date: string) {
  const d = new Date(date);
  return d.toLocaleString("es", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export function NotificationItem({ notification }: { notification: Notification }) {
  const colors = useColors();
  const icon = ICONS[notification.type];
  return (
    <View
      style={[
        styles.row,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: colors.radius,
        },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: colors.secondary }]}>
        <Feather name={icon} size={18} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={1}>
            {notification.title}
          </Text>
          {!notification.read && <View style={[styles.dot, { backgroundColor: colors.primary }]} />}
        </View>
        <Text style={[styles.message, { color: colors.mutedForeground }]} numberOfLines={2}>
          {notification.message}
        </Text>
        <Text style={[styles.time, { color: colors.mutedForeground }]}>
          {fmtTime(notification.date)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    padding: 14,
    borderWidth: 1,
    marginBottom: 10,
    gap: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { fontSize: 14, fontFamily: "Inter_600SemiBold", flex: 1, marginRight: 8 },
  message: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  time: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
