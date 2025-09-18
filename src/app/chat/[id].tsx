import { COLORS } from "@/constants";
import { useAuth } from "@/hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";
import { IMessage } from "react-native-gifted-chat";
import { getMessagesForChat, sendMessage } from "../../api/firestore";
import ChatRoom from "../../components/app/chat/ChatRoom";

export default function ChatRoomScreen() {
  const { id: chatId } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Real-time listener for messages - useEffect is a good pattern for this.
  useEffect(() => {
    if (chatId) {
      const unsubscribe = getMessagesForChat(chatId, (messages) => {
        setMessages(messages);
        if (isLoading) setIsLoading(false);
      });

      // Cleanup subscription on unmount
      return () => unsubscribe();
    }
  }, [chatId, isLoading]);

  // Mutation for sending a message
  const { mutate: send } = useMutation({
    mutationFn: ({ text }: { text: string }) => {
      if (!chatId || !user) throw new Error("Chat ID or user not found");
      return sendMessage(chatId, user.uid, text);
    },
    onError: (error) => {
      console.error("Failed to send message:", error);
      // Here you could add UI feedback, like an alert
    },
  });

  const onSend = (newMessages: IMessage[] = []) => {
    const text = newMessages[0].text;
    send({ text });
  };

  if (isLoading) {
    return (
      <ActivityIndicator
        style={{ flex: 1 }}
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


