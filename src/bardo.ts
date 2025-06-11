import { Player } from "./player";
import { enumClasse } from "./classe.enum";
import { ICard } from "./cards/ICard";

export class Bardo extends Player {
  constructor(nome: string, deck?: ICard[]) {
    super(nome, deck);
    this.classe = enumClasse.bardo;
  }

  override inicioTurno() {
    this.mana += 1;
  }
}
