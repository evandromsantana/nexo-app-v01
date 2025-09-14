import { getFirestore, doc, setDoc, serverTimestamp, updateDoc, collection, getDocs, query, where, getDoc } from 'firebase/firestore';
import { User as FirebaseUser } from 'firebase/auth';
import { geohashForLocation } from 'geofire-common';
import { UserProfile } from '../types/user';

const db = getFirestore();

export const createUserProfile = async (user: FirebaseUser, displayName: string) => {
  const userRef = doc(db, 'users', user.uid);

  const newUserProfile: Omit<UserProfile, 'memberSince'> = {
    uid: user.uid,
    email: user.email!,
    displayName: displayName,
    photoUrl: null,
    bio: '',
    timeBalance: 60, // Default 1 hour (60 minutes)
    skillsToTeach: [],
    skillsToLearn: [],
    location: null,
  };

  await setDoc(userRef, {
    ...newUserProfile,
    memberSince: serverTimestamp(),
  });
};

export const updateUserLocation = async (uid: string, coords: { latitude: number, longitude: number }) => {
  const userRef = doc(db, 'users', uid);
  const hash = geohashForLocation([coords.latitude, coords.longitude]);

  const newLocation = {
    geohash: hash,
    latitude: coords.latitude,
    longitude: coords.longitude,
  };

  await updateDoc(userRef, { location: newLocation });
};

export const getUsers = async (): Promise<UserProfile[]> => {
    const usersCol = collection(db, 'users');
    const q = query(usersCol, where('location', '!=', null));
    const querySnapshot = await getDocs(q);
    const users: UserProfile[] = [];
    querySnapshot.forEach((doc) => {
        users.push(doc.data() as UserProfile);
    });
    return users;
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const userRef = doc(db, 'users', uid);
  const docSnap = await getDoc(userRef);

  if (docSnap.exists()) {
    return docSnap.data() as UserProfile;
  } else {
    console.log("No such user document!");
    return null;
  }
};

export const updateUserProfile = async (uid: string, data: Partial<UserProfile>) => {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, data);
};
