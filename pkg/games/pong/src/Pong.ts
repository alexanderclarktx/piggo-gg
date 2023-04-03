import { Entity, Game, Renderer, System, Button, Character, Floor, TextBox } from "@piggo-legends/gamertc";
import { Text, Texture, AnimatedSprite, Assets } from "pixi.js";

export class Pong extends Game {

  constructor(renderer: Renderer) {
    super({
      renderer: renderer,
      systems: [],
      entities: []
    });
    this.init();
    window["renderer"] = this.renderer;
  }

  init = async () => {
    // floor
    const sandbox = await Assets.load("sandbox.json");
    const floorTexture = await Texture.fromURL("dirt.png");
    this.renderer.addWorld(new Floor(this.renderer, {
      width: 25,
      height: 25,
      texture: sandbox.textures["green"],
      scale: 2,
      tint: 0x1199ff
    }));

    const char = await Assets.load("chars.json");
    this.renderer.addWorld(new Character(this.renderer, {
      animations: {
        d: new AnimatedSprite([char.textures["d1"], char.textures["d2"], char.textures["d3"]]),
        u: new AnimatedSprite([char.textures["u1"], char.textures["u2"], char.textures["u3"]]),
        l: new AnimatedSprite([char.textures["l1"], char.textures["l2"], char.textures["l3"]]),
        r: new AnimatedSprite([char.textures["r1"], char.textures["r2"], char.textures["r3"]]),
        dl: new AnimatedSprite([char.textures["dl1"], char.textures["dl2"], char.textures["dl3"]]),
        dr: new AnimatedSprite([char.textures["dr1"], char.textures["dr2"], char.textures["dr3"]]),
        ul: new AnimatedSprite([char.textures["ul1"], char.textures["ul2"], char.textures["ul3"]]),
        ur: new AnimatedSprite([char.textures["ur1"], char.textures["ur2"], char.textures["ur3"]])
      },
      enableControls: true,
      track: true,
      pos: { x: 300, y: 400 },
      scale: 2,
    }));

    // spaceship
    const spaceship = await Assets.load("spaceship.json");
    this.renderer.addWorld(new Character(this.renderer, {
      animations: {
        d: new AnimatedSprite([spaceship.textures["spaceship"]]),
        u: new AnimatedSprite([spaceship.textures["spaceship"]]),
        l: new AnimatedSprite([spaceship.textures["spaceship"]]),
        r: new AnimatedSprite([spaceship.textures["spaceship"]]),
        dl: new AnimatedSprite([spaceship.textures["spaceship"]]),
        dr: new AnimatedSprite([spaceship.textures["spaceship"]]),
        ul: new AnimatedSprite([spaceship.textures["spaceship"]]),
        ur: new AnimatedSprite([spaceship.textures["spaceship"]])
      },
      enableControls: false,
      track: false,
      pos: { x: 100, y: 400 },
      scale: 1.5,
    }));

    // fps text box
    this.renderer.addHUD(new TextBox(this.renderer, {
      dynamic: (text: Text) => {
        text.text = Math.round(this.renderer.app.ticker.FPS);
      }
    }));

    // fullscreen button
    this.renderer.addHUD(new Button(this.renderer, {
      dims: { x: 690, y: 5, w: 37, lx: 10, ly: 5 },
      text: (new Text("⚁", { fill: "#FFFFFF", fontSize: 16 })),
      onPress: () => {
        //@ts-ignore
        this.renderer.app.view.requestFullscreen();
      },
      onDepress: () => { }
    }));

    // debug button
    this.renderer.addHUD(new Button(this.renderer, {
      dims: { x: 735, y: 5, w: 60, lx: 10, ly: 7 },
      text: (new Text("debug", { fill: "#FFFFFF", fontSize: 14 })),
      onPress: () => {
        this.renderer.debug = true;
        this.renderer.events.emit("debug");
      },
      onDepress: () => {
        this.renderer.debug = false;
        this.renderer.events.emit("debug");
      }
    }));
  }
}
