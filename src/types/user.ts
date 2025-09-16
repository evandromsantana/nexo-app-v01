import { Timestamp } from 'firebase/firestore';

export interface TaughtSkill {
  skillName: string;
  multiplier: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoUrl: string | null;
  bio: string;
  timeBalance: number;
  skillsToTeach: TaughtSkill[];
  skillsToLearn: string[];
  location: {
    geohash: string;
    latitude: number;
    longitude: number;
  } | null;
  memberSince: Timestamp;
}
