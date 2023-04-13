import { Game, GameProps } from "@piggo-legends/core";
import { Skelly, Spaceship, Button, Floor, TextBox, DebugSystem } from "@piggo-legends/contrib";
import { Text, Assets } from "pixi.js";

export type PongProps = GameProps & {}

export class Pong extends Game<PongProps> {

  constructor(props: PongProps) {
    super({
      ...props,
      entities: [
        new Skelly({renderer: props.renderer, networked: true, enableControls: true, track: true}),
        new Spaceship({renderer: props.renderer})
      ],
      systems: [
        new DebugSystem({renderer: props.renderer})
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
    this.props.renderer.addWorld(new TextBox({
      renderer: this.props.renderer,
      cameraPosition: {x: 0, y: 5},
      dynamic: (c: Text) => {
        c.text = Math.round(this.props.renderer.app.ticker.FPS);
      }
    }));

    // fullscreen button
    this.props.renderer.addWorld(new Button({
      renderer: this.props.renderer,
      cameraPosition: {x: 695, y: 5},
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
    this.props.renderer.addWorld(new Button({
      renderer: this.props.renderer,
      cameraPosition: {x: 735, y: 5},
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
