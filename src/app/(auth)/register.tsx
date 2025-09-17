
import {
  COLORS,
  FONT_SIZE,
  FONT_WEIGHT,
  RADIUS,
  SHADOWS,
  SPACING,
} from "@/constants";
import { Link } from "expo-router";
import AuthHeader from "../../components/app/AuthHeader";
import RegisterForm from "../../components/app/RegisterForm";
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
      <AuthHeader title="Crie a sua Conta" subtitle="Comece a trocar conhecimento hoje mesmo." />

      <RegisterForm
        displayName={displayName}
        setDisplayName={setDisplayName}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        onRegister={handleRegister}
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
