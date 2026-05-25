import React, { useEffect } from "react";
import { View, ViewStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useColors } from "@/hooks/useColors";

export function Skeleton({
  width,
  height,
  style,
  radius,
}: {
  width?: number | `${number}%`;
  height?: number;
  style?: ViewStyle;
  radius?: number;
}) {
  const colors = useColors();
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.9, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        {
          width: width ?? "100%",
          height: height ?? 16,
          backgroundColor: colors.secondary,
          borderRadius: radius ?? 10,
          borderWidth: 1,
          borderColor: colors.border,
        },
        animatedStyle,
        style,
      ]}
    />
  );
}
