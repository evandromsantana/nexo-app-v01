import { COLORS } from "@/constants";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Button,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { getUserProfile } from "../../api/firestore";
import { UserProfile } from "../../types/user";

export default function UserDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchProfile = async () => {
        try {
          const profile = await getUserProfile(id);
          setUserProfile(profile);
        } catch (error) {
          console.error("Failed to fetch user profile:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchProfile();
    }
  }, [id]);

  if (isLoading) {
    return (
      <ActivityIndicator
        style={styles.centered}
        size="large"
        color={COLORS.primary}
      />
    );
  }

  if (!userProfile) {
    return (
      <View style={styles.centered}>
        <Text>User not found.</Text>
      </View>
    );
  }

  const handleProposeTrade = () => {
    // Navigate to proposal creation screen, passing the user id
    router.push(`/propose/${id}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.name}>{userProfile.displayName}</Text>
      <Text style={styles.bio}>{userProfile.bio || "No bio."}</Text>

      <View style={styles.skillsContainer}>
        <Text style={styles.skillsTitle}>Habilidades para Ensinar:</Text>
        {userProfile.skillsToTeach.map((skill) => (
          <Text key={skill.skillName} style={styles.skill}>
            - {skill.skillName} (x{skill.multiplier})
          </Text>
        ))}
      </View>

      <View style={styles.skillsContainer}>
        <Text style={styles.skillsTitle}>Habilidades para Aprender:</Text>
        {userProfile.skillsToLearn.map((skill) => (
          <Text key={skill} style={styles.skill}>
            - {skill}
          </Text>
        ))}
      </View>

      <Button title="Propor Troca" onPress={handleProposeTrade} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: COLORS.background },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  name: {
    fontSize: 26,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 10,
  },
  bio: {
    fontSize: 16,
    color: COLORS.grayDark,
    marginBottom: 20,
    fontStyle: "italic",
  },
  skillsContainer: { marginBottom: 20 },
  skillsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 5,
  },
  skill: { fontSize: 16, color: COLORS.grayDark, marginLeft: 10 },
});
