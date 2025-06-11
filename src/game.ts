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
    const iuAtual = this.interfaceDoJogador(jogadorAtacante);
    const vidaInicial = jogadorAtacante.vida;
    const danoVeneno = jogadorAtacante.processarVenenos();
    iuAtual.exibirTurno(jogadorAtacante);
    if (iuAtual.exibirInicioTurno) {
      iuAtual.exibirInicioTurno(jogadorAtacante, vidaInicial, danoVeneno);
    }
    jogadorAtacante.incrementarManaSlot();
    jogadorAtacante.reiniciarMana();
    jogadorAtacante.aplicarManaExtra();
    if (jogadorAtacante.classe === enumClasse.bardo) {
      jogadorAtacante.mana += 1;
    }

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
      if (
        iuAtual.exibirBuffNaCarta &&
        jogadorAtacante.obterBuff() > 1 &&
        carta.obterTipo() !== enumTipo.buff
      ) {
        const percentual = (jogadorAtacante.obterBuff() - 1) * 100;
        iuAtual.exibirBuffNaCarta(Math.round(percentual));
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
          const vidaAntes = jogadorAtacante.vida;
          jogadorAtacante.curar(carta);
          if (iuAtual.exibirCura) {
            iuAtual.exibirCura(
              jogadorAtacante.vida - vidaAntes,
              jogadorAtacante.vida
            );
          }
          break;
        case enumTipo.buff:
          const incremento = carta.obterValor();
          jogadorAtacante.buffar(carta);
          if (iuAtual.exibirBuffAplicado) {
            iuAtual.exibirBuffAplicado(Math.round((incremento - 1) * 100));
          }
          break;
        case enumTipo.escudo:
          const buffAtual = jogadorAtacante.obterBuff();
          jogadorAtacante.proteger(carta);
          if (iuAtual.exibirEscudo) {
            iuAtual.exibirEscudo(Math.round(carta.obterValor() * buffAtual));
          }
          break;
        case enumTipo.mana:
          const buffMana = jogadorAtacante.obterBuff();
          jogadorAtacante.carregarMana(carta);
          if (iuAtual.exibirManaExtra) {
            iuAtual.exibirManaExtra(Math.round(carta.obterValor() * buffMana));
          }
          break;
        case enumTipo.veneno: {
          const buffVeneno = jogadorAtacante.obterBuff();
          const duracao = jogadorAtacante.envenenar(carta);
          jogadorDefensor.aplicarVeneno(duracao);
          if (iuAtual.exibirVeneno) {
            iuAtual.exibirVeneno(Math.floor(carta.obterValor() * buffVeneno));
          }
          break;
        }
      }

      
    }
  }
}

