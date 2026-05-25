import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";
import { useColors } from "@/hooks/useColors";

interface TagProps {
  label: string;
  active?: boolean;
  onPress?: () => void;
}

export function Tag({ label, active, onPress }: TagProps) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.tag,
        {
          backgroundColor: active ? colors.primary : colors.secondary,
          borderColor: active ? colors.primary : colors.border,
        },
      ]}
    >
      <Text
        style={[
          styles.label,
          { color: active ? colors.primaryForeground : colors.foreground },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tag: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  label: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
});
