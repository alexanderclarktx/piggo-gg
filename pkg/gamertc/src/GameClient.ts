import { NetManager } from "./net/NetManager";
import { Game } from "./game/Game";
import { Renderer } from "./graphics/Renderer";

export class GameClient {
  net: NetManager;
  game?: Game;
  renderer: Renderer;

  constructor(net: NetManager, game: Game|undefined = undefined, renderer: Renderer) {
    this.net = net;
    this.game = game;
    this.renderer = renderer;
  }
}
