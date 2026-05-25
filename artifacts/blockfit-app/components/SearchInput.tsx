import React from "react";
import { View, TextInput, StyleSheet, TextInputProps } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";

export function SearchInput(props: TextInputProps) {
  const colors = useColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.input, borderColor: colors.border, borderRadius: colors.radius }]}>
      <Feather name="search" size={20} color={colors.mutedForeground} style={styles.icon} />
      <TextInput
        {...props}
        style={[styles.input, { color: colors.foreground }]}
        placeholderTextColor={colors.mutedForeground}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 16,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    height: "100%",
  }
});
