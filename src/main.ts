import { Game } from "./game";
import { Player } from "./player";
import { ConsoleInterface } from "./ConsoleInterface";
import promptSync from "prompt-sync";

const prompt = promptSync();

const nome1 = prompt("Nome Jogador 1: ");
const nome2 = prompt("Nome Jogador 2: ");

const jogador1 = new Player(nome1);
const jogador2 = new Player(nome2);

const iu = new ConsoleInterface();
const game = new Game(jogador1, jogador2, iu);

game.iniciarJogo();

if (game.Vencedor) {
  console.log(`jogador vencedor: ${game.Vencedor.nome}`);
} else {
  console.log("jogo empatado");
}
