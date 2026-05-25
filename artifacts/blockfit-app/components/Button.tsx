import React from "react";
import { Text, StyleSheet, Pressable, StyleProp, ViewStyle, TextStyle, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { useColors } from "@/hooks/useColors";
import * as Haptics from "expo-haptics";
import { AppIcon, AppIconName } from "./AppIcon";

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: "primary" | "secondary" | "ghost" | "outline" | "default";
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
  icon?: AppIconName;
}

export function Button({ onPress, title, variant = "primary", style, textStyle, disabled, icon }: ButtonProps) {
  const colors = useColors();
  const scale = useSharedValue(1);
  const normalizedVariant = variant === "default" ? "primary" : variant === "outline" ? "ghost" : variant;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.95, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 100 });
  };

  const handlePress = () => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const getTextColor = () => {
    if (normalizedVariant === "primary") return colors.primaryForeground;
    if (normalizedVariant === "secondary") return colors.secondaryForeground;
    return colors.primary;
  };

  const buttonBody = (
    <View style={styles.content}>
      {icon ? <AppIcon name={icon} size={18} color={getTextColor()} /> : null}
      <Text style={[styles.text, { color: getTextColor() }, textStyle]}>{title}</Text>
    </View>
  );

  return (
    <Animated.View
      style={[
        animatedStyle,
        normalizedVariant === "primary"
          ? { shadowColor: colors.primary, shadowOpacity: 0.3, shadowRadius: 18, shadowOffset: { width: 0, height: 12 }, elevation: 8 }
          : null,
        style,
      ]}
    >
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        disabled={disabled}
        style={[
          styles.button,
          {
            backgroundColor: normalizedVariant === "secondary" ? colors.secondary : "transparent",
            borderRadius: colors.radius,
            borderColor: normalizedVariant === "ghost" ? colors.primary : normalizedVariant === "secondary" ? colors.border : "transparent",
            borderWidth: normalizedVariant === "ghost" || normalizedVariant === "secondary" ? 1 : 0,
          },
          disabled && styles.disabled
        ]}
      >
        {normalizedVariant === "primary" ? (
          <LinearGradient colors={colors.gradientAccent} style={[styles.gradientFill, { borderRadius: colors.radius }]}>
            {buttonBody}
          </LinearGradient>
        ) : (
          buttonBody
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    overflow: "hidden",
    minHeight: 54,
    justifyContent: "center",
  },
  gradientFill: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  text: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.2,
  },
  disabled: {
    opacity: 0.5,
  }
});
