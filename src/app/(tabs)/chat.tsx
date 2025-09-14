import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, Pressable, Image } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { getChatsForUser, getUserProfile } from '../../api/firestore';
import { COLORS } from '../../constants/colors';
import { UserProfile } from '../../types/user';
import { Chat, ChatWithId } from '../../types/chat';

// Helper component for rendering a single chat item
const ChatListItem = ({ chat, otherUser, onPress }: { chat: ChatWithId, otherUser: UserProfile | null, onPress: () => void }) => {
  const photoSource = otherUser?.photoUrl ? { uri: otherUser.photoUrl } : undefined;
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Image 
        source={photoSource} 
        style={styles.avatar}
      />
      <View style={styles.textContainer}>
        <Text style={styles.cardTitle}>{otherUser?.displayName || '...'}</Text>
        <Text style={styles.cardText} numberOfLines={1}>{chat.lastMessage}</Text>
      </View>
    </Pressable>
  );
};

export default function ChatScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [chats, setChats] = useState<ChatWithId[]>([]);
  const [userProfiles, setUserProfiles] = useState<Record<string, UserProfile>>({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchChatsAndProfiles = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const userChats = await getChatsForUser(user.uid);
      setChats(userChats);

      const otherUserIds: string[] = userChats.map(chat => chat.users.find(uid => uid !== user.uid)).filter((id): id is string => typeof id === 'string');
      const uniqueUserIds = [...new Set(otherUserIds)];
      
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
      console.error("Failed to fetch chats:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user, userProfiles]);

  // useFocusEffect to refetch when the screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchChatsAndProfiles();
    }, [fetchChatsAndProfiles])
  );

  const handlePressChat = (chatId: string) => {
    router.push(`/chat/${chatId}`);
  };

  if (isLoading) {
    return <ActivityIndicator style={styles.centered} size="large" color={COLORS.primary} />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={chats}
        keyExtractor={item => item.id}
        renderItem={({ item }: { item: ChatWithId }) => {
          const otherUserId = item.users.find(uid => uid !== user?.uid);
          
          // Ensure otherUserId is a string before using it as an index
          const otherUser = typeof otherUserId === 'string' ? userProfiles[otherUserId] : null;

          return <ChatListItem chat={item} otherUser={otherUser} onPress={() => handlePressChat(item.id)} />;
        }}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma conversa iniciada.</Text>}
        onRefresh={fetchChatsAndProfiles}
        refreshing={isLoading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyText: { textAlign: 'center', color: COLORS.grayDark, marginTop: 50 },
    card: {
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        padding: 15,
        marginHorizontal: 10,
        marginVertical: 5,
        borderRadius: 10,
        alignItems: 'center',
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 15,
        backgroundColor: '#e0e0e0',
    },
    textContainer: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    cardText: {
        fontSize: 14,
        color: COLORS.grayDark,
        marginTop: 2,
    },
});