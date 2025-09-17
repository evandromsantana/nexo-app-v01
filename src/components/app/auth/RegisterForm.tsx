import { COLORS, FONT_SIZE, FONT_WEIGHT, RADIUS, SHADOWS, SPACING } from "@/constants";
import { Link } from "expo-router";
import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface RegisterFormProps {
  displayName: string;
  setDisplayName: (displayName: string) => void;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  onRegister: () => void;
  isLoading: boolean;
  error: string | null;
}

const RegisterForm: React.FC<RegisterFormProps> = ({
  displayName,
  setDisplayName,
  email,
  setEmail,
  password,
  setPassword,
  onRegister,
  isLoading,
  error,
}) => {
  return (
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
        style={[styles.button, isLoading && { opacity: 0.7 }]}
        onPress={onRegister}
        disabled={isLoading}>
        <Text style={styles.buttonText}>
          {isLoading ? "Cadastrando..." : "Cadastrar"}
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
  );
};

const styles = StyleSheet.create({
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

export default RegisterForm;