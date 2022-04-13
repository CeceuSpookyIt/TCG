import { enumTipo } from "../tipo.enum";
import { AbstractCard } from "./abstractCard";

export class CardBuff extends AbstractCard {
  private custo: number;

  constructor(valor: number) {
    super();
    this.custo = valor;
    
  }

  obterCusto(): number {
    return this.custo;
  }

  obterValor(): number {
    return 1 + 0.2 * this.custo;
  }

  obterTipo(): enumTipo {
    return enumTipo.buff;
  }
}
