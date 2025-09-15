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
  - `styled-components` para estilização CSS-in-JS.
  - `lucide-react-native` para ícones.
  - `expo-linear-gradient` para gradientes.
- **Navegação:** React Navigation (`@react-navigation/native`)
- **Mapas:** `react-native-maps` com `react-native-map-clustering` e `supercluster` para agrupamento de marcadores.
- **Chat:** `react-native-gifted-chat` para a interface de chat.
- **Fontes:** `@expo-google-fonts/nunito-sans`
- **Armazenamento Local:** `@react-native-async-storage/async-storage`

### **Backend (Firebase):**
- **Autenticação:** `@react-native-firebase/auth` e `firebase/auth`
- **Banco de Dados:** Firestore (inferido pelo `src/api/firestore.ts`)
- **Cloud Functions:** A pasta `functions` sugere o uso de funções serverless para lógica de backend.

### **Ferramentas de Desenvolvimento:**
- **Gerenciador de Pacotes:** `npm`
- **TypeScript:** para tipagem estática.

## 3. Estrutura do Projeto

O projeto é organizado de forma modular, separando claramente as responsabilidades.

```
nexo-app/
├── functions/      # Lógica de backend (Firebase Cloud Functions)
├── src/
│   ├── api/        # Módulos de comunicação com APIs (Firebase, Cloudinary)
│   ├── app/        # Estrutura de rotas e telas (padrão Expo Router)
│   │   ├── (auth)/ # Telas de autenticação (login, registro)
│   │   ├── (tabs)/ # Telas principais após login (chat, perfil, etc.)
│   │   └── ...
│   ├── assets/     # Imagens, fontes e outros arquivos estáticos
│   ├── components/ # Componentes React reutilizáveis
│   ├── constants/  # Constantes globais (cores, espaçamento, tipografia)
│   ├── contexts/   # Contextos React (ex: AuthContext para gerenciamento de sessão)
│   ├── hooks/      # Hooks customizados (ex: useAuth)
│   ├── types/      # Definições de tipos TypeScript
│   └── utils/      # Funções utilitárias
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
