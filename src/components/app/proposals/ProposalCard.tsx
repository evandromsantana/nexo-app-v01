import React from "react";
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Image,
  ActivityIndicator,
} from "react-native";
import { COLORS } from "@/constants";
import { ProposalWithId } from "../../../types/proposal";
import { UserProfile } from "../../../types/user";

interface ProposalCardProps {
  proposal: ProposalWithId;
  type: "received" | "sent" | "pending";
  onUpdate: (
    variables: {
      proposalId: string;
      status: "accepted" | "declined" | "completed";
      proposerId: string;
      recipientId: string;
    }
  ) => void;
  userProfiles: Record<string, UserProfile>;
  currentUserId: string | undefined;
  currentUserProfile: UserProfile | null | undefined;
  isUpdatingProposal: boolean;
}

const ProposalCard = ({
  proposal,
  type,
  onUpdate,
  userProfiles,
  currentUserId,
  currentUserProfile,
  isUpdatingProposal,
}: ProposalCardProps) => {
  const otherUserId =
    type === "received" ? proposal.proposerId : proposal.recipientId;
  const otherUser = userProfiles[otherUserId];

  const handleUpdate = (status: "accepted" | "declined" | "completed") => {
    onUpdate({
      proposalId: proposal.id,
      status,
      proposerId: proposal.proposerId,
      recipientId: proposal.recipientId,
    });
  };

  // Logic for time balance display
  let balanceMessage = "";
  let balanceColor = COLORS.textSecondary;

  if (currentUserProfile) {
    const cost = proposal.costInMinutes;
    let payerBalance = 0;

    if (type === "received") {
      // Current user is recipient, proposer needs to pay
      const proposerProfile = userProfiles[proposal.proposerId];
      payerBalance = proposerProfile?.timeBalance || 0;
      if (payerBalance >= cost) {
        balanceMessage = `Proponente tem ${payerBalance} min. Saldo suficiente para ${cost} min.`;
        balanceColor = COLORS.success;
      } else {
        balanceMessage = `Proponente tem ${payerBalance} min. Saldo insuficiente para ${cost} min.`;
        balanceColor = COLORS.danger;
      }
    } else { // type === "sent"
      // Current user is proposer, current user needs to pay
      payerBalance = currentUserProfile.timeBalance || 0;
      if (payerBalance >= cost) {
        balanceMessage = `Você tem ${payerBalance} min. Saldo suficiente para ${cost} min.`;
        balanceColor = COLORS.success;
      } else {
        balanceMessage = `Você tem ${payerBalance} min. Saldo insuficiente para ${cost} min.`;
        balanceColor = COLORS.danger;
      }
    }
  }

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Image
          source={
            otherUser?.photoUrl
              ? { uri: otherUser.photoUrl }
              : require("../../../assets/default-avatar.png")
          }
          style={styles.avatar}
        />
        <View>
          <Text style={styles.cardText}>
            {type === "received"
              ? `De: ${otherUser?.displayName || "..."}`
              : `Para: ${otherUser?.displayName || "..."}`}
          </Text>
          <Text style={styles.cardSkill}>Habilidade: {String(proposal.skillName)}</Text>
        </View>
      </View>

      <Text style={styles.cardDate}>
        Enviada em:{" "}
        {proposal.createdAt?.toDate
          ? proposal.createdAt.toDate().toLocaleDateString("pt-BR")
          : "..."}
      </Text>
      <Text style={styles.cardStatus}>Status: {String(proposal.status)}</Text>
      {balanceMessage ? (
        <Text style={[styles.balanceText, { color: balanceColor }]}>
          {String(balanceMessage)}
        </Text>
      ) : null}

      {type === "received" &&
        (proposal.status === "pending" ? (
          <View style={styles.buttonGroup}>
            <Pressable
              style={[styles.button, styles.buttonAccept]}
              onPress={() => handleUpdate("accepted")}
              disabled={isUpdatingProposal}> 
              {isUpdatingProposal ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <Text style={styles.buttonText}>Aceitar</Text>
              )}
            </Pressable>
            <Pressable
              style={[styles.button, styles.buttonDecline]}
              onPress={() => handleUpdate("declined")}
              disabled={isUpdatingProposal}> 
              {isUpdatingProposal ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <Text style={styles.buttonText}>Recusar</Text>
              )}
            </Pressable>
          </View>
        ) : (
          <View style={styles.statusFeedback}>
            <Text style={styles.statusFeedbackText}>
              {proposal.status === "accepted" && "Você aceitou esta proposta."}
              {proposal.status === "declined" && "Você recusou esta proposta."}
              {proposal.status === "completed" && "Esta troca foi concluída."}
            </Text>
          </View>
        ))}

      {type === "sent" &&
        proposal.status === "accepted" &&
        proposal.proposerId === currentUserId && (
          <Pressable
            style={[styles.button, styles.buttonComplete]}
            onPress={() => handleUpdate("completed")}
            disabled={isUpdatingProposal}> 
            {isUpdatingProposal ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Text style={styles.buttonText}>Marcar como Concluída</Text>
            )}
          </Pressable>
        )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
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
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  cardText: { fontSize: 16, color: COLORS.textPrimary, fontWeight: "bold" },
  cardSkill: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginVertical: 2,
  },
  cardDate: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 5 },
  cardStatus: { fontSize: 14, fontStyle: "italic", color: COLORS.secondary, marginBottom: 5 },
  balanceText: { fontSize: 14, fontWeight: "bold", marginBottom: 10 },
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
  statusFeedback: {
    marginTop: 10,
    padding: 10,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    alignItems: 'center',
  },
  statusFeedbackText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontStyle: 'italic',
  },
});

export default ProposalCard;