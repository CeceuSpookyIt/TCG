import { Mago } from "./mago";
import { CardBuff } from "./cards/cardBuff";
import { CardAtaque } from "./cards/cardAtaque";

describe("Mago", () => {
  let mago: Mago;

  beforeEach(() => {
    mago = new Mago("Gandalf");
  });

  it("Deve aplicar buff de 30% por custo da carta", () => {
    mago.mao = [new CardBuff(2)];
    mago.mana = 2;

    mago.buffar(new CardBuff(2));
    expect(mago.obterBuff()).toBeCloseTo(1.6);
  });

  it("Deve aplicar buff de 30% no ataque", () => {
    mago.mao = [new CardBuff(2), new CardAtaque(4)];
    mago.mana = 6;

    mago.buffar(new CardBuff(2));
    const dano = mago.atacar(new CardAtaque(4));
    expect(dano).toBe(6); // 4 * 1.6 = 6.4 -> round 6
    expect(mago.obterBuff()).toBe(1);
  });
});
