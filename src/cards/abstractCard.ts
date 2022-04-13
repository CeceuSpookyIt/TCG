import { enumTipo } from "../tipo.enum";
import { ICard } from "./ICard";

export abstract class AbstractCard implements ICard {
  abstract obterCusto(): number;
  abstract obterValor(): number;
  abstract obterTipo(): enumTipo;

  toEquals(abstractCard: AbstractCard): boolean {
    return (
      this.obterCusto() === abstractCard.obterCusto() &&
      this.obterValor() === abstractCard.obterValor() &&
      this.obterTipo() === abstractCard.obterTipo()
    );
  }
}
