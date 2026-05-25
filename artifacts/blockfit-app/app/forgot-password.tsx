import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { gymApi } from "@/lib/api";
import Animated, { FadeInDown } from "react-native-reanimated";

export default function ForgotPasswordScreen() {
  const colors = useColors();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleResetRequest = async () => {
    if (!email) {
      setError("Por favor, ingresa tu correo electrónico.");
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const res = await gymApi.forgotPassword(email);
      if (res.success) {
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err.message || "Error al solicitar la recuperación.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={colors.gradientBackground} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.content}>
        <Animated.View entering={FadeInDown.duration(600)} style={styles.form}>
          <Text style={[styles.title, { color: colors.foreground }]}>Recuperar</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Ingresa tu correo electrónico asociado a la cuenta. Te enviaremos un código para restablecer tu contraseña.
          </Text>

          {success ? (
            <View style={styles.successContainer}>
              <Text style={[styles.successText, { color: colors.primary }]}>
                ¡Listo! Hemos generado un token de recuperación. Revisa la consola del servidor (temporalmente) o tu correo.
              </Text>
              <Pressable 
                onPress={() => router.push("/reset-password")} 
                style={[styles.button, { backgroundColor: colors.primary }]}
              >
                <Text style={styles.buttonText}>INGRESAR TOKEN</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <Text style={[styles.label, { color: colors.primary, marginTop: 40 }]}>EMAIL</Text>
              <TextInput
                style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.secondary }]}
                placeholder="tu@email.com"
                placeholderTextColor={colors.mutedForeground}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />

              {error && <Text style={styles.errorText}>{error}</Text>}

              <Pressable 
                onPress={handleResetRequest} 
                disabled={loading}
                style={({ pressed }) => [
                  styles.button, 
                  { backgroundColor: colors.primary, opacity: pressed || loading ? 0.8 : 1 }
                ]}
              >
                {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>ENVIAR INSTRUCCIONES</Text>}
              </Pressable>
            </>
          )}

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
  successContainer: { marginTop: 40 },
  successText: { fontSize: 16, fontWeight: "600", textAlign: "center", marginBottom: 20, lineHeight: 24 },
  backButton: { marginTop: 30, alignItems: "center", paddingVertical: 10 },
  backButtonText: { fontSize: 14, fontWeight: "600" },
});
