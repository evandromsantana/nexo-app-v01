import { COLORS } from "@/constants";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";
import { getChatsForUser, getUserProfile } from "../../api/firestore";
import ChatList from "../../components/app/ChatList";
import LoadingIndicator from "../../components/ui/LoadingIndicator";
import { useAuth } from "../../hooks/useAuth";
import { ChatWithId } from "../../types/chat";
import { UserProfile } from "../../types/user";

export default function ChatScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [chats, setChats] = useState<ChatWithId[]>([]);
  const [userProfiles, setUserProfiles] = useState<Record<string, UserProfile>>(
    {}
  );
  const [isLoading, setIsLoading] = useState(true);

  const fetchChatsAndProfiles = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const userChats = await getChatsForUser(user.uid);
      setChats(userChats);

      const otherUserIds: string[] = userChats
        .map((chat) => chat.users.find((uid) => uid !== user.uid))
        .filter((id): id is string => typeof id === "string");
      const uniqueUserIds = [...new Set(otherUserIds)];

      const profilesToFetch = uniqueUserIds.filter(
        (id) => !(userProfiles as Record<string, UserProfile>)[id]
      );
      if (profilesToFetch.length > 0) {
        const fetchedProfiles = await Promise.all(
          profilesToFetch.map((id) => getUserProfile(id))
        );

        const newProfiles = fetchedProfiles.reduce(
          (acc: Record<string, UserProfile>, profile) => {
            if (profile) {
              acc[profile.uid] = profile;
            }
            return acc;
          },
          {}
        );

        setUserProfiles((prev) => ({ ...prev, ...newProfiles }));
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
    return <LoadingIndicator />;
  }

  return (
    <View style={styles.container}>
      <ChatList
        chats={chats}
        userProfiles={userProfiles}
        currentUserId={user?.uid}
        onPressChat={handlePressChat}
        onRefresh={fetchChatsAndProfiles}
        refreshing={isLoading}
        emptyMessage="Nenhuma conversa iniciada."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
});
