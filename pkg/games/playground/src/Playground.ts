import {
  TextBox, DebugSystem, RenderSystem, Character, Controller,
  InputSystem, Actions, Renderable, Position, CarMovement, SwitchButton,
  TapButton, Interactive, InteractiveSystem, NetcodeSystem, PlayerSpawnSystem,
  Player, playerControlsEntity, Networked, Floor
} from "@piggo-legends/contrib";
import { Entity, EntityProps, Game, GameProps } from "@piggo-legends/core";
import { Text, Assets, AnimatedSprite } from "pixi.js";

const randomName = `player${(Math.random() * 100).toFixed(0)}`;

export type PlaygroundProps = GameProps & {}

export class Playground extends Game<PlaygroundProps> {

  constructor(props: PlaygroundProps) {
    super({
      ...props,
      systems: [
        new RenderSystem({ renderer: props.renderer }),
        new DebugSystem({ renderer: props.renderer }),
        new InputSystem({ renderer: props.renderer, player: randomName }),
        new InteractiveSystem({ renderer: props.renderer, player: randomName }),
        new NetcodeSystem({ renderer: props.renderer, net: props.net, player: randomName }),
        new PlayerSpawnSystem({ renderer: props.renderer, player: randomName })
      ]
    });
    this.addPlayer();
    this.addUI();
    this.addGameObjects();
  }

  addPlayer = () => {
    this.addEntity(new Entity({
      id: randomName,
      components: {
        networked: new Networked({isNetworked: true}),
        player: new Player({name: randomName}),
      }
    }));
  }

  addUI = () => {
    // fpsText
    this.addEntity(new Entity({
      id: "fpsText", renderer: this.props.renderer,
      components: {
        position: new Position(0, 0),
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
      id: "fullscreenButton", renderer: this.props.renderer,
      components: {
        position: new Position(0, 0),
        renderable: new TapButton({
          renderer: this.props.renderer,
          dims: { w: 32, textX: 8, textY: 5 },
          cameraPos: { x: 40, y: 5 },
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
      id: "debugButton", renderer: this.props.renderer,
      components: {
        position: new Position(0, 0),
        renderable: new SwitchButton({
          renderer: this.props.renderer,
          dims: { w: 32, textX: 7, textY: 5 },
          cameraPos: { x: 5, y: 5 },
          zIndex: 1,
          text: (new Text("🐞", { fill: "#FFFFFF", fontSize: 18 })),
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
  }

  addGameObjects = async () => {
    // floor
    const sandbox = await Assets.load("sandbox.json");
    this.addEntity(new Entity({
      id: "floor", renderer: this.props.renderer,
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
      id: "ball",
      renderer: this.props.renderer,
      components: {
        position: new Position(400, 500),
        networked: new Networked({isNetworked: true}),
        interactive: new Interactive({
          width: 32,
          height: 32,
          active: true,
          onPress: "click"
        }),
        actions: new Actions({
          "click": (entity: Entity<EntityProps>, game: Game<GameProps>, player: string) => {
            const t = (entity.components.renderable as TextBox).c as Text;
            t.text = "🙃";
          }
        }),
        renderable: new Renderable({
          renderer: this.props.renderer,
          debuggable: true,
          zIndex: 1,
          container: new Text("🏀", { fill: "#FFFFFF", fontSize: 16 }),
        })
      }
    }));

    // spaceship
    const spaceship = await Assets.load("spaceship.json");
    this.addEntity(new Entity({
      id: "spaceship",
      renderer: this.props.renderer,
      components: {
        position: new Position(100, 300),
        networked: new Networked({isNetworked: true}),
        interactive: new Interactive({
          width: 100,
          height: 120,
          active: true,
          onPress: "click"
        }),
        controller: new Controller({
          map: {
            "a,d": "", "w,s": "",
            "shift,a": "skidleft", "shift,d": "skidright",
            "w": "up", "s": "down", "a": "left", "d": "right"
          },
        }),
        actions: new Actions({
          ...CarMovement,
          "click": playerControlsEntity
        }),
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
          zIndex: 3
        })
      }
    }));
  }
}
