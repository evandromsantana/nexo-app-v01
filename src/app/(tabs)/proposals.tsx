import { COLORS } from "@/constants";
import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import {
  getProposalsForUser,
  getUserProfile,
  updateProposalStatus,
} from "../../api/firestore";
import ProposalList from "../../components/app/proposals/ProposalList";
import LoadingIndicator from "../../components/ui/LoadingIndicator";
import { useAuth } from "../../hooks/useAuth";
import { ProposalWithId } from "../../types/proposal";
import { UserProfile } from "../../types/user";

export default function ProposalsScreen() {
  const { user } = useAuth();
  const [proposals, setProposals] = useState<{
    received: ProposalWithId[];
    sent: ProposalWithId[];
  }>({ received: [], sent: [] });
  const [userProfiles, setUserProfiles] = useState<Record<string, UserProfile>>(
    {}
  );
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProposals = useCallback(async () => {
    if (!user) return;
    try {
      const { received, sent } = await getProposalsForUser(user.uid);
      setProposals({ received, sent });

      const allUserIds = [
        ...received.map((p) => p.proposerId),
        ...sent.map((p) => p.recipientId),
      ];
      const uniqueUserIds = [...new Set(allUserIds)];

      const profilesToFetch = uniqueUserIds.filter(
        (id) => !(userProfiles as Record<string, UserProfile>)[id]
      );
      if (profilesToFetch.length > 0) {
        const fetchedProfiles = await Promise.all(
          profilesToFetch.map((id) => getUserProfile(id))
        );
        const newProfiles: Record<string, UserProfile> = {};
        fetchedProfiles.forEach((profile) => {
          if (profile) newProfiles[profile.uid] = profile;
        });
        setUserProfiles((prev) => ({ ...prev, ...newProfiles }));
      }
    } catch (error) {
      console.error("Failed to fetch proposals:", error);
    }
  }, [user, userProfiles]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    await fetchProposals();
    setIsLoading(false);
  }, [fetchProposals]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchProposals();
    setRefreshing(false);
  }, [fetchProposals]);

  useEffect(() => {
    if (user) loadData();
  }, [user, loadData]);

  const handleUpdateStatus = async (
    proposalId: string,
    status: "accepted" | "declined" | "completed",
    proposerId: string,
    recipientId: string
  ) => {
    try {
      await updateProposalStatus(proposalId, status, proposerId, recipientId);
      onRefresh();
    } catch (error) {
      console.error("Failed to update proposal status:", error);
    }
  };

  if (isLoading) {
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
        onRefresh={onRefresh}
        refreshing={refreshing}
        emptyMessage="Nenhuma proposta recebida."
      />

      <ProposalList
        title="Propostas Enviadas"
        proposals={proposals.sent}
        userProfiles={userProfiles}
        currentUserId={user?.uid}
        onUpdate={handleUpdateStatus}
        onRefresh={onRefresh}
        refreshing={refreshing}
        emptyMessage="Nenhuma proposta enviada."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: COLORS.background },
});
