import { Server, Socket } from "socket.io";
import { Game } from "./game";
import { Player } from "./player";
import { Mago } from "./mago";
import { Ladrao } from "./ladrao";
import { Bardo } from "./bardo";
import { Barbaro } from "./barbaro";
import { Guerreiro } from "./guerreiro";
import { WebInterface } from "./WebInterface";
import { CpuInterface } from "./CpuInterface";
import { enumClasse } from "./classe.enum";
import { ICard } from "./cards/ICard";
import { listDecks, loadDeck, saveDeck } from "./deckStorage";
import {
  gerarBooster,
  escolherCartasBooster,
} from "./draft";
import { enumTipo, obterNomeTipo } from "./tipo.enum";
import { CardAtaque } from "./cards/cardAtaque";
import { CardCura } from "./cards/cardCura";
import { CardBuff } from "./cards/cardBuff";
import { CardEscudo } from "./cards/cardEscudo";
import { CardMana } from "./cards/cardMana";
import { CardVeneno } from "./cards/cardVeneno";

interface RoomPlayer {
  socket: Socket;
  nome: string;
  classe: enumClasse;
  deck?: ICard[];
  ready: boolean;
}

interface Room {
  id: string;
  mode: "single" | "multi";
  players: RoomPlayer[];
  game?: Game;
}

function criarJogador(nome: string, classe: enumClasse, deck?: ICard[]): Player {
  switch (classe) {
    case enumClasse.mago:
      return new Mago(nome, deck);
    case enumClasse.ladrao:
      return new Ladrao(nome, deck);
    case enumClasse.bardo:
      return new Bardo(nome, deck);
    case enumClasse.barbaro:
      return new Barbaro(nome, deck);
    default:
      return new Guerreiro(nome, deck);
  }
}

function serializarCarta(carta: ICard) {
  return {
    tipo: carta.obterTipo(),
    tipoNome: obterNomeTipo(carta.obterTipo()),
    custo: carta.obterCusto(),
    valor: carta.obterValor(),
  };
}

export class GameManager {
  private rooms: Map<string, Room> = new Map();
  private io: Server;

  constructor(io: Server) {
    this.io = io;
  }

  private generateRoomId(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  handleConnection(socket: Socket): void {
    socket.on("list-decks", () => {
      socket.emit("deck-list", { decks: listDecks() });
    });

    socket.on("create-game", (data: { mode: "single" | "multi" }) => {
      const roomId = this.generateRoomId();
      const room: Room = {
        id: roomId,
        mode: data.mode,
        players: [],
      };
      this.rooms.set(roomId, room);
      socket.join(roomId);
      socket.emit("game-created", { roomId });
    });

    socket.on("join-game", (data: { roomId: string }) => {
      const room = this.rooms.get(data.roomId);
      if (!room) {
        socket.emit("error-msg", { message: "Sala nao encontrada" });
        return;
      }
      if (room.players.length >= 2) {
        socket.emit("error-msg", { message: "Sala cheia" });
        return;
      }
      socket.join(data.roomId);
      socket.emit("joined-game", { roomId: data.roomId });
    });

    socket.on(
      "set-player-info",
      (data: { roomId: string; nome: string; classe: number; deckName?: string }) => {
        const room = this.rooms.get(data.roomId);
        if (!room) return;

        let deck: ICard[] | undefined;
        if (data.deckName) {
          deck = loadDeck(data.deckName) || undefined;
        }

        const existing = room.players.find((p) => p.socket.id === socket.id);
        if (existing) {
          existing.nome = data.nome;
          existing.classe = data.classe as enumClasse;
          existing.deck = deck;
          existing.ready = true;
        } else {
          room.players.push({
            socket,
            nome: data.nome,
            classe: data.classe as enumClasse,
            deck,
            ready: true,
          });
        }

        if (room.mode === "single" && room.players.length === 1 && room.players[0].ready) {
          this.startSinglePlayerGame(room);
        } else if (room.mode === "multi") {
          if (room.players.length === 2 && room.players.every((p) => p.ready)) {
            this.startMultiplayerGame(room);
          } else {
            socket.emit("waiting-opponent");
          }
        }
      }
    );

    socket.on("draft-start", (data: { roomId: string }) => {
      const room = this.rooms.get(data.roomId);
      if (!room) return;
      this.startDraft(socket, room);
    });

    socket.on("save-draft-deck", (data: { name: string; cards: Array<{ tipo: number; valor: number }> }) => {
      const deck: ICard[] = data.cards.map((c) => {
        switch (c.tipo) {
          case enumTipo.ataque: return new CardAtaque(c.valor);
          case enumTipo.cura: return new CardCura(c.valor);
          case enumTipo.buff: return new CardBuff(c.valor);
          case enumTipo.escudo: return new CardEscudo(c.valor);
          case enumTipo.mana: return new CardMana(c.valor);
          default: return new CardVeneno(c.valor);
        }
      });
      saveDeck(data.name, deck);
      socket.emit("deck-saved");
    });

    socket.on("disconnect", () => {
      const roomIds = Array.from(this.rooms.keys());
      for (const roomId of roomIds) {
        const room = this.rooms.get(roomId)!;
        const idx = room.players.findIndex((p: RoomPlayer) => p.socket.id === socket.id);
        if (idx !== -1) {
          room.players.splice(idx, 1);
          this.io.to(roomId).emit("player-disconnected");
          if (room.players.length === 0) {
            this.rooms.delete(roomId);
          }
        }
      }
    });
  }

  private async startSinglePlayerGame(room: Room): Promise<void> {
    const p1Data = room.players[0];
    const jogador1 = criarJogador(p1Data.nome, p1Data.classe, p1Data.deck);
    const cpuClasse = Math.floor(Math.random() * 5) as enumClasse;
    const jogador2 = criarJogador("CPU", cpuClasse);

    const iu1 = new WebInterface(p1Data.socket);
    const iu2 = new CpuInterface();

    const game = new Game(jogador1, jogador2, iu1, iu2);
    room.game = game;

    p1Data.socket.emit("game-start", {
      opponent: { nome: "CPU", classe: cpuClasse },
    });

    await game.iniciarJogo();

    const resultado = game.Vencedor
      ? { winner: game.Vencedor.nome, draw: false }
      : { winner: null, draw: true };

    p1Data.socket.emit("game-over", resultado);
    this.rooms.delete(room.id);
  }

  private async startMultiplayerGame(room: Room): Promise<void> {
    const p1Data = room.players[0];
    const p2Data = room.players[1];

    const jogador1 = criarJogador(p1Data.nome, p1Data.classe, p1Data.deck);
    const jogador2 = criarJogador(p2Data.nome, p2Data.classe, p2Data.deck);

    const iu1 = new WebInterface(p1Data.socket);
    const iu2 = new WebInterface(p2Data.socket);

    const game = new Game(jogador1, jogador2, iu1, iu2);
    room.game = game;

    p1Data.socket.emit("game-start", {
      opponent: { nome: p2Data.nome, classe: p2Data.classe },
    });
    p2Data.socket.emit("game-start", {
      opponent: { nome: p1Data.nome, classe: p1Data.classe },
    });

    await game.iniciarJogo();

    const resultado = game.Vencedor
      ? { winner: game.Vencedor.nome, draw: false }
      : { winner: null, draw: true };

    p1Data.socket.emit("game-over", resultado);
    p2Data.socket.emit("game-over", resultado);
    this.rooms.delete(room.id);
  }

  private startDraft(socket: Socket, room: Room): void {
    const deck: ICard[] = [];
    let boosterIndex = 0;

    const sendBooster = () => {
      if (boosterIndex >= 10) {
        const player = room.players.find((p) => p.socket.id === socket.id);
        if (player) {
          player.deck = deck;
        }
        socket.emit("draft-complete", {
          deck: deck.map(serializarCarta),
        });
        return;
      }

      const booster = gerarBooster();
      let picksLeft = 4;

      const sendBoosterState = () => {
        socket.emit("draft-booster", {
          boosterIndex: boosterIndex + 1,
          totalBoosters: 10,
          picksLeft,
          cards: booster.map(serializarCarta),
        });
      };

      sendBoosterState();

      const onPick = (data: { cardIndex: number }) => {
        try {
          const chosen = escolherCartasBooster(booster, 1, () => data.cardIndex);
          deck.push(...chosen);
          picksLeft--;
          if (picksLeft <= 0) {
            socket.removeListener("draft-pick", onPick);
            boosterIndex++;
            sendBooster();
          } else {
            sendBoosterState();
          }
        } catch {
          socket.emit("error-msg", { message: "Indice invalido" });
          sendBoosterState();
        }
      };

      socket.on("draft-pick", onPick);
    };

    sendBooster();
  }
}
