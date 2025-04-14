import { ClientSystemBuilder, Entity, Health, Position, Renderable } from "@piggo-gg/core"
import { ColorMatrixFilter } from "pixi.js"

export const DamageSystem = ClientSystemBuilder({
  id: "DamageSystem",
  init: (world) => {

    const filterMap: Record<string, [number, ColorMatrixFilter]> = {}

    return {
      id: "DamageSystem",
      query: ["health", "position", "renderable"],
      priority: 5,
      onTick: (entities: Entity<Health | Position | Renderable>[]) => {
        entities.forEach((entity) => {
          const { health, renderable, element } = entity.components
          if (!renderable.initialized) return

          if (!filterMap[entity.id]) {
            const filter = new ColorMatrixFilter()
            filterMap[entity.id] = [1, filter]
            // renderable.c.filters = filter

            // set default onDamage
            const originalOnDamage = health.onDamage
            health.onDamage = ((damage, world) => {
              originalOnDamage?.(damage, world)

              const newBrightness = 1 + (damage / 25)
              filter.brightness(newBrightness, false)

              if (element?.data.kind === "flesh") filter.tint(0xff9999, true)

              filterMap[entity.id] = [newBrightness, filter]
            })
          }

          // update filter
          const [brightness, filter] = filterMap[entity.id]
          if (brightness > 1) {
            filter.brightness(brightness - 0.1, false)
            if (element?.data.kind === "flesh") filter.tint(0xff9999, true)
            filterMap[entity.id] = [brightness - 0.1, filter]
          } else {
            filter.tint(0xffffff, false)
          }

          // clean up old entities
          for (const e in filterMap) {
            if (!world.entities[e]) delete filterMap[e]
          }
        })
      }
    }
  }
})
