import { ICard } from "./cards/ICard";
import { Player } from "./player";

export interface IInterfaceUsuario {
  selecionarCarta(mao: ICard[], mana: number): ICard | undefined;
  exibirTurno(jogador: Player): void;
  exibirCartaEscolhida?(carta: ICard): void;
  exibirDano?(alvo: Player, dano: number): void;
}
