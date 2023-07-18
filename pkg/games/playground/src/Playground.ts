import { Entity, Game, GameProps } from "@piggo-legends/core";
import { Button, Floor, TextBox, DebugSystem, RenderSystem, Character, Controller, InputSystem, Actions, Renderable, Position, CharacterMovement } from "@piggo-legends/contrib";
import { Text, Assets, SCALE_MODES, AnimatedSprite } from "pixi.js";

export type PlaygroundProps = GameProps & {}

export class Playground extends Game<PlaygroundProps> {

  constructor(props: PlaygroundProps) {
    super({
      ...props,
      systems: [
        new RenderSystem({ renderer: props.renderer }),
        new DebugSystem({ renderer: props.renderer }),
        new InputSystem({ renderer: props.renderer })
      ]
    });
    this.init();
  }

  init = async () => {
    // fpsText
    this.addEntity(new Entity({
      id: "fpsText", renderer: this.props.renderer, networked: false,
      components: {
        renderable: new TextBox({
          renderer: this.props.renderer,
          cameraPos: { x: -35, y: 5 },
          color: 0xFFFF00,
          zIndex: 1,
          dynamic: (t: Text) => {
            t.text = Math.round(this.props.renderer.app.ticker.FPS);
          },
        })
      }
    }));

    // fullscreen button
    this.addEntity(new Entity({
      id: "fullscreenButton", renderer: this.props.renderer, networked: false,
      components: {
        renderable: new Button({
          renderer: this.props.renderer,
          dims: { w: 37, textX: 10, textY: 5 },
          cameraPos: { x: 70, y: 5 },
          zIndex: 1,
          text: (new Text("⚁", { fill: "#FFFFFF", fontSize: 16 })),
          onPress: () => {
            //@ts-ignore
            props.renderer.app.view.requestFullscreen();
          },
          onDepress: () => {
            //@ts-ignore
            document.exitFullscreen();
          }
        })
      }
    }));

    // debug button
    this.addEntity(new Entity({
      id: "debugButton", renderer: this.props.renderer, networked: false,
      components: {
        renderable: new Button({
          renderer: this.props.renderer,
          dims: { w: 59, textX: 10, textY: 7 },
          cameraPos: { x: 5, y: 5 },
          zIndex: 1,
          text: (new Text("debug", { fill: "#FFFFFF", fontSize: 14 })),
          onPress: () => {
            this.props.renderer.debug = true;
            this.props.renderer.events.emit("debug");
          },
          onDepress: () => {
            this.props.renderer.debug = false;
            this.props.renderer.events.emit("debug");
          }
        })
      }
    }));

    // floor
    const sandbox = await Assets.load("sandbox.json");
    this.addEntity(new Entity({
      id: "floor", renderer: this.props.renderer, networked: false,
      components: {
        position: new Position(0, 0),
        renderable: new Floor({
          renderer: this.props.renderer,
          width: 25,
          height: 25,
          texture: sandbox.textures["green"],
          scale: 2,
          tint: 0x1199ff,
          zIndex: 0
        })
      }
    }));

    // ball
    this.addEntity(new Entity({
      id: "ball", renderer: this.props.renderer, networked: false,
      components: {
        renderable: new Renderable({
          renderer: this.props.renderer,
          debuggable: true,
          pos: { x: 50, y: 50 },
          zIndex: 1,
          container: new Text("🏀", { fill: "#FFFFFF", fontSize: 16 }),
        })
      }
    }));

    // skelly
    const chars = await Assets.load("chars.json");
    for (const key in chars.textures) {
      chars.textures[key].baseTexture.scaleMode = SCALE_MODES.NEAREST;
    }
    this.addEntity(new Entity({
      id: "skelly1", renderer: this.props.renderer, networked: false,
      components: {
        position: new Position(300, 300),
        controller: new Controller({
          "w,a": "upleft",
          "w,d": "upright",
          "s,a": "downleft",
          "s,d": "downright",
          "w": "up",
          "s": "down",
          "a": "left",
          "d": "right"
        }, true),
        actions: new Actions(CharacterMovement),
        renderable: new Character({
          renderer: this.props.renderer,
          animations: {
            d: new AnimatedSprite([chars.textures["d1"], chars.textures["d2"], chars.textures["d3"]]),
            u: new AnimatedSprite([chars.textures["u1"], chars.textures["u2"], chars.textures["u3"]]),
            l: new AnimatedSprite([chars.textures["l1"], chars.textures["l2"], chars.textures["l3"]]),
            r: new AnimatedSprite([chars.textures["r1"], chars.textures["r2"], chars.textures["r3"]]),
            dl: new AnimatedSprite([chars.textures["dl1"], chars.textures["dl2"], chars.textures["dl3"]]),
            dr: new AnimatedSprite([chars.textures["dr1"], chars.textures["dr2"], chars.textures["dr3"]]),
            ul: new AnimatedSprite([chars.textures["ul1"], chars.textures["ul2"], chars.textures["ul3"]]),
            ur: new AnimatedSprite([chars.textures["ur1"], chars.textures["ur2"], chars.textures["ur3"]])
          },
          track: true,
          scale: 2,
          zIndex: 2
        })
      }
    }));

    // spaceship
    const spaceship = await Assets.load("spaceship.json");
    this.addEntity(new Entity({
      id: "spaceship", renderer: this.props.renderer, networked: false,
      components: {
        position: new Position(100, 300),
        renderable: new Character({
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
          track: false,
          scale: 2,
          zIndex: 1
        })
      }
    }));
  }
}
