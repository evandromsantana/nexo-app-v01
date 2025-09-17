import { COLORS } from "@/constants";
import { useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet } from "react-native";
import { GiftedChat, IMessage } from "react-native-gifted-chat";
import { getMessagesForChat, sendMessage } from "../../api/firestore";
import { useAuth } from "../../hooks/useAuth";

export default function ChatRoomScreen() {
  const { id: chatId } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (chatId) {
      const unsubscribe = getMessagesForChat(chatId, (messages) => {
        setMessages(messages);
        if (isLoading) setIsLoading(false);
      });

      // Cleanup subscription on unmount
      return () => unsubscribe();
    }
  }, [chatId]);

  const onSend = useCallback(
    (newMessages: IMessage[] = []) => {
      if (chatId && user) {
        const text = newMessages[0].text;
        sendMessage(chatId, user.uid, text);
      }
    },
    [chatId, user]
  );

  if (isLoading) {
    return (
      <ActivityIndicator
        style={styles.centered}
        size="large"
        color={COLORS.primary}
      />
    );
  }

  return (
    <GiftedChat
      messages={messages}
      onSend={(messages) => onSend(messages)}
      user={{
        _id: user?.uid || "",
      }}
    />
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
});
