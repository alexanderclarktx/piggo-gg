import {
  Actions, Clickable, Component, Effects, Entity, Networked, Position,
  ProtoEntity, Renderable, SystemBuilder, XY, abs, hypot, min, pickupItem, round
} from "@piggo-gg/core"

export type Item = Component<"item"> & {
  name: string
  flips: boolean
  dropped: boolean
  equipped: boolean
  stackable: boolean
}

export type ItemActionParams = {
  mouse: XY
  entity: string
  tick: number
  character: string
  hold: boolean
}

export type ItemProps = {
  name: string
  flips?: boolean
  dropped?: boolean
  equipped?: boolean
  stackable?: boolean
}

export const Item = ({ name, flips, dropped, equipped, stackable }: ItemProps): Item => ({
  name,
  type: "item",
  flips: flips ?? false,
  dropped: dropped ?? false,
  equipped: equipped ?? false,
  stackable: stackable ?? false
})

export type ItemComponents = Position | Actions | Effects | Renderable | Item | Clickable
export type ItemEntity = Entity<ItemComponents>

// override some components
export const ItemEntity = (entity: ProtoEntity<ItemComponents>): ItemEntity => {

  const { renderable, actions, clickable } = entity.components

  actions.actionMap.pickupItem = pickupItem

  entity.components.networked = Networked()
  entity.components.clickable = {
    ...clickable,
    click: () => ({ actionId: "pickupItem" }),
    hoverOver: () => renderable.setOutline({ color: 0xffffff, thickness: 2 }),
    hoverOut: () => renderable.setOutline()
  }

  return Entity(entity)
}

export const ItemSystem = SystemBuilder({
  id: "ItemSystem",
  init: (world) => ({
    id: "ItemSystem",
    query: ["item", "renderable", "position"],
    priority: 5,
    onTick: (entities: Entity<Item | Renderable | Position>[]) => {
      for (const entity of entities) {
        const { position, renderable, item } = entity.components
        const { pointingDelta, rotation, follows } = position.data

        if (!follows) continue

        if (rotation) position.rotate(rotation > 0 ? -0.1 : 0.1, true)

        if (!item.dropped) {
          const hypotenuse = hypot(pointingDelta.x, pointingDelta.y)

          const hyp_x = pointingDelta.x / hypotenuse
          const hyp_y = pointingDelta.y / hypotenuse

          const flip = world.flip()

          position.data.offset = {
            x: round(hyp_x * min(20, abs(pointingDelta.x)), 2),
            y: round(hyp_y * min(20, abs(pointingDelta.y)) - 7 * flip, 2)
          }

          const xScale = flip * (!item.flips ? 1 : pointingDelta.x > 0 ? 1 : -1)

          renderable.setScale({ x: xScale, y: 1 })
          renderable.revolves = true
        }
      }
    }
  })
})
