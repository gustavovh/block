import { Tabs } from "expo-router";
import React from "react";
import { useColors } from "@/hooks/useColors";
import { AppIcon, AppIconName } from "@/components/AppIcon";

export default function TabLayout() {
  const colors = useColors();

  const renderIcon = (name: AppIconName) =>
    ({ color, size, focused }: { color: string; size: number; focused: boolean }) => (
      <AppIcon name={name} size={size} color={color} active={focused} glow highlight />
    );

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "rgba(7, 12, 22, 0.96)",
          borderTopColor: colors.border,
          height: 78,
          paddingBottom: 10,
          paddingTop: 10,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarLabelStyle: {
          fontFamily: "Inter_500Medium",
          fontSize: 11,
          marginTop: 2,
        },
        tabBarItemStyle: {
          paddingVertical: 2,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Inicio",
          tabBarIcon: renderIcon("home-outline"),
        }}
      />
      <Tabs.Screen
        name="training"
        options={{
          title: "Entrenar",
          tabBarIcon: renderIcon("barbell-outline"),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: "Progreso",
          tabBarIcon: renderIcon("stats-chart-outline"),
        }}
      />
      <Tabs.Screen
        name="nutrition"
        options={{
          title: "Nutrición",
          tabBarIcon: renderIcon("nutrition-outline"),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarIcon: renderIcon("person-outline"),
        }}
      />
    </Tabs>
  );
}
