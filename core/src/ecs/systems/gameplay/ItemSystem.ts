import { Entity, Inventory, Item, Position, Renderable, SystemBuilder, loadTexture } from "@piggo-gg/core"
import { AnimatedSprite } from "pixi.js"

// ortho positions
const pz = [
  { x: -20, y: 0 }, { x: -20, y: -15 },
  { x: 0, y: -25 }, { x: 20, y: -15 },
  { x: 20, y: 0 }, { x: 15, y: 15 },
  { x: 0, y: 15 }, { x: -15, y: 15 }
]

const renderableId = (playerId: string, itemId: string) => `item-draw-${playerId}-${itemId}`

export const ItemSystem: SystemBuilder<"item"> = ({
  id: "item",
  init: (world) => {

    let playerToItem: Record<string, string | null> = {}
    let itemToRenderable: Record<string, Entity<Renderable | Position>> = {}

    const draw = (player: Entity<Inventory | Position>, item: Item): Entity<Renderable | Position> => Entity({
      id: renderableId(player.id, item.id),
      components: {
        position: player.components.position,
        renderable: Renderable({
          scaleMode: "nearest",
          zIndex: 2,
          scale: 2.5,
          anchor: { x: 0.5, y: 0.5 },
          position: { x: 20, y: 0 },
          interpolate: true,
          dynamic: (_, r) => {
            const { position } = player.components
            const { pointing } = position.data

            r.position = pz[pointing]
            r.bufferedAnimation = pointing.toString()

            // r.setOutline(item.reloading ? 0xff0000 : item.outlineColor)
          },
          setup: async (r: Renderable) => {
            const textures = await loadTexture(`${item.components.name.data.name}.json`)

            r.animations = {
              "0": new AnimatedSprite([textures["0"]]),
              "1": new AnimatedSprite([textures["1"]]),
              "2": new AnimatedSprite([textures["2"]]),
              "3": new AnimatedSprite([textures["3"]]),
              "4": new AnimatedSprite([textures["4"]]),
              "5": new AnimatedSprite([textures["5"]]),
              "6": new AnimatedSprite([textures["6"]]),
              "7": new AnimatedSprite([textures["7"]]),
            }

            r.setOutline(0x000000)
          }
        })
      }
    })

    return {
      id: "item",
      query: ["inventory", "position", "renderable"],
      onTick: (entities: Entity<Inventory | Position | Renderable>[]) => {
        entities.forEach((entity) => {

          const { inventory, renderable } = entity.components

          // const z = inventory.activeItem
          const { activeItem } = inventory

          if (!activeItem) {
            // rm from playerToItem
            if (playerToItem[entity.id]) {
              world.removeEntity(renderableId(entity.id, playerToItem[entity.id]!))
            }
            playerToItem[entity.id] = null
            return
          }

          // clean up old items
          if (activeItem.id !== playerToItem[entity.id]) {
            world.removeEntity(renderableId(entity.id, playerToItem[entity.id]!))
            playerToItem[entity.id] = null
          }

          // draw new items
          if (!playerToItem[entity.id]) {
            const r = draw(entity, activeItem)
            world.addEntity(r)
            playerToItem[entity.id] = activeItem.id
            itemToRenderable[activeItem.id] = r
          }

          // update item visibility
          itemToRenderable[activeItem.id].components.renderable.visible = renderable.visible
        })
      }
    }
  }
})
