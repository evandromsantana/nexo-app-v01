import { Timestamp } from 'firebase/firestore';

export interface Chat {
  users: string[]; // Array of UIDs of users in the chat
  lastMessage: string;
  updatedAt: Timestamp;
}

export interface ChatWithId extends Chat {
  id: string;
}
