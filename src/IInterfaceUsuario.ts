import { ICard } from "./cards/ICard";

export interface IInterfaceUsuario {
  selecionarCarta(mao: ICard[], mana: number): ICard | undefined;
}
