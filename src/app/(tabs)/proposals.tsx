import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  getProposalsForUser,
  getUserProfile,
  updateProposalStatus,
} from "../../api/firestore";
import { COLORS } from "../../constants/colors";
import { useAuth } from "../../hooks/useAuth";
import { Proposal, ProposalWithId } from "../../types/proposal";
import { UserProfile } from "../../types/user";

// Componente de cartão de proposta
const ProposalCard = ({
  proposal,
  type,
  onUpdate,
  userProfiles,
  currentUserId,
}: {
  proposal: ProposalWithId;
  type: "received" | "sent";
  onUpdate: (
    proposalId: string,
    status: "accepted" | "declined" | "completed",
    proposerId: string,
    recipientId: string
  ) => Promise<void>;
  userProfiles: Record<string, UserProfile>;
  currentUserId: string | undefined;
}) => {
  const otherUserId =
    type === "received" ? proposal.proposerId : proposal.recipientId;
  const otherUser = userProfiles[otherUserId];

  const handleUpdate = (status: "accepted" | "declined" | "completed") => {
    onUpdate(proposal.id, status, proposal.proposerId, proposal.recipientId);
  };

  return (
    <View style={styles.card}>
      <Text style={styles.cardText}>
        {type === "received"
          ? `De: ${otherUser?.displayName || "..."}`
          : `Para: ${otherUser?.displayName || "..."}`}
      </Text>

      <View style={styles.badge}>
        <Text style={styles.badgeText}>
          Habilidade: {proposal.skillName}
        </Text>
      </View>

      <Text style={styles.cardStatus}>Status: {proposal.status}</Text>

      {type === "received" && proposal.status === "pending" && (
        <View style={styles.buttonGroup}>
          <Pressable
            style={[styles.button, styles.buttonAccept]}
            onPress={() => handleUpdate("accepted")}>
            <Text style={styles.buttonText}>Aceitar</Text>
          </Pressable>
          <Pressable
            style={[styles.button, styles.buttonDecline]}
            onPress={() => handleUpdate("declined")}>
            <Text style={styles.buttonText}>Recusar</Text>
          </Pressable>
        </View>
      )}

      {type === "sent" &&
        proposal.status === "accepted" &&
        proposal.proposerId === currentUserId && (
          <Pressable
            style={[styles.button, styles.buttonComplete]}
            onPress={() => handleUpdate("completed")}>
            <Text style={styles.buttonText}>Marcar como Concluída</Text>
          </Pressable>
        )}
    </View>
  );
};

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
    return (
      <ActivityIndicator
        style={styles.centered}
        size="large"
        color={COLORS.primary}
      />
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Propostas Recebidas</Text>
      <FlatList
        data={proposals.received}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProposalCard
            proposal={item}
            type="received"
            onUpdate={handleUpdateStatus}
            userProfiles={userProfiles}
            currentUserId={user?.uid}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Nenhuma proposta recebida.</Text>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      <Text style={styles.title}>Propostas Enviadas</Text>
      <FlatList
        data={proposals.sent}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProposalCard
            proposal={item}
            type="sent"
            onUpdate={handleUpdateStatus}
            userProfiles={userProfiles}
            currentUserId={user?.uid}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Nenhuma proposta enviada.</Text>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: COLORS.background },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.primary,
    marginTop: 20,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  card: {
    backgroundColor: COLORS.background,
    padding: 15,
    borderRadius: 15,
    marginVertical: 5,
    marginHorizontal: 10,
    shadowColor: COLORS.grayDark,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  cardText: { fontSize: 16, color: COLORS.grayDark },
  cardSkill: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.primary,
    marginVertical: 5,
  },
  cardStatus: { fontSize: 14, fontStyle: "italic", color: COLORS.secondary },
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: COLORS.grayDark,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonAccept: { backgroundColor: COLORS.success },
  buttonDecline: { backgroundColor: COLORS.danger },
  buttonComplete: { backgroundColor: COLORS.primary },
  buttonText: { color: COLORS.white, fontWeight: "bold", fontSize: 14 },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.info,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    marginVertical: 4,
  },
  badgeText: { color: COLORS.white, fontSize: 12, fontWeight: "bold" },
  emptyText: { textAlign: "center", color: COLORS.grayDark, marginTop: 20 },
});
