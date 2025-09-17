import React from "react";
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { COLORS } from "@/constants";
import { ChatWithId } from "../../../types/chat";
import { UserProfile } from "../../../types/user";

// Helper component for rendering a single chat item (copiado de chat.tsx)
const ChatListItem = ({
  chat,
  otherUser,
  onPress,
}: {
  chat: ChatWithId;
  otherUser: UserProfile | null;
  onPress: () => void;
}) => {
  const photoSource = otherUser?.photoUrl
    ? { uri: otherUser.photoUrl }
    : undefined;
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Image source={photoSource} style={styles.avatar} />
      <View style={styles.textContainer}>
        <Text style={styles.cardTitle}>{otherUser?.displayName || "..."}</Text>
        <Text style={styles.cardText} numberOfLines={1}>
          {chat.lastMessage}
        </Text>
      </View>
    </Pressable>
  );
};

interface ChatListProps {
  chats: ChatWithId[];
  userProfiles: Record<string, UserProfile>;
  currentUserId: string | undefined;
  onPressChat: (chatId: string) => void;
  onRefresh: () => void;
  refreshing: boolean;
  emptyMessage: string;
}

const ChatList: React.FC<ChatListProps> = ({
  chats,
  userProfiles,
  currentUserId,
  onPressChat,
  onRefresh,
  refreshing,
  emptyMessage,
}) => {
  return (
    <FlatList
      data={chats}
      keyExtractor={(item) => item.id}
      renderItem={({ item }: { item: ChatWithId }) => {
        const otherUserId = item.users.find((uid) => uid !== currentUserId);

        // Ensure otherUserId is a string before using it as an index
        const otherUser =
          typeof otherUserId === "string" ? userProfiles[otherUserId] : null;

        return (
          <ChatListItem
            chat={item}
            otherUser={otherUser}
            onPress={() => onPressChat(item.id)}
          />
        );
      }}
      ListEmptyComponent={
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      }
      onRefresh={onRefresh}
      refreshing={refreshing}
    />
  );
};

const styles = StyleSheet.create({
  emptyText: { textAlign: "center", color: COLORS.grayDark, marginTop: 50 },
  card: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    padding: 15,
    marginHorizontal: 10,
    marginVertical: 5,
    borderRadius: 10,
    alignItems: "center",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
    backgroundColor: "#e0e0e0",
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  cardText: {
    fontSize: 14,
    color: COLORS.grayDark,
    marginTop: 2,
  },
});

export default ChatList;