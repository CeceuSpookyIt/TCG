import { Player } from "./player";
import { CardAtaque } from "./cards/cardAtaque";
import { CardCura } from "./cards/cardCura";

describe("player", () => {
  let _sut: Player;

  beforeEach(() => {
    _sut = new Player("Player");
  });

  it("Deve retornar o nome do jogador quando a propriedade nome for chamada", () => {
    expect(_sut.nome).toBe("Player");
  });

  it("Deve retornar 30 pontos de vida do jogador no inicio do jogo", () => {
    expect(_sut.vida).toBe(30);
  });

  it("Deve ter 0 de mana no comeco do jogo", () => {
    expect(_sut.mana).toBe(0);
  });

  it("Deve ter 0 de espacos de mana no comeco do jogo", () => {
    expect(_sut.manaSlot).toBe(0);
  });

  it("Deve iniciar o jogo com a seguinte combinacao de cartas", () => {
    expect(_sut.deck).toEqual([
      new CardAtaque(0),
      new CardAtaque(0),
      new CardAtaque(1),
      new CardAtaque(1),
      new CardAtaque(2),
      new CardAtaque(2),
      new CardAtaque(2),
      new CardAtaque(3),
      new CardAtaque(3),
      new CardAtaque(3),
      new CardAtaque(3),
      new CardAtaque(4),
      new CardAtaque(4),
      new CardAtaque(4),
      new CardAtaque(5),
      new CardAtaque(5),
      new CardAtaque(6),
      new CardAtaque(6),
      new CardAtaque(7),
      new CardAtaque(8),
    ]);
  });

  it("Deve iniciar o jogo sem nenhuma carta na mao", () => {
    expect(_sut.mao.length).toBe(0);
  });

  it("Deve iniciar o jogo sem nenhuma carta na mao", () => {
    const deckInicial = _sut.deck.length;
    const maoInicial = _sut.mao.length;

    _sut.comprarCarta();

    expect(_sut.deck.length).toBe(deckInicial - 1);
    expect(_sut.mao.length).toBe(maoInicial + 1);
  });

  it("Deve iniciar o jogo sem nenhuma carta na mao", () => {
    const tamanhoInicial = _sut.deck.length;

    _sut.embaralharCartas();

    expect(_sut.deck.length).toBe(tamanhoInicial);
  });

  it("Deve lancar excecao quando nao houver a carta disponivel na mao", () => {
    _sut.mao = [new CardAtaque(1), new CardAtaque(2), new CardAtaque(3)];

    expect(() => _sut.atacar(new CardAtaque(4))).toThrow();
  });

  it("Deve remover a carta utilizada da mao", () => {
    _sut.mao = [new CardAtaque(1), new CardAtaque(2), new CardAtaque(3)];
    _sut.mana = 4;
    _sut.atacar(new CardAtaque(3));
    expect(_sut.mao).toEqual([new CardAtaque(1), new CardAtaque(2)]);
  });

  it("Deve subtrair da mana o valor que foi utilizado", () => {
    _sut.mao = [new CardAtaque(1), new CardAtaque(2), new CardAtaque(3)];
    _sut.mana = 4;
    _sut.atacar(new CardAtaque(3));
    expect(_sut.mana).toBe(1);
  });

  it("Deve lançar excessão quando o player jogar uma carta que custa mais mana do que ele tem", () => {
    _sut.mao = [new CardAtaque(1), new CardAtaque(2), new CardAtaque(3)];
    _sut.mana = 2;
    expect(() => _sut.atacar(new CardAtaque(3))).toThrow();
  });

  it("Deve retornar o valor do dano do ataque", () => {
    _sut.mao = [new CardAtaque(1), new CardAtaque(2), new CardAtaque(3)];
    _sut.mana = 4;
    expect(_sut.atacar(new CardAtaque(3))).toStrictEqual(new CardAtaque(3));
  });

  it("Deve adicionar 1 de espaco mana quando a funcao incrementar manaslot for chamada", () => {
    _sut.manaSlot = 1;

    _sut.incrementarManaSlot();

    expect(_sut.manaSlot).toBe(2);
  });

  it("Deve limitar o manaslot em no maximo 10", () => {
    _sut.manaSlot = 10;

    _sut.incrementarManaSlot();

    expect(_sut.manaSlot).toBe(10);
  });

  it("Deve reiniciar a mana quando a funcao reiniciarMana for chamada", () => {
    _sut.manaSlot = 5;
    _sut.mana = 0;

    _sut.reiniciarMana();

    expect(_sut.mana).toBe(5);
  });

  it("Deve retornar falso quando o jogador nao tiver mais cartas na mao", () => {
    _sut.mao = [];

    expect(_sut.temAtaqueDisponivel()).toBeFalsy();
  });

  it("Deve retornar falso quando o jogador tiver apenas cartas maiores que a sua mana disponivel", () => {
    _sut.mana = 1;

    _sut.mao = [new CardAtaque(6), new CardAtaque(8)];

    expect(_sut.temAtaqueDisponivel()).toBeFalsy();
  });

  it("Deve reduzir vida quando player defende um ataque", () => {
    _sut.vida = 10;
    _sut.defenderAtaque(3);
    expect(_sut.vida).toBe(7);
  });

  it("Deve retornar falso quando o jogador não tiver mais vida", () => {
    _sut.vida = 0;
    expect(_sut.estaVivo()).toBeFalsy();
  });

  it("Deve perder 1 ponto de vida se nao tiver nenhuma carta no deck para comprar quando for comprar", () => {
    _sut.vida = 10;
    _sut.deck = [];
    _sut.comprarCarta();
    expect(_sut.vida).toBe(9);
  });

  it("Deve tomar o dano da carta comprada caso tenha 5 cartas na mao", () => {
    _sut.vida = 10;
    _sut.deck = [new CardAtaque(2)];
    _sut.mao = [
      new CardAtaque(1),
      new CardAtaque(1),
      new CardAtaque(1),
      new CardAtaque(1),
      new CardAtaque(1),
    ];
    _sut.comprarCarta();
    expect(_sut.vida).toBe(8);
    expect(_sut.deck).toStrictEqual([]);
  });

  it("Deve lancar excecao quando o jogador tentar atacar com uma carta que nao é do tipo ataque", () => {
    _sut.mao = [new CardCura(1)];
    _sut.mana = 1;

    expect(() => _sut.atacar(new CardCura(1))).toThrow("A carta deve ser do tipo ataque");
  });

  it("Deve lancar excecao quando o jogador tentar curar com uma carta que nao é do tipo cura", () => {
    _sut.mao = [new CardAtaque(1)];
    _sut.mana = 1;

    expect(() => _sut.curar(new CardAtaque(1))).toThrow("A carta deve ser do tipo cura");
  });

  it("Deve lancar excecao quando o jogador nao tiver mana suficiente para usar a cura", () => {
    _sut.mao = [new CardCura(2)];
    _sut.mana = 1;

    expect(() => _sut.curar(new CardCura(2))).toThrow("Você não tem mana para jogar esta carta!");
  });

  it("Deve lancar excecao quando o jogador nao tiver a carta disponivel", () => {
    _sut.mao = [new CardCura(2)];
    _sut.mana = 5;

    expect(() => _sut.curar(new CardCura(3))).toThrow("Você não tem esta carta para jogar!");
  });


  it("Deve remover a carta cura da mao quando ela for utilisada", () => {
    _sut.mao = [new CardAtaque(1), new CardCura(2)];
    _sut.mana = 5;

    _sut.curar(new CardCura(2));
    expect(_sut.mao).toStrictEqual([new CardAtaque(1)]);
  });
  it("Deve remover a carta cura da mao quando ela for utilisada", () => {
    _sut.mao = [new CardAtaque(1), new CardCura(2)];
    _sut.mana = 5;

    _sut.curar(new CardCura(2));
    expect(_sut.mana).toBe(3);
  });

  it("Deve remover a carta cura da mao quando ela for utilisada", () => {
    _sut.mao = [new CardAtaque(1), new CardCura(2)];
    _sut.mana = 5;
    _sut.vida = 6;

    _sut.curar(new CardCura(2));
    expect(_sut.vida).toBe(8);
  });
});
