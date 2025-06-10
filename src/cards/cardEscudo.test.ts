import { CardEscudo } from "./cardEscudo";
import { enumTipo } from "../tipo.enum";

describe("CardEscudo", () => {
  let _sut: CardEscudo;

  beforeEach(() => {
    _sut = new CardEscudo(2);
  });

  it("Deve retornar o custo da carta quando a funcao obterCusto for chamada", () => {
    expect(_sut.obterCusto()).toBe(2);
  });

  it("Deve retornar o valor da carta quando a funcao obterValor for chamada", () => {
    expect(_sut.obterValor()).toBe(2);
  });

  it("Deve retornar o tipo escudo quando a funcao obterTipo for chamada", () => {
    expect(_sut.obterTipo()).toBe(enumTipo.escudo);
  });
});
