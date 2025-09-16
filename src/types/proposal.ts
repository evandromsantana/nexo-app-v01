import { Timestamp } from 'firebase/firestore';

export interface Proposal {
  proposerId: string;
  recipientId: string;
  skillName: string; // The skill being taught
  proposedDuration: number; // Base duration, e.g., 60 minutes
  costInMinutes: number; // The final calculated cost (duration * multiplier)
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type ProposalWithId = Proposal & { id: string };
