// src/app/(auth)/welcome.tsx


import { COLORS } from "@/constants";
import AuthHeader from "../../components/app/AuthHeader";
import WelcomeButtons from "../../components/app/WelcomeButtons";
import { Link } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

// Estrutura do componente como função anônima, conforme 04-CODING-STANDARDS.md
const WelcomeScreen = () => {
  return (
    <View style={styles.container}>
      <AuthHeader title="Bem-vindo ao Nexo" subtitle="Sua comunidade de troca de conhecimento." />

      <WelcomeButtons />
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
  
  
});

export default WelcomeScreen;
