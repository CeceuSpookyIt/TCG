import { ICard } from "./cards/ICard";
import { Player } from "./player";

export interface IInterfaceUsuario {
  selecionarCarta(mao: ICard[], mana: number): ICard | undefined;
  exibirTurno(jogador: Player): void;
  exibirCartaEscolhida?(carta: ICard): void;
  exibirDano?(alvo: Player, dano: number): void;
  exibirInicioTurno?(
    jogador: Player,
    vidaInicial: number,
    danoVeneno: number
  ): void;
  exibirCura?(cura: number, vidaTotal: number): void;
  exibirBuffAplicado?(percentual: number): void;
  exibirBuffNaCarta?(percentual: number): void;
  exibirEscudo?(valor: number): void;
  exibirManaExtra?(valor: number): void;
  exibirVeneno?(duracao: number): void;
  exibirTela?(jogador: Player, oponente: Player): void;
}
