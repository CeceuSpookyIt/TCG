import { IInterfaceUsuario } from "./IInterfaceUsuario";
import { ICard } from "./cards/ICard";
import { Player } from "./player";
import { obterNomeTipo } from "./tipo.enum";
import { Socket } from "socket.io";

function serializarCarta(carta: ICard) {
  return {
    tipo: carta.obterTipo(),
    tipoNome: obterNomeTipo(carta.obterTipo()),
    custo: carta.obterCusto(),
    valor: carta.obterValor(),
  };
}

function serializarJogador(jogador: Player) {
  return {
    nome: jogador.nome,
    vida: jogador.vida,
    mana: jogador.mana,
    manaSlot: jogador.manaSlot,
    escudos: jogador.escudos.slice(),
    venenos: jogador.venenos.slice(),
    maoSize: jogador.mao.length,
    deckSize: jogador.deck.length,
    buff: jogador.buff,
  };
}

export class WebInterface implements IInterfaceUsuario {
  private socket: Socket;

  constructor(socket: Socket) {
    this.socket = socket;
  }

  exibirTurno(jogador: Player): void {
    this.socket.emit("turn-start", { jogador: jogador.nome });
  }

  exibirCartaEscolhida(carta: ICard): void {
    this.socket.emit("card-played", { carta: serializarCarta(carta) });
  }

  exibirDano(alvo: Player, dano: number): void {
    this.socket.emit("damage-dealt", {
      alvo: alvo.nome,
      dano,
      vidaRestante: alvo.vida,
    });
  }

  exibirInicioTurno(
    jogador: Player,
    vidaInicial: number,
    danoVeneno: number
  ): void {
    this.socket.emit("turn-info", {
      jogador: jogador.nome,
      vidaInicial,
      danoVeneno,
      vidaAtual: jogador.vida,
      escudos: jogador.escudos.slice(),
    });
  }

  exibirCura(cura: number, vidaTotal: number): void {
    this.socket.emit("heal", { cura, vidaTotal });
  }

  exibirBuffAplicado(percentual: number): void {
    this.socket.emit("buff-applied", { percentual });
  }

  exibirBuffNaCarta(percentual: number): void {
    this.socket.emit("buff-on-card", { percentual });
  }

  exibirEscudo(valor: number): void {
    this.socket.emit("shield", { valor });
  }

  exibirManaExtra(valor: number): void {
    this.socket.emit("extra-mana", { valor });
  }

  exibirVeneno(duracao: number): void {
    this.socket.emit("poison", { duracao });
  }

  exibirTela(jogador: Player, oponente: Player): void {
    this.socket.emit("board-update", {
      jogador: serializarJogador(jogador),
      oponente: serializarJogador(oponente),
      mao: jogador.mao
        .slice()
        .sort((a, b) => a.obterValor() - b.obterValor())
        .map(serializarCarta),
    });
  }

  selecionarCarta(mao: ICard[], mana: number): Promise<ICard | undefined> {
    const ordenadas = [...mao].sort((a, b) => a.obterValor() - b.obterValor());
    const cartasSerializadas = ordenadas.map(serializarCarta);

    this.socket.emit("request-card", { mao: cartasSerializadas, mana });

    return new Promise((resolve) => {
      this.socket.once("select-card", (data: { cardIndex: number }) => {
        const indice = data.cardIndex;
        if (indice < 0 || indice >= ordenadas.length) {
          resolve(undefined);
          return;
        }
        const carta = ordenadas[indice];
        if (carta.obterCusto() > mana) {
          resolve(undefined);
          return;
        }
        resolve(carta);
      });

      this.socket.once("pass-turn", () => {
        resolve(undefined);
      });
    });
  }
}
