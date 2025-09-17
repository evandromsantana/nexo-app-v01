import { COLORS } from "@/constants";
import { useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { IMessage } from "react-native-gifted-chat";
import { ActivityIndicator, StyleSheet } from "react-native";

import { getMessagesForChat, sendMessage } from "../../api/firestore";
import { useAuth } from "../../hooks/useAuth";
import ChatRoom from "../../components/app/chat/ChatRoom";

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
        size="large"
        color={COLORS.primary}
      />
    );
  }

  return (
    <ChatRoom
      messages={messages}
      onSend={onSend}
      user={{
        _id: user?.uid || "",
      }}
    />
  );
}


