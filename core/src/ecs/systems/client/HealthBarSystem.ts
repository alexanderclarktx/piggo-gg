import { Entity, Health, HealthBar, Position, Renderable, ClientSystemBuilder, entries } from "@piggo-gg/core"

// HealthBarSystem displays character health bars
export const HealthBarSystem = ClientSystemBuilder({
  id: "HealthBarSystem",
  init: (world) => {
    const characterHealthBars: Record<string, Entity<Renderable | Position>> = {}

    const healthbarEntity = (entity: Entity<Health | Position | Renderable>) => {
      if (entity.components.renderable) {
        const { health, position } = entity.components

        const healthbar = Entity<Position | Renderable>({
          id: `${entity.id}-health`,
          components: {
            position: position,
            renderable: HealthBar({ health })
          }
        })

        characterHealthBars[entity.id] = healthbar
        world.addEntity(healthbar)
      }
    }

    return {
      id: "HealthBarSystem",
      query: ["health", "position", "renderable"],
      priority: 5,
      skipOnRollback: true,
      onTick: (entities: Entity<Health | Position | Renderable>[]) => {

        // handle old entities
        entries(characterHealthBars).forEach(([entityId, healthbar]) => {
          if (!world.entities[entityId]) {
            world.removeEntity(healthbar.id)
            delete characterHealthBars[entityId]
          }
        })
  
        // handle new entities
        entities.forEach((entity) => {
          const { health, position, renderable } = entity.components
          if (health && health.showHealthBar && position) {
            if (!characterHealthBars[entity.id] || position !== characterHealthBars[entity.id].components.position) {
              healthbarEntity(entity)
            }
          }

          // update visibility
          if (characterHealthBars[entity.id]) {
            characterHealthBars[entity.id].components.renderable.visible = renderable.visible
          }
        })
      }
    }
  }
})
