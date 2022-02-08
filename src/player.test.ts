import { Player } from "./player";

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
    expect(_sut.deck).toEqual([0,0,1,1,2,2,2,3,3,3,3,4,4,4,5,5,6,6,7,8]);
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
    _sut.mao = [1,2,3];

    expect(() => _sut.atacar(4)).toThrow();
  });

  it("Deve remover a carta utilizada da mao", () => {
    _sut.mao = [1,2,3];
    _sut.mana = 4;
    _sut.atacar(3);
    expect(_sut.mao).toEqual([1,2]);
  });

  
  it("Deve subtrair da mana o valor que foi utilizado", () => {
    _sut.mao = [1,2,3];
    _sut.mana = 4;
    _sut.atacar(3)
    expect(_sut.mana).toBe(1);
  });

  it("Deve lançar excessão quando o player jogar uma carta que custa mais mana do que ele tem", () => {
    _sut.mao = [1,2,3];
    _sut.mana = 2;
    expect(() => _sut.atacar(3)).toThrow();
  });

  it("Deve retornar o valor do dano do ataque", () => {
    _sut.mao = [1,2,3];
    _sut.mana = 4;
    expect(_sut.atacar(3)).toBe(3);
  });

});