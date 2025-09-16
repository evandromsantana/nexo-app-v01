# 05 - Guia de Estilo de UI/UX e Identidade Visual

Este documento é a fonte da verdade para a identidade visual e a experiência do usuário (UI/UX) do aplicativo Nexo.

## 1. Princípios de Design

*   **Claro e Intuitivo:** A interface deve ser fácil de usar, sem a necessidade de longas explicações.
*   **Comunitário e Confiável:** O design deve inspirar confiança e um senso de comunidade.
*   **Encorajador e Positivo:** A experiência deve motivar os usuários a aprender e compartilhar.

## 2. Identidade Visual

### Paleta de Cores

| Uso | Cor | Hex Code |
| :--- | :--- | :--- |
| **Primária (Coral Retrô)** | `#FF6B6B` |
| **Secundária (Azul Jeans)** | `#355070` |
| **Destaque (Amarelo Mostarda)** | `#F7B801` |
| **Sucesso (Verde Musgo)** | `#6A994E` |
| **Perigo (Vermelho Vinho)** | `#BC4749` |
| **Aviso (Laranja Queimado)** | `#E09F3E` |
| **Informação (Azul Acinzentado)** | `#577590` |
| **Branco (Off-white amarelado)** | `#FFF8F0` |
| **Preto (Vintage)** | `#1B1B1B` |
| **Cinza Claro (Esmaecido)** | `#E6DADA` |
| **Cinza Clássico** | `#B7B7B7` |
| **Cinza Carvão** | `#3A3A3A` |
| **Fundo (Bege Claro)** | `#FAF3E0` |
| **Card (Branco)** | `#FFFFFF` |
| **Texto Primário (Preto suave)** | `#2F2F2F` |
| **Texto Secundário (Cinza médio retrô)** | `#6D6D6D` |

### Tipografia

*   **Família da Fonte:** `System` (padrão do sistema, pode ser configurado para Nunito Sans via `@expo-google-fonts/nunito-sans`).
*   **Hierarquia (Tamanhos e Pesos):
    *   **H1 (Títulos de Tela):** `34px`, `Bold (700)`
    *   **H2 (Subtítulos):** `28px`, `Bold (700)`
    *   **H3:** `24px`, `Bold (700)`
    *   **Corpo (Texto principal):** `16px`, `Regular (400)`
    *   **Legenda (Texto auxiliar):** `14px`, `Regular (400)`
    *   **Extra Pequeno:** `12px`, `Regular (400)`

## 3. Tom de Voz

A comunicação do aplicativo deve ser:

*   **Colaborativa:** Usar "nós", "juntos", "comunidade".
*   **Encorajadora:** Ex: "Vamos aprender algo novo hoje?".
*   **Clara e Simples:** Evitar jargões técnicos.
*   **Exemplos:**
    * Em vez de "Transação Completa", usar "Troca Concluída com Sucesso!".
    * Em vez de "Avalie o Usuário", usar "Como foi aprender com a Ana?".

## 4. Fluxo de Telas Principal (User Flow)

1.  **Splash Screen:** Tela inicial de carregamento com o logo.
2.  **Fluxo de Autenticação (`app/(auth)/`):**
    *   Tela de Boas-Vindas (com opções de Login e Cadastro).
    *   Tela de Login (`app/(auth)/login.tsx`).
    *   Tela de Cadastro (`app/(auth)/register.tsx`).
3.  **Fluxo Principal do App (`app/(tabs)/` - Navegação por Abas):**
    *   **Aba Início/Explorar (Mapa):** Tela principal com o mapa para descoberta de usuários (`app/(tabs)/index.tsx`).
    *   **Aba Propostas:** Gerenciamento de propostas de troca (Recebidas, Enviadas) (`app/(tabs)/proposals.tsx`).
    *   **Aba Chat:** Lista de conversas ativas (`app/(tabs)/chat.tsx`).
    *   **Aba Perfil:** Perfil do próprio usuário, saldo de horas e configurações (`app/(tabs)/profile.tsx`).
4.  **Rotas Dinâmicas:**
    *   **Perfil de Outro Usuário:** `app/user/[id].tsx`.
    *   **Tela de Chat Específica:** `app/chat/[id].tsx`.
    *   **Tela de Proposta:** `app/propose/index.tsx` (para criar/visualizar uma proposta específica).
