import { z } from 'zod';
import { FirestoreTimestampSchema } from './user'; // Import the custom timestamp schema

// Schema for a chat
export const ChatSchema = z.object({
  users: z.array(z.string()), // Array of UIDs of users in the chat
  lastMessage: z.string(),
  updatedAt: FirestoreTimestampSchema, // Use custom schema
});

// Schema for a chat with its ID
export const ChatWithIdSchema = ChatSchema.extend({
  id: z.string(),
});

// Infer the TypeScript types from the Zod schemas
export type Chat = z.infer<typeof ChatSchema>;
export type ChatWithId = z.infer<typeof ChatWithIdSchema>;
