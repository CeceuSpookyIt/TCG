import { Game } from "./game";
import { ConsoleInterface } from "./ConsoleInterface";
import { CpuInterface } from "./CpuInterface";
import { IInterfaceUsuario } from "./IInterfaceUsuario";
import { enumClasse } from "./classe.enum";
import { Mago } from "./mago";
import { Ladrao } from "./ladrao";
import { Bardo } from "./bardo";
import { Barbaro } from "./barbaro";
import { Guerreiro } from "./guerreiro";
import {
  gerarBooster,
  escolherCartasBooster,
  exibirBooster,
} from "./draft";
import { ICard } from "./cards/ICard";
import promptSync from "prompt-sync";
import { saveDeck, loadDeck, listDecks } from "./deckStorage";

const prompt = promptSync();

function draftDeck(nome: string, cpu: boolean): ICard[] {
  const deck: ICard[] = [];
  for (let i = 0; i < 10; i++) {
    const booster = gerarBooster();
    if (!cpu) {
      console.log(`Booster ${i + 1} para ${nome}`);
      for (let j = 0; j < 4; j++) {
        exibirBooster(booster);
        const escolha = parseInt(prompt(`Opcao ${j + 1}: `), 10) - 1;
        try {
          deck.push(...escolherCartasBooster(booster, 1, () => escolha));
        } catch {
          console.log("Indice invalido");
          j--;
        }
      }
    } else {
      deck.push(
        ...escolherCartasBooster(booster, 4, (ops) =>
          Math.floor(Math.random() * ops.length)
        )
      );
    }
  }
  return deck;
}

function criarJogador(
  nome: string,
  classe: enumClasse,
  deck?: ICard[]
) {
  switch (classe) {
    case enumClasse.mago:
      return new Mago(nome, deck);
    case enumClasse.ladrao:
      return new Ladrao(nome, deck);
    case enumClasse.bardo:
      return new Bardo(nome, deck);
    case enumClasse.barbaro:
      return new Barbaro(nome, deck);
    default:
      return new Guerreiro(nome, deck);
  }
}

function escolherDeck(nome: string): ICard[] | undefined {
  const decks = listDecks();
  if (decks.length === 0) {
    return undefined;
  }
  console.log(`Escolha um deck para ${nome}:`);
  decks.forEach((d, i) => console.log(`${i + 1} - ${d}`));
  const resp = prompt("Opcao (0 para padrao): ");
  const idx = parseInt(resp, 10) - 1;
  if (idx >= 0 && idx < decks.length) {
    return loadDeck(decks[idx]);
  }
  return undefined;
}

function iniciarJogo(vsCpu: boolean): void {
  const nome1 = prompt("Nome Jogador 1: ");
  const nome2 = vsCpu ? "CPU" : prompt("Nome Jogador 2: ");

  const deck1 = escolherDeck(nome1);
  const deck2 = vsCpu ? undefined : escolherDeck(nome2);

  console.log("Escolha a classe para cada jogador:");
  console.log("1 - Guerreiro");
  console.log("2 - Bardo");
  console.log("3 - Mago");
  console.log("4 - Ladrao");
  console.log("5 - Barbaro");

  const classe1 = (parseInt(prompt("Classe Jogador 1: "), 10) - 1) as enumClasse;
  let classe2: enumClasse;

  let iu1: IInterfaceUsuario = new ConsoleInterface();
  let iu2: IInterfaceUsuario;
  if (vsCpu) {
    classe2 = Math.floor(Math.random() * 5) as enumClasse;
    iu2 = new CpuInterface();
  } else {
    classe2 = (parseInt(prompt("Classe Jogador 2: "), 10) - 1) as enumClasse;
    iu2 = new ConsoleInterface();
  }

  const jogador1 = criarJogador(nome1, classe1, deck1);
  const jogador2 = criarJogador(nome2, classe2, deck2);

  const game = new Game(jogador1, jogador2, iu1, iu2);

  game.iniciarJogo();

  if (game.Vencedor) {
    console.log(`jogador vencedor: ${game.Vencedor.nome}`);
  } else {
    console.log("jogo empatado");
  }
}

function criarDeck(): void {
  const nome = prompt("Nome do deck: ");
  const deck = draftDeck(nome, false);
  saveDeck(nome, deck);
  console.log(`Deck '${nome}' salvo!`);
}

while (true) {
  console.log("1 - Single Player");
  console.log("2 - Multiplayer");
  console.log("3 - Criar Deck");
  console.log("4 - Fechar");
  const opcao = prompt("Opcao: ");
  if (opcao === "1") {
    iniciarJogo(true);
  } else if (opcao === "2") {
    iniciarJogo(false);
  } else if (opcao === "3") {
    criarDeck();
  } else if (opcao === "4") {
    break;
  }
}
