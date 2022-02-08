export class Player {
  nome: string;
  vida: number;
  mana: number;
  manaSlot: number;
  deck: number[];
  mao: number[];

  constructor(nome: string) {
    this.nome = nome;
    this.vida = 30;
    this.mana = 0;
    this.manaSlot = 0;
    this.deck = [0, 0, 1, 1, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 5, 5, 6, 6, 7, 8];
    this.mao = [];
  }

  atacar(carta: number) {
    if (!this.mao.some((x) => x === carta)) {
      throw new Error("Você escolheu uma carta não disponível para o ataque!");
    }
    if (carta > this.mana) {
      throw new Error("Você não tem mana para jogar esta carta!");
    }
    this.mao.splice(this.mao.indexOf(carta), 1);
    this.mana -= carta;

    return carta;
  }

  comprarCarta() {
    const [primeiraCarta, ...rest] = this.deck;
    this.mao.push(primeiraCarta);
    this.deck = rest;
  }

  embaralharCartas() {
    for (let index = 0; index < 100; index++) {
      this.deck.sort(() => (Math.random() > 0.5 ? 1 : -1));
    }
  }
}
