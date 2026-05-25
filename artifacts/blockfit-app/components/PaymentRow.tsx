import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { Payment } from "@/types";
import { StatusPill } from "./StatusPill";

function fmtDate(date: string) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("es", { day: "2-digit", month: "short", year: "numeric" });
}

export function PaymentRow({
  payment,
  userName,
  onDownload,
}: {
  payment: Payment;
  userName?: string;
  onDownload?: () => void;
}) {
  const colors = useColors();
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
        <Feather name="credit-card" size={18} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        {userName && (
          <Text style={[styles.user, { color: colors.foreground }]} numberOfLines={1}>
            {userName}
          </Text>
        )}
        <Text style={[styles.amount, { color: colors.foreground }]}>
          ${payment.amount.toFixed(2)}
        </Text>
        <Text style={[styles.date, { color: colors.mutedForeground }]}>
          {payment.status === "paid"
            ? `Pagado el ${fmtDate(payment.date)}`
            : `Vence ${fmtDate(payment.dueDate)}`}
        </Text>
      </View>
      <View style={styles.right}>
        <StatusPill status={payment.status} />
        {payment.status === "paid" && onDownload && (
          <Pressable onPress={onDownload} style={styles.downloadBtn}>
            <Feather name="download" size={16} color={colors.foreground} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
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
  user: { fontSize: 13, fontFamily: "Inter_500Medium", marginBottom: 2 },
  amount: { fontSize: 16, fontFamily: "Inter_700Bold", fontVariant: ["tabular-nums"] },
  date: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  right: { alignItems: "flex-end", gap: 8 },
  downloadBtn: { padding: 6 },
});
