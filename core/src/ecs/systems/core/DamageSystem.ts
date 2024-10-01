import { Entity, Health, Position, Renderable, SystemBuilder, playSound, randomChoice } from "@piggo-gg/core"
import { ColorMatrixFilter } from "pixi.js"

export const DamageSystem: SystemBuilder<"DamageSystem"> = {
  id: "DamageSystem",
  init: (world) => {

    const filterMap: Record<string, [number, ColorMatrixFilter]> = {}

    return {
      id: "DamageSystem",
      query: ["health", "position", "renderable"],
      onTick: (entities: Entity<Health | Position | Renderable>[]) => {
        entities.forEach((entity) => {
          const { health, renderable } = entity.components
          if (!renderable.initialized) return

          if (!filterMap[entity.id]) {
            const filter = new ColorMatrixFilter()
            filterMap[entity.id] = [1, filter]
            renderable.c.filters = filter

            // set default onDamage
            if (!health.onDamage) health.onDamage = ((damage) => {
              const newBrightness = 1 + (damage / 25)
              filter.brightness(newBrightness, false)
              filterMap[entity.id] = [newBrightness, filter]
            })
          }

          // update filter
          const [brightness, filter] = filterMap[entity.id]
          if (brightness > 1) {
            filter.brightness(brightness - 0.1, false)
            filterMap[entity.id] = [brightness - 0.1, filter]
          }

          // handle death
          if (health.data.health <= 0) {

            // play death sound
            if (health.deathSounds.length > 0) {
              playSound(world.client?.sounds[randomChoice(health.deathSounds)], 0.1)
            }

            // remove entity
            world.removeEntity(entity.id)

            // clean up filterMap
            delete filterMap[entity.id]
          }
        })
      }
    }
  }
}
