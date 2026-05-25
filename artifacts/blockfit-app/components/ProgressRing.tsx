import React from "react";
import { View, StyleSheet, Text } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { useColors } from "@/hooks/useColors";

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  centerText?: string;
}

export function ProgressRing({ progress, size = 120, strokeWidth = 10, color, centerText }: ProgressRingProps) {
  const colors = useColors();
  const radius = (size - strokeWidth) / 2;
  const circum = radius * 2 * Math.PI;
  const strokeDashoffset = circum - Math.min(1, Math.max(0, progress)) * circum;
  const ringColor = color || colors.primary;

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          shadowColor: ringColor,
        },
      ]}
    >
      <View
        style={[
          styles.innerGlow,
          {
            width: size - strokeWidth * 2.5,
            height: size - strokeWidth * 2.5,
            borderRadius: (size - strokeWidth * 2.5) / 2,
            backgroundColor: colors.cardSecondary,
            borderColor: colors.border,
          },
        ]}
      />
      <Svg width={size} height={size}>
        <Circle
          stroke={colors.ringTrack}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <Circle
          stroke={ringColor}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circum}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {centerText && (
        <View style={StyleSheet.absoluteFill}>
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ color: colors.foreground, fontSize: size * 0.2, fontFamily: "Inter_700Bold", fontVariant: ["tabular-nums"] }}>
              {centerText}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 0.25,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 14 },
  },
  innerGlow: {
    position: "absolute",
    borderWidth: 1,
  },
});
