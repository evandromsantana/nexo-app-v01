import { Link } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getUserProfile } from "../../api/firestore";
import {
  COLORS,
  FONT_SIZE,
  FONT_WEIGHT,
  RADIUS,
  SHADOWS,
  SPACING,
} from "../../constants";
import { useAuth } from "../../hooks/useAuth";
import { UserProfile } from "../../types/user";

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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Nome e email */}
      <Text style={styles.name}>{userProfile?.displayName || "Usuário"}</Text>
      <Text style={styles.email}>{userProfile?.email}</Text>

      {/* Saldo de tempo */}
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>Saldo de Tempo</Text>
        <Text style={styles.infoContent}>
          {userProfile?.timeBalance || 0} minutos
        </Text>
      </View>

      {/* Bio */}
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>Bio</Text>
        <Text style={styles.infoContent}>
          {userProfile?.bio || "Nenhuma bio definida."}
        </Text>
      </View>

      {/* Editar perfil */}
      <Link href="/edit-profile" asChild>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Editar Perfil</Text>
        </TouchableOpacity>
      </Link>

      {/* Logout */}
      <TouchableOpacity
        style={[styles.button, styles.logoutButton]}
        onPress={logout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  name: {
    fontSize: FONT_SIZE["2xl"],
    fontWeight: FONT_WEIGHT.bold as any,
    color: COLORS.primary,
    marginTop: SPACING.lg,
  },
  email: {
    fontSize: FONT_SIZE.md,
    color: COLORS.grayDark,
    marginBottom: SPACING.xl,
  },
  infoBox: {
    backgroundColor: COLORS.card,
    width: "100%",
    padding: SPACING.lg,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  infoTitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.grayDark,
    fontWeight: FONT_WEIGHT.bold as any,
  },
  infoContent: {
    fontSize: FONT_SIZE.md,
    color: COLORS.primary,
    marginTop: SPACING.xs,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
    alignItems: "center",
    width: "100%",
    marginTop: SPACING.md,
    ...SHADOWS.md,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold as any,
  },
  logoutButton: {
    backgroundColor: COLORS.accent,
  },
});
