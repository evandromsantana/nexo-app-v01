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

export default function RegisterScreen() {
  const { register } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    if (!displayName) {
      setError("Por favor, insira seu nome de exibição.");
      return;
    }
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError("Por favor, insira um email válido.");
      return;
    }
    if (!password) {
      setError("Por favor, insira uma senha.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await register(email.trim(), password, displayName);
    } catch (err: any) {
      console.error(err);
      setError("Erro ao cadastrar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={styles.logoContainer}>
        <Text style={styles.title}>Cadastro</Text>
        <Text style={styles.subtitle}>Crie sua conta para começar 🚀</Text>
      </View>

      <View style={styles.form}>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TextInput
          style={styles.input}
          placeholder="Nome de Exibição"
          value={displayName}
          onChangeText={setDisplayName}
          autoCapitalize="words"
          placeholderTextColor={COLORS.gray + "99"}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          placeholderTextColor={COLORS.gray + "99"}
        />
        <TextInput
          style={styles.input}
          placeholder="Senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor={COLORS.gray + "99"}
        />

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.7 }]}
          onPress={handleRegister}
          disabled={loading}>
          <Text style={styles.buttonText}>
            {loading ? "Cadastrando..." : "Cadastrar"}
          </Text>
        </TouchableOpacity>

        <Link href="/login" asChild>
          <Pressable style={styles.link}>
            <Text style={styles.linkText}>
              Já tem uma conta?{" "}
              <Text style={styles.linkHighlight}>Faça login</Text>
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
