import { NetManager } from './net/netmanager';
import { Game } from './game/game';
import { Renderer } from './graphics/renderer';

export class GameRTC {
  net: NetManager;
  game?: Game;
  renderer: Renderer;

  constructor(net: NetManager, game: Game|undefined = undefined, renderer: Renderer) {
    this.net = net;
    this.game = game;
    this.renderer = renderer;
  }
}
