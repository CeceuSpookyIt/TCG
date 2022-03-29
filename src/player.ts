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
  }

  atacar(carta: ICard) {
    if (
      !this.mao.some(
        (x) =>
          x.obterCusto() === carta.obterCusto() &&
          x.obterTipo() === carta.obterTipo()
      )
    ) {
      throw new Error("Você escolheu uma carta não disponível para o ataque!");
    }
    if (carta.obterCusto() > this.mana) {
      throw new Error("Você não tem mana para jogar esta carta!");
    }
    if (carta.obterTipo() !== enumTipo.ataque) {
      throw new Error("A carta deve ser do tipo ataque");
    }
    this.mao.splice(this.mao.indexOf(carta), 1);
    this.mana -= carta.obterCusto();

    return carta;
  }

  curar(carta: ICard) {
    if (carta.obterTipo() !== enumTipo.cura) {
      throw new Error("A carta deve ser do tipo cura");
    }
    if (carta.obterCusto() > this.mana) {
      throw new Error("Você não tem mana para jogar esta carta!");
    }
    if (
      !this.mao.some(
        (x) =>
          x.obterCusto() === carta.obterCusto() &&
          x.obterTipo() === carta.obterTipo()
      )
    ) {
      throw new Error("Você não tem esta carta para jogar!");
    }
    this.mao.splice(this.mao.indexOf(carta), 1);
    this.mana -= carta.obterCusto();
    this.vida += carta.obterValor();
  }

  comprarCarta() {
    if (this.deck.length === 0) {
      this.vida--;
    } else {
      const [primeiraCarta, ...rest] = this.deck;
      if (this.mao.length === 5) {
        this.vida -= primeiraCarta.obterValor();
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

  temAtaqueDisponivel(): boolean {
    return (
      this.mao.length > 0 &&
      this.mao.some((carta) => carta.obterCusto() <= this.mana)
    );
  }

  defenderAtaque(dano: number) {
    this.vida -= dano;
  }

  estaVivo(): boolean {
    return this.vida > 0;
  }
}
