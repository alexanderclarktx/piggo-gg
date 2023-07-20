import { Entity, EntityProps, Game, GameProps } from "@piggo-legends/core";
import { Floor, TextBox, DebugSystem, RenderSystem, Character, Controller, InputSystem, Actions, Renderable, Position, CharacterMovement, CarMovement, SwitchButton, TapButton, Interactive, InteractiveSystem, RenderableProps, CharacterProps } from "@piggo-legends/contrib";
import { Text, Assets, SCALE_MODES, AnimatedSprite } from "pixi.js";

export type PlaygroundProps = GameProps & {}

export class Playground extends Game<PlaygroundProps> {

  constructor(props: PlaygroundProps) {
    super({
      ...props,
      systems: [
        new RenderSystem({ renderer: props.renderer }),
        new DebugSystem({ renderer: props.renderer }),
        new InputSystem({ renderer: props.renderer }),
        new InteractiveSystem({ renderer: props.renderer })
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
        renderable: new TapButton({
          renderer: this.props.renderer,
          dims: { w: 37, textX: 10, textY: 5 },
          cameraPos: { x: 70, y: 5 },
          zIndex: 1,
          text: (new Text("⚁", { fill: "#FFFFFF", fontSize: 16 })),
          onPress: (b: TapButton) => {
            console.log(document.fullscreenElement);
            if (!document.fullscreenElement) {
              //@ts-ignore
              b.props.renderer.app.view.requestFullscreen();
            } else {
              document.exitFullscreen();
            }
          }
        })
      }
    }));

    // debug button
    this.addEntity(new Entity({
      id: "debugButton", renderer: this.props.renderer, networked: false,
      components: {
        renderable: new SwitchButton({
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
          map: {
            "a,d": "", "w,s": "",
            "w,a": "upleft", "w,d": "upright", "s,a": "downleft", "s,d": "downright",
            "w": "up", "s": "down", "a": "left", "d": "right"
          },
          active: true
        }),
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
        interactive: new Interactive({
          active: true,
          bounds: { x: 50, y: 240, w: 100, h: 120 },
          onPress: (e: Entity<EntityProps>, g: Game<GameProps>) => {
            // const r = e.props.components.renderable as Character;
            // r.currentAnimation.tint = 0x0000cc;

            const spaceshipController = e.props.components.controller as Controller;
            spaceshipController.active = true;

            const skelly = g.props.entities["skelly1"] as Entity<EntityProps>;
            const skellyController = skelly.props.components.controller as Controller;
            skellyController.active = false;

            g.props.renderer.trackCamera(e.props.components.renderable as Renderable<RenderableProps>);
          }
        }),
        controller: new Controller({
          map: {
            "a,d": "", "w,s": "",
            "shift,a": "skidleft", "shift,d": "skidright",
            "w": "up", "s": "down", "a": "left", "d": "right"
          },
          active: false
        }),
        actions: new Actions(CarMovement),
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
