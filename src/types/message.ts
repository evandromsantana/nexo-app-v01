import { z } from 'zod';

export const GiftedChatMessageSchema = z.object({
  _id: z.string(),
  text: z.string(),
  createdAt: z.date(),
  user: z.object({
    _id: z.string(),
  }),
});

export type GiftedChatMessage = z.infer<typeof GiftedChatMessageSchema>;
