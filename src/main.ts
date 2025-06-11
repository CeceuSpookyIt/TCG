import { Game } from "./game";
import { Player } from "./player";
import { ConsoleInterface } from "./ConsoleInterface";
import { CpuInterface } from "./CpuInterface";
import { IInterfaceUsuario } from "./IInterfaceUsuario";
import promptSync from "prompt-sync";

const prompt = promptSync();

const modo = prompt("Quantidade de jogadores (1 ou 2): ");
const nome1 = prompt("Nome Jogador 1: ");
let nome2: string;

let iu1: IInterfaceUsuario = new ConsoleInterface();
let iu2: IInterfaceUsuario;
if (modo.trim() === "1") {
  nome2 = "CPU";
  iu2 = new CpuInterface();
} else {
  nome2 = prompt("Nome Jogador 2: ");
  iu2 = new ConsoleInterface();
}

const jogador1 = new Player(nome1);
const jogador2 = new Player(nome2);

const game = new Game(jogador1, jogador2, iu1, iu2);

game.iniciarJogo();

if (game.Vencedor) {
  console.log(`jogador vencedor: ${game.Vencedor.nome}`);
} else {
  console.log("jogo empatado");
}
