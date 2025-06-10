import { CardVeneno } from "./cardVeneno";
import { enumTipo } from "../tipo.enum";
import { CardAtaque } from "./cardAtaque";

describe("CardVeneno", () => {
  let _sut: CardVeneno;

  beforeEach(() => {
    _sut = new CardVeneno(3);
  });

  it("Deve retornar o custo da carta quando a funcao obterCusto for chamada", () => {
    expect(_sut.obterCusto()).toBe(3);
  });

  it("Deve retornar o valor da carta quando a funcao obterValor for chamada", () => {
    expect(_sut.obterValor()).toBe(3);
  });

  it("Deve retornar o tipo veneno quando a funcao obterTipo for chamada", () => {
    expect(_sut.obterTipo()).toBe(enumTipo.veneno);
  });

  it("Deve retornar falso quando as cartas forem diferentes", () => {
    const outro = new CardVeneno(2);
    expect(_sut.toEquals(outro)).toBeFalsy();
  });

  it("Deve retornar verdadeiro quando as cartas forem iguais", () => {
    const igual = new CardVeneno(3);
    expect(_sut.toEquals(igual)).toBeTruthy();
  });

  it("Deve retornar falso quando o tipo for diferente", () => {
    const diferenteTipo = new CardAtaque(3);
    expect(_sut.toEquals(diferenteTipo)).toBeFalsy();
  });
});
