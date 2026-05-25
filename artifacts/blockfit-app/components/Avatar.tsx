import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useColors } from "@/hooks/useColors";
import { Feather } from "@expo/vector-icons";

interface AvatarProps {
  initials: string;
  size?: number;
  url?: string;
}

export function Avatar({ initials, size = 40, url }: AvatarProps) {
  const colors = useColors();

  // If we had an image component, we would use url here. For now, initials.
  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.secondary,
        },
      ]}
    >
      <Text style={[styles.text, { color: colors.secondaryForeground, fontSize: size * 0.4 }]}>
        {initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  text: {
    fontFamily: "Inter_600SemiBold",
  },
});
