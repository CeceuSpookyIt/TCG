# Plano de Interface Web para TCG

## Resumo

Transformar o jogo de cartas TCG (atualmente somente console/CLI) em uma aplicação web jogável no navegador, mantendo compatibilidade com o modo console existente.

---

## Análise da Arquitetura Atual

O projeto já possui uma separação limpa entre lógica de jogo e interface do usuário através da interface `IInterfaceUsuario`. Isso é um ponto forte: podemos criar uma implementação web dessa interface sem alterar a lógica central do jogo.

**Desafio principal:** O game loop atual é **síncrono** — `selecionarCarta()` bloqueia a execução usando `prompt-sync`. Para funcionar na web, precisamos tornar o fluxo **assíncrono** (Promise-based) para que o servidor aguarde a resposta do cliente via WebSocket.

---

## Tecnologias Escolhidas

| Componente | Tecnologia | Justificativa |
|---|---|---|
| Servidor HTTP | **Express.js** | Leve, maduro, amplamente suportado |
| Comunicação real-time | **Socket.IO** | WebSocket com fallback, reconexão automática, rooms |
| Frontend | **HTML/CSS/JS vanilla + Socket.IO client** | Simplicidade — sem necessidade de framework SPA para este escopo |
| Build frontend | Nenhum (servido como estático) | Mantém a stack simples |

---

## Etapas de Implementação

### Fase 1 — Tornar o Game Loop Assíncrono

**Objetivo:** Permitir que `IInterfaceUsuario` funcione com Promises, viabilizando o uso via WebSocket.

1. **Alterar `IInterfaceUsuario`** — Todos os métodos que dependem de interação do usuário retornam `Promise`:
   - `selecionarCarta(mao, mana): Promise<ICard | undefined>` (era síncrono)
   - Métodos `exibir*` podem permanecer síncronos (são fire-and-forget)

2. **Tornar `Game` assíncrono:**
   - `iniciarJogo()` → `async iniciarJogo()`
   - `rodarTurno()` → `async rodarTurno()`
   - Adicionar `await` em `selecionarCarta`

3. **Adaptar `ConsoleInterface`** — Trocar `prompt-sync` por `readline` com Promises para manter compatibilidade do modo console

4. **Adaptar `CpuInterface`** — Retornar `Promise.resolve(carta)` (CPU não precisa esperar)

5. **Adaptar `main.ts`** — Tornar as funções de menu async e usar readline

6. **Atualizar testes** — Ajustar mocks para retornar Promises

**Arquivos afetados:**
- `src/IInterfaceUsuario.ts`
- `src/game.ts`
- `src/ConsoleInterface.ts`
- `src/CpuInterface.ts`
- `src/main.ts`
- `src/game.test.ts`
- `src/player.test.ts`

---

### Fase 2 — Servidor Web (Backend)

**Objetivo:** Criar servidor Express com Socket.IO que gerencia partidas.

1. **Instalar dependências:**
   ```
   npm install express socket.io
   npm install -D @types/express
   ```

2. **Criar `src/server.ts`** — Servidor principal:
   - Servir arquivos estáticos do diretório `public/`
   - Gerenciar conexões Socket.IO
   - Gerenciar salas de jogo (rooms) para partidas

3. **Criar `src/WebInterface.ts`** — Implementação de `IInterfaceUsuario` para web:
   - `selecionarCarta()` envia estado ao cliente via socket e retorna uma Promise que resolve quando o cliente responde
   - Métodos `exibir*` emitem eventos socket para o cliente renderizar
   - Cada instância ligada a um socket específico

4. **Criar `src/gameManager.ts`** — Orquestrador de partidas:
   - Criação de salas (single player / multiplayer)
   - Lobby: esperar segundo jogador em multiplayer
   - Iniciar partida quando ambos estiverem prontos
   - Gerenciar estado: escolha de nome, classe, deck

**Protocolo de eventos Socket.IO:**

| Evento (Cliente → Servidor) | Payload | Descrição |
|---|---|---|
| `create-game` | `{ mode: 'single' \| 'multi' }` | Criar nova partida |
| `join-game` | `{ roomId }` | Entrar em partida existente |
| `set-player-info` | `{ name, classe }` | Definir nome e classe |
| `select-card` | `{ cardIndex }` | Selecionar carta durante turno |
| `pass-turn` | — | Passar o turno (não jogar carta) |
| `select-deck` | `{ deckName \| null }` | Escolher deck salvo ou padrão |
| `draft-pick` | `{ cardIndex }` | Escolher carta durante draft |

| Evento (Servidor → Cliente) | Payload | Descrição |
|---|---|---|
| `game-created` | `{ roomId }` | Sala criada |
| `game-start` | `{ opponent }` | Partida iniciou |
| `turn-start` | `{ player, opponent, hand, mana, ... }` | Início do turno do jogador |
| `request-card` | `{ hand, mana }` | Solicitar seleção de carta |
| `card-played` | `{ card, effect, playerState, opponentState }` | Resultado de carta jogada |
| `turn-end` | `{ ... }` | Fim do turno |
| `game-over` | `{ winner, draw }` | Fim de jogo |
| `poison-damage` | `{ damage, currentLife }` | Dano de veneno no início do turno |
| `board-update` | `{ player, opponent }` | Atualização do tabuleiro |
| `waiting-opponent` | — | Aguardando oponente (lobby) |
| `deck-list` | `{ decks }` | Lista de decks disponíveis |
| `draft-booster` | `{ cards }` | Booster para draft |

---

### Fase 3 — Interface Web (Frontend)

**Objetivo:** Criar interface visual jogável no navegador.

1. **Criar diretório `public/`** com:
   - `index.html` — Página principal
   - `css/style.css` — Estilos do jogo
   - `js/app.js` — Lógica do cliente Socket.IO

2. **Telas da interface:**

   **a) Menu Principal**
   - Botões: Single Player, Multiplayer, Criar Deck
   - Estilizado com tema de card game

   **b) Configuração de Jogador**
   - Campo de nome
   - Seleção de classe (Guerreiro, Bardo, Mago, Ladrão, Bárbaro) com ícones/descrições
   - Seleção de deck (listar salvos + opção padrão)

   **c) Lobby Multiplayer**
   - Código da sala para compartilhar
   - Indicador de "aguardando oponente"

   **d) Tela de Jogo (principal)**
   ```
   ┌────────────────────────────────────┐
   │  OPONENTE: Nome  ❤️15  🛡️2  ☠️1   │
   │  [cartas oponente viradas]         │
   ├────────────────────────────────────┤
   │         ÁREA DE EFEITOS            │
   │    (animações de dano, cura, etc.) │
   ├────────────────────────────────────┤
   │  JOGADOR: Nome  ❤️15  🛡️2  ☠️1    │
   │  Mana: ⬡⬡⬡⬡⬡⬢⬢⬢⬢⬢               │
   │  [carta1] [carta2] [carta3] ...   │
   │  [Passar Turno]                    │
   └────────────────────────────────────┘
   ```
   - Cartas clicáveis (destacar jogáveis, escurecer sem mana)
   - Indicadores visuais: vida, mana, escudos, venenos
   - Log de ações no canto

   **e) Tela de Draft**
   - Exibir booster (8 cartas)
   - Selecionar 4 cartas por booster
   - Progresso: "Booster 3/10"

   **f) Tela de Fim de Jogo**
   - Vencedor ou empate
   - Botão "Voltar ao Menu"

3. **Visual/UX:**
   - Tema escuro com cores de fantasia
   - Cartas com cores por tipo (vermelho=ataque, verde=cura, azul=buff, cinza=escudo, roxo=mana, amarelo=veneno)
   - Feedback visual ao jogar cartas (destaque, animação simples CSS)
   - Layout responsivo (funcionar em mobile)

---

### Fase 4 — Integração e Testes

1. **Adicionar script npm:**
   - `"server": "ts-node src/server.ts"` — Iniciar servidor web
   - `"start"` continua como CLI

2. **Garantir que testes existentes passam** após a conversão async

3. **Testes manuais:**
   - Single player via web
   - Multiplayer (duas abas do navegador)
   - Criação de deck via draft
   - Fluxo completo de jogo

4. **Atualizar `specs.txt`** com a nova funcionalidade web

5. **Atualizar `AGENTS.md`** se necessário

---

## Estrutura Final de Arquivos

```
TCG/
├── src/
│   ├── main.ts                  # CLI (atualizado para async)
│   ├── server.ts                # ★ NOVO - Servidor Express + Socket.IO
│   ├── gameManager.ts           # ★ NOVO - Gerenciador de partidas web
│   ├── WebInterface.ts          # ★ NOVO - IInterfaceUsuario para web
│   ├── game.ts                  # Atualizado (async)
│   ├── player.ts                # Sem alteração
│   ├── IInterfaceUsuario.ts     # Atualizado (Promise em selecionarCarta)
│   ├── ConsoleInterface.ts      # Atualizado (readline async)
│   ├── CpuInterface.ts          # Atualizado (Promise.resolve)
│   ├── deckStorage.ts           # Sem alteração
│   ├── draft.ts                 # Sem alteração
│   ├── cards/                   # Sem alteração
│   └── *.test.ts                # Atualizados para async
├── public/                      # ★ NOVO - Frontend web
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── app.js
├── package.json                 # Atualizado com novas deps
├── specs.txt                    # Atualizado
└── AGENTS.md
```

---

## Ordem de Execução

1. **Fase 1** — Converter game loop para async (pré-requisito para tudo)
2. **Fase 2** — Backend: servidor, WebInterface, gameManager
3. **Fase 3** — Frontend: HTML/CSS/JS
4. **Fase 4** — Integração, testes, documentação

---

## Riscos e Mitigações

| Risco | Mitigação |
|---|---|
| Quebra de testes existentes ao tornar async | Converter testes incrementalmente, rodar `npm test` a cada mudança |
| Desconexão do jogador durante partida | Socket.IO tem reconexão automática; adicionar timeout para partidas abandonadas |
| Estado inconsistente em multiplayer | Toda lógica fica no servidor; cliente é apenas visualização |
| Compatibilidade com Node.js antigo | Projeto já usa TypeScript com target ES5, Express e Socket.IO suportam Node 12+ |

---

## Notas

- A lógica do jogo (`Player`, `Game`, cards) permanece **inalterada** — apenas a camada de interface é substituída
- O modo CLI continua funcionando após as mudanças (agora async com readline)
- Multiplayer online funciona na mesma rede local; para internet pública seria necessário deploy (fora do escopo deste plano)
