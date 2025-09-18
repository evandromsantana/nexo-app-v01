import { Link, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
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
import { COLORS } from "@/constants";
import { useAuth } from "@/hooks/useAuth";
import { UserProfile } from "@/types/user";
import ProfileHeader from "../../../components/app/profile/ProfileHeader";
import ProfileInfoBox from "../../../components/app/profile/ProfileInfoBox";
import ProfileActions from "../../../components/app/profile/ProfileActions";

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null) as [UserProfile | null, React.Dispatch<React.SetStateAction<UserProfile | null>>];
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (user) {
        const fetchProfile = async () => {
          try {
            // No need to set loading to true here as it might cause a flicker
            const profile = await getUserProfile(user.uid);
            setUserProfile(profile);
          } catch (error) {
            console.error("Failed to fetch user profile:", error);
          } finally {
            setIsLoading(false); // Set loading to false after the first fetch
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
        <ProfileHeader photoUrl={userProfile.photoUrl} displayName={userProfile.displayName} email={userProfile.email || undefined} />

        <ProfileInfoBox title="Saldo de Tempo" content={`${userProfile?.timeBalance || 0} minutos`} />

        <ProfileInfoBox title="Bio" content={userProfile?.bio || "Nenhuma bio definida."} />

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
