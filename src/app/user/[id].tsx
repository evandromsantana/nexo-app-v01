import { COLORS } from "@/constants";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { getUserProfile } from "../../api/firestore";
import UserDetailDisplay from "../../components/app/profile/UserDetailDisplay";
import ProposeTradeButton from "../../components/app/proposals/ProposeTradeButton";
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
      <UserDetailDisplay userProfile={userProfile} />

      <ProposeTradeButton onPress={handleProposeTrade} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: COLORS.background },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
});
