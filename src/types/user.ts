import { Timestamp } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoUrl: string | null;
  bio: string;
  timeBalance: number;
  skillsToTeach: string[];
  skillsToLearn: string[];
  location: {
    geohash: string;
    latitude: number;
    longitude: number;
  } | null;
  memberSince: Timestamp;
}
