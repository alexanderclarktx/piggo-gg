import { Entity, Inventory, Item, Position, Renderable, SystemBuilder, abs, loadTexture, min } from "@piggo-gg/core"
import { AnimatedSprite } from "pixi.js"

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
            const { pointing, pointingDelta } = position.data

            const hypotenuse = Math.sqrt(pointingDelta.x ** 2 + pointingDelta.y ** 2)

            const hyp_x = pointingDelta.x / hypotenuse
            const hyp_y = pointingDelta.y / hypotenuse

            r.position = {
              x: hyp_x * min(20, abs(pointingDelta.x)),
              y: hyp_y * min(20, abs(pointingDelta.y)) - 5
            }

            r.zIndex = (pointingDelta.y > 0) ? 3 : 2

            r.bufferedAnimation = pointing.toString()

            const flip = pointingDelta.x > 0 ? 1 : -1
            r.setScale({ x: flip, y: 1 })
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
