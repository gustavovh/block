import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { gymApi } from "@/lib/api";
import Animated, { FadeInDown } from "react-native-reanimated";
import { AppIcon } from "@/components/AppIcon";

export default function ResetPasswordScreen() {
  const colors = useColors();
  const router = useRouter();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReset = async () => {
    if (!token || !password) {
      setError("Por favor, ingresa el token y tu nueva contraseña.");
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const res = await gymApi.resetPassword(token.trim(), password);
      if (res.success) {
        router.replace("/login");
      }
    } catch (err: any) {
      setError(err.message || "Error al restablecer la contraseña. Revisa que el token sea correcto.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={colors.gradientBackground} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.content}>
        <Animated.View entering={FadeInDown.duration(600)} style={styles.form}>
          <Text style={[styles.title, { color: colors.foreground }]}>Nueva Contraseña</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Ingresa el token que recibiste y crea una nueva contraseña para tu cuenta.
          </Text>

          <Text style={[styles.label, { color: colors.primary, marginTop: 40 }]}>TOKEN DE RECUPERACIÓN</Text>
          <TextInput
            style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.secondary }]}
            placeholder="Pega el código aquí..."
            placeholderTextColor={colors.mutedForeground}
            value={token}
            onChangeText={setToken}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={[styles.label, { color: colors.primary, marginTop: 20 }]}>NUEVA CONTRASEÑA</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, styles.passwordInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.secondary }]}
              placeholder="••••••••"
              placeholderTextColor={colors.mutedForeground}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
              <AppIcon name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} active />
            </Pressable>
          </View>

          {error && <Text style={styles.errorText}>{error}</Text>}

          <Pressable 
            onPress={handleReset} 
            disabled={loading}
            style={({ pressed }) => [
              styles.button, 
              { backgroundColor: colors.primary, opacity: pressed || loading ? 0.8 : 1 }
            ]}
          >
            {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>GUARDAR CONTRASEÑA</Text>}
          </Pressable>

          <Pressable onPress={() => router.push("/login")} style={styles.backButton}>
            <Text style={[styles.backButtonText, { color: colors.mutedForeground }]}>Volver al inicio de sesión</Text>
          </Pressable>
        </Animated.View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 30, justifyContent: "center" },
  form: { width: "100%" },
  title: { fontSize: 32, fontWeight: "800", letterSpacing: -1, marginBottom: 10 },
  subtitle: { fontSize: 14, fontWeight: "500", lineHeight: 20 },
  label: { fontSize: 10, fontWeight: "800", letterSpacing: 1, marginBottom: 8 },
  input: {
    height: 55,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 20,
    fontSize: 16,
  },
  passwordContainer: { position: "relative", justifyContent: "center" },
  passwordInput: { paddingRight: 50 },
  eyeIcon: { position: "absolute", right: 15, height: "100%", justifyContent: "center" },
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
  buttonText: { color: "white", fontSize: 14, fontWeight: "800", letterSpacing: 1 },
  errorText: { color: "#ff4444", fontSize: 12, marginTop: 15, textAlign: "center", fontWeight: "600" },
  backButton: { marginTop: 30, alignItems: "center", paddingVertical: 10 },
  backButtonText: { fontSize: 14, fontWeight: "600" },
});
