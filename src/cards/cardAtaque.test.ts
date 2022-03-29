import { CardAtaque } from "./cardAtaque";
import { enumTipo } from "../tipo.enum";

describe("player", () => {
  let _sut: CardAtaque;

  beforeEach(() => {
    _sut = new CardAtaque(1);
  });

  it("Deve retornar o custo da carta quando a funcao obtereCusto for chamada", () => {
    expect(_sut.obterCusto()).toBe(1);
  });

  it("Deve retornar o dano da carta quando a funcao obterDano for chamada", () => {
    expect(_sut.obterValor()).toBe(1);
  });

  it("Deve retornar o tipo ataque quando a funcao obterTipo for chamada", () => {
    expect(_sut.obterTipo()).toBe(enumTipo.ataque);
  });
});
