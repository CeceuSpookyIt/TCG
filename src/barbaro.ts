import { Player } from "./player";
import { enumClasse } from "./classe.enum";
import { ICard } from "./cards/ICard";

export class Barbaro extends Player {
  constructor(nome: string) {
    super(nome);
    this.classe = enumClasse.barbaro;
  }

  override atacar(carta: ICard) {
    const dano = super.atacar(carta);
    return Math.round(dano * 1.5);
  }
}
