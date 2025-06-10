import { enumTipo } from "../tipo.enum";
import { AbstractCard } from "./abstractCard";

export class CardEscudo extends AbstractCard {
  private custo: number;
  private valor: number;

  constructor(valor: number) {
    super();
    this.custo = valor;
    this.valor = valor;
  }

  obterCusto(): number {
    return this.custo;
  }

  obterValor(): number {
    return this.valor;
  }

  obterTipo(): enumTipo {
    return enumTipo.escudo;
  }
}
