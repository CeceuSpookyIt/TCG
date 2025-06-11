import { Game } from "./game";
import { Player } from "./player";
import { ConsoleInterface } from "./ConsoleInterface";
import { CpuInterface } from "./CpuInterface";
import { IInterfaceUsuario } from "./IInterfaceUsuario";
import { enumClasse } from "./classe.enum";
import { Mago } from "./mago";
import { Ladrao } from "./ladrao";
import { Bardo } from "./bardo";
import { Barbaro } from "./barbaro";
import { Guerreiro } from "./guerreiro";
import { gerarBooster, escolherCartasBooster, exibirBooster } from "./draft";
import { ICard } from "./cards/ICard";
import promptSync from "prompt-sync";

const prompt = promptSync();

const modo = prompt("Quantidade de jogadores (1 ou 2): ");
const nome1 = prompt("Nome Jogador 1: ");
let nome2: string;
let ehCpu = false;
if (modo.trim() === "1") {
  nome2 = "CPU";
  ehCpu = true;
} else {
  nome2 = prompt("Nome Jogador 2: ");
}

function draft(nome: string, cpu: boolean): ICard[] {
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

const deck1 = draft(nome1, false);
const deck2 = draft(nome2, ehCpu);

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
if (modo.trim() === "1") {
  classe2 = Math.floor(Math.random() * 5) as enumClasse;
  iu2 = new CpuInterface();
} else {
  classe2 = (parseInt(prompt("Classe Jogador 2: "), 10) - 1) as enumClasse;
  iu2 = new ConsoleInterface();
}

function criarJogador(nome: string, classe: enumClasse, deck: ICard[]): Player {
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

const jogador1 = criarJogador(nome1, classe1, deck1);
const jogador2 = criarJogador(nome2, classe2, deck2);

const game = new Game(jogador1, jogador2, iu1, iu2);

game.iniciarJogo();

if (game.Vencedor) {
  console.log(`jogador vencedor: ${game.Vencedor.nome}`);
} else {
  console.log("jogo empatado");
}
