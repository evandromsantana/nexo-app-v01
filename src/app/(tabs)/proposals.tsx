import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Button, FlatList, RefreshControl } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { getProposalsForUser, updateProposalStatus, getUserProfile } from '../../api/firestore';
import { COLORS } from '../../constants/colors';
import { UserProfile } from '../../types/user';
import { Proposal } from '../../types/proposal';

// Helper component for rendering a single proposal
const ProposalCard = ({ proposal, type, onUpdate, userProfiles, currentUserId }: { proposal: Proposal, type: string, onUpdate: (proposalId: string, status: 'accepted' | 'declined' | 'completed', proposerId: string, recipientId: string) => Promise<void>, userProfiles: Record<string, UserProfile>, currentUserId: string | undefined }) => {
  const otherUserId = type === 'received' ? proposal.proposerId : proposal.recipientId;
  const otherUser = userProfiles[otherUserId];

  const handleUpdate = (status: 'accepted' | 'declined' | 'completed') => {
    onUpdate(proposal.id, status, proposal.proposerId, proposal.recipientId);
  };

  return (
    <View style={styles.card}>
      <Text style={styles.cardText}>
        {type === 'received' ? `De: ${otherUser?.displayName || '...'}` : `Para: ${otherUser?.displayName || '...'}`}
      </Text>
      <Text style={styles.cardSkill}>Habilidade: {proposal.skillRequested}</Text>
      <Text style={styles.cardStatus}>Status: {proposal.status}</Text>
      
      {/* Actions for received proposals */}
      {type === 'received' && proposal.status === 'pending' && (
        <View style={styles.buttonGroup}>
          <Button title="Aceitar" onPress={() => handleUpdate('accepted')} color={COLORS.success} />
          <Button title="Recusar" onPress={() => handleUpdate('declined')} color={COLORS.accent} />
        </View>
      )}

      {/* Action for sent proposals */}
      {type === 'sent' && proposal.status === 'accepted' && proposal.proposerId === currentUserId && (
        <View style={styles.completeButtonContainer}>
          <Button title="Marcar como Concluída" onPress={() => handleUpdate('completed')} />
        </View>
      )}
    </View>
  );
};

export default function ProposalsScreen() {
  const { user } = useAuth();
  const [proposals, setProposals] = useState<{ received: Proposal[], sent: Proposal[] }>({ received: [], sent: [] });
  const [userProfiles, setUserProfiles] = useState<Record<string, UserProfile>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProposals = useCallback(async () => {
    if (!user) return;
    try {
      const { received, sent } = await getProposalsForUser(user.uid);
      setProposals({ received, sent });

      const allUserIds = [...received.map(p => p.proposerId), ...sent.map(p => p.recipientId)];
      const uniqueUserIds = [...new Set(allUserIds)];
      
      const profilesToFetch = uniqueUserIds.filter((id) => !(userProfiles as Record<string, UserProfile>)[id]);
      if (profilesToFetch.length > 0) {
        const fetchedProfiles = await Promise.all(profilesToFetch.map(id => getUserProfile(id)));
        
        const newProfiles = fetchedProfiles.reduce((acc, profile) => {
          if (profile) {
            acc[profile.uid] = profile;
          }
          return acc;
        }, {});

        setUserProfiles(prev => ({ ...prev, ...newProfiles }));
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
    if (user) {
      loadData();
    }
  }, [user, loadData]);

  const handleUpdateStatus = async (proposalId: string, status: 'accepted' | 'declined' | 'completed', proposerId: string, recipientId: string) => {
    try {
      await updateProposalStatus(proposalId, status, proposerId, recipientId);
      onRefresh();
    } catch (error) {
      console.error("Failed to update proposal status:", error);
    }
  };

  if (isLoading) {
    return <ActivityIndicator style={styles.centered} size="large" color={COLORS.primary} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Propostas Recebidas</Text>
      <FlatList
        data={proposals.received}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <ProposalCard proposal={item} type="received" onUpdate={handleUpdateStatus} userProfiles={userProfiles} currentUserId={user?.uid} />}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma proposta recebida.</Text>}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
      
      <Text style={styles.title}>Propostas Enviadas</Text>
      <FlatList
        data={proposals.sent}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <ProposalCard proposal={item} type="sent" onUpdate={handleUpdateStatus} userProfiles={userProfiles} currentUserId={user?.uid} />}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma proposta enviada.</Text>}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 10, backgroundColor: COLORS.background },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 22, fontWeight: 'bold', color: COLORS.primary, marginTop: 20, marginBottom: 10, paddingHorizontal: 10 },
    card: { backgroundColor: COLORS.white, padding: 15, borderRadius: 10, marginVertical: 5, marginHorizontal: 10 },
    cardText: { fontSize: 16, color: COLORS.grayDark },
    cardSkill: { fontSize: 16, fontWeight: 'bold', color: COLORS.primary, marginVertical: 5 },
    cardStatus: { fontSize: 14, fontStyle: 'italic', color: COLORS.secondary },
    buttonGroup: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 },
    completeButtonContainer: { marginTop: 10 },
    emptyText: { textAlign: 'center', color: COLORS.grayDark, marginTop: 20 },
});