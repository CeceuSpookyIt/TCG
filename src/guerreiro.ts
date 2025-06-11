import { Player } from "./player";
import { enumClasse } from "./classe.enum";
import { ICard } from "./cards/ICard";
import { enumTipo } from "./tipo.enum";

export class Guerreiro extends Player {
  constructor(nome: string) {
    super(nome);
    this.classe = enumClasse.guerreiro;
  }

  override proteger(carta: ICard) {
    this.validarUtilizacao(carta, enumTipo.escudo);
    const cartaUsada = this.consumirCarta(carta);
    this.escudos.push(cartaUsada.obterValor() * this.buff * 1.5);
    this.buff = 1;
  }
}
