import { IInterfaceUsuario } from "./IInterfaceUsuario";
import { Player } from "./player";
import { ICard } from "./cards/ICard";
import { enumTipo } from "./tipo.enum";
import { enumClasse } from "./classe.enum";
export class Game {
  jogador1: Player;
  jogador2: Player;
  Vencedor: Player | undefined;
  iuJogador1: IInterfaceUsuario;
  iuJogador2: IInterfaceUsuario;
  constructor(
    jogador1: Player,
    jogador2: Player,
    iuJogador1: IInterfaceUsuario,
    iuJogador2: IInterfaceUsuario
  ) {
    this.jogador1 = jogador1;
    this.jogador2 = jogador2;
    this.iuJogador1 = iuJogador1;
    this.iuJogador2 = iuJogador2;
  }

  private interfaceDoJogador(jogador: Player): IInterfaceUsuario {
    return jogador === this.jogador1 ? this.iuJogador1 : this.iuJogador2;
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

    while (!this.Vencedor) {
      this.rodarTurno(jogadorAtacante, jogadorDefensor);
      if (!this.Vencedor) {
        [jogadorAtacante, jogadorDefensor] = [
          jogadorDefensor,
          jogadorAtacante,
        ];
      }
    }
  }

  rodarTurno(jogadorAtacante: Player, jogadorDefensor: Player) {
    jogadorAtacante.processarVenenos();
    jogadorAtacante.incrementarManaSlot();
    jogadorAtacante.reiniciarMana();
    jogadorAtacante.aplicarManaExtra();
    if (jogadorAtacante.classe === enumClasse.bardo) {
      jogadorAtacante.mana += 1;
    }

    const iuAtual = this.interfaceDoJogador(jogadorAtacante);
    iuAtual.exibirTurno(jogadorAtacante);

    jogadorAtacante.comprarCarta();

    if (!jogadorAtacante.estaVivo()) {
      this.Vencedor = jogadorDefensor;
      return;
    }

    while (jogadorAtacante.temCartaDisponivel()) {
      const carta: ICard | undefined = iuAtual.selecionarCarta(
        jogadorAtacante.mao,
        jogadorAtacante.mana
      );
      if (!carta) {
        break;
      }
      if (iuAtual.exibirCartaEscolhida) {
        iuAtual.exibirCartaEscolhida(carta);
      }

      switch (carta.obterTipo()) {
        case enumTipo.ataque: {
          const dano = jogadorAtacante.atacar(carta);
          jogadorDefensor.defenderAtaque(dano);
          if (iuAtual.exibirDano) {
            iuAtual.exibirDano(jogadorDefensor, dano);
          }
          if (!jogadorDefensor.estaVivo()) {
            this.Vencedor = jogadorAtacante;
          }
          break;
        }
        case enumTipo.cura:
          jogadorAtacante.curar(carta);
          break;
        case enumTipo.buff:
          jogadorAtacante.buffar(carta);
          break;
        case enumTipo.escudo:
          jogadorAtacante.proteger(carta);
          break;
        case enumTipo.mana:
          jogadorAtacante.carregarMana(carta);
          break;
        case enumTipo.veneno: {
          const duracao = jogadorAtacante.envenenar(carta);
          jogadorDefensor.aplicarVeneno(duracao);
          break;
        }
      }

      
    }
  }
}

