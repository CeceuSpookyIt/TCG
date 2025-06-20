import { Player } from "./player";
import { CardAtaque } from "./cards/cardAtaque";
import { CardCura } from "./cards/cardCura";
import { CardBuff } from "./cards/cardBuff";
import { CardEscudo } from "./cards/cardEscudo";
import { CardMana } from "./cards/cardMana";
import { CardVeneno } from "./cards/cardVeneno";
import { enumTipo } from "./tipo.enum";
import { Ladrao } from "./ladrao";

describe("player", () => {
  let _sut: Player;

  beforeEach(() => {
    _sut = new Player("Player");
  });

  it("Deve retornar o nome do jogador quando a propriedade nome for chamada", () => {
    expect(_sut.nome).toBe("Player");
  });

  it("Deve retornar 30 pontos de vida do jogador no inicio do jogo", () => {
    expect(_sut.vida).toBe(15);
  });

  it("Deve ter 1 de mana no comeco do jogo", () => {
    expect(_sut.mana).toBe(1);
  });

  it("Deve ter 0 de espacos de mana no comeco do jogo", () => {
    expect(_sut.manaSlot).toBe(0);
  });

it("Deve iniciar o jogo com todos os tipos de cartas", () => {
  const tipos = new Set(_sut.deck.map((c) => c.obterTipo()));
  expect(Array.from(tipos)).toEqual(
    expect.arrayContaining([
      enumTipo.ataque,
      enumTipo.cura,
      enumTipo.buff,
      enumTipo.escudo,
      enumTipo.mana,
      enumTipo.veneno,
    ])
  );
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

    expect(() => _sut.atacar(new CardAtaque(4))).toThrow("Você não possui essa carta!");
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
    expect(_sut.atacar(new CardAtaque(3))).toBe(3);
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

    expect(_sut.temCartaDisponivel()).toBeFalsy();
  });

  it("Deve retornar falso quando o jogador tiver apenas cartas maiores que a sua mana disponivel", () => {
    _sut.mana = 1;

    _sut.mao = [new CardAtaque(6), new CardAtaque(8)];

    expect(_sut.temCartaDisponivel()).toBeFalsy();
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

    expect(() => _sut.atacar(new CardCura(1))).toThrow("A carta selecionada não é do tipo correto!");
  });

  it("Deve lancar excecao quando o jogador tentar curar com uma carta que nao é do tipo cura", () => {
    _sut.mao = [new CardAtaque(1)];
    _sut.mana = 1;

    expect(() => _sut.curar(new CardAtaque(1))).toThrow("A carta selecionada não é do tipo correto!");
  });

  it("Deve lancar excecao quando o jogador nao tiver mana suficiente para usar a cura", () => {
    _sut.mao = [new CardCura(2)];
    _sut.mana = 1;

    expect(() => _sut.curar(new CardCura(2))).toThrow("Você não tem mana para jogar esta carta!");
  });

  it("Deve lancar excecao quando o jogador nao tiver a carta disponivel", () => {
    _sut.mao = [new CardCura(2)];
    _sut.mana = 5;

    expect(() => _sut.curar(new CardCura(3))).toThrow("Você não possui essa carta!");
  });


  it("Deve remover a carta cura da mao quando ela for utilizada", () => {
    _sut.mao = [new CardAtaque(1), new CardCura(2)];
    _sut.mana = 5;

    _sut.curar(new CardCura(2));
    expect(_sut.mao).toStrictEqual([new CardAtaque(1)]);
  });
  it("Deve remover a carta cura da mao quando ela for utilizada", () => {
    _sut.mao = [new CardAtaque(1), new CardCura(2)];
    _sut.mana = 5;

    _sut.curar(new CardCura(2));
    expect(_sut.mana).toBe(3);
  });

  it("Deve remover a carta cura da mao quando ela for utilizada", () => {
    _sut.mao = [new CardAtaque(1), new CardCura(2), new CardCura(3)];
    _sut.mana = 5;
    _sut.vida = 6;

    _sut.curar(new CardCura(2));
    expect(_sut.mao[0].obterCusto()).toBe(1);
    expect(_sut.mao[1].obterCusto()).toBe(3);
  });

  it("Deve remover a carta ataque da mao quando ela for utilizada", () => {
    _sut.mao = [new CardAtaque(1), new CardCura(2), new CardCura(3)];
    _sut.mana = 5;
    _sut.vida = 6;

    _sut.atacar(new CardAtaque(1));
    expect(_sut.mao[0].obterCusto()).toBe(2);
    expect(_sut.mao[1].obterCusto()).toBe(3);
  });
  it("Deve retornar valor stackado de buff quando chamar funcao obterBuff", () => {
    _sut.mao = [new CardBuff(5), new CardCura(2), new CardCura(3)];
    _sut.mana = 5;
    _sut.vida = 6;

    _sut.buffar(new CardBuff(5));
    expect(_sut.obterBuff()).toBe(1.5);
  });

  it("Deve retornar valor stackado de buff quando chamar funcao obterBuff", () => {
    _sut.mao = [new CardBuff(5), new CardBuff(2), new CardCura(3)];
    _sut.mana = 7;
    _sut.vida = 6;

    _sut.buffar(new CardBuff(5));
    _sut.buffar(new CardBuff(2));
    expect(_sut.obterBuff()).toBeCloseTo(1.8);
  });


  it("Deve lancar excecao quando o jogador tentar buffar com uma carta que nao é do tipo buff", () => {
    _sut.mao = [new CardAtaque(1)];
    _sut.mana = 1;

    expect(() => _sut.buffar(new CardAtaque(1))).toThrow("A carta selecionada não é do tipo correto!");
  });

  it("Deve lancar excecao quando o jogador nao tiver mana suficiente para usar o buff", () => {
    _sut.mao = [new CardBuff(2)];
    _sut.mana = 1;

    expect(() => _sut.buffar(new CardBuff(2))).toThrow("Você não tem mana para jogar esta carta!");
  });
  
  it("Deve lancar excecao quando o jogador nao tiver a carta disponivel", () => {
    _sut.mao = [new CardBuff(2)];
    _sut.mana = 5;

    expect(() => _sut.buffar(new CardBuff(3))).toThrow("Você não possui essa carta!");
  });

  it("Deve retornar valor stackado de buff quando chamar funcao obterBuff", () => {
    _sut.mao = [new CardBuff(5), new CardCura(2), new CardCura(3)];
    _sut.mana = 5;
    _sut.vida = 6;

    _sut.buffar(new CardBuff(5));
    expect(_sut.mana).toBe(0);
  });

  it("Deve remover a carta cura da mao quando ela for utilizada", () => {
    _sut.mao = [new CardAtaque(1), new CardBuff(2), new CardCura(2)];
    _sut.mana = 5;

    _sut.buffar(new CardBuff(2));
    expect(_sut.mao[0].obterTipo()).toBe(enumTipo.ataque);
    expect(_sut.mao[1].obterTipo()).toBe(enumTipo.cura);
  });

  
  it("Deve aplicar buff no ataque", () => {
    _sut.mao = [new CardAtaque(4), new CardBuff(2), new CardCura(2)];
    _sut.mana = 6;

    _sut.buffar(new CardBuff(2));
   
    expect( _sut.atacar(new CardAtaque(4))).toBe(5);
  });

  it("Deve remover buff se for utilisado", () => {
    _sut.mao = [new CardAtaque(4), new CardBuff(2), new CardCura(2)];
    _sut.mana = 6;

    _sut.buffar(new CardBuff(2));
    _sut.atacar(new CardAtaque(4));
    expect(_sut.obterBuff()).toBe(1);
  });

  it("Deve aplicar buff no escudo", () => {
    _sut.mao = [new CardBuff(2), new CardEscudo(2)];
    _sut.mana = 4;

    _sut.buffar(new CardBuff(2));
    _sut.proteger(new CardEscudo(2));

    expect(_sut.escudos[0]).toBeCloseTo(2.4);
    expect(_sut.obterBuff()).toBe(1);
  });

  it("Deve aplicar buff na cura", () => {
    _sut.mao = [new CardCura(4), new CardBuff(2), new CardCura(2)];
    _sut.mana = 6;
    _sut.vida= 10
    _sut.buffar(new CardBuff(2));
    _sut.curar(new CardCura(4))
    expect(_sut.vida).toBe(15);
  });

  it("Deve remover buff apos ser utilisado na cura", () => {
    _sut.mao = [new CardCura(4), new CardBuff(2), new CardCura(2)];
    _sut.mana = 6;
   

    _sut.buffar(new CardBuff(2));
    _sut.curar(new CardCura(4));
    expect(_sut.obterBuff()).toBe(1);
  });

  it("Deve ativar escudo e reduzir o dano do proximo ataque", () => {
    _sut.mao = [new CardEscudo(2)];
    _sut.mana = 2;
    _sut.proteger(new CardEscudo(2));
    _sut.vida = 10;
    _sut.defenderAtaque(10);
    expect(_sut.vida).toBe(2);
  });

  it("Deve consumir o escudo apos reduzir o dano", () => {
    _sut.mao = [new CardEscudo(2)];
    _sut.mana = 2;
    _sut.proteger(new CardEscudo(2));
    _sut.vida = 10;
    _sut.defenderAtaque(1);
    _sut.defenderAtaque(3);
    expect(_sut.vida).toBe(7);
  });

  it("Deve permitir utilizar varios escudos em sequencia", () => {
    _sut.mao = [new CardEscudo(2), new CardEscudo(3)];
    _sut.mana = 5;
    _sut.proteger(new CardEscudo(2));
    _sut.proteger(new CardEscudo(3));
    _sut.vida = 10;
    _sut.defenderAtaque(1); // usa escudo 2
    expect(_sut.vida).toBe(10);
    _sut.defenderAtaque(4); // usa escudo 3
    expect(_sut.vida).toBe(9);
  });

  it("Deve remover a carta escudo da mao e gastar mana ao usar", () => {
    _sut.mao = [new CardEscudo(2), new CardAtaque(1)];
    _sut.mana = 3;
    _sut.proteger(new CardEscudo(2));
    expect(_sut.mao.length).toBe(1);
    expect(_sut.mana).toBe(1);
  });


  it("Deve acumular mana extra para o proximo turno", () => {
    _sut.mao = [new CardMana(2)];
    _sut.mana = 2;
    _sut.carregarMana(new CardMana(2));
    expect(_sut.manaExtra).toBe(2);
    expect(_sut.buff).toBe(1);
  });

  it("Deve aplicar mana extra no inicio do turno", () => {
    _sut.manaExtra = 3;
    _sut.mana = 5;
    _sut.aplicarManaExtra();
    expect(_sut.mana).toBe(8);
    expect(_sut.manaExtra).toBe(0);
  });

  it("Deve aplicar buff na carta de mana", () => {
    _sut.mao = [new CardBuff(2), new CardMana(2)];
    _sut.mana = 4;
    _sut.buffar(new CardBuff(2));
    _sut.carregarMana(new CardMana(2));
    expect(_sut.manaExtra).toBeCloseTo(2.4);
    expect(_sut.buff).toBe(1);
  });
  it("Deve aplicar veneno ao oponente e reduzir a vida no inicio do turno", () => {
    _sut.mao = [new CardVeneno(3)];
    _sut.mana = 3;

    const duracao = _sut.envenenar(new CardVeneno(3));
    const oponente = new Player("op");
    oponente.aplicarVeneno(duracao);
    oponente.processarVenenos();
    expect(oponente.vida).toBe(14);
    oponente.processarVenenos();
    expect(oponente.vida).toBe(13);
    oponente.processarVenenos();
    expect(oponente.vida).toBe(12);
    oponente.processarVenenos();
    expect(oponente.vida).toBe(12); // sem veneno
  });

  it("Deve stackar varias instancias de veneno", () => {
    const op = new Player("op");
    op.aplicarVeneno(2);
    op.aplicarVeneno(3);
    op.processarVenenos();
    expect(op.vida).toBe(13);
    op.processarVenenos();
    expect(op.vida).toBe(11);
    op.processarVenenos();
    expect(op.vida).toBe(10);
    op.processarVenenos();
    expect(op.vida).toBe(10);
  });

  it("Deve usar escudo para absorver dano acumulado de veneno", () => {
    const op = new Player("op");
    op.aplicarVeneno(2);
    op.aplicarVeneno(1);
    op.escudos = [3];
    op.processarVenenos();
    expect(op.vida).toBe(15);
    expect(op.escudos.length).toBe(0);
    op.processarVenenos();
    expect(op.vida).toBe(14);

  });

  it("Jogadores da classe Ladrao aumentam em 2 turnos a duracao do veneno", () => {
    const ladrao = new Ladrao("Player");
    ladrao.mao = [new CardVeneno(2)];
    ladrao.mana = 2;

    const duracao = ladrao.envenenar(new CardVeneno(2));
    expect(duracao).toBe(4);
    const oponente = new Player("op");
    oponente.aplicarVeneno(duracao);
    for (let i = 0; i < 4; i++) {
      oponente.processarVenenos();
    }
    expect(oponente.vida).toBe(11);
    oponente.processarVenenos();
    expect(oponente.vida).toBe(11);
  });

  it("Bonus de veneno do ladrao considera o buff aplicado", () => {
    const ladrao = new Ladrao("Player");
    ladrao.mao = [new CardBuff(2), new CardVeneno(2)];
    ladrao.mana = 4;

    ladrao.buffar(new CardBuff(2));
    const duracao = ladrao.envenenar(new CardVeneno(2));
    expect(duracao).toBe(4);
  });




});
