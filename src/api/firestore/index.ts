// Re-exportando com uma sintaxe alternativa (importar e depois exportar)
// para forçar a atualização do cache do TypeScript.

import {
  createChatRoom,
  getChatsForUser,
  getMessagesForChat,
  sendMessage
} from './chat';

import {
  addFavorite,
  isFavorite,
  removeFavorite
} from './favorite';

import {
  createProposal,
  getProposalsForUser,
  updateProposalStatus
} from './proposal';

import {
  createUserProfile,
  getUserProfile,
  getUsers,
  updateUserLocation,
  updateUserProfile
} from './user';

export {
  // Funções de favoritos
  addFavorite,
  // Funções do chat
  createChatRoom,
  // Funções de propostas
  createProposal,
  // Funções de utilizador
  createUserProfile, getChatsForUser,
  getMessagesForChat, getProposalsForUser, getUserProfile, getUsers, isFavorite, removeFavorite, sendMessage, updateProposalStatus, updateUserLocation, updateUserProfile
};

