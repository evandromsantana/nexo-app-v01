import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { z } from 'zod';
import { ProposalSchema, ProposalStatus, ProposalWithIdSchema } from '../../types/proposal';
import { db } from '../firebase';
import { createChatRoom } from './chat'; // Importar a função para criar chat

// Schema para criar uma nova proposta, omitindo campos gerados pelo servidor
const CreateProposalSchema = ProposalSchema.omit({
    createdAt: true,
    updatedAt: true,
    status: true
});

/**
 * Cria uma nova proposta no Firestore.
 * @param proposalData Os dados para a nova proposta.
 */
export const createProposal = async (proposalData: z.infer<typeof CreateProposalSchema>) => {
    CreateProposalSchema.parse(proposalData);

    const proposalsCol = collection(db, 'proposals');

    const newProposal = {
        ...proposalData,
        status: 'pending' as const, // Estado inicial
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    };

    await addDoc(proposalsCol, newProposal);
};

/**
 * Obtém todas as propostas de um utilizador, separadas em recebidas e enviadas.
 * @param uid O ID do utilizador.
 * @returns Um objeto com arrays de propostas recebidas e enviadas.
 */
export const getProposalsForUser = async (uid: string) => {
    const proposalsCol = collection(db, 'proposals');

    // Consulta para propostas onde o utilizador é o destinatário
    const receivedQuery = query(proposalsCol, where('recipientId', '==', uid));
    const receivedSnapshot = await getDocs(receivedQuery);
    const received = receivedSnapshot.docs.map(doc => {
        try {
            return ProposalWithIdSchema.parse({ id: doc.id, ...doc.data() });
        } catch (error) {
            console.error(`Proposta recebida inválida para o doc ${doc.id}:`, error);
            return null;
        }
    }).filter((p): p is z.infer<typeof ProposalWithIdSchema> => p !== null);

    // Consulta para propostas onde o utilizador é o proponente
    const sentQuery = query(proposalsCol, where('proposerId', '==', uid));
    const sentSnapshot = await getDocs(sentQuery);
    const sent = sentSnapshot.docs.map(doc => {
        try {
            return ProposalWithIdSchema.parse({ id: doc.id, ...doc.data() });
        } catch (error) {
            console.error(`Proposta enviada inválida para o doc ${doc.id}:`, error);
            return null;
        }
    }).filter((p): p is z.infer<typeof ProposalWithIdSchema> => p !== null);

    return { received, sent };
};

/**
 * Atualiza o estado de uma proposta específica.
 * Se o estado for 'accepted', cria uma sala de chat.
 * @param proposalId O ID da proposta a atualizar.
 * @param status O novo estado ('accepted', 'rejected', 'cancelled').
 * @param proposerId O ID do utilizador que fez a proposta.
 * @param recipientId O ID do utilizador que recebeu a proposta.
 */
export const updateProposalStatus = async (
    proposalId: string,
    status: ProposalStatus,
    proposerId: string,
    recipientId: string
) => {
    const proposalRef = doc(db, 'proposals', proposalId);
    await updateDoc(proposalRef, {
        status: status,
        updatedAt: serverTimestamp(),
    });

    if (status === 'accepted') {
        await createChatRoom(proposerId, recipientId);
    }
};

