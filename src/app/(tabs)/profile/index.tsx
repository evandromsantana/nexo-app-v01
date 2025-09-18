import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
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
import { UserProfile } from "@/types/user";
import ProfileActions from "../../../components/app/profile/ProfileActions";
import ProfileHeader from "../../../components/app/profile/ProfileHeader";
import ProfileInfoBox from "../../../components/app/profile/ProfileInfoBox";

// Definimos um tipo local para o perfil que corresponde ao retorno da API.
// Este tipo garante que `photoUrl` é `string | undefined`.
type ProfileState =
  | (Omit<UserProfile, "photoUrl"> & { photoUrl: string | undefined })
  | null;

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  // Usamos o novo tipo para o estado do perfil.
  const [userProfile, setUserProfile] = useState<ProfileState>(null);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (user) {
        const fetchProfile = async () => {
          try {
            const profile = await getUserProfile(user.uid);

            // ✅ CORREÇÃO: Garantimos a conversão do tipo antes de definir o estado.
            // Isso resolve a incompatibilidade mesmo que a inferência de tipo falhe.
            if (profile) {
              const correctlyTypedProfile = {
                ...profile,
                photoUrl: profile.photoUrl ?? undefined,
              };
              setUserProfile(correctlyTypedProfile);
            } else {
              setUserProfile(null);
            }
          } catch (error) {
            console.error("Failed to fetch user profile:", error);
          } finally {
            setIsLoading(false);
          }
        };
        fetchProfile();
      }
    }, [user])
  );

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
        {/* Agora isto funciona porque `userProfile.photoUrl` é `string | undefined` */}
        <ProfileHeader
          photoUrl={userProfile.photoUrl}
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
