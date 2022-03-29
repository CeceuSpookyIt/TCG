import { ICard } from "./ICard";
import { enumTipo } from "../tipo.enum";

export class CardAtaque implements ICard{
  private custo: number;
  private valor: number;

  constructor(valor: number) {
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
