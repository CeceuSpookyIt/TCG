import { enumTipo } from "./tipo.enum";
import { ICard } from "./cards/ICard";
import { Player } from "./player";

export class Mago extends Player {
  constructor(nome: string, deck?: ICard[]) {
    super(nome, deck);
  }

  override buffar(carta: ICard) {
    this.validarUtilizacao(carta, enumTipo.buff);
    const cartaUsada = this.consumirCarta(carta);
    const incremento = 1 + 0.3 * cartaUsada.obterCusto();
    this.buff = this.buff * incremento;
  }
}
