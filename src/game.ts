import { IInterfaceUsuario } from "./IInterfaceUsuario";
import { Player } from "./player";
export class Game {
  jogador1: Player;
  jogador2: Player;
  Vencedor: Player | undefined;
  iu: IInterfaceUsuario;
  constructor(jogador1: Player, jogador2: Player, iu: IInterfaceUsuario) {
    this.jogador1 = jogador1;
    this.jogador2 = jogador2;
    this.iu = iu;

    jogador1.embaralharCartas();
    jogador2.embaralharCartas();

    for (let compra = 0; compra < 3; compra++) {
      jogador1.comprarCarta();
      jogador2.comprarCarta();
    }
  }

  rodarTurno(jogadorAtacante: Player, jogadorDefensor: Player) {
    if (jogadorAtacante.manaSlot < 10) {
      jogadorAtacante.manaSlot++;
    }
    jogadorAtacante.mana = jogadorAtacante.manaSlot;
    jogadorAtacante.comprarCarta();
    while (
      jogadorAtacante.mao.length > 0 &&
      jogadorAtacante.mao.some((carta) => carta <= jogadorAtacante.mana)
    ) {
      let ataque: number = this.iu.selecionarCarta();
      if (ataque === -1) {
        break;
      }
      const dano = jogadorAtacante.atacar(ataque);
      jogadorDefensor.vida -= dano;
      if (jogadorDefensor.vida <= 0) {
        this.Vencedor = jogadorAtacante;
      }
    }
  }

  iniciarJogo() {
    let jogadorAtacante: Player;
    let jogadorDefensor: Player;
    if (Math.random() < 0.5) {
      jogadorAtacante = this.jogador1;
      jogadorDefensor = this.jogador2;
    } else {
      jogadorAtacante = this.jogador2;
      jogadorDefensor = this.jogador1;
    }
    this.rodarTurno(jogadorAtacante, jogadorDefensor);
    [jogadorAtacante, jogadorDefensor] = [jogadorDefensor, jogadorAtacante];
    this.rodarTurno(jogadorAtacante, jogadorDefensor);
  }
}
