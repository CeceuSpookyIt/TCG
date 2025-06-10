import { CardAtaque } from "./cards/cardAtaque";
import { Player } from "./player";
import { Game } from "./game";
import { IInterfaceUsuario } from "./IInterfaceUsuario";
import { CardCura } from "./cards/cardCura";
import { CardBuff } from "./cards/cardBuff";
import { ICard } from "./cards/ICard";

describe("Game", () => {
  let _sut: Game;
  let j1EC: jest.SpyInstance;
  let j2EC: jest.SpyInstance;
  let j1CC: jest.SpyInstance;
  let j2CC: jest.SpyInstance;
  let j1Atacar: jest.SpyInstance;
  let selecionarCarta: jest.Mock<ICard | undefined>;
  let interfaceUsuario: IInterfaceUsuario;

  beforeEach(() => {
    const p1 = new Player("Player 1");
    const p2 = new Player("Player 2");

    j1EC = jest.spyOn(p1, "embaralharCartas");
    j2EC = jest.spyOn(p2, "embaralharCartas");

    j1CC = jest.spyOn(p1, "comprarCarta");
    j2CC = jest.spyOn(p2, "comprarCarta");

    selecionarCarta = jest.fn().mockReturnValue(new CardAtaque(3));
    interfaceUsuario = {
      selecionarCarta,
    };

    j1Atacar = jest.spyOn(p1, "atacar").mockImplementation((x) => {
      _sut.jogador1.mana -= x.obterCusto();
      _sut.jogador1.mao.splice(_sut.jogador1.mao.findIndex(y => y.toEquals(x)), 1);
      return x.obterValor();
    });

    _sut = new Game(p1, p2, interfaceUsuario);
  });

  afterEach(() => {
    j1EC.mockClear();
    j2EC.mockClear();
    jest.restoreAllMocks();
  });

  it("Deve haver dois jogadores em uma partida", () => {
    expect(_sut.jogador1).not.toBe(undefined);
    expect(_sut.jogador2).not.toBe(undefined);
  });

  it("no inicio do jogo, cada jogador deve comprar 3 cartas", () => {
    j1CC.mockClear();
    jest.spyOn(_sut, "rodarTurno").mockImplementation(() => {});

    _sut.iniciarJogo();

    expect(j1CC).toBeCalledTimes(3);
    expect(j2CC).toBeCalledTimes(3);
  });

  it("Deve embaralhar as cartas quando inicar jogo for chamado", () => {
    j1EC.mockClear();
    j2EC.mockClear();
    jest.spyOn(_sut, "rodarTurno").mockImplementation(() => {});

    _sut.iniciarJogo();

    expect(j1EC).toBeCalledTimes(1);
    expect(j2EC).toBeCalledTimes(1);
  });

  it("Deve disponibilizar toda a mana no inicio do turno", () => {
    selecionarCarta.mockReturnValueOnce(undefined);

    const rmSpy = jest.spyOn(_sut.jogador2, "reiniciarMana");

    _sut.rodarTurno(_sut.jogador2, _sut.jogador1);

    expect(rmSpy).toBeCalledTimes(1);
  });

  it("O jogador 1 deve comprar uma carta", () => {
    j1CC.mockClear();

    _sut.rodarTurno(_sut.jogador1, _sut.jogador2);

    expect(j1CC).toBeCalledTimes(1);
  });

  it("Deve aplicar o dano do jogador 1 no jogador 2", () => {
    _sut.jogador1.manaSlot = 2;
    _sut.jogador1.mao = [new CardAtaque(3)];
    selecionarCarta.mockReturnValueOnce(new CardAtaque(3));
    selecionarCarta.mockReturnValueOnce(undefined);

    const daSpy = jest.spyOn(_sut.jogador2, "defenderAtaque");

    _sut.rodarTurno(_sut.jogador1, _sut.jogador2);

    expect(daSpy).toBeCalledTimes(1);
  });

  it("Deve finalizar o jogo se o jogador2 tiver morrido", () => {
    selecionarCarta.mockReturnValueOnce(new CardAtaque(2));
    const tcdSpy = jest
      .spyOn(_sut.jogador1, "temCartaDisponivel")
      .mockReturnValueOnce(true);
    const daSpy = jest
      .spyOn(_sut.jogador2, "estaVivo")
      .mockReturnValueOnce(false);
    _sut.jogador1.nome = "vencedor";
    _sut.rodarTurno(_sut.jogador1, _sut.jogador2);
    expect(_sut.Vencedor).toBe(_sut.jogador1);
  });

  it("Deve dar a possibilidade passar a vez se o jogador escolher -1 como entrada do ataque", () => {
    _sut.jogador1.manaSlot = 5;
    _sut.jogador1.mao = [new CardAtaque(3), new CardAtaque(3), new CardAtaque(0), new CardAtaque(0)];
    selecionarCarta.mockClear();
    selecionarCarta.mockReturnValueOnce(undefined);
    j1Atacar.mockImplementation((x) => {
      _sut.jogador1.mana -= x;
      _sut.jogador1.mao.splice(_sut.jogador1.mao.findIndex(y => y.toEquals(x)), 1);
      return x;
    });
    _sut.rodarTurno(_sut.jogador1, _sut.jogador2);

    expect(j1Atacar).toBeCalledTimes(0);
  });

  it("Deve chamar incrementar manaslot do jogador", () => {
    selecionarCarta.mockReturnValueOnce(undefined);

    const incrementarMSSpy = jest.spyOn(_sut.jogador2, "incrementarManaSlot");

    _sut.rodarTurno(_sut.jogador2, _sut.jogador1);

    expect(incrementarMSSpy).toBeCalledTimes(1);
  });

  it("Deve adicionar 1 de espaco mana no inicio do turno do jogador", () => {
    jest
      .spyOn(Math, "random")
      .mockReturnValueOnce(0.49999)
      .mockReturnValueOnce(0.50001);

    const rodarTurno = jest
      .spyOn(_sut, "rodarTurno")
      .mockImplementation(() => {});

    _sut.iniciarJogo();
    expect(rodarTurno).toBeCalledWith(_sut.jogador1, _sut.jogador2);
    rodarTurno.mockClear();
    _sut.iniciarJogo();
    expect(rodarTurno).toBeCalledWith(_sut.jogador2, _sut.jogador1);
  });

  it("Deve adicionar 1 de espaco mana no inicio do turno do jogador", () => {
    jest.spyOn(Math, "random").mockReturnValueOnce(0.59999);

    const rodarTurno = jest
      .spyOn(_sut, "rodarTurno")
      .mockImplementation(() => {});

    _sut.iniciarJogo();
    expect(rodarTurno).toBeCalledWith(_sut.jogador1, _sut.jogador2);
    expect(rodarTurno).toBeCalledWith(_sut.jogador2, _sut.jogador1);
  });

  it("Deve verificar se o jogador continua vivo apos comprar carta", () => {
    const rodarTurno = jest
      .spyOn(_sut.jogador1, "estaVivo")
      .mockReturnValueOnce(false);

    _sut.rodarTurno(_sut.jogador1, _sut.jogador2);

    expect(_sut.Vencedor).toBe(_sut.jogador2);
  });

  it("Deve interromper o jogo caso o jogador tenha corrido tentando comprar carta", () => {
    jest.spyOn(_sut.jogador1, "estaVivo").mockReturnValueOnce(false);
    const adspy = jest.spyOn(_sut.jogador1, "temCartaDisponivel");

    _sut.rodarTurno(_sut.jogador1, _sut.jogador2);

    expect(adspy).toBeCalledTimes(0);
  });

  it("Deve chamar a funcao atacar do jogador caso ele tenha escolhido uma carta do tipo ataque", () => {
    selecionarCarta.mockReturnValueOnce(new CardAtaque(2));
    const ataqueSpy = jest.spyOn(_sut.jogador1, "atacar");
    const curarSpy = jest.spyOn(_sut.jogador1, "curar");


    _sut.rodarTurno(_sut.jogador1, _sut.jogador2);

    expect(ataqueSpy).toBeCalledTimes(1);
    expect(curarSpy).toBeCalledTimes(0);
  });

  it("Deve chamar funcao de cura do jogador caso ele tenha escolhido uma carta do tipo cura", () => {
    selecionarCarta.mockReturnValueOnce(new CardCura(2)).mockReturnValueOnce(undefined);
    const ataqueSpy = jest.spyOn(_sut.jogador1, "atacar");
    const curarSpy = jest.spyOn(_sut.jogador1, "curar").mockImplementation(() => {});

    ataqueSpy.mockClear();
    curarSpy.mockClear();
    _sut.rodarTurno(_sut.jogador1, _sut.jogador2);

    expect(ataqueSpy).toBeCalledTimes(0);
    expect(curarSpy).toBeCalledTimes(1);
  });

  it("Deve chamar funcao buffar do jogador caso ele tenha escolhido uma carta do tipo buff", () => {
    selecionarCarta
      .mockReturnValueOnce(new CardBuff(2))
      .mockReturnValueOnce(undefined);

    const atacarSpy = jest.spyOn(_sut.jogador1, "atacar");
    const curarSpy = jest.spyOn(_sut.jogador1, "curar");
    const buffarSpy = jest.spyOn(_sut.jogador1, "buffar");

    _sut.rodarTurno(_sut.jogador1, _sut.jogador2);

    expect(atacarSpy).toBeCalledTimes(0);
    expect(curarSpy).toBeCalledTimes(0);
    expect(buffarSpy).toBeCalledTimes(1);
  });
});
