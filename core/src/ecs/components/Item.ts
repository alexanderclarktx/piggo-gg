import { Actions, Component, Effects, Entity, Renderable, Position, ProtoEntity, XY, XYdifferent, abs, hypot, min, mouseScreen, Clickable, PickupItem, Debug } from "@piggo-gg/core";

export type Item = Component<"item"> & {
  name: string
  dropped: boolean
  equipped: boolean
  stackable: boolean
}

export type ItemProps = {
  name: string
  dropped?: boolean
  equipped?: boolean
  stackable?: boolean
}

export const Item = ({ name, dropped = false, equipped = false, stackable = false }: ItemProps): Item => ({
  type: "item", name, dropped, equipped, stackable
})

export type ItemComponents = Position | Actions | Effects | Renderable | Item | Clickable
export type ItemEntity = Entity<ItemComponents>

export type ItemEntityProps = {
  flip: boolean
}

export const ItemEntity = (entity: ProtoEntity<ItemComponents>, props?: ItemEntityProps): ItemEntity => {

  let mouseLast = { x: 0, y: 0 }
  const flip = props?.flip ?? false

  entity.components.debug = Debug()

  const { renderable, clickable, actions } = entity.components

  // renderable
  renderable.dynamic = dynamicItem({ mouseLast, flip })

  // clickable
  clickable.click = () => ({ action: "pickup" })
  clickable.hoverOver = () => {
    renderable.setOutline({ color: 0xffffff, thickness: 2 })
  }
  clickable.hoverOut = () => {
    renderable.setOutline()
  }

  // actions
  actions.actionMap.pickup = PickupItem

  return Entity(entity)
}

const dynamicItem = ({ mouseLast, flip }: { mouseLast: XY, flip: boolean }) => async (_: any, r: Renderable, item: ItemEntity) => {
  const { pointingDelta, rotation, follows } = item.components.position.data
  if (!follows) return

  if (rotation) {
    item.components.position.rotateDown(rotation > 0 ? 0.1 : -0.1, true)
  }

  if (!item.components.item.dropped) {

    if (XYdifferent(mouseScreen, mouseLast)) {

      const hypotenuse = hypot(pointingDelta.x, pointingDelta.y)

      const hyp_x = pointingDelta.x / hypotenuse
      const hyp_y = pointingDelta.y / hypotenuse

      item.components.position.data.offset = {
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
