# Documentação da Camada de API

Este documento descreve como o frontend do Nexo App se comunica com os serviços de backend. A camada de API está abstraída na pasta `src/api`.

## 1. Visão Geral

A aplicação se comunica com dois serviços principais de backend:
- **Firebase/Firestore:** Para a maioria das operações de dados (leitura e escrita no banco de dados).
- **Cloudinary:** Para upload de imagens (como fotos de perfil).

## 2. Comunicação com o Firestore

O arquivo `src/api/firestore.ts` é o ponto central para todas as interações com o banco de dados Firestore. Ele exporta um conjunto de funções assíncronas que encapsulam a lógica de acesso aos dados.

### Principais Funções:

- **`createUserProfile`**: Cria um novo documento de usuário na coleção `users` após o registro.
- **`getUserProfile`**: Busca e retorna o perfil de um usuário específico.
- **`updateUserProfile`**: Atualiza os dados de um perfil de usuário.
- **`getUsers`**: Retorna uma lista de usuários (ex: para exibir no mapa).
- **`updateUserLocation`**: Atualiza a localização de um usuário, calculando e salvando o `geohash` para otimizar consultas espaciais.

- **`createProposal`**: Cria um novo documento na coleção `proposals`.
- **`getProposalsForUser`**: Busca todas as propostas enviadas e recebidas por um usuário.
- **`updateProposalStatus`**: Atualiza o status de uma proposta (`accepted`, `declined`, etc.). Se o status for `accepted`, esta função também chama `createChatRoom`.

- **`createChatRoom`**: Cria uma nova sala de chat se ela ainda não existir entre dois usuários.
- **`getChatsForUser`**: Retorna a lista de chats de um usuário.
- **`getMessagesForChat`**: Busca as mensagens de um chat específico em tempo real usando `onSnapshot` do Firestore. Isso permite que a UI do chat seja atualizada automaticamente com novas mensagens.
- **`sendMessage`**: Adiciona uma nova mensagem a uma sala de chat e atualiza o campo `lastMessage` no documento principal do chat.

## 3. Comunicação com o Cloudinary

O arquivo `src/api/cloudinary.ts` lida com o upload de mídias.

### Função: `uploadImage`
- **Propósito:** Fazer o upload de uma imagem para a conta do Cloudinary configurada.
- **Funcionamento:**
  1. Recebe a URI local de uma imagem (ex: vinda do `expo-image-picker`).
  2. Constrói um objeto `FormData` com a imagem e o `upload_preset`.
  3. Envia a imagem para a API do Cloudinary através de uma requisição `POST`.
  4. Retorna a `secure_url` da imagem hospedada no Cloudinary, que pode então ser salva no perfil do usuário no Firestore.
- **Configuração:** O nome da nuvem (`cloudName`) é obtido das variáveis de ambiente do Expo, e o `uploadPreset` deve ser configurado como "unsigned" no painel do Cloudinary para permitir uploads diretamente do cliente.