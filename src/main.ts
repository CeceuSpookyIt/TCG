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
import promptSync from "prompt-sync";

const prompt = promptSync();

const modo = prompt("Quantidade de jogadores (1 ou 2): ");

console.log("Escolha a classe para cada jogador:");
console.log("1 - Guerreiro");
console.log("2 - Bardo");
console.log("3 - Mago");
console.log("4 - Ladrao");
console.log("5 - Barbaro");

const classe1 = (parseInt(prompt("Classe Jogador 1: "), 10) - 1) as enumClasse;
const nome1 = prompt("Nome Jogador 1: ");
let classe2: enumClasse;
let nome2: string;

let iu1: IInterfaceUsuario = new ConsoleInterface();
let iu2: IInterfaceUsuario;
if (modo.trim() === "1") {
  classe2 = Math.floor(Math.random() * 5) as enumClasse;
  nome2 = "CPU";
  iu2 = new CpuInterface();
} else {
  classe2 = (parseInt(prompt("Classe Jogador 2: "), 10) - 1) as enumClasse;
  nome2 = prompt("Nome Jogador 2: ");
  iu2 = new ConsoleInterface();
}

function criarJogador(nome: string, classe: enumClasse): Player {
  switch (classe) {
    case enumClasse.mago:
      return new Mago(nome);
    case enumClasse.ladrao:
      return new Ladrao(nome);
    case enumClasse.bardo:
      return new Bardo(nome);
    case enumClasse.barbaro:
      return new Barbaro(nome);
    default:
      return new Guerreiro(nome);
  }
}

const jogador1 = criarJogador(nome1, classe1);
const jogador2 = criarJogador(nome2, classe2);

const game = new Game(jogador1, jogador2, iu1, iu2);

game.iniciarJogo();

if (game.Vencedor) {
  console.log(`jogador vencedor: ${game.Vencedor.nome}`);
} else {
  console.log("jogo empatado");
}
