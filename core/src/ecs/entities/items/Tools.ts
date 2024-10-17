import {
  Actions, Character, Clickable, Debug, Equip, Effects, ElementKinds, Item, Name,
  PickupItem, Position, Renderable, SpawnHitbox, ValidSounds, Whack, XY, XYdifferent,
  abs, hypot, loadTexture, min, mouseScreen, randomInt
} from "@piggo-gg/core"
import { Sprite } from "pixi.js"

type ElementToDamage = Record<ElementKinds, number>

export const dynamicItem = ({ mouseLast, flip }: { mouseLast: XY, flip: boolean }) => async (_: any, r: Renderable, item: Item) => {
  const { pointingDelta, rotation, follows } = item.components.position.data
  if (!follows) return

  if (rotation) {
    item.components.position.rotateDown(rotation > 0 ? 0.1 : -0.1, true)
  }

  if (!item.components.equip.dropped) {

    if (XYdifferent(mouseScreen, mouseLast)) {

      const hypotenuse = hypot(pointingDelta.x, pointingDelta.y)

      const hyp_x = pointingDelta.x / hypotenuse
      const hyp_y = pointingDelta.y / hypotenuse

      // TODO use some kind of follow-offset mechanism on Position (to get piggos to chase)
      r.position = {
        x: hyp_x * min(20, abs(pointingDelta.x)),
        y: hyp_y * min(20, abs(pointingDelta.y)) - 5
      }

      const xScale = flip ?
        pointingDelta.x > 0 ? 1 : -1
        : 1
      r.setScale({ x: xScale, y: 1 })
    }

    mouseLast = mouseScreen
  }
}

export const Tool = (name: string, sound: ValidSounds, damage: ElementToDamage) => (character: Character): Item => {

  let mouseLast = { x: 0, y: 0 }

  const tool = Item({
    id: `${name}-${randomInt(1000)}`,
    components: {
      name: Name(name),
      position: Position({ follows: character.id }),
      actions: Actions({
        mb1: Whack(sound, (e => {
          const { element } = e.components
          return damage[element?.data.kind ?? "flesh"]
        })),
        spawnHitbox: SpawnHitbox,
        pickup: PickupItem
      }),
      equip: Equip(),
      effects: Effects(),
      clickable: Clickable({
        width: 20, height: 20, active: true, anchor: { x: 0.5, y: 0.5 },
        click: () => ({ action: "pickup" }),
        hoverOver: () => {
          tool.components.renderable.setOutline(0xffffff, 2)
        },
        hoverOut: () => {
          tool.components.renderable.setOutline(0x000000, 1)
        },
      }),
      debug: Debug(),
      renderable: Renderable({
        scaleMode: "nearest",
        zIndex: character.components.renderable.zIndex,
        scale: 2.5,
        anchor: { x: 0.5, y: 0.5 },
        interpolate: true,
        visible: false,
        rotates: true,
        dynamic: dynamicItem({ mouseLast, flip: true }),
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

export const Axe = Tool("axe", "thud", { flesh: 15, wood: 25, rock: 10 })
export const Sword = Tool("sword", "slash", { flesh: 25, wood: 10, rock: 10 })
export const Pickaxe = Tool("pickaxe", "clink", { flesh: 10, wood: 10, rock: 25 })
