import { Player } from "./player";
import { enumClasse } from "./classe.enum";

export class Bardo extends Player {
  constructor(nome: string) {
    super(nome);
    this.classe = enumClasse.bardo;
  }

  override inicioTurno() {
    this.mana += 1;
  }
}
