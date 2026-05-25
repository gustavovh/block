import React, { useEffect } from "react";
import { View, Text, StyleSheet, Pressable, Modal, useWindowDimensions } from "react-native";
import Animated, { useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { useColors } from "@/hooks/useColors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { AppIcon } from "./AppIcon";

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function BottomSheet({ visible, onClose, title, children }: BottomSheetProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const translateY = useSharedValue(height);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 20, stiffness: 90 });
      opacity.value = withTiming(1, { duration: 200 });
    } else {
      translateY.value = withTiming(height, { duration: 200 });
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible, height]);

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.backdrop, { backgroundColor: colors.overlay }, { opacity }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>
        <Animated.View
          style={[
            styles.sheet,
            {
              borderTopLeftRadius: colors.radius + 8,
              borderTopRightRadius: colors.radius + 8,
              paddingBottom: Math.max(insets.bottom, 24),
              borderColor: colors.border,
              shadowColor: colors.shadow,
            },
            { transform: [{ translateY }] }
          ]}
        >
          <LinearGradient colors={colors.gradientCard} style={[styles.sheetFill, { borderTopLeftRadius: colors.radius + 8, borderTopRightRadius: colors.radius + 8 }]}> 
            <View style={styles.handleContainer}>
              <View style={[styles.handle, { backgroundColor: colors.ringTrack }]} />
            </View>
            {title && (
              <View style={styles.header}>
                <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
                <Pressable onPress={onClose} style={[styles.closeButton, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                  <AppIcon name="close-outline" size={18} />
                </Pressable>
              </View>
            )}
            <View style={styles.content}>
              {children}
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    height: "90%",
    borderWidth: 1,
    shadowOpacity: 0.22,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: -8 },
  },
  sheetFill: {
    overflow: "hidden",
    flex: 1,
  },
  handleContainer: {
    alignItems: "center",
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  content: {
    paddingHorizontal: 24,
    flex: 1,
  }
});
