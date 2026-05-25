import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View } from "react-native";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { initStorage } from "@/lib/storage";
import { gymApi } from "@/lib/api";
import { SocketListener } from "@/lib/socket";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#0A0A0B" },
        headerTintColor: "#F5F5F5",
        headerTitleStyle: { fontFamily: "Inter_600SemiBold" },
        contentStyle: { backgroundColor: "#0A0A0B" },
        headerBackTitle: "Atrás",
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="notifications" options={{ title: "Notificaciones" }} />
      <Stack.Screen name="notes" options={{ title: "Observaciones" }} />
      <Stack.Screen
        name="exercise-detail/[id]"
        options={{ presentation: "modal", title: "Ejercicio" }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    initStorage();
  }, []);

  useEffect(() => {
    gymApi.flushPendingSync().catch(() => {
      // Silent by design: sync retries on next cycle.
    });

    const interval = setInterval(() => {
      gymApi.flushPendingSync().catch(() => {
        // Silent by design: sync retries on next cycle.
      });
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <SocketListener />
          <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#0A0A0B" }}>
            <KeyboardProvider>
              <View style={{ flex: 1, backgroundColor: "#0A0A0B" }}>
                <StatusBar style="light" />
                <RootLayoutNav />
              </View>
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
