import { COLORS } from "@/constants";
import { useAuth } from "@/hooks/useAuth";
import { TaughtSkill, UserProfile } from "@/types/user";
import { Feather } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import { createProposal, getUserProfile } from "../../../api/firestore";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// --- Componente SkillTag modificado ---
const SkillTag = ({
  skill,
  isSelected,
  onPress,
}: {
  skill: TaughtSkill;
  isSelected: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.skillTag, isSelected && styles.selectedSkillTag]}>
    <Text
      style={[styles.skillTagText, isSelected && styles.selectedSkillTagText]}>
      {skill.skillName}
      {skill.multiplier && skill.multiplier !== 1 ? ` (x${skill.multiplier})` : ''}
    </Text>
  </TouchableOpacity>
);

interface UserInfoCardProps {
  user: UserProfile;
  onClose: () => void;
}

const UserInfoCard = ({ user: recipientUser, onClose }: UserInfoCardProps) => {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();

  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedSkill, setSelectedSkill] = useState<TaughtSkill | null>(null);
  const [feedback, setFeedback] = useState<{
    message: string;
    color: string;
  } | null>(null);

  // 1. Busca o perfil do usuário logado para checar o saldo
  const { data: currentUserProfile } = useQuery({
    queryKey: ["userProfile", currentUser?.uid],
    queryFn: () => getUserProfile(currentUser!.uid),
    enabled: !!currentUser,
  });

  // 2. Lógica de cálculo e verificação de saldo
  useEffect(() => {
    if (selectedSkill && currentUserProfile) {
      const cost = 60 * (selectedSkill.multiplier || 1); // Hardcoded 60 min duration
      if (currentUserProfile.timeBalance < cost) {
        setFeedback({
          message: `Saldo insuficiente (${currentUserProfile.timeBalance} min). Custo: ${cost} min.`,
          color: COLORS.danger,
        });
      } else {
        setFeedback({
          message: `Custo aula: ${cost} min.`,
          color: COLORS.success,
        });
      }
    } else {
      setFeedback(null);
    }
  }, [selectedSkill, currentUserProfile]);

  // 3. Mutação para criar a proposta
  const { mutate: sendProposal, isPending } = useMutation({
    mutationFn: async () => {
      if (!currentUser || !selectedSkill) {
        throw new Error("Usuário ou habilidade não selecionada.");
      }
      const cost = 60 * (selectedSkill.multiplier || 1);
      if (!currentUserProfile || currentUserProfile.timeBalance < cost) {
        throw new Error("Saldo de tempo insuficiente.");
      }
      const proposalPayload = {
        proposerId: currentUser.uid,
        recipientId: recipientUser.uid,
        skillName: selectedSkill.skillName,
        proposedDuration: 60,
        costInMinutes: cost,
      };

      // Explicitly remove 'id' if it somehow exists, as CreateProposalSchema does not expect it.
      const { id, ...finalPayload } = proposalPayload as any;

      await createProposal(finalPayload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["proposals", currentUser?.uid],
      });
      Alert.alert("Sucesso", "Sua proposta foi enviada!");
      onClose(); // Fecha o card ao enviar
    },
    onError: (error: Error) => {
      Alert.alert(
        "Erro",
        error.message || "Não foi possível enviar a proposta."
      );
    },
  });

  const toggleCard = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
    setIsExpanded(!isExpanded);
  };

  const handleSelectSkill = (skill: TaughtSkill) => {
    setSelectedSkill((prev) =>
      prev?.skillName === skill.skillName ? null : skill
    );
  };

  const canPropose =
    selectedSkill && currentUserProfile && feedback?.color !== COLORS.danger;

  return (
    <View style={styles.overlay}>
      <View style={styles.cardContainer}>
        <View style={styles.header}>
          <Image
            source={
              recipientUser.photoUrl
                ? { uri: recipientUser.photoUrl }
                : require("@/assets/default-avatar.png")
            }
            style={styles.cardAvatar}
          />
          <View style={styles.infoContainer}>
            <Text style={styles.cardName} numberOfLines={1}>
              {recipientUser.displayName}
            </Text>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={toggleCard}
              style={styles.expandHint}>
              <Text style={styles.topSkillText}>
                {isExpanded ? "Ver menos" : "Ver mais"}
              </Text>
              <Feather
                name={isExpanded ? "chevron-up" : "chevron-down"}
                size={16}
                color={COLORS.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {isExpanded && (
          <>
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={styles.expandedContent}>
              {recipientUser.skillsToTeach && recipientUser.skillsToTeach.length > 0 ? (
                <>
                  <View style={styles.skillContainer}>
                    <Text style={styles.cardSectionTitle}>
                      Selecionar habilidade:
                    </Text>

                    {feedback && (
                      <Text
                        style={[
                          styles.feedbackText,
                          { color: feedback.color },
                        ]}>
                        {feedback.message}
                      </Text>
                    )}
                  </View>

                  <View style={styles.skillContainer}>
                    {recipientUser.skillsToTeach.map((skill, i) => (
                      <SkillTag
                        key={`${i}-teach`}
                        skill={skill}
                        isSelected={
                          selectedSkill?.skillName === skill.skillName
                        }
                        onPress={() => handleSelectSkill(skill)}
                      />
                    ))}
                  </View>
                </>
              ) : (
                <Text style={styles.feedbackText}>
                  Este usuário não adicionou habilidades para ensinar.
                </Text>
              )}
              {recipientUser.bio && (
                <>
                  <Text style={styles.cardSectionTitle}>Sobre</Text>
                  <Text style={styles.cardBio}>{recipientUser.bio}</Text>
                </>
              )}
            </ScrollView>

            <View style={styles.expandedButtonContainer}>
              <TouchableOpacity
                style={[
                  styles.cardButton,
                  styles.proposeButton,
                  !canPropose && styles.disabledButton,
                ]}
                disabled={!canPropose || isPending}
                onPress={() => sendProposal()}>
                <Feather name="send" size={18} color={COLORS.white} />
                <Text style={styles.proposeButtonText}>
                  {isPending ? "Enviando..." : "Enviar Proposta"}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    backgroundColor: "transparent",
  },
  cardContainer: {
    backgroundColor: COLORS.background,
    borderRadius: 20,
    padding: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  header: { flexDirection: "row", alignItems: "center" },
  cardAvatar: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
  infoContainer: { flex: 1, justifyContent: "center" },
  cardName: {
    fontSize: 18,
    color: COLORS.textPrimary,
    fontFamily: "LeagueSpartan-Bold",
  },
  expandHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  topSkillText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontFamily: "LeagueSpartan-Regular",
  },
  expandedContent: { maxHeight: 250, marginTop: 16, paddingHorizontal: 4 },
  cardSectionTitle: {
    fontSize: 16,
    color: COLORS.secondary,
    fontFamily: "LeagueSpartan-SemiBold",
    marginBottom: 8,
  },
  cardBio: {
    fontSize: 15,
    color: COLORS.textSecondary,
    fontFamily: "LeagueSpartan-Regular",
    lineHeight: 22,
    marginBottom: 16,
  },
  skillContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
    justifyContent: "space-between",
  },
  skillTag: {
    backgroundColor: COLORS.grayLight,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  selectedSkillTag: { backgroundColor: COLORS.primary },
  skillTagText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontFamily: "LeagueSpartan-SemiBold",
  },
  selectedSkillTagText: { color: COLORS.white },
  feedbackText: {
    marginTop: 4,
    marginBottom: 12,
    fontSize: 14,
    fontFamily: "LeagueSpartan-SemiBold",
    textAlign: "center",
  },
  expandedButtonContainer: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.grayLight,
    paddingTop: 12,
  },
  cardButton: {
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    paddingVertical: 14,
    flex: 1,
  },
  proposeButton: { backgroundColor: COLORS.primary },
  disabledButton: { backgroundColor: COLORS.gray },
  proposeButtonText: {
    color: COLORS.white,
    fontFamily: "LeagueSpartan-Bold",
    fontSize: 16,
  },
});

export default UserInfoCard;
