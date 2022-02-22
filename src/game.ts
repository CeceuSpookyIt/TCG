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
  }

  rodarTurno(jogadorAtacante: Player, jogadorDefensor: Player) {
    jogadorAtacante.incrementarManaSlot();
    jogadorAtacante.reiniciarMana();
    jogadorAtacante.comprarCarta();

    if (!jogadorAtacante.estaVivo()) {
      this.Vencedor = jogadorDefensor;
      return;
    }

    while (jogadorAtacante.temAtaqueDisponivel()) {
      let ataque: number = this.iu.selecionarCarta();
      if (ataque === -1) {
        break;
      }
      const dano = jogadorAtacante.atacar(ataque);
      jogadorDefensor.defenderAtaque(dano);
      if (!jogadorDefensor.estaVivo()) {
        this.Vencedor = jogadorAtacante;
      }
    }
  }

  iniciarJogo() {
    let jogadorAtacante: Player;
    let jogadorDefensor: Player;

    [jogadorAtacante, jogadorDefensor] =
      Math.random() < 0.5
        ? [this.jogador1, this.jogador2]
        : [this.jogador2, this.jogador1];

    this.jogador1.embaralharCartas();
    this.jogador2.embaralharCartas();

    for (let compra = 0; compra < 3; compra++) {
      this.jogador1.comprarCarta();
      this.jogador2.comprarCarta();
    }

    this.rodarTurno(jogadorAtacante, jogadorDefensor);
    [jogadorAtacante, jogadorDefensor] = [jogadorDefensor, jogadorAtacante];
    this.rodarTurno(jogadorAtacante, jogadorDefensor);
  }
}
