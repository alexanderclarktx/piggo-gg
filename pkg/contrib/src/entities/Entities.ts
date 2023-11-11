import { Component, Entity,  Game, GameProps, Renderer } from "@piggo-legends/core";
import { Floor, Position, TextBox, TapButton, SwitchButton, Networked, Clickable, Renderable, Actions, Character, CarMovement, playerControlsEntity, Controller, CharacterMovement, CarMovementCommands, CharacterMovementCommands } from "@piggo-legends/contrib";
import { Assets, Text, AnimatedSprite } from "pixi.js";

export const Skelly = async (
  renderer: Renderer,
  id: string,
  tint?: number
): Promise<Entity> => {
  const skellyAssets = await Assets.load("chars.json");

  const character = new Entity({
    id: id,
    components: {
      position: new Position(300, 300),
      networked: new Networked({ isNetworked: true }),
      clickable: new Clickable({
        width: 32,
        height: 32,
        active: true,
        onPress: "click"
      }),
      controller: new Controller<CharacterMovementCommands>({
        "a,d": "", "w,s": "",
        "w,a": "upleft", "w,d": "upright", "s,a": "downleft", "s,d": "downright",
        "w": "up", "s": "down", "a": "left", "d": "right"
      }),
      actions: new Actions({
        ...CharacterMovement,
        "click": playerControlsEntity
      }),
      renderable: new Character({
        renderer: renderer,
        animations: {
          d: new AnimatedSprite([skellyAssets.textures["d1"], skellyAssets.textures["d2"], skellyAssets.textures["d3"]]),
          u: new AnimatedSprite([skellyAssets.textures["u1"], skellyAssets.textures["u2"], skellyAssets.textures["u3"]]),
          l: new AnimatedSprite([skellyAssets.textures["l1"], skellyAssets.textures["l2"], skellyAssets.textures["l3"]]),
          r: new AnimatedSprite([skellyAssets.textures["r1"], skellyAssets.textures["r2"], skellyAssets.textures["r3"]]),
          dl: new AnimatedSprite([skellyAssets.textures["dl1"], skellyAssets.textures["dl2"], skellyAssets.textures["dl3"]]),
          dr: new AnimatedSprite([skellyAssets.textures["dr1"], skellyAssets.textures["dr2"], skellyAssets.textures["dr3"]]),
          ul: new AnimatedSprite([skellyAssets.textures["ul1"], skellyAssets.textures["ul2"], skellyAssets.textures["ul3"]]),
          ur: new AnimatedSprite([skellyAssets.textures["ur1"], skellyAssets.textures["ur2"], skellyAssets.textures["ur3"]])
        },
        track: true,
        scale: 2,
        zIndex: 2,
        tintColor: tint ?? 0xffffff
      })
    }
  });
  return character;
}

export const Spaceship = async (
  renderer: Renderer,
  id: string = "spaceship",
  components?: Record<string, Component<string>>
): Promise<Entity> => {
  const spaceship = await Assets.load("spaceship.json");

  return new Entity({
    id: id,
    components: {
      ...components,
      position: new Position(100, 300),
      networked: new Networked({isNetworked: true}),
      clickable: new Clickable({
        width: 100,
        height: 120,
        active: true,
        onPress: "click"
      }),
      controller: new Controller<CarMovementCommands>({
        "a,d": "", "w,s": "",
        "shift,a": "skidleft", "shift,d": "skidright",
        "w": "up", "s": "down", "a": "left", "d": "right"
      }),
      actions: new Actions({
        ...CarMovement,
        "click": playerControlsEntity
      }),
      renderable: new Character({
        renderer: renderer,
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
  })
}

export const Ball = (
  renderer: Renderer,
  id: string = "ball",
  components?: Record<string, Component<string>>
): Entity => {
  return new Entity({
    id: id,
    components: {
      ...components,
      position: new Position(400, 500),
      networked: new Networked({isNetworked: true}),
      clickable: new Clickable({
        width: 32,
        height: 32,
        active: true,
        onPress: "click"
      }),
      actions: new Actions({
        "click": (entity: Entity) => {
          const t = (entity.components.renderable as TextBox).c as Text;
          t.text = "🙃";
        }
      }),
      renderable: new Renderable({
        renderer: renderer,
        debuggable: true,
        zIndex: 1,
        container: new Text("🏀", { fill: "#FFFFFF", fontSize: 16 }),
      })
    }
  })
}

export const DebugButton = (
  renderer: Renderer,
  id: string = "debugButton",
  components?: Record<string, Component<string>>
): Entity => {
  return new Entity({
    id: id,
    components: {
      position: new Position(0, 0),
      renderable: new SwitchButton({
        renderer: renderer,
        dims: { w: 32, textX: 7, textY: 5 },
        cameraPos: { x: 5, y: 5 },
        zIndex: 1,
        text: (new Text("🐞", { fill: "#FFFFFF", fontSize: 18 })),
        onPress: () => {
          renderer.debug = true;
          renderer.events.emit("debug");
        },
        onDepress: () => {
          renderer.debug = false;
          renderer.events.emit("debug");
        }
      })
    }
  })
}

export const FullscreenButton = (
  renderer: Renderer,
  id: string = "fullscreenButton",
  components?: Record<string, Component<string>>
): Entity => {
  return new Entity({
    id: id,
    components: {
      ...components,
      position: new Position(0, 0),
      renderable: new TapButton({
        renderer: renderer,
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
  })
}

export const FpsText = (
  renderer: Renderer,
  id: string = "fpsText",
  components?: Record<string, Component<string>>
): Entity => {
  return new Entity({
    id: id,
    components: {
      ...components,
      position: new Position(0, 0),
      renderable: new TextBox({
        renderer: renderer,
        cameraPos: { x: -35, y: 5 },
        color: 0xFFFF00,
        zIndex: 1,
        dynamic: (t: Text) => {
          t.text = Math.round(renderer.app.ticker.FPS);
        },
      })
    }
  })
}

export const TileFloor = async (
  renderer: Renderer,
  id: string = "tileFloor",
  components?: Record<string, Component<string>>
): Promise<Entity> => {
  const sandbox = await Assets.load("sandbox.json");

  return new Entity({
    id: id,
    components: {
      ...components,
      position: new Position(0, 0),
      renderable: new Floor({
        renderer: renderer,
        width: 25,
        height: 25,
        texture: sandbox.textures["green"],
        scale: 2,
        tint: 0x1199ff,
        zIndex: 0
      })
    }
  })
}
