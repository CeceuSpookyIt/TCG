import { CardAtaque } from "./cards/cardAtaque";
import { CardCura } from "./cards/cardCura";
import { CardBuff } from "./cards/cardBuff";
import { CardEscudo } from "./cards/cardEscudo";
import { CardMana } from "./cards/cardMana";
import { CardVeneno } from "./cards/cardVeneno";
import { ICard } from "./cards/ICard";
import { obterNomeTipo } from "./tipo.enum";

export function gerarCartaAleatoria(): ICard {
  const valor = Math.floor(Math.random() * 8) + 1;
  const tipo = Math.floor(Math.random() * 6);
  switch (tipo) {
    case 0:
      return new CardAtaque(valor);
    case 1:
      return new CardCura(valor);
    case 2:
      return new CardBuff(valor);
    case 3:
      return new CardEscudo(valor);
    case 4:
      return new CardMana(valor);
    default:
      return new CardVeneno(valor);
  }
}

export function gerarBooster(): ICard[] {
  const cartas: ICard[] = [];
  for (let i = 0; i < 8; i++) {
    cartas.push(gerarCartaAleatoria());
  }
  return cartas;
}

export function escolherCartasBooster(
  booster: ICard[],
  qtd: number,
  selecionador: (opcoes: ICard[]) => number
): ICard[] {
  const escolhidas: ICard[] = [];
  const opcoes = [...booster];
  for (let i = 0; i < qtd; i++) {
    const indice = selecionador(opcoes);
    if (indice < 0 || indice >= opcoes.length) {
      throw new Error("Indice invalido");
    }
    escolhidas.push(opcoes.splice(indice, 1)[0]);
  }
  return escolhidas;
}

export function exibirBooster(booster: ICard[]): void {
  booster.forEach((c, i) => {
    console.log(
      `${i + 1} - ${obterNomeTipo(c.obterTipo())} ${c.obterValor()} (custo ${c.obterCusto()})`
    );
  });
}

