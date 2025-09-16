# 01 - Visão Geral do Projeto: Nexo

## 1. Resumo Executivo

O Nexo é um aplicativo móvel multiplataforma (iOS/Android) que cria comunidades locais de escambo de habilidades. A plataforma opera com um sistema de "banco de horas", onde o tempo, e não o dinheiro, é a moeda de troca. A missão do Nexo é democratizar o acesso ao conhecimento e fortalecer laços comunitários, permitindo que qualquer pessoa possa ensinar o que sabe e aprender o que deseja.

## 2. O Problema

O acesso a novas habilidades é frequentemente caro (cursos, workshops) ou impessoal e ineficaz (tutoriais online genéricos). Ao mesmo tempo, muitos talentos e conhecimentos valiosos dentro de uma comunidade local permanecem ociosos por falta de uma plataforma que facilite e incentive o compartilhamento.

## 3. A Solução

O Nexo remove a barreira financeira ao aprendizado, valorizando o conhecimento individual como um ativo tangível. Através de uma interface baseada em mapa, o aplicativo conecta pessoas com interesses complementares dentro de sua própria vizinhança, permitindo trocas de conhecimento de forma segura e intuitiva.

*   **Para o Aprendiz:** Adquira novas competências de forma acessível e personalizada.
*   **Para o Professor:** Compartilhe sua paixão, ganhe créditos de tempo para financiar seu próprio aprendizado e construa uma reputação local.

## 4. Público-Alvo

*   **Primário:** Estudantes universitários, jovens profissionais (20-35 anos) e trabalhadores autônomos que buscam aprendizado contínuo com baixo custo.
*   **Secundário:** Especialistas em áreas de nicho, aposentados que desejam se manter ativos e pessoas em transição de carreira.

## 5. Modelo de Monetização (Freemium)

O uso principal da plataforma será sempre gratuito para garantir a missão do projeto. Uma assinatura opcional, **"Nexo Plus"**, será oferecida com benefícios de conveniência e destaque, como:

*   Perfil em destaque nos resultados de busca.
*   Filtros de busca avançados.
*   Selo de "Membro Plus" no perfil.

---

# Visão Geral do Projeto: Nexo App

## 1. Descrição

O **Nexo App** é uma aplicação móvel desenvolvida com React Native e Expo. Pela análise da estrutura de pastas e dependências, o projeto parece ser uma plataforma social ou de networking que conecta usuários. As funcionalidades principais incluem autenticação de usuário, chat em tempo real, criação e visualização de propostas, e perfis de usuário.

## 2. Tecnologias Utilizadas

A aplicação utiliza um stack moderno baseado em TypeScript e Firebase.

### **Frontend:**
- **Framework:** React Native com Expo
- **Linguagem:** TypeScript
- **Roteamento:** Expo Router
- **UI/Componentes:**
  - `lucide-react-native` para ícones.
  - `react-native-gifted-chat` para a interface de chat.
  - `react-native-maps` com `react-native-map-clustering` e `supercluster` para agrupamento de marcadores.
  - `@expo-google-fonts/nunito-sans` para fontes.
- **Gerenciamento de Estado:** React Context API
- **Armazenamento Local:** `@react-native-async-storage/async-storage`

### **Backend (Firebase):**
- **Autenticação:** Firebase Authentication
- **Banco de Dados:** Google Firestore
- **Armazenamento de Mídia:** Cloudinary
- **Lógica de Backend:** Firebase Cloud Functions

### **Ferramentas de Desenvolvimento:**
- **Gerenciador de Pacotes:** `npm`
- **TypeScript:** para tipagem estática.
- **ESLint:** para linting.
- **Prettier:** para formatação de código.

## 3. Estrutura do Projeto

O projeto é organizado de forma modular, separando claramente as responsabilidades.

```
nexo-app/
├── functions/      # Lógica de backend (Firebase Cloud Functions)
├── src/
│   ├── api/        # Módulos de comunicação com APIs (Cloudinary, Firebase, Firestore)
│   │   ├── cloudinary.ts
│   │   ├── firebase.ts
│   │   └── firestore.ts
│   ├── app/        # Estrutura de rotas e telas (padrão Expo Router)
│   │   ├── (auth)/ # Grupo de rotas para o fluxo de autenticação
│   │   ├── (tabs)/ # Grupo de rotas para a navegação por abas
│   │   ├── chat/   # Rota dinâmica para tela de chat
│   │   ├── profile/ # Rota para o perfil do usuário
│   │   ├── propose/ # Rota para criar propostas
│   │   ├── user/   # Rota dinâmica para perfil de outros usuários
│   │   └── _layout.tsx # Layout raiz do aplicativo
│   ├── assets/     # Arquivos estáticos (fontes, imagens)
│   │   ├── fonts/
│   │   ├── images/
│   │   └── default-avatar.png
│   ├── components/ # Componentes de UI reutilizáveis
│   │   ├── map/    # Componentes relacionados ao mapa
│   │   └── ... (outros componentes como Logo, Themed, etc.)
│   ├── constants/  # Constantes globais de estilo e configuração
│   │   ├── colors.ts
│   │   ├── index.ts
│   │   ├── radius.ts
│   │   ├── shadows.ts
│   │   ├── spacing.ts
│   │   └── typography.ts
│   ├── contexts/   # Contextos React para gerenciamento de estado global
│   │   └── AuthContext.tsx
│   ├── hooks/      # Hooks personalizados para lógica reutilizável
│   │   └── useAuth.ts
│   ├── types/      # Definições de tipos e interfaces TypeScript
│   │   ├── chat.ts
│   │   ├── proposal.ts
│   │   ├── supercluster.d.ts
│   │   └── user.ts
│   └── utils/      # Funções utilitárias genéricas (atualmente vazio)
├── package.json    # Dependências e scripts do projeto
└── tsconfig.json   # Configurações do TypeScript
```

## 4. Como Executar o Projeto

Para iniciar o ambiente de desenvolvimento, utilize os scripts definidos no `package.json`.

1. **Instalar dependências:**
   ```bash
   npm install
   ```

2. **Executar a aplicação:**
   - **Para desenvolvimento web:**
     ```bash
     npm run web
     ```
   - **Para Android:**
     ```bash
     npm run android
     ```
   - **Para iOS:**
     ```bash
     npm run ios
     ```
   - **Geral (abre o menu do Expo Dev Client):**
     ```bash
     npm start
     ```