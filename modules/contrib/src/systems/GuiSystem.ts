import { Health, HealthBar, Position, Renderable } from "@piggo-legends/contrib";
import { Entity, SystemBuilder } from "@piggo-legends/core";
import { Graphics } from "pixi.js";

// GuiSystem displays gui elements
export const GuiSystem: SystemBuilder = ({ game, renderer, thisPlayerId, mode }) => {
  if (!renderer) throw new Error("ClickableSystem requires a renderer");

  let renderedEntities: Set<Entity> = new Set();

  const onTick = (entities: Entity[]) => {
    // if any renderered entities are no longer in the game, remove them
    renderedEntities.forEach((entity) => {
      if (!game.entities[entity.id]) {
        game.removeEntity(`${entity.id}-health`);
        renderedEntities.delete(entity);
      }
    });

    // add healthbars for entities that need them
    entities.forEach((entity) => {
      const { health, position } = entity.components as { health: Health, position: Position };
      if (health && position) {
        if (!renderedEntities.has(entity)) {
          healthbarForEntity(entity);
        }
      }
    });
  }

  const healthbarForEntity = (entity: Entity) => {
    if (entity.components.renderable) {
      const { health, position } = entity.components as { health: Health, position: Position };

      // graphic for red health bar
      const redBar = new Graphics();
      redBar.beginFill(0xff0000);
      redBar.drawRect(-15, -25, 30, 5);
      redBar.endFill();

      game.addEntity({
        id: `${entity.id}-health`,
        components: {
          position: position,
          renderable: new Renderable({
            zIndex: 10,
            children: async () => [ new HealthBar({ health }) ],
          })
        }
      });

      renderedEntities.add(entity);
    }
  }

  return {
    componentTypeQuery: ["health", "position"],
    onTick
  }
}
