# 04 - Padrões de Código e Convenções

Este documento define os padrões e as melhores práticas a serem seguidos durante o desenvolvimento do Nexo. O objetivo é manter o código consistente, legível e de fácil manutenção.

## 1. Linguagem e Configurações

*   **Linguagem:** TypeScript.
*   **Modo Estrito:** O TypeScript deve ser configurado para rodar em modo `strict` no arquivo `tsconfig.json` para garantir a máxima segurança de tipos.

## 2. Formatação e Estilo

*   **Formatador:** [Prettier](https://prettier.io/) é a ferramenta oficial para formatação de código.
*   **Configuração:** Recomenda-se configurar o seu editor de código para formatar o arquivo automaticamente ao salvar (`formatOnSave`).
*   **Estilo:** Usaremos as configurações padrão do Prettier, com exceção de `singleQuote: true` (usar aspas simples) e `trailingComma: 'all'` (vírgula no final de listas e objetos).

## 3. Linting

*   **Linter:** [ESLint](https://eslint.org/) será usado para identificar e corrigir problemas no código, bem como para impor padrões de estilo.
*   **Configuração:** O projeto utilizará as regras recomendadas do ESLint e do plugin de TypeScript.

## 4. Convenções de Nomes

| Tipo de Arquivo/Variável | Convenção | Exemplo |
| :--- | :--- | :--- |
| **Arquivos de Componentes** | PascalCase | `UserProfileCard.tsx` |
| **Outros Arquivos** | kebab-case | `firebase.ts`, `auth-context.ts` |
| **Componentes e Tipos** | PascalCase | `const HomeScreen: React.FC<Props>`, `interface UserProfile {}` |
| **Variáveis e Funções** | camelCase | `const userName = 'Ana';`, `function getUserProfile() {}` |
| **Constantes Globais** | UPPER_SNAKE_CASE | `const API_URL = '...';`, `const COLORS = { ... };` |

## 5. Estrutura de Componentes

* Componentes devem ser escritos como **funções anônimas** (`const MyComponent = () => {}`).
* As props devem ser tipadas com uma `interface` ou `type` e passadas diretamente para o componente.
* A desestruturação de props é preferível para maior clareza.

```tsx
import React from 'react';

interface UserCardProps {
  userId: string;
  userName: string;
}

const UserCard = ({ userId, userName }: UserCardProps) => {
  // Lógica do componente aqui
  return (...);
};

export default UserCard;

