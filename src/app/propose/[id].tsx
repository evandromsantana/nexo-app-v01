import { COLORS } from "@/constants";
import { useAuth } from "@/hooks/useAuth";
import { UserProfile } from "@/types/user";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, View } from "react-native";
import { createProposal, getUserProfile } from "../../api/firestore";
import ProposeForm from "../../components/app/proposals/ProposeForm";

export default function ProposeTradeScreen() {
  const { id: recipientId } = useLocalSearchParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [selectedSkillName, setSelectedSkillName] = useState<string | null>(null);

  // 1. Query to fetch recipient's profile
  const { data: recipientProfile, isLoading } = useQuery<UserProfile | null, Error>({ 
    queryKey: ["userProfile", recipientId],
    queryFn: () => getUserProfile(recipientId!),
    enabled: !!recipientId,
  });

  // Effect to set the default selected skill once the profile is loaded
  useEffect(() => {
    if (recipientProfile?.skillsToTeach && recipientProfile.skillsToTeach.length > 0) {
      setSelectedSkillName(recipientProfile.skillsToTeach[0].skillName);
    }
  }, [recipientProfile]);

  // 2. Mutation to create the proposal
  const { mutate: sendProposal, isPending: isSubmitting } = useMutation({
    mutationFn: async () => {
      if (!currentUser || !recipientId || !selectedSkillName || !recipientProfile) {
        throw new Error("Informações insuficientes para enviar a proposta.");
      }
      const selectedSkill = recipientProfile.skillsToTeach.find(
        (s) => s.skillName === selectedSkillName
      );
      if (!selectedSkill) {
        throw new Error("Habilidade selecionada não é válida.");
      }

      const proposalData = {
        proposerId: currentUser.uid,
        recipientId: recipientId,
        skillName: selectedSkill.skillName,
        proposedDuration: 60, // Hardcoded for now
        costInMinutes: 60 * selectedSkill.multiplier,
      };

      await createProposal(proposalData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["proposals", currentUser?.uid] });
      Alert.alert("Sucesso", "Sua proposta foi enviada!");
      router.back();
    },
    onError: (error: Error) => {
      console.error("Failed to create proposal:", error);
      Alert.alert("Erro", error.message || "Ocorreu um erro ao enviar sua proposta.");
    },
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
        onSendProposal={sendProposal}
        isSubmitting={isSubmitting}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: COLORS.background },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
});
