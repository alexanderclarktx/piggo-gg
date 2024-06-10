import { Entity, Health, HealthBar, Position, Renderable, ClientSystemBuilder } from "@piggo-gg/core";

// HealthBarSystem displays gui elements
export const HealthBarSystem = ClientSystemBuilder({
  id: "HealthBarSystem",
  init: ({ world }) => {
    if (!world.renderer) return undefined;

    let renderedEntities: Set<Entity> = new Set();

    const healthbarForEntity = (entity: Entity<Health | Position | Renderable>) => {
      if (entity.components.renderable) {
        const { health, position } = entity.components;

        world.addEntity(Entity({
          id: `${entity.id}-health`,
          components: {
            position: position,
            renderable: HealthBar({ health })
          }
        }));

        renderedEntities.add(entity);
      }
    }

    return {
      id: "HealthBarSystem",
      query: ["health", "position", "renderable"],
      skipOnRollback: true,
      onTick: (entities: Entity<Health | Position | Renderable>[]) => {
        // handle old entities
        renderedEntities.forEach((entity) => {
          if (!world.entities[entity.id]) {
            world.removeEntity(`${entity.id}-health`);
            renderedEntities.delete(entity);
          }
        });
  
        // handle new entities
        entities.forEach((entity) => {
          const { health, position } = entity.components;
          if (health && position) {
            if (!renderedEntities.has(entity)) {
              healthbarForEntity(entity);
            }
          }
        });
      }
    }
  }
});
