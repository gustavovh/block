import React from "react";
import { View, StyleSheet, Text } from "react-native";
import Svg, { Rect } from "react-native-svg";
import { useColors } from "@/hooks/useColors";

interface BarChartProps {
  data: { label: string; value: number }[];
  width: number;
  height: number;
  color?: string;
}

export function BarChart({ data, width, height, color }: BarChartProps) {
  const colors = useColors();
  if (!data || data.length === 0) return <View style={{ width, height, backgroundColor: colors.secondary, borderRadius: colors.radius }} />;

  const barColor = color || colors.accent;
  const maxY = Math.max(...data.map(d => d.value));
  
  const padding = 10;
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2 - 20; // 20px for labels
  
  const barWidth = innerWidth / data.length * 0.6;
  const gap = innerWidth / data.length * 0.4;

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height - 20}>
        {data.map((d, i) => {
          const barHeight = (d.value / maxY) * innerHeight;
          const x = padding + (gap / 2) + i * (barWidth + gap);
          const y = padding + innerHeight - barHeight;
          return (
            <Rect
              key={i}
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              fill={barColor}
              rx={4}
            />
          );
        })}
      </Svg>
      <View style={{ flexDirection: "row", height: 20, paddingHorizontal: padding }}>
        {data.map((d, i) => (
          <View key={i} style={{ flex: 1, alignItems: "center" }}>
            <Text style={{ color: colors.mutedForeground, fontSize: 10, fontFamily: "Inter_500Medium" }} numberOfLines={1}>
              {d.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
