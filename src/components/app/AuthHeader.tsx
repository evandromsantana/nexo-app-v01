import React from "react";
import { View, Text, StyleSheet } from "react-native";
import LogoNexo4Pro from "./Logo"; // Importa o Logo do mesmo diretório

interface AuthHeaderProps {
  title: string;
  subtitle: string;
}

const AuthHeader: React.FC<AuthHeaderProps> = ({ title, subtitle }) => {
  return (
    <View style={styles.logoContainer}>
      <LogoNexo4Pro />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  logoContainer: {
    alignItems: "center",
    marginBottom: 30, // Ajustado para um valor fixo, pode ser passado via props se necessário
  },
  title: {
    fontSize: 28, // FONT_SIZE["2xl"]
    fontWeight: "bold", // FONT_WEIGHT.bold
    color: "#EA1D2C", // COLORS.primary
    marginTop: 10, // SPACING.sm
  },
  subtitle: {
    fontSize: 14, // FONT_SIZE.sm
    color: "#757575", // COLORS.grayDark
    marginTop: 5, // SPACING.xs
    textAlign: "center",
  },
});

export default AuthHeader;