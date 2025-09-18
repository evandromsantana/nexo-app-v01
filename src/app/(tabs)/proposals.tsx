import { COLORS } from "@/constants";
import { useAuth } from "@/hooks/useAuth";
import { ProposalWithId } from "@/types/proposal";
import { UserProfile } from "@/types/user";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import {
  getProposalsForUser,
  getUserProfile,
  updateProposalStatus,
} from "../../api/firestore";
import ProposalList from "../../components/app/proposals/ProposalList";
import LoadingIndicator from "../../components/ui/LoadingIndicator";

// Helper function to fetch multiple user profiles
const fetchUserProfiles = async (userIds: string[]) => {
  const uniqueUserIds = [...new Set(userIds)];
  const profilePromises = uniqueUserIds.map((id) => getUserProfile(id));
  const profiles = await Promise.all(profilePromises);

  const profileMap: Record<string, UserProfile> = {};
  profiles.forEach((profile) => {
    if (profile) {
      profileMap[profile.uid] = profile;
    }
  });
  return profileMap;
};

export default function ProposalsScreen() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // 1. Query to fetch proposals
  const { 
    data: proposals = { received: [], sent: [] }, 
    isLoading: proposalsLoading,
    refetch: refetchProposals,
    isRefetching,
  } = useQuery({
    queryKey: ["proposals", user?.uid],
    queryFn: () => getProposalsForUser(user!.uid),
    enabled: !!user,
  });

  // 2. Dependent query to fetch user profiles based on proposal data
  const allUserIds = useMemo(() => {
    if (!proposals) return [];
    const ids = [
      ...proposals.received.map((p) => p.proposerId),
      ...proposals.sent.map((p) => p.recipientId),
    ];
    return [...new Set(ids)];
  }, [proposals]);

  const { data: userProfiles = {}, isLoading: profilesLoading } = useQuery({
    queryKey: ["userProfiles", allUserIds],
    queryFn: () => fetchUserProfiles(allUserIds),
    enabled: allUserIds.length > 0, // Only run if there are user IDs to fetch
  });

  // 3. Mutation to update proposal status
  const { mutate: handleUpdateStatus } = useMutation({
    mutationFn: (variables: {
      proposalId: string;
      status: "accepted" | "declined" | "completed";
      proposerId: string;
      recipientId: string;
    }) => 
      updateProposalStatus(
        variables.proposalId,
        variables.status,
        variables.proposerId,
        variables.recipientId
      ),
    onSuccess: () => {
      // When mutation is successful, invalidate the proposals query to refetch
      queryClient.invalidateQueries({ queryKey: ["proposals", user?.uid] });
    },
    onError: (error) => {
      console.error("Failed to update proposal status:", error);
    },
  });

  if (proposalsLoading || profilesLoading) {
    return <LoadingIndicator />;
  }

  return (
    <View style={styles.container}>
      <ProposalList
        title="Propostas Recebidas"
        proposals={proposals.received}
        userProfiles={userProfiles}
        currentUserId={user?.uid}
        onUpdate={handleUpdateStatus}
        onRefresh={refetchProposals}
        refreshing={isRefetching}
        emptyMessage="Nenhuma proposta recebida."
      />

      <ProposalList
        title="Propostas Enviadas"
        proposals={proposals.sent}
        userProfiles={userProfiles}
        currentUserId={user?.uid}
        onUpdate={handleUpdateStatus}
        onRefresh={refetchProposals}
        refreshing={isRefetching}
        emptyMessage="Nenhuma proposta enviada."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: COLORS.background },
});
