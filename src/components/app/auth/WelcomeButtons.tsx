import { COLORS } from "@/constants";
import { Link } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

const WelcomeButtons: React.FC = () => {
  return (
    <>
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
    </>
  );
};

const styles = StyleSheet.create({
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

export default WelcomeButtons;