import { enumTipo } from "../tipo.enum";

export interface ICard {
  obterCusto(): number;
  obterValor(): number;
  obterTipo(): enumTipo;
  toEquals(card: ICard): boolean; 
}