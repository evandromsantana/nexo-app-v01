# 06 - Referência da API e Estrutura de Dados

Este documento detalha a estrutura de dados do Firestore e as interações com as APIs externas.

## 1. Firebase Firestore

### Coleções e Estrutura dos Documentos

A base de dados será composta pelas seguintes coleções principais, com seus respectivos modelos de dados (definidos em `src/types/`):

#### `users`
Armazena o perfil de cada usuário. O ID do documento é o `uid` do Firebase Auth. (Ver `src/types/user.ts`)

| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `uid` | `string` | ID único do Firebase Auth. |
| `email` | `string` | E-mail de cadastro do usuário. |
| `displayName` | `string` | Nome de exibição do usuário. |
| `photoUrl` | `string` | URL da foto de perfil (hospedada no Cloudinary). |
| `bio` | `string` | Uma breve biografia do usuário. |
| `timeBalance` | `number` | Saldo de horas (em minutos). Ex: 1.5 horas = 90. |
| `skillsToTeach` | `Array<string>` | Lista de habilidades que o usuário ensina. |
| `skillsToLearn` | `Array<string>` | Lista de habilidades que o usuário quer aprender. |
| `location` | `Object` | Objeto com a localização aproximada do usuário. |
| `  ∟ geohash` | `string` | Geohash para buscas de proximidade. |
| `  ∟ latitude` | `number` | Latitude da localização. |
| `  ∟ longitude` | `number` | Longitude da localização. |
| `memberSince` | `Timestamp` | Data de cadastro do usuário. |

#### `proposals`
Armazena cada proposta de troca entre usuários. (Ver `src/types/proposal.ts`)

| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `proposerId` | `string` | UID do usuário que fez a proposta. |
| `recipientId` | `string` | UID do usuário que recebeu a proposta. |
| `skillRequested` | `string` | Habilidade que o `proposer` quer aprender. |
| `status` | `string` | Status da proposta: `pending`, `accepted`, `declined`, `completed`, `cancelled`. |
| `createdAt` | `Timestamp` | Data de criação da proposta. |
| `updatedAt` | `Timestamp` | Data da última atualização da proposta. |

#### `reviews`
Armazena as avaliações após uma troca ser concluída.

| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `reviewerId` | `string` | UID de quem está avaliando. |
| `reviewedId` | `string` | UID de quem está sendo avaliado. |
| `proposalId` | `string` | ID da proposta que originou a avaliação. |
| `rating` | `number` | Nota da avaliação (de 1 a 5). |
| `comment` | `string` | Comentário da avaliação. |
| `createdAt` | `Timestamp` | Data da criação da avaliação. |

#### `chats`
Modela as conversas entre os usuários. Uma sala de chat é criada quando uma proposta é aceita. (Ver `src/types/chat.ts`)

| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `users` | `Array<string>` | Array com os UIDs dos dois usuários. |
| `lastMessage` | `string` | Conteúdo da última mensagem. |
| `updatedAt` | `Timestamp` | Data da última atualização do chat. |

*   **Subcoleção `messages`:** Dentro de cada documento de `chat`, há uma subcoleção `messages` que armazena as mensagens daquela conversa, ordenadas por data.

## 2. Comunicação com APIs Externas (`src/api/`)

A camada de API está abstraída na pasta `src/api`, gerenciando a comunicação com os serviços de backend.

### 2.1. Comunicação com o Firestore (`src/api/firestore.ts`)

O arquivo `src/api/firestore.ts` é o ponto central para todas as interações com o banco de dados Firestore. Ele exporta um conjunto de funções assíncronas que encapsulam a lógica de acesso aos dados.

### Principais Funções:

*   **`createUserProfile(uid: string, email: string, displayName: string)`**: Cria um novo documento de usuário na coleção `users` após o registro.
*   **`getUserProfile(uid: string)`**: Busca e retorna o perfil de um usuário específico.
*   **`updateUserProfile(uid: string, data: Partial<UserProfile>)`**: Atualiza os dados de um perfil de usuário.
*   **`getUsers()`**: Retorna uma lista de usuários (ex: para exibir no mapa).
*   **`updateUserLocation(uid: string, latitude: number, longitude: number, geohash: string)`**: Atualiza a localização de um usuário, calculando e salvando o `geohash` para otimizar consultas espaciais.
*   **`createProposal(proposerId: string, recipientId: string, skillRequested: string)`**: Cria um novo documento na coleção `proposals`.
*   **`getProposalsForUser(uid: string)`**: Busca todas as propostas enviadas e recebidas por um usuário.
*   **`updateProposalStatus(proposalId: string, status: ProposalStatus)`**: Atualiza o status de uma proposta (`accepted`, `declined`, etc.). Se o status for `accepted`, esta função também chama `createChatRoom`.
*   **`createChatRoom(user1Id: string, user2Id: string)`**: Cria uma nova sala de chat se ela ainda não existir entre dois usuários.
*   **`getChatsForUser(uid: string)`**: Retorna a lista de chats de um usuário.
*   **`getMessagesForChat(chatId: string)`**: Busca as mensagens de um chat específico em tempo real usando `onSnapshot` do Firestore. Isso permite que a UI do chat seja atualizada automaticamente com novas mensagens.
*   **`sendMessage(chatId: string, senderId: string, text: string)`**: Adiciona uma nova mensagem a uma sala de chat e atualiza o campo `lastMessage` no documento principal do chat.

### 2.2. Comunicação com o Cloudinary (`src/api/cloudinary.ts`)

O arquivo `src/api/cloudinary.ts` lida com o upload de mídias.

### Função: `uploadImage`

*   **Propósito:** Fazer o upload de uma imagem para a conta do Cloudinary configurada.
*   **Funcionamento:**
    1.  Recebe a URI local de uma imagem (ex: vinda do `expo-image-picker`).
    2.  Constrói um objeto `FormData` com a imagem e o `upload_preset`.
    3.  Envia a imagem para a API do Cloudinary através de uma requisição `POST`.
    4.  Retorna a `secure_url` da imagem hospedada no Cloudinary, que pode então ser salva no perfil do usuário no Firestore.
*   **Configuração:** O nome da nuvem (`cloudName`) é obtido das variáveis de ambiente do Expo, e o `uploadPreset` deve ser configurado como "unsigned" no painel do Cloudinary para permitir uploads diretamente do cliente.
