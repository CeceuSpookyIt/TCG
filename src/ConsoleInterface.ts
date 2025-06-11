import { IInterfaceUsuario } from "./IInterfaceUsuario";
import { ICard } from "./cards/ICard";
import { Player } from "./player";
import { obterNomeTipo } from "./tipo.enum";
import promptSync from "prompt-sync";

const prompt = promptSync();

export class ConsoleInterface implements IInterfaceUsuario {
  exibirTurno(jogador: Player): void {
    console.log(`----- Turno de ${jogador.nome} -----`);
  }
  exibirCartaEscolhida(carta: ICard): void {
    console.log(
      `Carta escolhida: ${obterNomeTipo(carta.obterTipo())} ${carta.obterValor()} (custo ${carta.obterCusto()})`
    );
  }
  exibirDano(alvo: Player, dano: number): void {
    console.log(
      `${alvo.nome} sofreu ${dano} de dano e possui ${alvo.vida} de vida`
    );
  }

  exibirInicioTurno(
    jogador: Player,
    vidaInicial: number,
    danoVeneno: number
  ): void {
    const escudos = jogador.escudos.join(", ") || "0";
    console.log(`Vida: ${vidaInicial} - Escudos: ${escudos}`);
    if (danoVeneno > 0) {
      console.log(`Sofreu ${danoVeneno} de dano de veneno`);
      console.log(`Vida atual: ${jogador.vida}`);
    }
  }

  exibirCura(cura: number, vidaTotal: number): void {
    console.log(`Cura de ${cura}. Vida atual: ${vidaTotal}`);
  }

  exibirBuffAplicado(percentual: number): void {
    console.log(`Buff de ${percentual}% aplicado`);
  }

  exibirBuffNaCarta(percentual: number): void {
    console.log(`Esta acao recebera bonus de ${percentual}%`);
  }

  exibirEscudo(valor: number): void {
    console.log(`Escudo ativado com valor ${valor}`);
  }

  exibirManaExtra(valor: number): void {
    console.log(`Mana extra de ${valor} para o proximo turno`);
  }

  exibirVeneno(duracao: number): void {
    console.log(`Veneno aplicado por ${duracao} turno(s)`);
  }
  selecionarCarta(mao: ICard[], mana: number): ICard | undefined {
    const ordenadas = [...mao].sort((a, b) => a.obterValor() - b.obterValor());
    console.log("Qual carta voce quer jogar?");
    ordenadas.forEach((c, i) => {
      console.log(
        `${i + 1} - ${obterNomeTipo(c.obterTipo())} ${c.obterValor()}(c${c.obterCusto()})`
      );
    });
    const resposta = prompt(`Opcao (0 para passar) --- Mana ${mana}: `);
    const indice = parseInt(resposta, 10);
    if (isNaN(indice) || indice <= 0 || indice > ordenadas.length) {
      return undefined;
    }
    const carta = ordenadas[indice - 1];
    if (carta.obterCusto() > mana) {
      console.log("Mana insuficiente!");
      return undefined;
    }
    return carta;
  }
}
