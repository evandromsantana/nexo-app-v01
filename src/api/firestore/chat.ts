import { addDoc, collection, doc, getDocs, onSnapshot, orderBy, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { z } from 'zod';
import { ChatSchema, ChatWithIdSchema } from '../../types/chat';
import { GiftedChatMessage, GiftedChatMessageSchema } from '../../types/message';
import { db } from '../firebase';

export const createChatRoom = async (user1Id: string, user2Id: string) => {
    const chatsCol = collection(db, 'chats');
    const sortedUsers = [user1Id, user2Id].sort();
    
    const q = query(chatsCol, where('users', '==', sortedUsers));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        const newChat = {
            users: sortedUsers,
            lastMessage: 'Proposta aceite! Diga olá.',
            updatedAt: serverTimestamp(),
        };
        ChatSchema.pick({ users: true, lastMessage: true }).parse(newChat);
        await addDoc(chatsCol, newChat);
    }
};

export const getChatsForUser = async (uid: string): Promise<import("../../types/chat").ChatWithId[]> => {
    const chatsCol = collection(db, 'chats');
    const q = query(chatsCol, where('users', 'array-contains', uid), orderBy('updatedAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const chats = querySnapshot.docs.map(doc => {
        try {
            return ChatWithIdSchema.parse({ id: doc.id, ...doc.data() });
        } catch (error) {
            console.error(`Documento de chat inválido para o doc ${doc.id}:`, error);
            return null;
        }
    }).filter((chat): chat is import("../../types/chat").ChatWithId => chat !== null);

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
                console.error(`Documento de mensagem inválido para o doc ${doc.id}:`, error);
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
