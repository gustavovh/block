import React, { useEffect } from "react";
import { Platform, StyleProp, StyleSheet, Text, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

import { useColors } from "@/hooks/useColors";

export type AppIconName = React.ComponentProps<typeof Ionicons>["name"];

interface AppIconProps {
  name: AppIconName;
  size?: number;
  color?: string;
  active?: boolean;
  glow?: boolean;
  highlight?: boolean;
  style?: StyleProp<ViewStyle>;
}

const WEB_ICON_FALLBACK: Record<string, string> = {
  "home-outline": "⌂",
  "barbell-outline": "⌁",
  "stats-chart-outline": "↗",
  "nutrition-outline": "◍",
  "person-outline": "◔",
  "document-text-outline": "▤",
  "notifications-outline": "◉",
  "list-outline": "≡",
  "time-outline": "◷",
  "flag-outline": "⚑",
  "arrow-forward-outline": "›",
  "footsteps-outline": "⋯",
  "flame-outline": "△",
  "alert-circle-outline": "!",
  "play-outline": "▷",
  "repeat-outline": "↻",
  "play-circle-outline": "◉",
  "shield-outline": "⬡",
  "add-circle-outline": "+",
  "close-outline": "✕",
  "create-outline": "✎",
  "calendar-outline": "◫",
  "water-outline": "◒",
  "heart-outline": "♡",
  "help-circle-outline": "?",
  "log-out-outline": "⇥",
  "chevron-forward-outline": "›",
  "image-outline": "▣",
  "checkmark": "✓",
  "trending-up-outline": "↗",
  "trending-down-outline": "↘",
  "pulse-outline": "∿",
  "chatbubble-ellipses-outline": "…",
  "speedometer-outline": "◴",
};

export function AppIcon({
  name,
  size = 20,
  color,
  active = false,
  glow = false,
  highlight = false,
  style,
}: AppIconProps) {
  const colors = useColors();
  const scale = useSharedValue(active ? 1.08 : 1);

  useEffect(() => {
    scale.value = withTiming(active ? 1.08 : 1, { duration: 180 });
  }, [active]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const iconColor = color ?? (active ? colors.primary : colors.mutedForeground);
  const containerSize = size + 20;
  const webFallbackGlyph = WEB_ICON_FALLBACK[name] ?? "•";

  return (
    <Animated.View
      style={[
        styles.container,
        animatedStyle,
        {
          width: containerSize,
          height: containerSize,
          borderRadius: containerSize / 2,
          backgroundColor: highlight && active ? colors.secondary : "transparent",
          shadowColor: glow && active ? colors.primary : "transparent",
          shadowOpacity: glow && active ? 0.34 : 0,
          shadowRadius: glow && active ? 18 : 0,
          shadowOffset: { width: 0, height: 8 },
        },
        style,
      ]}
    >
      {Platform.OS === "web" ? (
        <Text
          style={{
            color: iconColor,
            fontSize: size,
            fontWeight: active ? "700" : "600",
            lineHeight: size + 2,
          }}
        >
          {webFallbackGlyph}
        </Text>
      ) : (
        <Ionicons name={name} size={size} color={iconColor} />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
});