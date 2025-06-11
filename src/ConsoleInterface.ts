import { IInterfaceUsuario } from "./IInterfaceUsuario";
import { ICard } from "./cards/ICard";
import { Player } from "./player";
import promptSync from "prompt-sync";

const prompt = promptSync();

export class ConsoleInterface implements IInterfaceUsuario {
  exibirTurno(jogador: Player): void {
    console.log(`----- Turno de ${jogador.nome} -----`);
  }
  exibirCartaEscolhida(carta: ICard): void {
    console.log(
      `Carta escolhida: Valor ${carta.obterValor()} (custo ${carta.obterCusto()})`
    );
  }
  exibirDano(alvo: Player, dano: number): void {
    console.log(
      `${alvo.nome} sofreu ${dano} de dano e possui ${alvo.vida} de vida`
    );
  }
  selecionarCarta(mao: ICard[], mana: number): ICard | undefined {
    const opcoes = mao
      .map((c, i) => `${i}:${c.obterValor()}(c${c.obterCusto()})`)
      .join(", ");
    const resposta = prompt(
      `Com qual carta voce quer jogar [${opcoes}] --- Mana ${mana}: `
    );
    const indice = parseInt(resposta, 10);
    if (isNaN(indice) || indice < 0 || indice >= mao.length) {
      return undefined;
    }
    const carta = mao[indice];
    if (carta.obterCusto() > mana) {
      console.log("Mana insuficiente!");
      return undefined;
    }
    return carta;
  }
}
