import { COLORS } from "@/constants";
import { UserProfile } from "@/types/user";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { getUserProfile } from "../../api/firestore";
import UserDetailDisplay from "../../components/app/profile/UserDetailDisplay";
import ProposeTradeButton from "../../components/app/proposals/ProposeTradeButton";

export default function UserDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { 
    data: userProfile, 
    isLoading, 
    isError 
  } = useQuery<UserProfile | null, Error>({ 
    queryKey: ["userProfile", id],
    queryFn: () => getUserProfile(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <ActivityIndicator
        style={styles.centered}
        size="large"
        color={COLORS.primary}
      />
    );
  }

  if (isError || !userProfile) {
    return (
      <View style={styles.centered}>
        <Text>User not found.</Text>
      </View>
    );
  }

  const handleProposeTrade = () => {
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
