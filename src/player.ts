import { CardAtaque } from "./cards/cardAtaque";
import { ICard } from "./cards/ICard";
import { enumTipo } from "./tipo.enum";
import { enumClasse } from "./classe.enum";

export class Player {
  nome: string;
  vida: number;
  mana: number;
  manaSlot: number;
  deck: ICard[];
  mao: ICard[];
  buff: number;
  escudos: number[];
  manaExtra: number;
  venenos: number[];
  classe: enumClasse;

  constructor(nome: string) {


    this.nome = nome;
    this.vida = 30;

    this.mana = 1;
    this.manaSlot = 0;

    const valores = [
      1, 1, 2, 2, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 6, 6, 7, 7, 8, 9,
    ];
    this.deck = valores.map((v) => new CardAtaque(v));
    this.mao = [];
    this.buff = 1;
    this.escudos = [];
    this.venenos = [];
    this.manaExtra = 0;
    this.classe = enumClasse.guerreiro;
  }

  protected consumirCarta(carta: ICard): ICard {
    this.mana -= carta.obterCusto();
    const indice = this.mao.findIndex((c) => c.toEquals(carta));
    return this.mao.splice(indice, 1)[0];
  }
  protected validarUtilizacao(carta: ICard, tipo: enumTipo) {
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
    const cartaUsada = this.consumirCarta(carta);
    const dano = cartaUsada.obterValor() * this.buff;

    this.buff = 1;
    return Math.round(dano);
  }



 

 
  carregarMana(carta: ICard) {
    this.validarUtilizacao(carta, enumTipo.mana);
    const cartaUsada = this.consumirCarta(carta);
    this.manaExtra += cartaUsada.obterValor() * this.buff;
    this.buff = 1;
  }

  curar(carta: ICard) {
    this.validarUtilizacao(carta, enumTipo.cura);
    const cartaUsada = this.consumirCarta(carta);
    const cura = cartaUsada.obterValor();
    this.vida += Math.round(cura * this.buff);
    this.buff = 1;
  }
  buffar(carta: ICard) {
    this.validarUtilizacao(carta, enumTipo.buff);
    const cartaUsada = this.consumirCarta(carta);
    this.buff = this.buff * cartaUsada.obterValor();
  }

  proteger(carta: ICard) {
    this.validarUtilizacao(carta, enumTipo.escudo);
    const cartaUsada = this.consumirCarta(carta);
    this.escudos.push(cartaUsada.obterValor() * this.buff);
    this.buff = 1;
  }

  envenenar(carta: ICard) {
    this.validarUtilizacao(carta, enumTipo.veneno);
    const cartaUsada = this.consumirCarta(carta);
    const duracao = Math.floor(cartaUsada.obterValor() * this.buff);
    this.buff = 1;
    return duracao;
  }

  aplicarVeneno(duracao: number) {
    if (duracao > 0) {
      this.venenos.push(duracao);
    }
  }

  processarVenenos() {
    if (this.venenos.length === 0) {
      return;
    }
    const dano = this.venenos.length;
    this.defenderAtaque(dano);
    this.venenos = this.venenos
      .map((v) => v - 1)
      .filter((v) => v > 0);
  }


  obterBuff() {
    return this.buff;
  }

  comprarCarta() {
    const carta = this.deck.shift();
    if (!carta) {
      this.vida--;
      return;
    }
    if (this.mao.length === 5) {
      this.vida -= carta.obterCusto();
    } else {
      this.mao.push(carta);
    }
  }

  embaralharCartas() {
    this.deck.sort(() => Math.random() - 0.5);
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

  aplicarManaExtra() {
    this.mana += Math.round(this.manaExtra);
    this.manaExtra = 0;
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
