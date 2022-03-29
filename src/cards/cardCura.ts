import { ICard } from "./ICard";
import { enumTipo } from "../tipo.enum";
export class CardCura implements ICard {
  private custo: number;
  private cura: number;

  constructor(valor: number) {
    this.custo = valor;
    this.cura = valor;
  }

  obterCusto(): number {
    return this.custo;
  }
  obterValor(): number {
    return this.cura;
  }
  obterTipo(): enumTipo {
    return enumTipo.cura;
  }
}
