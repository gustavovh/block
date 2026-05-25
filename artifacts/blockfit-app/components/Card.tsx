import React from "react";
import { View, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { useColors } from "@/hooks/useColors";
import { LinearGradient } from "expo-linear-gradient";

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: "default" | "gold";
}

export function Card({ children, style, variant = "default" }: CardProps) {
  const colors = useColors();
  const isAccent = variant === "gold";

  return (
    <View
      style={[
        styles.shell,
        {
          borderRadius: colors.radius,
          shadowColor: isAccent ? colors.primary : colors.shadow,
        },
        style,
      ]}
    >
      <LinearGradient
        colors={isAccent ? ["rgba(34, 199, 255, 0.18)", "rgba(24, 242, 178, 0.14)", colors.card] : colors.gradientCard}
        style={[
          styles.card,
          {
            borderColor: isAccent ? colors.primary : colors.border,
            borderRadius: colors.radius,
          },
        ]}
      >
        <View
          pointerEvents="none"
          style={[
            styles.glow,
            { backgroundColor: isAccent ? colors.glow : colors.glowSecondary },
          ]}
        />
        {children}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 8,
  },
  card: {
    padding: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  glow: {
    position: "absolute",
    top: -36,
    right: -20,
    width: 110,
    height: 110,
    borderRadius: 55,
    opacity: 0.7,
  },
});
