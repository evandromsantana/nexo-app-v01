# Documentação do Backend (Firebase)

Esta documentação descreve a arquitetura do backend da aplicação Nexo, que é construída inteiramente sobre a plataforma Firebase.

## 1. Visão Geral

O backend utiliza três serviços principais do Firebase:
- **Firestore:** Como banco de dados NoSQL para armazenar todos os dados da aplicação (perfis de usuário, propostas, chats).
- **Firebase Authentication:** Para gerenciar o ciclo de vida da autenticação dos usuários.
- **Cloud Functions:** Para executar lógicas de backend em resposta a eventos no banco de dados.

## 2. Estrutura do Banco de Dados (Firestore)

O Firestore é organizado em coleções de documentos. Abaixo estão as principais coleções e seus respectivos modelos de dados.

### Coleção: `users`

Armazena o perfil de cada usuário.

- **Documento ID:** `uid` do usuário (o mesmo do Firebase Authentication).
- **Modelo de Dados (`UserProfile`):
  ```typescript
  interface UserProfile {
    uid: string;
    email: string;
    displayName: string;
    photoUrl: string | null;
    bio: string;
    timeBalance: number; // Saldo de tempo em minutos
    skillsToTeach: string[];
    skillsToLearn: string[];
    location: {
      geohash: string;
      latitude: number;
      longitude: number;
    } | null;
    memberSince: Timestamp;
  }
  ```

### Coleção: `proposals`

Contém as propostas de troca de tempo/habilidade entre usuários.

- **Documento ID:** Gerado automaticamente pelo Firestore.
- **Modelo de Dados (`Proposal`):
  ```typescript
  interface Proposal {
    proposerId: string;  // UID de quem propõe
    recipientId: string; // UID de quem recebe
    skillRequested: string;
    status: 'pending' | 'accepted' | 'declined' | 'completed';
    createdAt: Timestamp;
    updatedAt: Timestamp;
  }
  ```

### Coleção: `chats`

Modela as conversas entre os usuários. Uma sala de chat é criada quando uma proposta é aceita.

- **Documento ID:** Gerado automaticamente pelo Firestore.
- **Modelo de Dados (`Chat`):
  ```typescript
  interface Chat {
    users: string[]; // Array com os UIDs dos dois usuários
    lastMessage: string;
    updatedAt: Timestamp;
  }
  ```

- **Subcoleção:** `messages`
  - Dentro de cada documento de `chat`, há uma subcoleção `messages` que armazena as mensagens daquela conversa, ordenadas por data.

## 3. Lógica de Backend (Cloud Functions)

As Cloud Functions são usadas para executar tarefas server-side que não devem ser confiadas ao cliente por segurança e consistência.

### Função: `onProposalCompleted`

- **Gatilho:** Atualização de um documento na coleção `proposals`.
- **Lógica:**
  1. A função é acionada sempre que uma proposta é atualizada.
  2. Ela verifica se o status da proposta mudou para `completed`.
  3. Se sim, ela realiza a transferência de "saldo de tempo" entre os dois usuários envolvidos na proposta.
  4. Utiliza uma **transação do Firestore** para garantir que a atualização dos saldos de ambos os usuários seja atômica (ou tudo é salvo, ou nada é).
  5. O usuário que ensinou (`recipientId`) ganha 60 minutos, e o que aprendeu (`proposerId`) perde 60 minutos.
  6. Registra logs de sucesso ou falha na operação.

Este mecanismo é crucial para a lógica de "banco de tempo" da aplicação, garantindo que as transferências sejam seguras e consistentes.