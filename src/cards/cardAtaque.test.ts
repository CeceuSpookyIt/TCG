import { CardAtaque } from "./cardAtaque";
import { enumTipo } from "../tipo.enum";
import { CardCura } from "./cardCura";

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

  it("Deve retornar o verdadeiro quando a carta A for igual a carta B", () => {
    const _sutA = new CardAtaque(2);
    const _sutB = new CardAtaque(2);

    expect(_sutA.toEquals(_sutB)).toBeTruthy();
  });

  it("Deve retornar o falso quando o custo da carta A for diferente da carta B", () => {
    const _sutA = new CardAtaque(2);
    const _sutB = new CardAtaque(3);

    expect(_sutA.toEquals(_sutB)).toBeFalsy();
  });

  it("Deve retornar  falso quando o tipo da carta A for diferente da carta B", () => {
    const _sutA = new CardAtaque(2);
    const _sutB = new CardCura(2);

    expect(_sutA.toEquals(_sutB)).toBeFalsy();
  });
});
