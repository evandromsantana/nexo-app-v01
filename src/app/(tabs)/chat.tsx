import { COLORS } from "@/constants";
import { useAuth } from "@/hooks/useAuth";
import { ChatWithId } from "@/types/chat";
import { UserProfile } from "@/types/user";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { getChatsForUser, getUserProfile } from "../../api/firestore";
import ChatList from "../../components/app/chat/ChatList";
import LoadingIndicator from "../../components/ui/LoadingIndicator";

// Helper function to fetch multiple user profiles
const fetchUserProfiles = async (userIds: string[]) => {
  const uniqueUserIds = [...new Set(userIds)];
  const profilePromises = uniqueUserIds.map((id) => getUserProfile(id));
  const profiles = await Promise.all(profilePromises);

  const profileMap: Record<string, UserProfile> = {};
  profiles.forEach((profile) => {
    if (profile) {
      profileMap[profile.uid] = profile;
    }
  });
  return profileMap;
};

export default function ChatScreen() {
  const { user } = useAuth();
  const router = useRouter();

  // 1. Query to fetch chats
  const { 
    data: chats = [], 
    isLoading: chatsLoading,
    refetch: refetchChats,
    isRefetching,
  } = useQuery<ChatWithId[], Error, ChatWithId[]>({ 
    queryKey: ["chats", user?.uid],
    queryFn: () => getChatsForUser(user!.uid),
    enabled: !!user,
  });

  // 2. Dependent query to fetch user profiles based on chat data
  const otherUserIds = useMemo(() => {
    if (!user || !chats) return [];
    const ids = chats
      .map((chat) => chat.users.find((uid) => uid !== user.uid))
      .filter((id): id is string => !!id);
    return [...new Set(ids)];
  }, [chats, user]);

  const { data: userProfiles = {}, isLoading: profilesLoading } = useQuery({
    queryKey: ["userProfiles", otherUserIds],
    queryFn: () => fetchUserProfiles(otherUserIds),
    enabled: otherUserIds.length > 0,
  });

  const handlePressChat = (chatId: string) => {
    router.push(`/chat/${chatId}`);
  };

  if (chatsLoading || profilesLoading) {
    return <LoadingIndicator />;
  }

  return (
    <View style={styles.container}>
      <ChatList
        chats={chats}
        userProfiles={userProfiles}
        currentUserId={user?.uid}
        onPressChat={handlePressChat}
        onRefresh={refetchChats}
        refreshing={isRefetching}
        emptyMessage="Nenhuma conversa iniciada."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
});
