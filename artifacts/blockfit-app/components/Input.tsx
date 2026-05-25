import React from "react";
import { View, Text, StyleSheet, TextInput, TextInputProps } from "react-native";
import { useColors } from "@/hooks/useColors";

export function Input(props: TextInputProps & { label?: string; error?: string }) {
  const colors = useColors();

  return (
    <View style={styles.container}>
      {props.label && <Text style={[styles.label, { color: colors.mutedForeground }]}>{props.label}</Text>}
      <TextInput
        {...props}
        style={[
          styles.input,
          {
            backgroundColor: colors.input,
            borderColor: props.error ? colors.destructive : colors.border,
            color: colors.foreground,
            borderRadius: colors.radius,
          },
          props.style,
        ]}
        placeholderTextColor={colors.mutedForeground}
      />
      {props.error && <Text style={[styles.error, { color: colors.destructive }]}>{props.error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    padding: 12,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
  },
  error: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 4,
  },
});
