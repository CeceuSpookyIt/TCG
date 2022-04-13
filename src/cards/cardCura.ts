import { enumTipo } from "../tipo.enum";
import { AbstractCard } from "./abstractCard";
export class CardCura extends AbstractCard {
  private custo: number;
  private cura: number;

  constructor(valor: number) {
    super();
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
