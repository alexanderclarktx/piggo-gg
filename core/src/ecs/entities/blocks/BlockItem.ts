import {
  Actions, BlockColors, BlockDimensions, BlockType, BlockTypeInt, Clickable,
  Controlling, Effects, Item, ItemActionParams, ItemBuilder, ItemEntity, NPC,
  pixiGraphics, Position, randomInt, Renderable, sin, WhackBlock, XYZdistance, XYZtoIJK
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
  leaf: undefined,
  birch: undefined
}

export const BlockItem = (type: BlockType): ItemBuilder => ({ character, id }) => {

  const rng = randomInt(100)

  const item = ItemEntity({
    id: `block-${type}-${id}`,
    components: {
      position: Position({ follows: character?.id ?? "" }),
      actions: Actions({
        mb1: WhackBlock,
        mb2: ({ params, world, player }) => {
          const { hold, mouse } = params as ItemActionParams
          if (hold) return

          const character = player?.components.controlling.getCharacter(world)
          if (!character) return

          const xyz = world.blocks.fromMouse(mouse, character.components.position.data)
          if (!xyz) return

          const spot = XYZtoIJK(xyz)
          const added = world.blocks.add({ ...spot, type: BlockTypeInt[type] })
          if (!added) return

          world.client?.soundManager.play({ soundName: "click2" })
          // item.components.renderable.visible = false
          // character.components.inventory?.removeItem(item.id, world)
        }
      }),
      item: Item({ name: `block-${type}`, flips: false, stackable: true }),
      effects: Effects(),
      clickable: Clickable({ width: 20, height: 20, active: false, anchor: { x: 0.5, y: 0.5 } }),
      npc: NPC({
        behavior: (_, world) => {
          if (!item.components.item?.dropped) return

          item.components.renderable.visible = true

          const players = world.queryEntities<Controlling>(["controlling"])
          for (const player of players) {
            const character = player.components.controlling.getCharacter(world)
            if (!character) continue

            const dist = XYZdistance(item.components.position.data, character.components.position.data)
            if (dist < 10) {
              world.actions.push(world.tick + 1, item.id, { actionId: "pickupItem", playerId: player.id })
              // todo sound effect
            }
          }
        }
      }),
      renderable: Renderable({
        scaleMode: "nearest",
        zIndex: 4,
        scale: 0.3,
        anchor: { x: 0.5, y: 0.5 },
        interpolate: true,
        visible: false,
        rotates: true,
        onTick: ({ world }) => {
          if (item.components.renderable.visible && item.components.item.dropped) {
            item.components.renderable.position.y = sin((world.tick + rng) / 10) * 2
          }
        },
        setup: async (r) => {
          const clone = blockGraphics(type).clone()
          clone.position.y = -height
          r.c = clone

          r.setOutline({ color: 0x000000, thickness: 1 })
        }
      })
    }
  })
  return item
}

export const blockGraphics = (type: BlockType): Graphics => {
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
