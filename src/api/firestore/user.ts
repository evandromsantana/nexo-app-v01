import { User as FirebaseUser } from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { geohashForLocation } from 'geofire-common';
import { UserProfile, UserProfileSchema } from '../../types/user';
import { db } from '../firebase'; // A única fonte para a instância 'db'

// A linha 'const db = getFirestore();' foi removida para evitar duplicados.

export const createUserProfile = async (user: FirebaseUser, displayName: string) => {
    const userRef = doc(db, 'users', user.uid);

    const newUserProfile: Omit<UserProfile, 'memberSince'> = {
        uid: user.uid,
        email: user.email!,
        displayName: displayName,
        photoUrl: null,
        bio: '',
        timeBalance: 60, // Padrão de 1 hora (60 minutos)
        skillsToTeach: [],
        skillsToLearn: [],
        location: null,
    };

    await setDoc(userRef, {
        ...newUserProfile,
        memberSince: serverTimestamp(),
    });
};

export const updateUserLocation = async (uid: string, coords: { latitude: number; longitude: number }) => {
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

    const users = querySnapshot.docs.map(doc => {
        try {
            return UserProfileSchema.parse(doc.data());
        } catch (error) {
            console.error(`Perfil de utilizador inválido para doc ${doc.id}:`, error);
            return null;
        }
    }).filter((user): user is UserProfile => user !== null);

    return users;
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
    const userRef = doc(db, 'users', uid);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
        try {
            return UserProfileSchema.parse(docSnap.data());
        } catch (error) {
            console.error("Dados de perfil de utilizador inválidos:", error);
            return null;
        }
    } else {
        console.log("Documento de utilizador não encontrado!");
        return null;
    }
};

export const updateUserProfile = async (uid: string, data: Partial<UserProfile>) => {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, data);
};

