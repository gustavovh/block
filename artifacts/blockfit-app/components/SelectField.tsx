import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { BottomSheet } from "./BottomSheet";

interface Option {
  label: string;
  value: string;
}

interface SelectFieldProps {
  label?: string;
  value?: string;
  options: Option[];
  onSelect: (value: string) => void;
  placeholder?: string;
}

export function SelectField({ label, value, options, onSelect, placeholder = "Select..." }: SelectFieldProps) {
  const colors = useColors();
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find((o) => o.value === value);

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { color: colors.mutedForeground }]}>{label}</Text>}
      <Pressable
        style={[styles.field, { backgroundColor: colors.input, borderColor: colors.border, borderRadius: colors.radius }]}
        onPress={() => setIsOpen(true)}
      >
        <Text style={[styles.valueText, { color: selectedOption ? colors.foreground : colors.mutedForeground }]}>
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <Feather name="chevron-down" size={20} color={colors.mutedForeground} />
      </Pressable>

      <BottomSheet visible={isOpen} onClose={() => setIsOpen(false)} title={label || "Select Option"}>
        <ScrollView>
          {options.map((opt) => (
            <Pressable
              key={opt.value}
              style={[styles.option, { borderBottomColor: colors.border }]}
              onPress={() => {
                onSelect(opt.value);
                setIsOpen(false);
              }}
            >
              <Text style={[styles.optionText, { color: opt.value === value ? colors.primary : colors.foreground }]}>
                {opt.label}
              </Text>
              {opt.value === value && <Feather name="check" size={20} color={colors.primary} />}
            </Pressable>
          ))}
        </ScrollView>
      </BottomSheet>
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
  field: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    paddingHorizontal: 16,
    height: 48,
  },
  valueText: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  optionText: {
    fontSize: 16,
    fontFamily: "Inter_500Medium",
  }
});
