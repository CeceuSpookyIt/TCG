import { CardAtaque } from "./cards/cardAtaque";
import { ICard } from "./cards/ICard";
import { enumTipo } from "./tipo.enum";
export class Player {
  nome: string;
  vida: number;
  mana: number;
  manaSlot: number;
  deck: ICard[];
  mao: ICard[];
  buff: number;
  escudos: number[];

  constructor(nome: string) {
    this.nome = nome;
    this.vida = 30;
    this.mana = 0;
    this.manaSlot = 0;
    this.deck = [
      new CardAtaque(0),
      new CardAtaque(0),
      new CardAtaque(1),
      new CardAtaque(1),
      new CardAtaque(2),
      new CardAtaque(2),
      new CardAtaque(2),
      new CardAtaque(3),
      new CardAtaque(3),
      new CardAtaque(3),
      new CardAtaque(3),
      new CardAtaque(4),
      new CardAtaque(4),
      new CardAtaque(4),
      new CardAtaque(5),
      new CardAtaque(5),
      new CardAtaque(6),
      new CardAtaque(6),
      new CardAtaque(7),
      new CardAtaque(8),
    ];
    this.mao = [];
    this.buff = 0;
    this.escudos = [];
  }
  private validarUtilizacao(carta: ICard, tipo: enumTipo) {
    if (!this.mao.some((x) => x.toEquals(carta))) {
      throw new Error("Você não possui essa carta!");
    }
    if (carta.obterCusto() > this.mana) {
      throw new Error("Você não tem mana para jogar esta carta!");
    }
    if (carta.obterTipo() !== tipo) {
      throw new Error("A carta selecionada não é do tipo correto!");
    }
  }
  atacar(carta: ICard) {
    this.validarUtilizacao(carta, enumTipo.ataque);
    this.mana -= carta.obterCusto();
    const dano =
      this.mao
        .splice(
          this.mao.findIndex((cardMao) => cardMao.toEquals(carta)),
          1
        )[0]
        .obterValor() * (this.obterBuff() ? this.obterBuff() : 1);

    this.buff = 0;
    return Math.round(dano);
  }

  curar(carta: ICard) {
    this.validarUtilizacao(carta, enumTipo.cura);
    this.mana -= carta.obterCusto();
    const cura = this.mao
      .splice(
        this.mao.findIndex((cartaMao) => cartaMao.toEquals(carta)),
        1
      )[0]
      .obterValor();

    this.vida += Math.round(cura * (this.obterBuff() ? this.obterBuff() : 1));
    this.buff = 0;
  }
  buffar(carta: ICard) {
    this.validarUtilizacao(carta, enumTipo.buff);
    this.buff += carta.obterValor();
    this.mana -= carta.obterCusto();
    this.mao.splice(
      this.mao.findIndex((cartaMao) => cartaMao.toEquals(carta)),
      1
    );
  }

  proteger(carta: ICard) {
    this.validarUtilizacao(carta, enumTipo.escudo);
    this.escudos.push(carta.obterValor());
    this.mana -= carta.obterCusto();
    this.mao.splice(
      this.mao.findIndex((cartaMao) => cartaMao.toEquals(carta)),
      1
    );
  }

  obterBuff() {
    return this.buff;
  }

  comprarCarta() {
    if (this.deck.length === 0) {
      this.vida--;
    } else {
      const [primeiraCarta, ...rest] = this.deck;
      if (this.mao.length === 5) {
        this.vida -= primeiraCarta.obterCusto();
      } else {
        this.mao.push(primeiraCarta);
      }
      this.deck = rest;
    }
  }

  embaralharCartas() {
    for (let index = 0; index < 100; index++) {
      this.deck.sort(() => (Math.random() > 0.5 ? 1 : -1));
    }
  }

  incrementarManaSlot() {
    if (this.manaSlot < 10) {
      this.manaSlot++;
    }
  }

  reiniciarMana() {
    this.mana = this.manaSlot;
  }

  temCartaDisponivel(): boolean {
    return (
      this.mao.length > 0 &&
      this.mao.some((carta) => carta.obterCusto() <= this.mana)
    );
  }

  defenderAtaque(dano: number) {
    if (this.escudos.length > 0) {
      const valorEscudo = this.escudos.shift()!;
      const danoReduzido = dano - valorEscudo;
      if (danoReduzido > 0) {
        this.vida -= danoReduzido;
      }
      return;
    }
    this.vida -= dano;
  }

  estaVivo(): boolean {
    return this.vida > 0;
  }
}
