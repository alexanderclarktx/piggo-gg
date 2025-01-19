import { Clickable, ClientSystemBuilder, Entity, InvokedAction, Position, Renderable, XY, checkBounds, mouse } from "@piggo-gg/core"
import { FederatedPointerEvent } from "pixi.js"

export const clickableClickedThisFrame = {
  value: 0,
  set: (value: number) => clickableClickedThisFrame.value = value,
  reset: () => clickableClickedThisFrame.value = 0
}

// ClickableSystem handles clicks for clickable entities
export const ClickableSystem = ClientSystemBuilder({
  id: "ClickableSystem",
  init: (world) => {
    if (!world.renderer) return undefined

    let clickables: Entity<Clickable | Position>[] = []

    const renderer = world.renderer

    let bufferClick: XY[] = []

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

    renderer.app.canvas.addEventListener("pointerdown", (event: FederatedPointerEvent) => {
      const click = { x: event.offsetX, y: event.offsetY }
      bufferClick.push(click)

      const clickWorld = renderer.camera.toWorldCoords(click)

      clickables.forEach((entity) => {
        const { clickable, position } = entity.components
        if (!clickable.active || !clickable.click) return

        const clicked = checkBounds(renderer, position, clickable, click, clickWorld)
        if (clicked) {
          clickableClickedThisFrame.set(world.tick)
          return
        }
      })
    })

    return {
      id: "ClickableSystem",
      query: ["clickable", "position", "renderable"],
      skipOnRollback: true,
      onTick: (entities: Entity<Clickable | Position | Renderable>[]) => {

        clickables = entities

        const hoveredEntity = getHoveredEntity()

        if (hoveredEntity) {
          const { clickable, position } = hoveredEntity.components

          if (entities.find(e => e.id === hoveredEntity.id)) {
            const hovering = checkBounds(renderer, position, clickable, mouse, mouse)
            if (!hovering) {
              if (clickable.hoverOut) clickable.hoverOut(world)
              hoveredEntityId = undefined
            }
          } else {
            if (clickable.hoverOut) clickable.hoverOut(world)
            hoveredEntityId = undefined
          }
        }

        // check each entity for hovering (sorted by zIndex) (max 1 hovered)
        for (const entity of entities.sort((a, b) => b.components.renderable.c.zIndex - a.components.renderable.c.zIndex)) {
          const { clickable, position, renderable } = entity.components

          if (hoveredEntityId && hoveredEntityId?.zIndex > renderable.c.zIndex) break

          if (clickable.active && clickable.hoverOver && hoveredEntityId?.id !== entity.id) {
            const hovering = checkBounds(renderer, position, clickable, mouse, mouse)
            if (hovering) {
              clickable.hoverOver(world)

              if (hoveredEntity) {
                const { clickable: hoveredClickable } = hoveredEntity.components
                if (hoveredClickable.hoverOut) hoveredClickable.hoverOut(world)
              }
              hoveredEntityId = { id: entity.id, zIndex: renderable.c.zIndex }
              break
            }
          }
        }

        // TODO does this make sense? just using hovered entity
        if (bufferClick.length) {
          const clicked = getHoveredEntity()

          if (clicked) {
            const { clickable, networked } = clicked.components

            if (clickable.click) {
              const invocation: InvokedAction = {
                ...clickable.click({ world }),
                playerId: world.client?.playerId()
              }

              if (networked && networked.isNetworked) {
                world.actionBuffer.push(world.tick + 1, clicked.id, invocation)
              } else {
                world.actionBuffer.push(world.tick, clicked.id, invocation)
              }
            }
          }
        }
        bufferClick = []
      }
    }
  }
})
