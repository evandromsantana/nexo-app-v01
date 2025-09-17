import { COLORS } from "@/constants";

import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, View } from "react-native";
import { createProposal, getUserProfile } from "../../api/firestore";
import ProposeForm from "../../components/app/proposals/ProposeForm";
import { useAuth } from "../../hooks/useAuth";
import { UserProfile } from "../../types/user";

export default function ProposeTradeScreen() {
  const { id: recipientId } = useLocalSearchParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const router = useRouter();

  const [recipientProfile, setRecipientProfile] = useState<UserProfile | null>(
    null
  );
  const [selectedSkillName, setSelectedSkillName] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (recipientId) {
      const fetchRecipientProfile = async () => {
        try {
          const profile = await getUserProfile(recipientId);
          setRecipientProfile(profile);
          if (profile?.skillsToTeach && profile.skillsToTeach.length > 0) {
            setSelectedSkillName(profile.skillsToTeach[0].skillName);
          }
        } catch (error) {
          console.error("Failed to fetch recipient profile:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchRecipientProfile();
    }
  }, [recipientId]);

  const handleSendProposal = async () => {
    if (
      !currentUser ||
      !recipientId ||
      !selectedSkillName ||
      !recipientProfile
    ) {
      Alert.alert(
        "Erro",
        "Não foi possível enviar a proposta. Tente novamente."
      );
      return;
    }

    const selectedSkill = recipientProfile.skillsToTeach.find(
      (s) => s.skillName === selectedSkillName
    );

    if (!selectedSkill) {
      Alert.alert("Erro", "Habilidade selecionada não é válida.");
      return;
    }

    const proposedDuration = 60; // Hardcoded for now, can be a form field later
    const costInMinutes = proposedDuration * selectedSkill.multiplier;

    const proposalData = {
      proposerId: currentUser.uid,
      recipientId: recipientId,
      skillName: selectedSkill.skillName,
      proposedDuration,
      costInMinutes,
    };

    try {
      await createProposal(proposalData);
      Alert.alert("Sucesso", "Sua proposta foi enviada!");
      router.back();
    } catch (error) {
      console.error("Failed to create proposal:", error);
      Alert.alert("Erro", "Ocorreu um erro ao enviar sua proposta.");
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

  if (!recipientProfile) {
    return (
      <View style={styles.centered}>
        <Text>Usuário não encontrado.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ProposeForm
        recipientProfile={recipientProfile}
        selectedSkillName={selectedSkillName}
        setSelectedSkillName={setSelectedSkillName}
        onSendProposal={handleSendProposal}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: COLORS.background },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
});
