import { CardAtaque } from "./cards/cardAtaque";
import { Player } from "./player";
import { Game } from "./game";
import { IInterfaceUsuario } from "./IInterfaceUsuario";
import { CardCura } from "./cards/cardCura";

import { CardBuff } from "./cards/cardBuff";
import { CardMana } from "./cards/cardMana";
import { ICard } from "./cards/ICard";
import { Bardo } from "./bardo";


describe("Game", () => {
  let _sut: Game;
  let j1EC: jest.SpyInstance;
  let j2EC: jest.SpyInstance;
  let j1CC: jest.SpyInstance;
  let j2CC: jest.SpyInstance;
  let j1Atacar: jest.SpyInstance;
  let j1Buffar: jest.SpyInstance;
  let selecionarCarta: jest.Mock<Promise<ICard | undefined>, [ICard[], number]>;
  let interfaceUsuario: IInterfaceUsuario;

  beforeEach(() => {
    const p1 = new Player("Player 1");
    const p2 = new Player("Player 2");

    j1EC = jest.spyOn(p1, "embaralharCartas");
    j2EC = jest.spyOn(p2, "embaralharCartas");

    j1CC = jest.spyOn(p1, "comprarCarta");
    j2CC = jest.spyOn(p2, "comprarCarta");

    selecionarCarta = jest.fn().mockResolvedValue(new CardAtaque(3));
    interfaceUsuario = {
      selecionarCarta,
      exibirTurno: jest.fn(),
    } as unknown as IInterfaceUsuario;

    j1Atacar = jest.spyOn(p1, "atacar").mockImplementation((x) => {
      _sut.jogador1.mana -= x.obterCusto();
      _sut.jogador1.mao.splice(_sut.jogador1.mao.findIndex(y => y.toEquals(x)), 1);
      return x.obterValor();
    });
    j1Buffar = jest.spyOn(p1, "buffar").mockImplementation((x) => {
      _sut.jogador1.mana -= x.obterCusto();
      _sut.jogador1.mao.splice(_sut.jogador1.mao.findIndex(y => y.toEquals(x)), 1);
    });

    _sut = new Game(p1, p2, interfaceUsuario, interfaceUsuario);
  });

  afterEach(() => {
    j1EC.mockClear();
    j2EC.mockClear();
    if (j1Buffar) j1Buffar.mockClear();
    jest.restoreAllMocks();
  });

  it("Deve haver dois jogadores em uma partida", () => {
    expect(_sut.jogador1).not.toBe(undefined);
    expect(_sut.jogador2).not.toBe(undefined);
  });

  it("no inicio do jogo, cada jogador deve comprar 3 cartas", async () => {
    j1CC.mockClear();
    jest.spyOn(_sut, "rodarTurno").mockImplementation(async () => {
      _sut.Vencedor = _sut.jogador1;
    });

    await _sut.iniciarJogo();

    expect(j1CC).toBeCalledTimes(3);
    expect(j2CC).toBeCalledTimes(3);
  });

  it("Deve embaralhar as cartas quando inicar jogo for chamado", async () => {
    j1EC.mockClear();
    j2EC.mockClear();
    jest.spyOn(_sut, "rodarTurno").mockImplementation(async () => {
      _sut.Vencedor = _sut.jogador1;
    });

    await _sut.iniciarJogo();

    expect(j1EC).toBeCalledTimes(1);
    expect(j2EC).toBeCalledTimes(1);
  });

  it("Deve disponibilizar toda a mana no inicio do turno", async () => {
    selecionarCarta.mockResolvedValueOnce(undefined);

    const rmSpy = jest.spyOn(_sut.jogador2, "reiniciarMana");

    await _sut.rodarTurno(_sut.jogador2, _sut.jogador1);

    expect(rmSpy).toBeCalledTimes(1);
  });

  it("Jogadores da classe Bardo ganham 1 de mana extra no inicio do turno", async () => {
    selecionarCarta.mockResolvedValueOnce(undefined);
    const bardo = new Bardo("Player 1");
    const game = new Game(bardo, _sut.jogador2, interfaceUsuario, interfaceUsuario);
    bardo.manaSlot = 0;
    bardo.mana = 0;

    await game.rodarTurno(bardo, _sut.jogador2);

    expect(bardo.mana).toBe(2);
  });

  it("O jogador 1 deve comprar uma carta", async () => {
    j1CC.mockClear();

    await _sut.rodarTurno(_sut.jogador1, _sut.jogador2);

    expect(j1CC).toBeCalledTimes(1);
  });

  it("Deve aplicar o dano do jogador 1 no jogador 2", async () => {
    _sut.jogador1.manaSlot = 2;
    _sut.jogador1.mao = [new CardAtaque(3)];
    selecionarCarta.mockResolvedValueOnce(new CardAtaque(3));
    selecionarCarta.mockResolvedValueOnce(undefined);

    const daSpy = jest.spyOn(_sut.jogador2, "defenderAtaque");

    await _sut.rodarTurno(_sut.jogador1, _sut.jogador2);

    expect(daSpy).toBeCalledTimes(1);
  });

  it("Deve finalizar o jogo se o jogador2 tiver morrido", async () => {
    selecionarCarta.mockResolvedValueOnce(new CardAtaque(2));
    const tcdSpy = jest
      .spyOn(_sut.jogador1, "temCartaDisponivel")
      .mockReturnValueOnce(true);
    const daSpy = jest
      .spyOn(_sut.jogador2, "estaVivo")
      .mockReturnValueOnce(false);
    _sut.jogador1.nome = "vencedor";
    await _sut.rodarTurno(_sut.jogador1, _sut.jogador2);
    expect(_sut.Vencedor).toBe(_sut.jogador1);
  });

  it("Deve dar a possibilidade passar a vez se o jogador escolher -1 como entrada do ataque", async () => {
    _sut.jogador1.manaSlot = 5;
    _sut.jogador1.mao = [new CardAtaque(3), new CardAtaque(3), new CardAtaque(1), new CardAtaque(1)];
    selecionarCarta.mockClear();
    selecionarCarta.mockResolvedValueOnce(undefined);
    j1Atacar.mockImplementation((x) => {
      _sut.jogador1.mana -= x;
      _sut.jogador1.mao.splice(_sut.jogador1.mao.findIndex(y => y.toEquals(x)), 1);
      return x;
    });
    await _sut.rodarTurno(_sut.jogador1, _sut.jogador2);

    expect(j1Atacar).toBeCalledTimes(0);
  });

  it("Deve chamar incrementar manaslot do jogador", async () => {
    selecionarCarta.mockResolvedValueOnce(undefined);

    const incrementarMSSpy = jest.spyOn(_sut.jogador2, "incrementarManaSlot");

    await _sut.rodarTurno(_sut.jogador2, _sut.jogador1);

    expect(incrementarMSSpy).toBeCalledTimes(1);
  });

  it("Deve adicionar 1 de espaco mana no inicio do turno do jogador", async () => {
    jest
      .spyOn(Math, "random")
      .mockReturnValueOnce(0.49999)
      .mockReturnValueOnce(0.50001);

    const rodarTurno = jest
      .spyOn(_sut, "rodarTurno")
      .mockImplementation(async () => {
        _sut.Vencedor = _sut.jogador1;
      });

    await _sut.iniciarJogo();
    expect(rodarTurno).toBeCalled();
    rodarTurno.mockClear();
    _sut.Vencedor = undefined;
    await _sut.iniciarJogo();
    expect(rodarTurno).toBeCalled();
  });

  it("Deve adicionar 1 de espaco mana no inicio do turno do jogador", async () => {
    jest.spyOn(Math, "random").mockReturnValueOnce(0.59999);

    const rodarTurno = jest
      .spyOn(_sut, "rodarTurno")
      .mockImplementation(async () => {
        _sut.Vencedor = _sut.jogador1;
      });

    await _sut.iniciarJogo();
    expect(rodarTurno).toBeCalledWith(_sut.jogador2, _sut.jogador1);
  });

  it("Deve verificar se o jogador continua vivo apos comprar carta", async () => {
    const rodarTurno = jest
      .spyOn(_sut.jogador1, "estaVivo")
      .mockReturnValueOnce(false);

    await _sut.rodarTurno(_sut.jogador1, _sut.jogador2);

    expect(_sut.Vencedor).toBe(_sut.jogador2);
  });

  it("Deve interromper o jogo caso o jogador tenha corrido tentando comprar carta", async () => {
    jest.spyOn(_sut.jogador1, "estaVivo").mockReturnValueOnce(false);
    const adspy = jest.spyOn(_sut.jogador1, "temCartaDisponivel");

    await _sut.rodarTurno(_sut.jogador1, _sut.jogador2);

    expect(adspy).toBeCalledTimes(0);
  });

  it("Deve chamar a funcao atacar do jogador caso ele tenha escolhido uma carta do tipo ataque", async () => {
    selecionarCarta.mockResolvedValueOnce(new CardAtaque(2));
    const ataqueSpy = jest.spyOn(_sut.jogador1, "atacar");
    const curarSpy = jest.spyOn(_sut.jogador1, "curar");


    await _sut.rodarTurno(_sut.jogador1, _sut.jogador2);

    expect(ataqueSpy).toBeCalledTimes(1);
    expect(curarSpy).toBeCalledTimes(0);
  });

  it("Deve chamar funcao de cura do jogador caso ele tenha escolhido uma carta do tipo cura", async () => {
    selecionarCarta.mockResolvedValueOnce(new CardCura(2)).mockResolvedValueOnce(undefined);
    const ataqueSpy = jest.spyOn(_sut.jogador1, "atacar");
    const curarSpy = jest.spyOn(_sut.jogador1, "curar").mockImplementation(() => {});

    ataqueSpy.mockClear();
    curarSpy.mockClear();
    await _sut.rodarTurno(_sut.jogador1, _sut.jogador2);

    expect(ataqueSpy).toBeCalledTimes(0);
    expect(curarSpy).toBeCalledTimes(1);
  });


  it("Deve chamar funcao buffar do jogador caso ele tenha escolhido uma carta do tipo buff", async () => {
    selecionarCarta
      .mockResolvedValueOnce(new CardBuff(2))
      .mockResolvedValueOnce(undefined);

    const atacarSpy = jest.spyOn(_sut.jogador1, "atacar");
    const curarSpy = jest.spyOn(_sut.jogador1, "curar");
    const buffarSpy = jest.spyOn(_sut.jogador1, "buffar");

    await _sut.rodarTurno(_sut.jogador1, _sut.jogador2);

    expect(atacarSpy).toBeCalledTimes(0);
    expect(curarSpy).toBeCalledTimes(0);
    expect(buffarSpy).toBeCalledTimes(1);
  });

  it("Deve chamar funcao carregarMana do jogador caso ele tenha escolhido uma carta do tipo mana", async () => {
    _sut.jogador1.mao = [new CardMana(2)];
    _sut.jogador1.manaSlot = 2;
    _sut.jogador1.reiniciarMana();
    selecionarCarta.mockResolvedValueOnce(new CardMana(2)).mockResolvedValueOnce(undefined);

    const carregarManaSpy = jest.spyOn(_sut.jogador1, "carregarMana");

    await _sut.rodarTurno(_sut.jogador1, _sut.jogador2);

    expect(carregarManaSpy).toBeCalledTimes(1);
  });

  it("os turnos devem se repetir ate que haja um vencedor", async () => {
    jest.spyOn(Math, "random").mockReturnValueOnce(0.2);
    const ordem: string[] = [];
    jest.spyOn(_sut, "rodarTurno").mockImplementation(async (a, d) => {
      ordem.push(`${a.nome}->${d.nome}`);
      if (ordem.length === 3) {
        _sut.Vencedor = a;
      }
    });

    await _sut.iniciarJogo();

    expect(ordem).toEqual([
      "Player 1->Player 2",
      "Player 2->Player 1",
      "Player 1->Player 2",
    ]);
    expect(_sut.Vencedor).toBe(_sut.jogador1);
  });
});
