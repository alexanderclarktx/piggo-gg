import { Skelly, Spaceship, Game, Button, Floor, TextBox, GameProps } from "@piggo-legends/gamertc";
import { Text, Assets } from "pixi.js";

export type PongProps = GameProps & {}

export class Pong extends Game<PongProps> {

  constructor(props: PongProps) {
    super({
      ...props,
      entities: [
        new Skelly({renderer: props.renderer, networked: true, enableControls: true, track: true}),
        new Spaceship({renderer: props.renderer})
      ]
    });
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
      onDepress: () => {
        document.exitFullscreen();
      }
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
      },
      onDepress: () => {
        this.props.renderer.debug = false;
        this.props.renderer.events.emit("debug");
      }
    }));
  }
}
