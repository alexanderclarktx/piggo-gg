import {
  Actions, Clickable, Collider, Debug, Effects, Element, Entity,
  Health, Item, ItemActionParams, ItemBuilder, ItemEntity, mouse,
  pixiGraphics, Position, Renderable, round, values, World, XY, XYZ
} from "@piggo-gg/core"

const width = 18
const height = width / 3 * 2

export const Block = (pos: XYZ) => Entity({
  id: `block-${pos.x}-${pos.y}-${pos.z}`,
  components: {
    position: Position({ ...pos }),
    debug: Debug(),
    element: Element("rock"),
    health: Health({ hp: 50 }),
    collider: Collider({
      shape: "line",
      isStatic: true,
      hittable: true,
      group: (pos.z / 21 + 1).toString() as "1" | "2" | "3",
      points: [
        0, height + width / 2,
        -width, height,
        0, 3,
        width, height,
        0, height + width / 2
      ]
    }),
    renderable: Renderable({
      scaleMode: "nearest",
      zIndex: 3 + (pos.z / 21) / 10,
      anchor: { x: 0.5, y: 0 },
      position: { x: 0, y: height },
      setup: async (r) => {
        const g = pixiGraphics()

          // top
          .moveTo(0, 0)
          .lineTo(-width, -width / 2)
          .lineTo(0, -width)
          .lineTo(width, -width / 2)
          .lineTo(0, 0)
          .fill({ color: 0x08dd00, alpha: 1 })

          // bottom-left
          .moveTo(-width, -width / 2)
          .lineTo(-width, height)
          .lineTo(0, height + width / 2)
          .lineTo(0, 0)
          .fill({ color: 0x6E260E, alpha: 1 })

          // bottom-right
          .lineTo(0, height + width / 2)
          .lineTo(width, height)
          .lineTo(width, -width / 2)
          .fill({ color: 0x7B3F00, alpha: 1 })

        g.position.y = -height

        r.c.addChild(g)
      }
    })
  }
})

export const snapXY = (pos: XY): XY => {
  const half = width / 2

  // Convert to isometric grid coords (skewed grid space)
  const gridX = (pos.x / width + pos.y / half) / 2
  const gridY = (pos.y / half - pos.x / width) / 2

  // Snap to nearest tile
  const tileX = round(gridX)
  const tileY = round(gridY)

  // Convert back to screen position (center of tile)
  const snappedX = (tileX - tileY) * width
  const snappedY = (tileX + tileY) * half - height

  return { x: snappedX, y: snappedY }
}

export const snapXYZ = (pos: XY, world: World): XYZ => {
  return { z: highestBlock(pos, world), ...snapXY(pos) }
}

export const highestBlock = (pos: XY, world: World): number => {
  const snapped = snapXY(pos)

  const blocks = values(world.entities).filter((e) => e.id.startsWith("block-"))
  let highest = 0

  for (const block of blocks) {
    const { x, y, z } = block.components.position!.data
    if (x === snapped.x && y === snapped.y) {
      highest = Math.max(highest, z + 21)
    }
  }
  return highest
}

export const BlockPreview = () => Entity({
  id: "item-block-preview",
  components: {
    position: Position(),
    debug: Debug(),
    renderable: Renderable({
      zIndex: 3,
      anchor: { x: 0.5, y: 0 },
      position: { x: 0, y: height },
      dynamic: ({ entity, world }) => {
        let visible = false

        const activeItem = world.client?.playerCharacter()?.components.inventory?.activeItem(world)
        if (activeItem && activeItem.id.startsWith("item-block-")) {
          visible = true
        }
        entity.components.renderable.visible = visible

        if (!visible) return

        const xyz = snapXYZ(mouse, world)

        entity.components.position.setPosition(xyz)

        entity.components.renderable.zIndex = 3 + (xyz.z / 21) / 10
      },
      setup: async (r) => {
        const g = pixiGraphics()
          // top
          .moveTo(0, 0)
          .lineTo(-width, -width / 2)
          .lineTo(0, -width)
          .lineTo(width, -width / 2)
          .lineTo(0, 0)

          // bottom-left
          .moveTo(-width, -width / 2)
          .lineTo(-width, height)
          .lineTo(0, height + width / 2)
          .lineTo(0, 0)

          // bottom-right
          .lineTo(0, height + width / 2)
          .lineTo(width, height)
          .lineTo(width, -width / 2)
          .stroke()

        g.position.y = -height

        r.c.addChild(g)
      }
    })
  }
})

export const BlockItem: ItemBuilder = ({ character, id }) => ItemEntity({
  id: id ?? `item-block-${character.id}`,
  components: {
    position: Position({ follows: character?.id ?? "" }),
    actions: Actions({
      mb1: ({ params, world }) => {
        const { hold, mouse } = params as ItemActionParams
        if (hold) return

        const block = Block(snapXYZ(mouse, world))
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

          .stroke({ color: 0x00ff00, width: 0.5 })

        r.c.addChild(g)
      }
    })
  }
})
