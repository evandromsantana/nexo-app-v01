import React, { useCallback } from "react";
import { GiftedChat, IMessage } from "react-native-gifted-chat";

interface ChatRoomProps {
  messages: IMessage[];
  onSend: (newMessages: IMessage[]) => void;
  user: { _id: string };
}

const ChatRoom: React.FC<ChatRoomProps> = ({ messages, onSend, user }) => {
  return (
    <GiftedChat
      messages={messages}
      onSend={(msgs) => onSend(msgs)}
      user={user}
    />
  );
};

export default ChatRoom;