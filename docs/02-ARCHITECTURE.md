# 02 - Arquitetura do Projeto

Este documento detalha as decisões técnicas e a estrutura arquitetônica do projeto Nexo.

## 1. Stack Tecnológico

A seleção de tecnologias foi feita visando agilidade, escalabilidade e uma excelente experiência de desenvolvimento.

| Categoria | Tecnologia | Justificativa |
| :--- | :--- | :--- |
| **Frontend (Mobile)** | React Native c/ Expo | Desenvolvimento multiplataforma rápido, ecossistema JavaScript robusto e acesso a ferramentas como EAS Build e Dev Client. |
| **Banco de Dados** | Google Firestore | Banco de dados NoSQL, escalável, com funcionalidades de tempo real e um modelo de segurança robusto integrado ao Firebase. |
| **Autenticação** | Firebase Authentication | Solução completa para gerenciamento de usuários (login, registro, etc.), segura e integrada ao ecossistema Firebase. |
| **Armazenamento de Mídia** | Cloudinary | Serviço especializado para armazenamento, otimização e entrega de imagens. Garante performance e um plano gratuito generoso. |
| **Interface de Mapa** | `react-native-maps` | Biblioteca padrão da comunidade React Native para integração de mapas nativos (Google Maps no Android, Apple Maps no iOS), complementada por `react-native-map-clustering` e `supercluster` para agrupamento de marcadores. |

## 2. Estrutura de Pastas do Frontend (`src/`)

O código-fonte (`/src`) é organizado por funcionalidade e utiliza o roteamento baseado em arquivos do Expo Router para as telas principais, garantindo a separação de responsabilidades e a manutenibilidade.

```
src/
├── api/             # Módulos de integração com serviços externos (Cloudinary, Firebase, Firestore).
│   ├── cloudinary.ts
│   ├── firebase.ts
│   └── firestore.ts
├── app/             # Telas e layouts do aplicativo, organizados pelo Expo Router.
│   ├── (auth)/      # Grupo de rotas para o fluxo de autenticação (login, registro).
│   ├── (tabs)/      # Grupo de rotas para a navegação por abas (Início/Mapa, Propostas, Chat, Perfil).
│   ├── chat/        # Rota dinâmica para telas de chat específicas (`[id].tsx`).
│   ├── profile/     # Rota para o perfil do usuário logado.
│   ├── propose/     # Rota para a tela de criação de propostas.
│   ├── user/        # Rota dinâmica para telas de perfil de outros usuários (`[id].tsx`).
│   └── _layout.tsx  # Layout raiz do aplicativo, gerencia o roteamento protegido.
├── assets/          # Arquivos estáticos como fontes e imagens.
│   ├── fonts/
│   ├── images/
│   └── default-avatar.png
├── components/      # Componentes de UI reutilizáveis.
│   ├── map/         # Componentes específicos para a interface de mapa.
│   └── ...          # Outros componentes como Logo.tsx, Themed.tsx, etc.
├── constants/       # Constantes globais para estilo e configuração.
│   ├── colors.ts    # Paleta de cores.
│   ├── index.ts
│   ├── radius.ts    # Raio de borda.
│   ├── shadows.ts   # Estilos de sombra.
│   ├── spacing.ts   # Espaçamento.
│   └── typography.ts # Tipografia (tamanhos, pesos, famílias de fonte).
├── contexts/        # Contextos React para gerenciamento de estado global.
│   └── AuthContext.tsx # Gerencia o estado de autenticação do usuário.
├── hooks/           # Hooks personalizados para lógica reutilizável.
│   └── useAuth.ts   # Hook para acessar o AuthContext.
├── types/           # Definições de tipos e interfaces TypeScript.
│   ├── chat.ts
│   ├── proposal.ts
│   ├── supercluster.d.ts
│   └── user.ts
└── utils/           # Funções utilitárias genéricas (atualmente vazio).
```

## 3. Fluxo de Dados e Gerenciamento de Estado

O fluxo de dados segue um padrão unidirecional para garantir a previsibilidade, com o gerenciamento de estado centralizado através do React Context API para dados globais como autenticação.

1.  **Ação do Usuário (View):** Um usuário interage com um componente em uma `Tela` (ex: clica no botão "Login").
2.  **Lógica da Aplicação:** A `Tela` chama uma função de um `Hook` ou `Contexto` (ex: `useAuth` para autenticação).
3.  **Comunicação com Backend:** A função do `Hook`/`Contexto` chama um módulo da `API` (ex: `api/firebase.ts` para autenticação, `api/firestore.ts` para dados, `api/cloudinary.ts` para upload de imagens).
4.  **Serviço Externo:** O módulo da `API` se comunica com o serviço externo (ex: Firebase Auth, Firestore, Cloudinary).
5.  **Atualização de Estado:** O retorno do serviço atualiza o estado global (no `Contexto`, como `AuthContext`) ou o estado local do componente.
6.  **Re-renderização (View):** A mudança no estado faz com que as `Telas` relevantes sejam re-renderizadas com a nova informação.

### Gerenciamento de Autenticação

O estado de autenticação do usuário é o pilar central da aplicação, gerenciado através de um `AuthContext` (`src/contexts/AuthContext.tsx`) e disponibilizado para toda a aplicação. Ele utiliza `onAuthStateChanged` do Firebase para ouvir mudanças no estado de autenticação em tempo real e interage com o Firestore para criar/atualizar perfis de usuário.

## 4. Navegação e Roteamento

A navegação é gerenciada pelo **Expo Router**, que usa uma convenção baseada em arquivos e pastas para definir as rotas, garantindo um roteamento intuitivo e declarativo.

*   **`src/app/_layout.tsx` (Layout Raiz):** Componente raiz que envolve toda a aplicação com o `AuthProvider` e implementa a lógica de roteamento protegido, redirecionando usuários autenticados para `/(tabs)` e não autenticados para `/(auth)`.
*   **`src/app/(auth)/`:** Grupo de rotas para o fluxo de autenticação (ex: `login.tsx`, `register.tsx`).
*   **`src/app/(tabs)/`:** Grupo de rotas para a área principal da aplicação, acessível após o login, com navegação por abas (definida em `src/app/(tabs)/_layout.tsx`).
*   **Rotas Dinâmicas:** Inclui rotas como `src/app/chat/[id].tsx` (para chats específicos) e `src/app/user/[id].tsx` (para perfis de usuários).

## 5. Estrutura do Banco de Dados (Firestore)

O Firestore é organizado em coleções de documentos, com os seguintes modelos de dados principais:

*   **Coleção `users`:** Armazena o perfil de cada usuário (ID do documento é o `uid` do Firebase Auth).
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
*   **Coleção `proposals`:** Contém as propostas de troca de tempo/habilidade entre usuários.
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
*   **Coleção `chats`:** Modela as conversas entre os usuários (uma sala de chat é criada quando uma proposta é aceita).
    *   Possui uma subcoleção `messages` para armazenar as mensagens daquela conversa.

## 6. Lógica de Backend (Cloud Functions)

As Cloud Functions são usadas para executar tarefas server-side que garantem segurança e consistência, como a função `onProposalCompleted`.

*   **Função `onProposalCompleted`:** Acionada na atualização de documentos na coleção `proposals`. Verifica se o status mudou para `completed` e realiza a transferência atômica de "saldo de tempo" entre os usuários via transação do Firestore.

## 7. Decisões Chave de Arquitetura

*   **Autenticação via Context API:** Um `AuthContext` proverá o estado do usuário (`user`, `isLoading`) para toda a aplicação, gerenciando o fluxo entre as telas de autenticação e as telas principais.
*   **Descoberta via Mapa:** A tela principal será uma interface de mapa, proporcionando uma experiência de descoberta visual e focada na localidade. A privacidade será garantida através de "jittering" (randomização leve) da localização exata do usuário.
*   **Transação Segura de Horas:** A lógica de transferência de horas no "banco de tempo" será implementada via **Firebase Cloud Functions**. Isso garante que a transação seja atômica e segura, pois o código executa em um ambiente de servidor controlado, e não no dispositivo do cliente.
*   **Variáveis de Ambiente:** Todas as chaves de API e segredos serão armazenados em um arquivo `.env` e nunca serão "commitados" no repositório Git, garantindo a segurança.

## 8. Diagrama de Estrutura de Telas e Rotas

Este diagrama ilustra o fluxo de navegação e a hierarquia das rotas no Nexo App. Para visualizar, copie o código abaixo em um editor de Mermaid online (como o [Mermaid Live Editor](https://mermaid.live)).

```mermaid
graph TD
    subgraph Fluxo Inicial
        A[Início da App] --> B{Usuário Autenticado?};
    end

    subgraph Autenticação
        B -- Não --> C[(auth) Group];
        C --> C1["/login"];
        C --> C2["/register"];
        C1 -- Efetua Login --> B;
        C2 -- Cria Conta --> B;
    end

    subgraph App Principal
        B -- Sim --> D[(tabs) Group];
        D --> D1["/(tabs)/index\n(Início/Mapa)"];
        D --> D2["/(tabs)/proposals\n(Lista de Propostas)"];
        D --> D3["/(tabs)/chat\n(Lista de Chats)"];
        D --> D4["/(tabs)/profile\n(Perfil do Usuário)"];
    end

    subgraph Rotas Dinâmicas
        D1 -- Clica em Usuário --> E["/user/[id]\n(Perfil de outro usuário)"];
        D3 -- Clica em Conversa --> F["/chat/[id]\n(Tela de Chat)"];
        D2 -- Proposta Aceita --> F;
    end

    %% Styling
    style C fill:#f9f,stroke:#333,stroke-width:2px;
    style D fill:#ccf,stroke:#333,stroke-width:2px;
```

---

### Observação sobre o Tunnel

O comando `npx expo start --tunnel` é utilizado para expor o servidor de desenvolvimento local a uma URL pública, facilitando o teste em dispositivos reais fora da rede local.
