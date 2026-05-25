import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Path, Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from "react-native-svg";
import { useColors } from "@/hooks/useColors";

interface LineChartProps {
  data: { x: number; y: number }[];
  width: number;
  height: number;
  color?: string;
}

export function LineChart({ data, width, height, color }: LineChartProps) {
  const colors = useColors();
  if (!data || data.length === 0) {
    return <View style={{ width, height, backgroundColor: colors.secondary, borderRadius: colors.radius }} />;
  }

  const strokeColor = color || colors.primary;
  
  const minX = Math.min(...data.map(d => d.x));
  const maxX = Math.max(...data.map(d => d.x));
  const minY = Math.min(...data.map(d => d.y));
  const maxY = Math.max(...data.map(d => d.y));
  
  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;
  
  const padding = 10;
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;

  const points = data.map(d => ({
    x: padding + ((d.x - minX) / rangeX) * innerWidth,
    y: padding + innerHeight - ((d.y - minY) / rangeY) * innerHeight,
  }));

  const lastPoint = points[points.length - 1];

  const path = points.reduce((acc, point, index, list) => {
    if (index === 0) {
      return `M ${point.x} ${point.y}`;
    }

    const previous = list[index - 1];
    const midpointX = (previous.x + point.x) / 2;
    const midpointY = (previous.y + point.y) / 2;

    return `${acc} Q ${previous.x} ${previous.y} ${midpointX} ${midpointY}`;
  }, "") + ` T ${lastPoint.x} ${lastPoint.y}`;

  const areaPath = `${path} L ${lastPoint.x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height}>
        <Defs>
          <SvgLinearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={strokeColor} stopOpacity={0.35} />
            <Stop offset="1" stopColor={strokeColor} stopOpacity={0} />
          </SvgLinearGradient>
        </Defs>
        <Path d={areaPath} fill="url(#chartFill)" />
        <Path d={path} fill="none" stroke={strokeColor} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => (
          <Circle key={i} cx={p.x} cy={p.y} r={4} fill={colors.background} stroke={strokeColor} strokeWidth={2} />
        ))}
      </Svg>
    </View>
  );
}
