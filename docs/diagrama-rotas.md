# Diagrama de Estrutura de Telas e Rotas

Este documento contém um diagrama gerado com a sintaxe Mermaid que ilustra o fluxo de navegação e a hierarquia das rotas no Nexo App.

**Para visualizar o diagrama:** Copie e cole o código dentro do bloco abaixo em um editor de Mermaid online (como o [Mermaid Live Editor](https://mermaid.live)) ou visualize este arquivo em uma plataforma com suporte a Mermaid (como o GitHub).

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
        D --> D1["/(tabs)/index
(Início/Mapa)"];
        D --> D2["/(tabs)/proposals
(Lista de Propostas)"];
        D --> D3["/(tabs)/chat
(Lista de Chats)"];
        D --> D4["/(tabs)/profile
(Perfil do Usuário)"];
    end

    subgraph Rotas Dinâmicas
        D1 -- Clica em Usuário --> E["/user/[id]
(Perfil de outro usuário)"];
        D3 -- Clica em Conversa --> F["/chat/[id]
(Tela de Chat)"];
        D2 -- Proposta Aceita --> F;
    end

    %% Styling
    style C fill:#f9f,stroke:#333,stroke-width:2px;
    style D fill:#ccf,stroke:#333,stroke-width:2px;
```
