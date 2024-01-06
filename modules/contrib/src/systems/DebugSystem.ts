import { DebugBounds, Position, Renderable, TextBox } from "@piggo-legends/contrib";
import { Entity, SystemBuilder } from "@piggo-legends/core";
import { Text } from 'pixi.js';

// DebugSystem adds visual debug information to renderered entities
export const DebugSystem: SystemBuilder = ({ renderer, game }) => {
  if (!renderer) throw new Error("DebugSystem requires a renderer");

  let debuggedEntities: Map<Entity, Renderable[]> = new Map();
  let debugEntities: Record<string, string> = {};

  const onTick = (entities: Entity[]) => {
    if (renderer.debug) {
      // handle new entities
      entities.forEach((entity) => {
        const renderable = entity.components.renderable as Renderable;
        if (renderable && renderable.props.debuggable && !debuggedEntities.has(entity)) {
          addEntity(entity);
        }
      });

      // update debug entity positions
      Object.entries(debugEntities).forEach(([id, debugId]) => {
        const entity = game.entities[id];
        if (entity) {
          const debugEntity = game.entities[debugId];
          if (debugEntity) {
            const debugPosition = debugEntity.components.position as Position;
            const position = entity.components.position as Position;
            debugPosition.x = position.x;
            debugPosition.y = position.y;
          }
        } else {
          game.removeEntity(debugId);
          delete debugEntities[id];
        }
      });
    } else {
      // handle old entities
      debuggedEntities.forEach((renderables, entity) => {
        game.removeEntity(`${entity.id}-debug`);
        renderables.forEach((renderable) => renderable.cleanup());
        debuggedEntities.delete(entity);
        delete debugEntities[entity.id];
      });
    }
  }

  const addEntity = (entity: Entity) => {
    if (entity.components.renderable) {
      const {renderable, position} = entity.components as {renderable: Renderable, position: Position};

      const bounds = renderable.c.getLocalBounds();

      // text box
      const textBox = new TextBox({
        position: new Position({ x: 0, y: -(bounds.height / 2) - 30 }),
        dynamic: (c: Text) => {
          if (renderable && position) c.text = debugText(position, renderable);
        },
        fontSize: 12, color: 0xffff00, debuggable: false
      });

      // debug bounds
      const debugBounds = new DebugBounds({ debugRenderable: renderable });

      const debugEntityId = game.addEntity({
        id: `${entity.id}-debug`,
        components: {
          position: new Position({ x: position.x, y: position.y }),
          renderable: new Renderable({
            children: async () => [textBox, debugBounds]
          })
        }
      });

      debugEntities[entity.id] = debugEntityId;

      // add to the map
      debuggedEntities.set(entity, [textBox, debugBounds]);
    }
  }

  const debugText = (p: Position, r: Renderable) => `w: ${p.x.toFixed(2)} ${p.y.toFixed(2)}<br>s: ${r.c.x.toFixed(2)} ${r.c.y.toFixed(2)}`;

  return {
    componentTypeQuery: ["renderable"],
    onTick
  }
}
