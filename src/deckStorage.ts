import fs from "fs";
import path from "path";
import { ICard } from "./cards/ICard";
import { enumTipo } from "./tipo.enum";
import { CardAtaque } from "./cards/cardAtaque";
import { CardCura } from "./cards/cardCura";
import { CardBuff } from "./cards/cardBuff";
import { CardEscudo } from "./cards/cardEscudo";
import { CardMana } from "./cards/cardMana";
import { CardVeneno } from "./cards/cardVeneno";

const DECK_DIR = path.join(__dirname, "../decks");

function ensureDir(): void {
  if (!fs.existsSync(DECK_DIR)) {
    fs.mkdirSync(DECK_DIR);
  }
}

export function saveDeck(name: string, deck: ICard[]): void {
  ensureDir();
  const data = deck.map((c) => ({ tipo: c.obterTipo(), valor: c.obterValor() }));
  fs.writeFileSync(path.join(DECK_DIR, `${name}.json`), JSON.stringify(data));
}

function createCard(tipo: enumTipo, valor: number): ICard {
  switch (tipo) {
    case enumTipo.ataque:
      return new CardAtaque(valor);
    case enumTipo.cura:
      return new CardCura(valor);
    case enumTipo.buff:
      return new CardBuff(valor);
    case enumTipo.escudo:
      return new CardEscudo(valor);
    case enumTipo.mana:
      return new CardMana(valor);
    default:
      return new CardVeneno(valor);
  }
}

export function loadDeck(name: string): ICard[] | undefined {
  try {
    const file = fs.readFileSync(path.join(DECK_DIR, `${name}.json`), "utf-8");
    const data: { tipo: enumTipo; valor: number }[] = JSON.parse(file);
    return data.map((d) => createCard(d.tipo, d.valor));
  } catch {
    return undefined;
  }
}

export function listDecks(): string[] {
  ensureDir();
  return fs
    .readdirSync(DECK_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(/\.json$/, ""));
}
