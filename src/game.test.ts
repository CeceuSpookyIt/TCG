import { Player } from "./player";
import { Game } from "./game";
import { IInterfaceUsuario } from "./IInterfaceUsuario";

describe("Game", () => {
  let _sut: Game;
  let j1EC: jest.SpyInstance;
  let j2EC: jest.SpyInstance;
  let j1CC: jest.SpyInstance;
  let j1Atacar: jest.SpyInstance;
  let selecionarCarta: jest.Mock<number>;
  let interfaceUsuario: IInterfaceUsuario;

  beforeEach(() => {
    const p1 = new Player("Player 1");
    const p2 = new Player("Player 2");

    j1EC = jest.spyOn(p1, "embaralharCartas");
    j2EC = jest.spyOn(p2, "embaralharCartas");

    j1CC = jest.spyOn(p1, "comprarCarta");

    selecionarCarta = jest.fn().mockReturnValue(3);
    interfaceUsuario = {
      selecionarCarta,
    };

    j1Atacar = jest.spyOn(p1, "atacar").mockImplementation((x) => {
      _sut.jogador1.mana -= x;
      _sut.jogador1.mao.splice(_sut.jogador1.mao.indexOf(x), 1);
      return x;
    });

    _sut = new Game(p1, p2, interfaceUsuario);
  });

  afterEach(() => {
    j1EC.mockClear();
    j2EC.mockClear();
  });

  it("Deve haver dois jogadores em uma partida", () => {
    expect(_sut.jogador1).not.toBe(undefined);
    expect(_sut.jogador2).not.toBe(undefined);
  });

  it("cada jogador comeca com 3 cartas", () => {
    expect(_sut.jogador1.deck.length).toBe(17);
    expect(_sut.jogador1.mao.length).toBe(3);

    expect(_sut.jogador2.deck.length).toBe(17);
    expect(_sut.jogador2.mao.length).toBe(3);
  });

  it("Deve embaralhar as cartas no comeco do jogo", () => {
    expect(j1EC).toBeCalledTimes(1);
    expect(j2EC).toBeCalledTimes(1);
  });

  it("Deve adicionar 1 de espaco mana no inicio do turno do jogador", () => {
    const slotIni = _sut.jogador1.manaSlot;

    _sut.rodarTurno(_sut.jogador1, _sut.jogador2);

    expect(_sut.jogador1.manaSlot).toBe(slotIni + 1);
  });

  it("Deve limitar o espaco de mana a 10", () => {
    _sut.jogador1.manaSlot = 10;

    _sut.rodarTurno(_sut.jogador1, _sut.jogador2);

    expect(_sut.jogador1.manaSlot).toBe(10);
  });

  it("Deve disponibilizar toda a mana no inicio do turno", () => {
    _sut.jogador1.manaSlot = 2;
    selecionarCarta.mockReturnValueOnce(-1);
    _sut.rodarTurno(_sut.jogador1, _sut.jogador2);

    expect(_sut.jogador1.mana).toBe(3);
  });

  it("O jogador 1 deve comprar uma carta", () => {
    j1CC.mockClear();

    _sut.rodarTurno(_sut.jogador1, _sut.jogador2);

    expect(j1CC).toBeCalledTimes(1);
  });

  it("Deve aplicar o dano do jogador 1 no jogador 2", () => {
    _sut.jogador1.manaSlot = 2;
    _sut.jogador1.mao = [3];
    j1Atacar.mockImplementation(() => {
      _sut.jogador1.mana -= 3;
      return 3;
    });

    _sut.rodarTurno(_sut.jogador1, _sut.jogador2);

    expect(_sut.jogador2.vida).toBe(27);
  });

  it("Deve finalizar o jogo se o jogador2 tiver morrido", () => {
    _sut.jogador1.manaSlot = 2;
    _sut.jogador1.mao = [3];
    _sut.jogador2.vida = 2;
    _sut.rodarTurno(_sut.jogador1, _sut.jogador2);
    expect(_sut.Vencedor).toBe(_sut.jogador1);
  });

  it("Deve dar a possibilidade de atacar enquanto o jogador 1 tiver cartas disponiveis para o ataque", () => {
    _sut.jogador1.manaSlot = 5;
    _sut.jogador1.mao = [3, 3, 0, 0];
    selecionarCarta.mockClear();
    selecionarCarta
      .mockReturnValueOnce(3)
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(3)
      .mockReturnValueOnce(0);
    j1Atacar.mockImplementation((x) => {
      _sut.jogador1.mana -= x;
      _sut.jogador1.mao.splice(_sut.jogador1.mao.indexOf(x), 1);
      return x;
    });
    _sut.rodarTurno(_sut.jogador1, _sut.jogador2);

    expect(j1Atacar).toBeCalledTimes(4);
  });

  it("Deve dar a possibilidade passar a vez se o jogador escolher -1 como entrada do ataque", (  ) => {
    _sut.jogador1.manaSlot = 5;
    _sut.jogador1.mao = [3, 3, 0, 0];
    selecionarCarta.mockClear();
    selecionarCarta.mockReturnValueOnce(-1);
    j1Atacar.mockImplementation((x) => {
      _sut.jogador1.mana -= x;
      _sut.jogador1.mao.splice(_sut.jogador1.mao.indexOf(x), 1);
      return x;
    });
    _sut.rodarTurno(_sut.jogador1, _sut.jogador2);

    expect(j1Atacar).toBeCalledTimes(0);
  });

  it("Deve adicionar 1 de espaco mana no inicio do turno do jogador", () => {
    const slotIni = _sut.jogador2.manaSlot;
    selecionarCarta.mockReturnValueOnce(-1);

    _sut.rodarTurno(_sut.jogador2, _sut.jogador1);

    expect(_sut.jogador2.manaSlot).toBe(slotIni + 1);
  });

  it("Deve adicionar 1 de espaco mana no inicio do turno do jogador", () => {
    jest
      .spyOn(Math, "random")
      .mockReturnValueOnce(0.49999)
      .mockReturnValueOnce(0.50001);

    const rodarTurno = jest.spyOn(_sut, "rodarTurno").mockImplementation(()=>{});

    _sut.iniciarJogo();
    expect(rodarTurno).toBeCalledWith(_sut.jogador1, _sut.jogador2);
    rodarTurno.mockClear();
    _sut.iniciarJogo();
    expect(rodarTurno).toBeCalledWith(_sut.jogador2, _sut.jogador1);
  });

  it("Deve adicionar 1 de espaco mana no inicio do turno do jogador", () => {
    jest
      .spyOn(Math, "random")
      .mockReturnValueOnce(0.59999)

    const rodarTurno = jest.spyOn(_sut, "rodarTurno").mockImplementation(()=>{});

    _sut.iniciarJogo();
    expect(rodarTurno).toBeCalledWith(_sut.jogador1, _sut.jogador2);
    expect(rodarTurno).toBeCalledWith(_sut.jogador2, _sut.jogador1);
  });
});
