import { enumTipo } from "../tipo.enum";
import { CardMana } from "./cardMana";

describe("CardMana", () => {
  let _sut: CardMana;

  beforeEach(() => {
    _sut = new CardMana(3);
  });

  it("Deve retornar o custo da carta quando a funcao obterCusto for chamada", () => {
    expect(_sut.obterCusto()).toBe(3);
  });

  it("Deve retornar o valor da carta quando a funcao obterValor for chamada", () => {
    expect(_sut.obterValor()).toBe(3);
  });

  it("Deve retornar o tipo mana quando a funcao obterTipo for chamada", () => {
    expect(_sut.obterTipo()).toBe(enumTipo.mana);
  });
});
