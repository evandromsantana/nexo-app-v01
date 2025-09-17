import { getFirestore, doc, setDoc, serverTimestamp, updateDoc, collection, getDocs, query, where, getDoc, addDoc, orderBy, onSnapshot, deleteDoc } from 'firebase/firestore';
import { User as FirebaseUser } from 'firebase/auth';
import { geohashForLocation } from 'geofire-common';
import { z } from 'zod';
import { UserProfile, UserProfileSchema } from '../types/user';
import { Chat, ChatWithId, ChatSchema, ChatWithIdSchema } from '../types/chat';
import { Proposal, ProposalWithId, ProposalSchema, ProposalWithIdSchema, ProposalStatus } from '../types/proposal';
import { GiftedChatMessage, GiftedChatMessageSchema } from '../types/message';

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
    
    const users = querySnapshot.docs.map(doc => {
        try {
            return UserProfileSchema.parse(doc.data());
        } catch (error) {
            console.error(`Invalid user profile for doc ${doc.id}:`, error);
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
      console.error("Invalid user profile data:", error);
      return null;
    }
  } else {
    console.log("No such user document!");
    return null;
  }
};

export const updateUserProfile = async (uid: string, data: Partial<UserProfile>) => {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, data);
};

const CreateProposalSchema = ProposalSchema.omit({ createdAt: true, updatedAt: true, status: true });

export const createProposal = async (proposalData: z.infer<typeof CreateProposalSchema>) => {
  CreateProposalSchema.parse(proposalData);

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
  const received = receivedSnapshot.docs.map(doc => {
    try {
      return ProposalWithIdSchema.parse({ id: doc.id, ...doc.data() });
    } catch (error) {
      console.error(`Invalid received proposal for doc ${doc.id}:`, error);
      return null;
    }
  }).filter((p): p is ProposalWithId => p !== null);

  const sentQuery = query(proposalsCol, where('proposerId', '==', uid));
  const sentSnapshot = await getDocs(sentQuery);
  const sent = sentSnapshot.docs.map(doc => {
    try {
      return ProposalWithIdSchema.parse({ id: doc.id, ...doc.data() });
    } catch (error) {
      console.error(`Invalid sent proposal for doc ${doc.id}:`, error);
      return null;
    }
  }).filter((p): p is ProposalWithId => p !== null);

  return { received, sent };
};

export const createChatRoom = async (user1Id: string, user2Id: string) => {
    const chatsCol = collection(db, 'chats');
    const sortedUsers = [user1Id, user2Id].sort();
    
    const q = query(chatsCol, where('users', '==', sortedUsers));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        const newChat = {
            users: sortedUsers,
            lastMessage: 'Proposta aceita! Diga olá.',
            updatedAt: serverTimestamp(),
        };
        ChatSchema.pick({ users: true, lastMessage: true }).parse(newChat);
        await addDoc(chatsCol, newChat);
    }
};

export const updateProposalStatus = async (proposalId: string, status: ProposalStatus, proposerId: string, recipientId: string) => {
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
    
    const chats = querySnapshot.docs.map(doc => {
        try {
            return ChatWithIdSchema.parse({ id: doc.id, ...doc.data() });
        } catch (error) {
            console.error(`Invalid chat document for doc ${doc.id}:`, error);
            return null;
        }
    }).filter((chat): chat is ChatWithId => chat !== null);

    return chats;
};

export const getMessagesForChat = (chatId: string, callback: (messages: GiftedChatMessage[]) => void) => {
    const messagesCol = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesCol, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const messages = querySnapshot.docs.map(doc => {
            const data = doc.data();
            try {
                const messageData = {
                    _id: doc.id,
                    text: data.text,
                    createdAt: data.createdAt.toDate(),
                    user: {
                        _id: data.senderId,
                    }
                };
                return GiftedChatMessageSchema.parse(messageData);
            } catch (error) {
                console.error(`Invalid message document for doc ${doc.id}:`, error);
                return null;
            }
        }).filter((msg): msg is GiftedChatMessage => msg !== null);
        
        callback(messages);
    });

    return unsubscribe;
};

const NewMessageSchema = z.object({
    text: z.string(),
    senderId: z.string(),
});

export const sendMessage = async (chatId: string, senderId: string, text: string) => {
    const newMessage = { text, senderId };
    NewMessageSchema.parse(newMessage);

    const messagesCol = collection(db, 'chats', chatId, 'messages');
    await addDoc(messagesCol, {
        ...newMessage,
        createdAt: serverTimestamp(),
    });

    const chatRef = doc(db, 'chats', chatId);
    const chatUpdate = {
        lastMessage: text,
        updatedAt: serverTimestamp(),
    };
    ChatSchema.pick({ lastMessage: true }).parse(chatUpdate);
    await updateDoc(chatRef, chatUpdate);
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