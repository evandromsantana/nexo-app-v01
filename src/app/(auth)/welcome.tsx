// src/app/(auth)/welcome.tsx

import LogoNexo4Pro from "@/components/Logo";
import { Link } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../../constants/Colors";

// Estrutura do componente como função anônima, conforme 04-CODING-STANDARDS.md
const WelcomeScreen = () => {
  return (
    <View style={styles.container}>
      <LogoNexo4Pro />
      <Text style={styles.title}>Bem-vindo ao Nexo</Text>
      <Text style={styles.subtitle}>
        Sua comunidade de troca de conhecimento.
      </Text>

      <Link href="/login" asChild>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Entrar</Text>
        </TouchableOpacity>
      </Link>

      <Link href="/register" asChild>
        <TouchableOpacity style={[styles.button, styles.buttonOutline]}>
          <Text style={[styles.buttonText, styles.buttonOutlineText]}>
            Criar Conta
          </Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 28, // H1 (Títulos de Tela): 28px, Bold
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 10,
    fontFamily: "NunitoSans-Bold", // Supondo que a fonte será configurada
  },
  subtitle: {
    fontSize: 16, // Corpo (Texto principal): 16px, Regular
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 40,
    fontFamily: "NunitoSans-Regular",
  },
  button: {
    backgroundColor: COLORS.accent,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    marginBottom: 15,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16, // Corpo (Texto principal): 16px, Regular
    fontWeight: "bold",
    fontFamily: "NunitoSans-Bold",
  },
  buttonOutline: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
  buttonOutlineText: {
    color: COLORS.accent,
  },
});

export default WelcomeScreen;
