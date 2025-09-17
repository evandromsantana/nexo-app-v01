import React from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { COLORS } from "@/constants";
import { ProposalWithId } from "../../types/proposal";
import { UserProfile } from "../../types/user";

// Componente de cartão de proposta (copiado de proposals.tsx)
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
        <Text style={styles.badgeText}>Habilidade: {proposal.skillName}</Text>
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

interface ProposalListProps {
  title: string;
  proposals: ProposalWithId[];
  userProfiles: Record<string, UserProfile>;
  currentUserId: string | undefined;
  onUpdate: (
    proposalId: string,
    status: "accepted" | "declined" | "completed",
    proposerId: string,
    recipientId: string
  ) => Promise<void>;
  onRefresh: () => void;
  refreshing: boolean;
  emptyMessage: string;
}

const ProposalList: React.FC<ProposalListProps> = ({
  title,
  proposals,
  userProfiles,
  currentUserId,
  onUpdate,
  onRefresh,
  refreshing,
  emptyMessage,
}) => {
  return (
    <>
      <Text style={styles.title}>{title}</Text>
      <FlatList
        data={proposals}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProposalCard
            proposal={item}
            type={title.includes("Recebidas") ? "received" : "sent"}
            onUpdate={onUpdate}
            userProfiles={userProfiles}
            currentUserId={currentUserId}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>{emptyMessage}</Text>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </>
  );
};

const styles = StyleSheet.create({
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

export default ProposalList;