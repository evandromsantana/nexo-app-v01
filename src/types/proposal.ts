import { z } from 'zod';
import { FirestoreTimestampSchema } from './user'; // Import the custom timestamp schema

// Schema for the proposal status
const ProposalStatusSchema = z.union([
  z.literal('pending'),
  z.literal('accepted'),
  z.literal('declined'),
  z.literal('completed'),
]);

// Schema for a proposal
export const ProposalSchema = z.object({
  proposerId: z.string(),
  recipientId: z.string(),
  skillName: z.string(), // The skill being taught
  proposedDuration: z.number(), // Base duration, e.g., 60 minutes
  costInMinutes: z.number(), // The final calculated cost (duration * multiplier)
  status: ProposalStatusSchema,
  createdAt: FirestoreTimestampSchema, // Use custom schema
  updatedAt: FirestoreTimestampSchema, // Use custom schema
});

// Schema for a proposal with its ID
export const ProposalWithIdSchema = ProposalSchema.extend({
  id: z.string(),
});


// Infer the TypeScript types from the Zod schemas
export type Proposal = z.infer<typeof ProposalSchema>;
export type ProposalWithId = z.infer<typeof ProposalWithIdSchema>;
export type ProposalStatus = z.infer<typeof ProposalStatusSchema>;