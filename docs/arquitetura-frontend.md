# Documentação da Arquitetura Frontend

Este documento detalha a arquitetura do frontend do Nexo App, construído com React Native e Expo.

## 1. Gerenciamento de Estado e Autenticação

O estado de autenticação do usuário é o pilar central da aplicação. Ele é gerenciado através de um `AuthContext` e disponibilizado para toda a aplicação.

### `src/contexts/AuthContext.tsx`
- **Propósito:** Prover o estado de autenticação (`user` e `isLoading`) e as funções para interagir com o Firebase Auth (`login`, `logout`, `register`).
- **Funcionamento:** Ele utiliza o `onAuthStateChanged` do Firebase para ouvir mudanças no estado de autenticação em tempo real. Quando um usuário faz login ou se registra, o contexto também chama funções do Firestore (`createUserProfile`) para criar o perfil do usuário no banco de dados.

### `src/hooks/useAuth.ts`
- **Propósito:** Um hook customizado simples que provê acesso fácil ao `AuthContext`. Qualquer componente que precise de informações do usuário pode simplesmente chamar `const { user } = useAuth();`.

### `src/app/_layout.tsx` (Layout Raiz)
- **Propósito:** Este é o componente raiz da aplicação. Sua principal responsabilidade é envolver toda a aplicação com o `AuthProvider`, garantindo que o contexto de autenticação esteja disponível em todos os lugares.
- **Roteamento protegido:** Ele implementa a lógica de roteamento protegido. O componente `InitialLayout` verifica se o usuário está autenticado. Se estiver, ele é redirecionado para a área principal (`/(tabs)`). Se não estiver, é enviado para a tela de `login`. Isso previne que usuários não autenticados acessem telas protegidas.

## 2. Navegação e Estrutura de Rotas

A navegação é gerenciada pelo **Expo Router**, que usa uma convenção baseada em arquivos e pastas para definir as rotas.

### `src/app/`
- **(auth)/**: Grupo de rotas para o fluxo de autenticação. Inclui `login.tsx`, `register.tsx`, etc. O `_layout.tsx` dentro deste grupo pode definir um layout específico para essas telas.
- **(tabs)/**: Grupo de rotas para a área principal da aplicação, acessível após o login. A navegação é feita por abas na parte inferior da tela.
- **`chat/[id].tsx`**: Rota dinâmica para uma tela de chat específica, onde `[id]` é o ID da sala de chat.
- **`user/[id].tsx`**: Rota dinâmica para a tela de perfil de um usuário específico.

### `src/app/(tabs)/_layout.tsx`
- **Propósito:** Define a estrutura da barra de abas (Tab Bar).
- **Telas:** Configura as quatro abas principais da aplicação:
  - **Início:** Tela principal.
  - **Propostas:** Para visualizar propostas recebidas e enviadas.
  - **Chat:** Lista de conversas ativas.
  - **Perfil:** Perfil do usuário logado.
- **Estilização:** Utiliza ícones da biblioteca `lucide-react-native` e cores do arquivo de constantes `src/constants/colors.ts`.

## 3. Componentes e Estilização

A aplicação segue uma abordagem de componentes reutilizáveis e um sistema de design consistente.

### `src/components/`
- Contém componentes reutilizáveis usados em várias telas, como `Logo.tsx` ou componentes de formulário.
- **`Themed.tsx`**: Fornece componentes `Text` e `View` customizados que (no futuro) podem suportar temas (claro/escuro). Atualmente, ele está configurado para usar um tema 'light' fixo, mas a estrutura para suportar múltiplos temas já está presente com o hook `useThemeColor`.

### `src/constants/`
- Esta pasta é o coração do sistema de design da aplicação.
- **`colors.ts`**: Define a paleta de cores primárias, secundárias, de texto, etc.
- **`typography.ts`**: Define tamanhos e pesos de fontes.
- **`spacing.ts`**, **`radius.ts`**, **`shadows.ts`**: Definem outras variáveis de design para manter a consistência visual em toda a aplicação.