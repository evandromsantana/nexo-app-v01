# 03 - Guia de Instalação e Configuração (Getting Started)

Este guia contém todas as instruções necessárias para configurar o ambiente de desenvolvimento e rodar o projeto Nexo localmente.

## 1. Pré-requisitos

Antes de começar, garanta que você tenha as seguintes ferramentas instaladas em sua máquina:

*   **Node.js (LTS):** [Link para download](https://nodejs.org/en/)
*   **Git:** [Link para download](https://git-scm.com/downloads)
*   **Conta no Firebase:** [Criar conta](https://console.firebase.google.com/)
*   **Conta no Cloudinary:** [Criar conta](https://cloudinary.com/users/register/free)
*   **EAS CLI (Expo Application Services):**
    ```bash
    npm install -g eas-cli
    ```

## 2. Configuração do Projeto

1.  **Clonar o Repositório:**
    ```bash
    git clone SEU_URL_DO_REPOSITORIO_GIT nexo-app-v3
    cd nexo-app-v3
    ```
    *Substitua `SEU_URL_DO_REPOSITORIO_GIT` pela URL real do seu repositório.*

2.  **Instalar as Dependências:**
    ```bash
    npm install
    ```

3.  **Configurar Variáveis de Ambiente:**
    * Na raiz do projeto, crie uma cópia do arquivo `env.example` e renomeie-a para `.env`.
        ```bash
        cp env.example .env
        ```
    * Preencha o arquivo `.env` com as chaves de API dos seus projetos Firebase e Cloudinary. As variáveis devem começar com `EXPO_PUBLIC_`.

        ```
        EXPO_PUBLIC_FIREBASE_API_KEY="SUA_CHAVE_AQUI"
        EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN="SEU_DOMINIO_AQUI"
        # ... (todas as outras chaves do Firebase)

        EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME="SEU_CLOUD_NAME_AQUI"
        EXPO_PUBLIC_CLOUDINARY_API_KEY="SUA_API_KEY_AQUI"
        ```

## 3. Rodando o Projeto

Para iniciar o servidor de desenvolvimento, use o seguinte comando:

```bash
npx expo start
