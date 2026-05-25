import React, { useMemo } from "react";
import { View } from "react-native";
import Svg, { Rect } from "react-native-svg";
import { useColors } from "@/hooks/useColors";

export function QRPlaceholder({ size = 220, seed = "blockfit" }: { size?: number; seed?: string }) {
  const colors = useColors();
  const grid = 21;
  const cell = size / grid;

  const cells = useMemo(() => {
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
    const out: boolean[][] = [];
    for (let r = 0; r < grid; r++) {
      const row: boolean[] = [];
      for (let c = 0; c < grid; c++) {
        h = (h * 1103515245 + 12345) & 0x7fffffff;
        row.push(h % 2 === 0);
      }
      out.push(row);
    }
    return out;
  }, [seed]);

  const finder = (r: number, c: number) => (
    <>
      <Rect x={c * cell} y={r * cell} width={cell * 7} height={cell * 7} fill={colors.foreground} />
      <Rect
        x={(c + 1) * cell}
        y={(r + 1) * cell}
        width={cell * 5}
        height={cell * 5}
        fill={colors.background}
      />
      <Rect
        x={(c + 2) * cell}
        y={(r + 2) * cell}
        width={cell * 3}
        height={cell * 3}
        fill={colors.foreground}
      />
    </>
  );

  return (
    <View
      style={{
        width: size + 24,
        height: size + 24,
        padding: 12,
        backgroundColor: colors.background,
        borderRadius: 16,
      }}
    >
      <Svg width={size} height={size}>
        <Rect width={size} height={size} fill={colors.background} />
        {cells.map((row, r) =>
          row.map((on, c) => {
            if ((r < 7 && c < 7) || (r < 7 && c >= grid - 7) || (r >= grid - 7 && c < 7)) return null;
            if (!on) return null;
            return (
              <Rect
                key={`${r}-${c}`}
                x={c * cell}
                y={r * cell}
                width={cell}
                height={cell}
                fill={colors.foreground}
              />
            );
          }),
        )}
        {finder(0, 0)}
        {finder(0, grid - 7)}
        {finder(grid - 7, 0)}
      </Svg>
    </View>
  );
}
