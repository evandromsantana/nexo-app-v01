import { Timestamp } from 'firebase/firestore';

export interface Proposal {
  proposerId: string;
  recipientId: string;
  skillRequested: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}