import LogoNexo4Pro from "@/components/Logo";
import {
  COLORS,
  FONT_SIZE,
  FONT_WEIGHT,
  RADIUS,
  SHADOWS,
  SPACING,
} from "@/constants";
import { Link } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../hooks/useAuth";

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError("Por favor, insira um email válido.");
      return;
    }
    if (!password) {
      setError("Por favor, insira sua senha.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await login(email.trim(), password);
    } catch (err: any) {
      console.error(err);
      setError("Erro ao fazer login. Confira suas credenciais.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}>
      {/* Logo + título */}
      <View style={styles.logoContainer}>
        <LogoNexo4Pro />
        <Text style={styles.title}>Bem-vindo de volta</Text>
        <Text style={styles.subtitle}>Seu conhecimento é a sua moeda.</Text>
      </View>

      {/* Formulário */}
      <View style={styles.form}>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TextInput
          style={styles.input}
          placeholder="Digite seu email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          placeholderTextColor={COLORS.gray + "99"}
        />
        <TextInput
          style={styles.input}
          placeholder="Digite sua senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor={COLORS.gray + "99"}
        />

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.7 }]}
          onPress={handleLogin}
          disabled={loading}>
          <Text style={styles.buttonText}>
            {loading ? "Entrando..." : "Login"}
          </Text>
        </TouchableOpacity>

        <Link href="/register" asChild>
          <Pressable style={styles.link}>
            <Text style={styles.linkText}>
              Não tem uma conta?{" "}
              <Text style={styles.linkHighlight}>Cadastre-se</Text>
            </Text>
          </Pressable>
        </Link>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: FONT_SIZE["2xl"],
    fontWeight: FONT_WEIGHT.bold as any,
    color: COLORS.primary,
    marginTop: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.grayDark,
    marginTop: SPACING.xs,
    textAlign: "center",
  },
  form: {
    width: "100%",
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray,
    fontSize: FONT_SIZE.md,
    color: COLORS.grayDark,
    ...SHADOWS.sm,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: "center",
    ...SHADOWS.md,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold as any,
  },
  link: {
    marginTop: SPACING.lg,
    alignItems: "center",
  },
  linkText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.grayDark,
  },
  linkHighlight: {
    color: COLORS.accent,
    fontWeight: FONT_WEIGHT.bold as any,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: FONT_SIZE.sm,
    marginBottom: SPACING.sm,
    textAlign: "center",
  },
});
