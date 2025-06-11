import { Player } from "./player";
import { enumClasse } from "./classe.enum";
import { ICard } from "./cards/ICard";

export class Ladrao extends Player {
  constructor(nome: string, deck?: ICard[]) {
    super(nome, deck);
    this.classe = enumClasse.ladrao;
  }

  override envenenar(carta: ICard) {
    const duracao = super.envenenar(carta);
    return duracao + 2;
  }
}
