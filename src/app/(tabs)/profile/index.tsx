import { useQuery } from "@tanstack/react-query";
import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { getUserProfile } from "@/api/firestore";
import { COLORS } from "@/constants";
import { useAuth } from "@/hooks/useAuth";
import ProfileActions from "../../../components/app/profile/ProfileActions";
import ProfileHeader from "../../../components/app/profile/ProfileHeader";
import ProfileInfoBox from "../../../components/app/profile/ProfileInfoBox";

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const {
    data: userProfile,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["userProfile", user?.uid],
    queryFn: () => getUserProfile(user!.uid),
    enabled: !!user, // Apenas executa a query se o utilizador existir
  });

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (isError || !userProfile) {
    return (
      <View style={styles.centered}>
        <Text>Perfil não encontrado ou erro ao carregar.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <ProfileHeader
          photoUrl={userProfile.photoUrl ?? undefined}
          displayName={userProfile.displayName}
          email={userProfile.email || undefined}
        />

        <ProfileInfoBox
          title="Saldo de Tempo"
          content={`${userProfile?.timeBalance || 0} minutos`}
        />

        <ProfileInfoBox
          title="Bio"
          content={userProfile?.bio || "Nenhuma bio definida."}
        />

        <ProfileInfoBox
          title="Habilidades para ensinar"
          content={
            userProfile?.skillsToTeach && userProfile.skillsToTeach.length > 0
              ? userProfile.skillsToTeach
                  .map((s) => `${s.skillName} (x${s.multiplier})`)
                  .join("\n")
              : "Nenhuma habilidade definida."
          }
        />

        <ProfileInfoBox
          title="Habilidades para aprender"
          content={
            userProfile?.skillsToLearn?.join(", ") ||
            "Nenhuma habilidade definida."
          }
        />

        <ProfileActions onLogout={logout} />
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
});

