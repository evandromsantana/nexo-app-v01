// src/app/(auth)/register.tsx

import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS } from "../../constants/Colors";

// Estrutura do componente como função anônima
const RegisterScreen = () => {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleRegister = () => {
    // A lógica de cadastro com Firebase será adicionada aqui
    console.log("Register attempt:", { displayName, email, password });
    Alert.alert("Cadastro", `Nome: ${displayName}\nEmail: ${email}`);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backButtonText}>‹ Voltar</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Criar Conta</Text>

      {/* O fluxo de autenticação inclui uma tela de cadastro com campo para Nome */}
      <TextInput
        style={styles.input}
        placeholder="Seu nome completo"
        placeholderTextColor="#999"
        value={displayName}
        onChangeText={setDisplayName}
        autoCapitalize="words"
      />

      <TextInput
        style={styles.input}
        placeholder="Seu melhor e-mail"
        placeholderTextColor="#999"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Crie uma senha forte"
        placeholderTextColor="#999"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Cadastrar</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Já tem uma conta?</Text>
        <Link href="/login" asChild>
          <TouchableOpacity>
            <Text style={styles.footerLink}> Faça o login</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background, // Cinza Claro (Fundo)
    justifyContent: "center",
    padding: 20,
  },
  backButton: {
    position: "absolute",
    top: 60,
    left: 20,
  },
  backButtonText: {
    color: COLORS.primary, // Azul Petróleo Escuro
    fontSize: 16,
  },
  title: {
    fontSize: 28, // H1 (Títulos de Tela): 28px, Bold
    fontWeight: "bold",
    color: COLORS.primary, // Azul Petróleo Escuro
    marginBottom: 30,
    textAlign: "center",
  },
  input: {
    backgroundColor: COLORS.white, // Branco
    width: "100%",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16, // Corpo (Texto principal): 16px, Regular
    borderWidth: 1,
    borderColor: "#ddd",
    color: COLORS.text, // Cinza Escuro (Texto)
  },
  button: {
    backgroundColor: COLORS.accent, // Laranja Queimado (Ação/Destaque)
    paddingVertical: 15,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: COLORS.white, // Branco
    fontSize: 16,
    fontWeight: "bold",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  footerText: {
    fontSize: 16,
    color: COLORS.text, // Cinza Escuro (Texto)
  },
  footerLink: {
    fontSize: 16,
    color: COLORS.accent, // Laranja Queimado (Ação/Destaque)
    fontWeight: "bold",
  },
});

export default RegisterScreen;
