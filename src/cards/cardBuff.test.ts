import { enumTipo } from "../tipo.enum";
import { CardBuff } from "./cardBuff";

describe("CardBuff", () => {
  let _sut: CardBuff;

  beforeEach(() => {
    _sut = new CardBuff(5);
  });

  it("Deve retornar o custo da carta quando a funcao obterCusto for chamada", () => {
    expect(_sut.obterCusto()).toBe(5);
  });

  it("Deve retornar o valor do modificador quando a funcao obterValor for chamada", () => {
    expect(_sut.obterValor()).toBe(1.5);
    _sut = new CardBuff(3)
    expect(_sut.obterValor()).toBe(1.3);
  });

  it("Deve retornar o tipo ataque quando a funcao obterTipo for chamada", () => {
    expect(_sut.obterTipo()).toBe(enumTipo.buff);
  });

});
