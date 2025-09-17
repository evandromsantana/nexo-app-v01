import { Timestamp } from 'firebase/firestore';
import { z } from 'zod';

// Custom schema for Firestore Timestamps that handles both object types
export const FirestoreTimestampSchema = z.union([
  z.any().refine((val): val is Timestamp => val && typeof val.toDate === 'function'),
  z.object({
    seconds: z.number(),
    nanoseconds: z.number(),
  })
]);

// Schema for a taught skill
export const TaughtSkillSchema = z.object({
  skillName: z.string(),
  multiplier: z.number(),
});

// Schema for the user profile
export const UserProfileSchema = z.object({
  uid: z.string(),
  email: z.string().email(),
  displayName: z.string(),
  photoUrl: z.string().url().nullable(),
  bio: z.string(),
  timeBalance: z.number(),
  skillsToTeach: z.array(TaughtSkillSchema),
  skillsToLearn: z.array(z.string()),
  location: z.object({
    geohash: z.string(),
    latitude: z.number(),
    longitude: z.number(),
  }).nullable(),
  memberSince: FirestoreTimestampSchema.optional(), // Field is now optional
});

// Infer the TypeScript types from the Zod schemas
export type TaughtSkill = z.infer<typeof TaughtSkillSchema>;
export type UserProfile = z.infer<typeof UserProfileSchema>;