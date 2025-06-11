import { ConsoleInterface } from "./ConsoleInterface";
import { ICard } from "./cards/ICard";

export class CpuInterface extends ConsoleInterface {
  selecionarCarta(mao: ICard[], mana: number): ICard | undefined {
    const jogaveis = mao.filter((c) => c.obterCusto() <= mana);
    if (jogaveis.length === 0) {
      return undefined;
    }
    const indice = Math.floor(Math.random() * jogaveis.length);
    return jogaveis[indice];
  }
}
