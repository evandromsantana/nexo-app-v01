import { Link } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { getUserProfile } from "@/api/firestore";
import { COLORS } from "@/constants/colors";
import { useAuth } from "@/hooks/useAuth";
import { UserProfile } from "@/types/user";

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        try {
          setIsLoading(true);
          const profile = await getUserProfile(user.uid);
          setUserProfile(profile);
        } catch (error) {
          console.error("Failed to fetch user profile:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchProfile();
    }
  }, [user]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!userProfile) {
    return (
      <View style={styles.centered}>
        <Text>Perfil não encontrado.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.profileavatar}>
          <Image
            source={
              userProfile.photoUrl
                ? { uri: userProfile.photoUrl }
                : require("@/assets/default-avatar.png") // Fallback image
            }
            style={styles.avatar}
          />

          <Text style={styles.name}>
            {userProfile?.displayName || "Usuário"}
          </Text>
          <Text style={styles.email}>{userProfile?.email}</Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Saldo de Tempo</Text>
          <Text style={styles.infoContent}>
            {userProfile?.timeBalance || 0} minutos
          </Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Bio</Text>
          <Text style={styles.infoContent}>
            {userProfile?.bio || "Nenhuma bio definida."}
          </Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Habilidades para ensinar</Text>
          <Text style={styles.infoContent}>
            {userProfile?.skillsToTeach?.join(", ") ||
              "Nenhuma habilidade definida."}
          </Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Habilidades para aprender</Text>
          <Text style={styles.infoContent}>
            {userProfile?.skillsToLearn?.join(", ") ||
              "Nenhuma habilidade definida."}
          </Text>
        </View>

        <Link href="/profile/edit-profile" asChild>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Editar Perfil</Text>
          </TouchableOpacity>
        </Link>

        <TouchableOpacity
          style={[styles.button, styles.logoutButton]}
          onPress={logout}>
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    backgroundColor: COLORS.background,
    padding: 20,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  profileavatar: {
    alignItems: "center",
    justifyContent: "center",
    padding: 15,

    marginTop: 20,
    width: "100%",
  },
  name: {
    fontSize: 26,
    fontWeight: "bold" as any,
    color: COLORS.primary,
  },
  email: {
    fontSize: 16,
    color: COLORS.grayDark,
    marginBottom: 20,
  },
  infoBox: {
    backgroundColor: COLORS.card,
    width: "100%",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "bold" as any,
    color: COLORS.grayDark,
  },
  infoContent: { fontSize: 16, color: COLORS.primary, marginTop: 5 },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    width: "100%",
    marginTop: 15,
  },
  buttonText: { color: COLORS.white, fontWeight: "bold" as any, fontSize: 16 },
  logoutButton: { backgroundColor: COLORS.accent },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
    backgroundColor: COLORS.grayLight,
  },
});
