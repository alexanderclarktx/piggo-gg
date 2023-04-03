import { Game, Button, Character, Floor, TextBox, GameProps } from "@piggo-legends/gamertc";
import { Text, AnimatedSprite, Assets } from "pixi.js";

export type PongProps = GameProps & {}

export class Pong extends Game<PongProps> {

  constructor(props: PongProps) {
    super(props);
    this.init();
    (window as any).renderer = this.props.renderer;
  }

  init = async () => {
    // floor
    const sandbox = await Assets.load("sandbox.json");
    this.props.renderer.addWorld(new Floor({
      renderer: this.props.renderer,
      width: 25,
      height: 25,
      texture: sandbox.textures["green"],
      scale: 2,
      tint: 0x1199ff
    }));

    // character
    const char = await Assets.load("chars.json");
    this.props.renderer.addWorld(new Character({
      renderer: this.props.renderer,
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
    this.props.renderer.addWorld(new Character({
      renderer: this.props.renderer,
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
    this.props.renderer.addHUD(new TextBox({
      renderer: this.props.renderer,
      dynamic: (text: Text) => {
        text.text = Math.round(this.props.renderer.app.ticker.FPS);
      }
    }));

    // fullscreen button
    this.props.renderer.addHUD(new Button({
      renderer: this.props.renderer,
      dims: { w: 37, textX: 10, textY: 5 },
      pos: { x: 690, y: 5 },
      text: (new Text("⚁", { fill: "#FFFFFF", fontSize: 16 })),
      onPress: () => {
        //@ts-ignore
        this.props.renderer.app.view.requestFullscreen();
      },
      onDepress: () => { }
    }));

    // debug button
    this.props.renderer.addHUD(new Button({
      renderer: this.props.renderer,
      pos: { x: 735, y: 5 },
      dims: { w: 60, textX: 10, textY: 7 },
      text: (new Text("debug", { fill: "#FFFFFF", fontSize: 14 })),
      onPress: () => {
        this.props.renderer.debug = true;
        this.props.renderer.events.emit("debug");
        this.props.renderer.addHUD(new TextBox(
          {
            renderer: this.props.renderer,
            text: "hi",
            pos: { x: 50, y: 100 },
            timeout: 1000
          }
        ));
      },
      onDepress: () => {
        this.props.renderer.debug = false;
        this.props.renderer.events.emit("debug");
      }
    }));
  }
}
