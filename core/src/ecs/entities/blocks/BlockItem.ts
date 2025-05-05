import {
  Actions, BlockColors, BlockDimensions, blocks, BlockType, BlockTypeInt,
  Clickable, Effects, Item, ItemActionParams, ItemBuilder, ItemEntity,
  pixiGraphics, Position, Renderable, snapXYZ,
  XYtoChunk,
  XYtoIJ,
  XYZtoChunk,
  XYZtoIJK
} from "@piggo-gg/core"
import { Graphics } from "pixi.js"

const { width, height } = BlockDimensions

const graphics: Record<BlockType, Graphics | undefined> = {
  stone: undefined,
  grass: undefined,
  moss: undefined,
  moonrock: undefined,
  asteroid: undefined,
  saphire: undefined,
  obsidian: undefined,
  ruby: undefined,
  white: undefined,
  wood: undefined,
  leaf: undefined
}

export const BlockItem = (type: BlockType): ItemBuilder => ({ character, id }) => ItemEntity({
  id: id ?? `item-block-${character.id}-${type}`,
  components: {
    position: Position({ follows: character?.id ?? "" }),
    actions: Actions({
      mb1: ({ params, world, player }) => {
        const { hold, mouse } = params as ItemActionParams
        if (hold) return
        // addToXBlocksBuffer(block)

        const character = player?.components.controlling.getCharacter(world)
        if (!character) return

        const xyz = blocks.atMouse(mouse, character.components.position.data)
        if (!xyz) return

        const spot = XYZtoIJK(xyz)
        console.log("add block", xyz, spot)
        const added = blocks.add({ ...spot, z: spot.z + 1, type: BlockTypeInt[type] })
        if (!added) return

        // blocks.add({ ...snapXYZ(world.flip(mouse)), type: BlockTypeInt[type] })

        world.client?.soundManager.play("click2")
      }
    }),
    item: Item({ name: "block", flips: false }),
    effects: Effects(),
    clickable: Clickable({ width: 20, height: 20, active: false, anchor: { x: 0.5, y: 0.5 } }),
    renderable: Renderable({
      scaleMode: "nearest",
      zIndex: 3,
      scale: 0.3,
      anchor: { x: 0.5, y: 0.5 },
      interpolate: true,
      visible: false,
      rotates: false,
      setup: async (r) => {
        const clone = blockGraphics(type).clone()
        clone.position.y = -height
        r.c = clone

        r.setOutline({ color: 0x000000, thickness: 1 })
      }
    })
  }
})

const blockGraphics = (type: BlockType) => {
  if (graphics[type]) return graphics[type]

  const colors = BlockColors[type]

  graphics[type] = pixiGraphics()
    // top
    .moveTo(0, 0)
    .lineTo(-width, -width / 2)
    .lineTo(0, -width)
    .lineTo(width, -width / 2)
    .lineTo(0, 0)
    .fill({ color: colors[0] })

    // bottom-left
    .moveTo(-width, -width / 2)
    .lineTo(-width, height)
    .lineTo(0, height + width / 2)
    .lineTo(0, 0)
    .fill({ color: colors[1] })

    // bottom-right
    .lineTo(0, height + width / 2)
    .lineTo(width, height)
    .lineTo(width, -width / 2)
    .fill({ color: colors[2] })

  return graphics[type]
}
