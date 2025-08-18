import {
  World, Component, Position, InvokedAction, XY, ClientSystemBuilder,
  checkBounds, Entity, mouse, Renderable
} from "@piggo-gg/core"
import { FederatedPointerEvent } from "pixi.js"

export type Bounds = { x: number, y: number, w: number, h: number }

export type Clickable = Component<"clickable"> & {
  type: "clickable"
  width: number
  height: number
  active: boolean
  anchor: XY
  click?: (_: { world: World }) => InvokedAction
  hoverOver?: ((world: World) => void) | undefined
  hoverOut?: ((world: World) => void) | undefined
}

export type ClickableProps = {
  width: number
  height: number
  active?: boolean
  anchor?: XY
  click?: (_: { world: World }) => InvokedAction
  hoverOver?: (world: World) => void
  hoverOut?: (world: World) => void
}

export const Clickable = (props: ClickableProps): Clickable => {
  return {
    type: "clickable",
    width: props.width,
    height: props.height,
    active: props.active ?? true,
    anchor: props.anchor ?? { x: 0, y: 0 },
    click: props.click ?? (({ world }) => ({ actionId: "click", playerId: world.client?.playerId() })),
    hoverOver: props.hoverOver,
    hoverOut: props.hoverOut
  }
}

export const ClickableSystem = ClientSystemBuilder({
  id: "ClickableSystem",
  init: (world) => {
    let clickables: Entity<Clickable | Position | Renderable>[] = []

    const renderer = world.renderer

    let bufferClick: { xy: XY, clickable?: Entity<Clickable | Position | Renderable> } | undefined = undefined

    let hoveredEntityId: { id: string, zIndex: number } | undefined = undefined

    const getHoveredEntity = (): undefined | Entity<Position | Clickable | Renderable> => {
      if (hoveredEntityId) {
        const entity = world.entities[hoveredEntityId.id] as Entity<Position | Clickable | Renderable>
        if (!entity) {
          hoveredEntityId = undefined
          return undefined
        }
        return entity
      }
      return undefined
    }

    renderer?.app.canvas.addEventListener("pointerdown", (event: FederatedPointerEvent) => {
      const click = { x: event.offsetX, y: event.offsetY }

      const clickWorld = renderer.camera.toWorldCoords(click)

      for (const entity of clickables) {
        const { clickable, position } = entity.components
        if (!clickable.active || !clickable.click) return

        const clicked = checkBounds(renderer, position, clickable, click, clickWorld)
        if (clicked) {
          world.client?.clickThisFrame.set(world.tick)
          bufferClick = { xy: click, clickable: entity }
          return
        }
      }

      bufferClick = { xy: click }
    })

    return {
      id: "ClickableSystem",
      query: ["clickable", "position", "renderable"],
      priority: 3,
      skipOnRollback: true,
      onTick: (entities: Entity<Clickable | Position | Renderable>[]) => {

        clickables = entities

        const hoveredEntity = getHoveredEntity()

        if (hoveredEntity) {
          const { clickable, position } = hoveredEntity.components

          if (entities.find(e => e.id === hoveredEntity.id)) {
            const hovering = checkBounds(renderer!, position, clickable, mouse, mouse)
            if (!hovering) {
              if (clickable.hoverOut) clickable.hoverOut(world)
              hoveredEntityId = undefined
            }
          } else {
            if (clickable.hoverOut) clickable.hoverOut(world)
            hoveredEntityId = undefined
          }
        }

        // find the current hovered entity
        const sortedEntities = entities.sort((a, b) => b.components.renderable.c.zIndex - a.components.renderable.c.zIndex)
        for (const entity of sortedEntities) {
          const { clickable, position, renderable } = entity.components

          if (hoveredEntityId && hoveredEntityId?.zIndex > renderable.c.zIndex) break

          if (clickable.active && hoveredEntityId?.id !== entity.id) {
            const hovering = checkBounds(renderer!, position, clickable, { x: 0, y: 0 }, mouse)
            if (hovering) {
              clickable.hoverOver?.(world)

              if (hoveredEntity) {
                const { clickable: hoveredClickable } = hoveredEntity.components
                if (hoveredClickable.hoverOut) hoveredClickable.hoverOut(world)
              }
              hoveredEntityId = { id: entity.id, zIndex: renderable.c.zIndex }
              break
            }
          }
        }

        if (bufferClick) {
          let clicked = getHoveredEntity()

          if (!clicked && bufferClick.clickable) {
            clicked = bufferClick.clickable
          }

          if (clicked) {
            const { clickable, networked } = clicked.components

            if (clickable.click) {
              const invocation: InvokedAction = {
                ...clickable.click({ world }),
                playerId: world.client?.playerId()
              }

              // TODO might need refactor (explicit InvokedAction.offline handling)
              if (networked && networked.isNetworked) {
                world.actions.push(world.tick + 1, invocation.entityId ?? clicked.id, invocation)
              } else {
                world.actions.push(world.tick, invocation.entityId ?? clicked.id, invocation)
              }
            }
          }
        }
        bufferClick = undefined
      }
    }
  }
})
