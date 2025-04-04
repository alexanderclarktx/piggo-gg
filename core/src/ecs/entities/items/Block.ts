import {
  Actions, Clickable, Collider, Debug, Effects, Element, Entity, Health, Item, ItemActionParams,
  ItemBuilder, ItemEntity, pixiGraphics, Position, Renderable, XY
} from "@piggo-gg/core"

const width = 18
const height = width / 3 * 2

export const Block = (pos: XY) => Entity({
  id: `block-${pos.x}-${pos.y}`,
  components: {
    position: Position({ ...pos }),
    debug: Debug(),
    element: Element("rock"),
    health: Health({ hp: 50 }),
    collider: Collider({
      shape: "line", isStatic: true, hittable: true, points: [
        0, height + width / 2,
        -width, height,
        0, 2,
        width, height,
        0, height + width / 2,
        // 0, height + width / 2,
        // -width, height,
        // 0, height + width / 2,
        // 0, 0
      ]
    }),
    renderable: Renderable({
      scaleMode: "nearest",
      zIndex: 3,
      scale: 1,
      anchor: { x: 0.5, y: 0 },
      setup: async (r) => {

        // isometric block
        const g = pixiGraphics()
          // hidden lines
          // .moveTo(-width, h)
          // .lineTo(0, 2)
          // .lineTo(width, h)
          // .stroke({ color: 0x00ffff, width: 0.5, alpha: 0.5 })

          // top
          .moveTo(0, 0)
          .lineTo(-width, -width / 2)
          .lineTo(0, -width)
          .lineTo(width, -width / 2)
          .lineTo(0, 0)
          .fill({ color: 0x08ed00, alpha: 1 })
          // .stroke({ color: 0x000000, width: 0.5 })

          // bottom-left
          .moveTo(-width, -width / 2)
          .lineTo(-width, height)
          .lineTo(0, height + width / 2)
          .lineTo(0, 0)
          .fill({ color: 0x7B3F00, alpha: 1 })
          // .stroke({ color: 0x000000, width: 0.5 })

          // bottom-right
          .lineTo(0, height + width / 2)
          .lineTo(width, height)
          .lineTo(width, -width / 2)
          .fill({ color: 0x6E260E, alpha: 1 })
        // .stroke({ color: 0x000000, width: 0.5 })

        r.c.addChild(g)
      }
    })
  }
})

const snap = (pos: XY) => {
  const result = { ...pos }

  const xGap = pos.x % width
  result.x = pos.x - xGap

  const even = result.x % (width * 2) === 0

  const yGap = pos.y % width
  if (even) {
    if (yGap > (width / 2)) {
      result.y = pos.y - yGap + width
    } else {
      result.y = pos.y - yGap
    }
  } else {
    result.y = pos.y - yGap + (width / 2)
  }

  return result
}

export const BlockItem: ItemBuilder = ({ character, id }) => ItemEntity({
  id: id ?? `block-${character.id}`,
  components: {
    position: Position({ follows: character?.id ?? "" }),
    actions: Actions({
      mb1: ({ params, world }) => {
        const { hold, mouse } = params as ItemActionParams
        if (hold) return

        const block = Block(snap(mouse))
        world.addEntity(block)
      }
    }),
    item: Item({ name: "block", flips: false }),
    effects: Effects(),
    clickable: Clickable({ width: 20, height: 20, active: false, anchor: { x: 0.5, y: 0.5 } }),
    renderable: Renderable({
      scaleMode: "nearest",
      zIndex: 3,
      scale: 1,
      anchor: { x: 0.5, y: 0.5 },
      interpolate: true,
      visible: false,
      rotates: false,
      outline: { color: 0x000000, thickness: 1 },
      setup: async (r) => {

        const width = 6
        const h = 4

        // isometric block
        const g = pixiGraphics()
          .lineTo(-width, -width / 2)
          .lineTo(0, -width)
          .lineTo(width, -width / 2)
          .lineTo(0, 0)
          .stroke({ color: 0x00ffff, width: 0.5 })

          .moveTo(-width, -width / 2)

          .lineTo(-width, h)
          .lineTo(0, h + width / 2)

          .stroke({ color: 0xffff00, width: 0.5 })

          .lineTo(width, h)
          .lineTo(width, -width / 2)

          .moveTo(0, 0)
          .lineTo(0, h + width / 2)

          // .rect(0, 0, 16, 16)
          .stroke({ color: 0x00ff00, width: 0.5 })

        r.c.addChild(g)
      }
    })
  }
})
