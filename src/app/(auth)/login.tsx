import { COLORS, SPACING } from "@/constants";
import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import AuthHeader from "../../components/app/AuthHeader";
import LoginForm from "../../components/app/LoginForm";
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
      <AuthHeader
        title="Bem-vindo de volta"
        subtitle="Seu conhecimento é a sua moeda."
      />

      <LoginForm
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        onLogin={handleLogin}
        isLoading={loading}
        error={error}
      />
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
});
