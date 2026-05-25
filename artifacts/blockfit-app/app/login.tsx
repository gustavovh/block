import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColors } from "@/hooks/useColors";
import { gymApi } from "@/lib/api";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { AppIcon } from "@/components/AppIcon";

export default function LoginScreen() {
  const colors = useColors();
  const router = useRouter();
  const [email, setEmail] = useState("alejandro@gym.local");
  const [password, setPassword] = useState("atleta123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await gymApi.login(email, password);
      if (response.success) {
        await AsyncStorage.setItem("atleta_token", response.data.access_token);
        await AsyncStorage.setItem("atleta_id", response.data.user.id);
        await AsyncStorage.setItem("atleta_user", JSON.stringify(response.data.user));
        router.replace("/(tabs)/home");
      }
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={colors.gradientBackground} style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.content}
      >
        <Animated.View entering={FadeIn.duration(800)} style={styles.logoContainer}>
          <Image 
            source={require("../assets/images/logo.png")} 
            style={styles.mainLogo} 
            resizeMode="contain" 
          />
          <Text style={[styles.subtitle, { color: colors.mutedForeground, marginTop: 10 }]}>SAGA GYM</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.form}>
          <Text style={[styles.label, { color: colors.primary }]}>EMAIL</Text>
          <TextInput
            style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.secondary }]}
            placeholder="tu@email.com"
            placeholderTextColor={colors.mutedForeground}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={[styles.label, { color: colors.primary, marginTop: 20 }]}>CONTRASEÑA</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, styles.passwordInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.secondary }]}
              placeholder="••••••••"
              placeholderTextColor={colors.mutedForeground}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <Pressable 
              onPress={() => setShowPassword(!showPassword)} 
              style={styles.eyeIcon}
            >
              <AppIcon name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} active />
            </Pressable>
          </View>

          <Pressable onPress={() => router.push("/forgot-password")} style={styles.forgotPassword}>
            <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>¿Olvidaste tu contraseña?</Text>
          </Pressable>

          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}

          <Pressable 
            onPress={handleLogin} 
            disabled={loading}
            style={({ pressed }) => [
              styles.button, 
              { backgroundColor: colors.primary, opacity: pressed || loading ? 0.8 : 1 }
            ]}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>ENTRAR</Text>
            )}
          </Pressable>
        </Animated.View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 30, justifyContent: "center" },
  logoContainer: { alignItems: "center", marginBottom: 50 },
  mainLogo: { width: 220, height: 100 },
  title: { fontSize: 32, fontWeight: "800", letterSpacing: -1 },
  subtitle: { fontSize: 12, fontWeight: "600", letterSpacing: 2, marginTop: 5 },
  form: { width: "100%" },
  label: { fontSize: 10, fontWeight: "800", letterSpacing: 1, marginBottom: 8 },
  input: {
    height: 55,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 20,
    fontSize: 16,
  },
  button: {
    height: 55,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  buttonText: { color: "white", fontSize: 16, fontWeight: "800", letterSpacing: 1 },
  errorText: { color: "#ff4444", fontSize: 12, marginTop: 15, textAlign: "center", fontWeight: "600" },
  passwordContainer: { position: "relative", justifyContent: "center" },
  passwordInput: { paddingRight: 50 },
  eyeIcon: { position: "absolute", right: 15, height: "100%", justifyContent: "center" },
  forgotPassword: { alignItems: "flex-end", marginTop: 12 },
  forgotPasswordText: { fontSize: 12, fontWeight: "600" },
});
