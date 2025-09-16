import { getFirestore, doc, setDoc, serverTimestamp, updateDoc, collection, getDocs, query, where, getDoc, addDoc, orderBy, onSnapshot, deleteDoc } from 'firebase/firestore';
import { User as FirebaseUser } from 'firebase/auth';
import { geohashForLocation } from 'geofire-common';
import { UserProfile } from '../types/user';
import { Chat, ChatWithId } from '../types/chat'; // Import ChatWithId
import { Proposal } from '../types/proposal';

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

export const createProposal = async (proposalData: Omit<Proposal, 'createdAt' | 'updatedAt'>) => {
  const proposalsCol = collection(db, 'proposals');

  const newProposal = {
    ...proposalData,
    status: 'pending' as const,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await addDoc(proposalsCol, newProposal);
};

export const getProposalsForUser = async (uid: string) => {
  const proposalsCol = collection(db, 'proposals');
  
  const receivedQuery = query(proposalsCol, where('recipientId', '==', uid));
  const receivedSnapshot = await getDocs(receivedQuery);
  const received = receivedSnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as Omit<Proposal, 'id'>) }));

  const sentQuery = query(proposalsCol, where('proposerId', '==', uid));
  const sentSnapshot = await getDocs(sentQuery);
  const sent = sentSnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as Omit<Proposal, 'id'>) }));

  return { received, sent };
};

export const createChatRoom = async (user1Id: string, user2Id: string) => {
    const chatsCol = collection(db, 'chats');
    const sortedUsers = [user1Id, user2Id].sort();
    
    const q = query(chatsCol, where('users', '==', sortedUsers));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        await addDoc(chatsCol, {
            users: sortedUsers,
            lastMessage: 'Proposta aceita! Diga olá.',
            updatedAt: serverTimestamp(),
        });
    }
};

export const updateProposalStatus = async (proposalId: string, status: 'accepted' | 'declined' | 'completed', proposerId: string, recipientId: string) => {
    const proposalRef = doc(db, 'proposals', proposalId);
    await updateDoc(proposalRef, {
        status: status,
        updatedAt: serverTimestamp(),
    });

    if (status === 'accepted') {
        await createChatRoom(proposerId, recipientId);
    }
};

export const getChatsForUser = async (uid: string): Promise<ChatWithId[]> => {
    const chatsCol = collection(db, 'chats');
    const q = query(chatsCol, where('users', 'array-contains', uid), orderBy('updatedAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const chats = querySnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as Omit<Chat, 'id'>) }));
    return chats as ChatWithId[];
};

export const getMessagesForChat = (chatId: string, callback: (messages: any[]) => void) => {
    const messagesCol = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesCol, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const messages = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                _id: doc.id,
                text: data.text,
                createdAt: data.createdAt.toDate(),
                user: {
                    _id: data.senderId,
                }
            };
        });
        callback(messages);
    });

    return unsubscribe; // Return the unsubscribe function to be called on cleanup
};

export const sendMessage = async (chatId: string, senderId: string, text: string) => {
    const messagesCol = collection(db, 'chats', chatId, 'messages');
    // Add the new message
    await addDoc(messagesCol, {
        text,
        senderId,
        createdAt: serverTimestamp(),
    });

    // Update the last message on the chat document
    const chatRef = doc(db, 'chats', chatId);
    await updateDoc(chatRef, {
        lastMessage: text,
        updatedAt: serverTimestamp(),
    });
};

// =================================================================
// FAVORITE FUNCTIONS
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