import { Entity, Health, HealthBar, Position, Renderable, ClientSystemBuilder, entries } from "@piggo-gg/core";

// HealthBarSystem displays gui elements
export const HealthBarSystem = ClientSystemBuilder({
  id: "HealthBarSystem",
  init: ({ world }) => {
    if (!world.renderer) return undefined;

    // let renderedEntities: Set<Entity> = new Set();
    const characterHealthBars: Record<string, Entity<Renderable | Position>> = {};

    const healthbarForCharacter = (character: Entity<Health | Position | Renderable>) => {
      if (character.components.renderable) {
        const { health, position } = character.components;

        const healthbar = Entity<Position | Renderable>({
          id: `${character.id}-health`,
          components: {
            position: position,
            renderable: HealthBar({ health })
          }
        });

        // renderedEntities.add(entity);
        characterHealthBars[character.id] = healthbar;
        world.addEntity(healthbar);
      }
    }

    return {
      id: "HealthBarSystem",
      query: ["health", "position", "renderable"],
      skipOnRollback: true,
      onTick: (characters: Entity<Health | Position | Renderable>[]) => {
        // handle old entities
        // renderedEntities.forEach((entity) => {
        entries(characterHealthBars).forEach(([entityId, healthbar]) => {
          if (!world.entities[entityId]) {
            world.removeEntity(healthbar.id);
            // renderedEntities.delete(entity);
            delete characterHealthBars[entityId];
          }
        });

        // handle new entities
        characters.forEach((character) => {
          const { health, position, renderable } = character.components;
          if (health && health.showHealthBar && position) {
            // if (!renderedEntities.has(entity)) {
            if (!characterHealthBars[character.id]) {
              healthbarForCharacter(character);
            }
          }

          characterHealthBars[character.id].components.renderable.visible = renderable.visible;
        });
      }
    }
  }
});
