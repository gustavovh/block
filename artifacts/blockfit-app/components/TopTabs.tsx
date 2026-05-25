import React from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { useColors } from "@/hooks/useColors";

export function TopTabs({
  tabs,
  active,
  onChange,
}: {
  tabs: string[];
  active: string;
  onChange: (t: string) => void;
}) {
  const colors = useColors();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.row, { borderBottomColor: colors.border }]}
    >
      {tabs.map((t) => {
        const isActive = t === active;
        return (
          <Pressable key={t} onPress={() => onChange(t)} style={styles.tab}>
            <Text
              style={[
                styles.label,
                { color: isActive ? colors.primary : colors.mutedForeground },
              ]}
            >
              {t}
            </Text>
            {isActive && (
              <View style={[styles.indicator, { backgroundColor: colors.primary }]} />
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { borderBottomWidth: 1, paddingHorizontal: 8 },
  tab: { paddingHorizontal: 16, paddingVertical: 14, alignItems: "center" },
  label: { fontSize: 13, fontFamily: "Inter_600SemiBold", textTransform: "uppercase", letterSpacing: 0.5 },
  indicator: { position: "absolute", bottom: -1, left: 16, right: 16, height: 2, borderRadius: 1 },
});
