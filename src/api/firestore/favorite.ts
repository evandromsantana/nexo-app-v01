import { deleteDoc, doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

// =================================================================
// FUNÇÕES DE FAVORITOS
// =================================================================

export const addFavorite = async (currentUserId: string, favoritedUserId: string): Promise<void> => {
  const favoriteRef = doc(db, 'users', currentUserId, 'favorites', favoritedUserId);
  await setDoc(favoriteRef, { savedAt: serverTimestamp() });
};

export const removeFavorite = async (currentUserId: string, favoritedUserId: string): Promise<void> => {
  const favoriteRef = doc(db, 'users', currentUserId, 'favorites', favoritedUserId);
  await deleteDoc(favoriteRef);
};

export const isFavorite = async (currentUserId: string, favoritedUserId: string): Promise<boolean> => {
  const favoriteRef = doc(db, 'users', currentUserId, 'favorites', favoritedUserId);
  const docSnap = await getDoc(favoriteRef);
  return docSnap.exists();
};
