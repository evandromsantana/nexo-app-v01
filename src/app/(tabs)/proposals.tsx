import { COLORS } from "@/constants";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useMemo, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
  getProposalsForUser,
  updateProposalStatus,
} from "../../api/firestore/proposal";
import { fetchUserProfiles, getUserProfile } from "../../api/firestore/user";
import ProposalList from "../../components/app/proposals/ProposalList";
import LoadingIndicator from "../../components/ui/LoadingIndicator";

export default function ProposalsScreen() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"received" | "sent" | "pending">(
    "received"
  );

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

  // Query to fetch the current user's profile for timeBalance check
  const { data: currentUserProfile } = useQuery({
    queryKey: ["userProfile", user?.uid],
    queryFn: () => getUserProfile(user!.uid),
    enabled: !!user,
  });

  // 3. Mutation to update proposal status
  const { mutate: handleUpdateStatus, isPending: isUpdatingProposal } =
    useMutation({
      mutationFn: (variables: {
        proposalId: string;
        status: "accepted" | "declined" | "completed";
        proposerId: string;
        recipientId: string;
      }) => updateProposalStatus(variables.proposalId, variables.status),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["proposals", user?.uid] });
        Alert.alert("Sucesso", "Status da proposta atualizado com sucesso!");
      },
      onError: (error: any) => {
        console.error("Failed to update proposal status:", error);
        Alert.alert(
          "Erro",
          error.message || "Não foi possível atualizar o status da proposta."
        );
      },
    });

  // Define variables for the active tab before the main return
  const activeProposals = useMemo(() => {
    if (activeTab === "received") {
      return proposals.received;
    } else if (activeTab === "sent") {
      return proposals.sent;
    } else {
      // activeTab === "pending"
      return [...proposals.received, ...proposals.sent].filter(
        (p) => p.status === "pending"
      );
    }
  }, [activeTab, proposals]);

  const emptyMessage = useMemo(() => {
    if (activeTab === "received") {
      return "Nenhuma proposta recebida.";
    } else if (activeTab === "sent") {
      return "Nenhuma proposta enviada.";
    } else {
      // activeTab === "pending"
      return "Nenhuma proposta pendente.";
    }
  }, [activeTab]);

  if (proposalsLoading || profilesLoading) {
    return <LoadingIndicator />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "received" && styles.activeTabButton,
          ]}
          onPress={() => setActiveTab("received")}>
          <Text
            style={[
              styles.tabButtonText,
              activeTab === "received" && styles.activeTabButtonText,
            ]}>
            Recebidas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "sent" && styles.activeTabButton,
          ]}
          onPress={() => setActiveTab("sent")}>
          <Text
            style={[
              styles.tabButtonText,
              activeTab === "sent" && styles.activeTabButtonText,
            ]}>
            Enviadas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "pending" && styles.activeTabButton,
          ]}
          onPress={() => setActiveTab("pending")}>
          <Text
            style={[
              styles.tabButtonText,
              activeTab === "pending" && styles.activeTabButtonText,
            ]}>
            Pendentes
          </Text>
        </TouchableOpacity>
      </View>

      <ProposalList
        type={activeTab}
        proposals={activeProposals}
        userProfiles={userProfiles}
        currentUserId={user?.uid}
        currentUserProfile={currentUserProfile}
        onUpdate={handleUpdateStatus}
        onRefresh={refetchProposals}
        refreshing={isRefetching}
        emptyMessage={emptyMessage}
        isUpdatingProposal={isUpdatingProposal}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: COLORS.background,
  },
  tabContainer: {
    flexDirection: "row",
    marginTop: 30,
    backgroundColor: COLORS.card,
    borderRadius: 10,
    overflow: "hidden",
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8, // Added for pill shape
  },
  activeTabButton: {
    backgroundColor: COLORS.primary, // Changed to background color
  },
  tabButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "LeagueSpartan-SemiBold",
    color: COLORS.textSecondary,
  },
  activeTabButtonText: {
    color: COLORS.white, // Changed text color for contrast
  },
});
