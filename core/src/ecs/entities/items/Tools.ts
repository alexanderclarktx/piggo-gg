import {
  Actions, Character, Effects, ElementKinds, Item, Name,
  Renderable, SpawnHitbox, ValidSounds, Whack, XYdifferent,
  abs, hypot, loadTexture, min, mouseScreen, randomInt
} from "@piggo-gg/core"
import { Sprite } from "pixi.js"

type ElementToDamage = Record<ElementKinds, number>

export const Tool = (name: string, sound: ValidSounds, damage: ElementToDamage) => (character: Character): Item => {

  let mouseLast = { x: 0, y: 0 }

  const tool = Item({
    id: `${character.id}-${name}-${randomInt(1000)}`,
    components: {
      name: Name(name),
      position: character.components.position,
      actions: Actions<any>({
        "mb1": Whack(sound, (e => {
          const { element } = e.components
          return damage[element?.data.kind ?? "flesh"]
        })),
        "spawnHitbox": SpawnHitbox
      }),
      effects: Effects(),
      renderable: Renderable({
        scaleMode: "nearest",
        zIndex: character.components.renderable.zIndex,
        scale: 2.5,
        anchor: { x: 0.5, y: 0.5 },
        interpolate: true,
        visible: false,
        rotates: true,
        dynamic: (_, r) => {
          const { pointingDelta, rotation } = character.components.position.data

          if (rotation) {
            character.components.position.rotateDown(rotation > 0 ? 0.1 : -0.1, true)
          }

          if (XYdifferent(mouseScreen, mouseLast)) {

            const hypotenuse = hypot(pointingDelta.x, pointingDelta.y)

            const hyp_x = pointingDelta.x / hypotenuse
            const hyp_y = pointingDelta.y / hypotenuse

            r.position = {
              x: hyp_x * min(20, abs(pointingDelta.x)),
              y: hyp_y * min(20, abs(pointingDelta.y)) - 5
            }

            const flip = pointingDelta.x > 0 ? 1 : -1
            r.setScale({ x: flip, y: 1 })
          }

          mouseLast = mouseScreen
        },
        setup: async (r: Renderable) => {
          const textures = await loadTexture(`${name}.json`)

          r.c = new Sprite(textures["0"])

          r.setOutline(0x000000)
        }
      })
    }
  })
  return tool
}

export const Axe = Tool("axe", "thud", {flesh: 15, wood: 25, rock: 10})
export const Sword = Tool("sword", "slash", {flesh: 25, wood: 10, rock: 10})
export const Pickaxe = Tool("pickaxe", "clink", {flesh: 10, wood: 10, rock: 25})
