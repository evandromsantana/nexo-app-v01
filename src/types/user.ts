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
  skillName: z.string().optional(),
  multiplier: z.number().optional(),
});

// Schema for the user profile
export const UserProfileSchema = z.object({
  uid: z.string(),
  email: z.string().email().nullable(),
  displayName: z.string(),
  photoUrl: z.string().url().nullable().optional(),
  bio: z.string(),
  timeBalance: z.number(),
  skillsToTeach: z.array(TaughtSkillSchema).optional(),
  skillsToLearn: z.array(z.string()).optional(),
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

// Schema for a user's public profile (subset of UserProfile)
export const PublicUserProfileSchema = z.object({
  uid: z.string(),
  displayName: z.string(),
  photoUrl: z.string().url().nullable().optional(),
  bio: z.string(),
  skillsToTeach: z.array(TaughtSkillSchema).optional(),
  skillsToLearn: z.array(z.string()).optional(),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }).nullable(),
});

export type PublicUserProfile = z.infer<typeof PublicUserProfileSchema>;