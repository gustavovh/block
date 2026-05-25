import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useColors } from "@/hooks/useColors";

interface CalendarProps {
  year: number;
  month: number; // 0-11
  attended: Set<string>; // YYYY-MM-DD
  missed?: Set<string>;
}

const WEEKDAYS = ["L", "M", "M", "J", "V", "S", "D"];
const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export function Calendar({ year, month, attended, missed }: CalendarProps) {
  const colors = useColors();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startWeekday = (firstDay.getDay() + 6) % 7; // shift Sunday to end

  const cells: (number | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const today = new Date();
  const isToday = (d: number) =>
    today.getFullYear() === year && today.getMonth() === month && today.getDate() === d;

  return (
    <View>
      <Text style={[styles.monthLabel, { color: colors.foreground }]}>
        {MONTH_NAMES[month]} {year}
      </Text>
      <View style={styles.weekRow}>
        {WEEKDAYS.map((d, i) => (
          <Text key={i} style={[styles.weekday, { color: colors.mutedForeground }]}>
            {d}
          </Text>
        ))}
      </View>
      <View style={styles.grid}>
        {cells.map((d, i) => {
          if (d === null) return <View key={i} style={styles.cell} />;
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
          const isAttended = attended.has(dateStr);
          const isMissed = missed?.has(dateStr);
          return (
            <View key={i} style={styles.cell}>
              <View
                style={[
                  styles.dayCircle,
                  isAttended && { backgroundColor: colors.primary },
                  isMissed && !isAttended && { backgroundColor: `${colors.destructive}30` },
                  isToday(d) && !isAttended && { borderColor: colors.primary, borderWidth: 1 },
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    {
                      color: isAttended
                        ? colors.primaryForeground
                        : isMissed
                          ? colors.destructive
                          : colors.foreground,
                    },
                  ]}
                >
                  {d}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  monthLabel: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 12,
    textTransform: "capitalize",
  },
  weekRow: { flexDirection: "row", marginBottom: 8 },
  weekday: {
    flex: 1,
    textAlign: "center",
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
  },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  cell: { width: `${100 / 7}%`, aspectRatio: 1, padding: 2, alignItems: "center", justifyContent: "center" },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  dayText: { fontSize: 13, fontFamily: "Inter_500Medium" },
});
