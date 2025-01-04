import {
  Actions, Component, Effects, Entity, Renderable, Position, ProtoEntity, XY,
  XYdiff, abs, hypot, min, mouseScreen, Clickable, PickupItem, Debug, ClientSystemBuilder
} from "@piggo-gg/core"

export type Item = Component<"item"> & {
  name: string
  flips: boolean
  dropped: boolean
  equipped: boolean
  stackable: boolean
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

export type ItemEntityProps = {
  flip: boolean
}

// override some components
export const ItemEntity = (entity: ProtoEntity<ItemComponents>, props?: ItemEntityProps): ItemEntity => {

  const { renderable, actions, clickable } = entity.components

  entity.components.debug = Debug()

  entity.components.clickable = {
    ...clickable,
    click: () => ({ action: "pickup" }),
    hoverOver: () => renderable.setOutline({ color: 0xffffff, thickness: 2 }),
    hoverOut: () => renderable.setOutline()
  }

  actions.actionMap.pickup = PickupItem

  return Entity(entity)
}

export const ItemSystem = ClientSystemBuilder({
  id: "ItemSystem",
  init: () => {
    let mouseLast = { x: 0, y: 0 }

    return {
      id: "ItemSystem",
      query: ["item", "renderable", "position"],
      onTick: (entities: Entity<Item | Renderable | Position>[]) => {
        for (const entity of entities) {
          const { position, renderable, item } = entity.components
          const { pointingDelta, rotation, follows } = position.data

          if (!follows) return

          if (rotation) position.rotateDown(rotation > 0 ? 0.1 : -0.1, true)

          if (!item.dropped) {
            if (XYdiff(mouseScreen, mouseLast)) {
              const hypotenuse = hypot(pointingDelta.x, pointingDelta.y)

              const hyp_x = pointingDelta.x / hypotenuse
              const hyp_y = pointingDelta.y / hypotenuse

              position.data.offset = {
                x: hyp_x * min(20, abs(pointingDelta.x)),
                y: hyp_y * min(20, abs(pointingDelta.y)) - 5
              }

              const xScale = item.flips ?
                pointingDelta.x > 0 ? 1 : -1
                : 1
              renderable.setScale({ x: xScale, y: 1 })
            }
          }
        }
        mouseLast = mouseScreen
      }
    }
  }
})
