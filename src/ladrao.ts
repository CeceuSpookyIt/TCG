import { Player } from "./player";
import { enumClasse } from "./classe.enum";
import { ICard } from "./cards/ICard";

export class Ladrao extends Player {
  constructor(nome: string) {
    super(nome);
    this.classe = enumClasse.ladrao;
  }

  override envenenar(carta: ICard) {
    const duracao = super.envenenar(carta);
    return duracao + 2;
  }
}
