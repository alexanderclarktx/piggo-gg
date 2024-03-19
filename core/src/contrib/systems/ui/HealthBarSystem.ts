import { Entity, SystemBuilder, Health, HealthBar, Position, Renderable } from "@piggo-gg/core";

// HealthBarSystem displays gui elements
export const HealthBarSystem: SystemBuilder<"HealthBarSystem"> = ({
  id: "HealthBarSystem",
  init: ({ world, renderer }) => {
    if (!renderer) throw new Error("ClickableSystem requires a renderer");

    let renderedEntities: Set<Entity> = new Set();

    const onTick = (entities: Entity<Health | Position | Renderable>[]) => {
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

    const healthbarForEntity = (entity: Entity<Health | Position | Renderable>) => {
      if (entity.components.renderable) {
        const { health, position } = entity.components;

        world.addEntity(Entity({
          id: `${entity.id}-health`,
          components: {
            position: position,
            renderable: new Renderable({
              zIndex: 10,
              setup: HealthBar(health)
            })
          }
        }));

        renderedEntities.add(entity);
      }
    }

    return {
      id: "HealthBarSystem",
      query: ["health", "position", "renderable"],
      onTick,
      skipOnRollback: true,
      onCleanup: () => {
        renderedEntities.forEach((entity) => {
          world.removeEntity(`${entity.id}-health`);
          renderedEntities.delete(entity);
        })
      }
    }
  }
});
