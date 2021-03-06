import { enumTipo } from "../tipo.enum";
import { AbstractCard } from "./abstractCard";

export class CardAtaque extends AbstractCard {
  private custo: number;
  private valor: number;

  constructor(valor: number) {
    super();
    this.custo = valor;
    this.valor = valor;
  }
  
  obterCusto() {
    return this.custo;
  }
  obterValor() {
    return this.valor;
  }
  obterTipo(): enumTipo {
      return enumTipo.ataque;
  }
}
