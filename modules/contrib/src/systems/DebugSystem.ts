import { Text } from 'pixi.js';
import { Entity, Renderer, SystemBuilder, SystemProps } from "@piggo-legends/core";
import { TextBox, DebugBounds, Renderable, Position } from "@piggo-legends/contrib";

export type DebugSystemProps = SystemProps & {
  renderer: Renderer
}

// DebugSystem adds visual debug information to renderered entities
export const DebugSystem: SystemBuilder<DebugSystemProps> = ({ renderer, game }) => {
  let debuggedEntities: Map<Entity, Renderable[]> = new Map();

  const onTick = (entities: Entity[]) => {
    if (renderer.debug) { // debug mode is on
      entities.forEach((entity) => {
        const renderable = entity.components.renderable as Renderable;
        if (renderable && renderable.props.debuggable && !debuggedEntities.has(entity)) {
          addEntity(entity);
        }
      });
    } else { // debug mode is off
      debuggedEntities.forEach((renderables, entity) => {
        game.removeEntity(`${entity.id}-debug`);
        renderables.forEach((renderable) => renderable.cleanup());
        debuggedEntities.delete(entity);
      });
    }
  }

  const addEntity = (entity: Entity) => {
    if (entity.components.renderable) {
      const {renderable, position} = entity.components as {renderable: Renderable, position: Position};

      const bounds = renderable.c.getLocalBounds();

      // text box
      const textBox = new TextBox({
        // renderer: renderer,
        position: new Position({ x: 0, y: -(bounds.height / 2) - 30 }),
        dynamic: (c: Text) => {
          c.text = `
            w: ${position.x.toFixed(2)} ${position.y.toFixed(2)}<br>
            s: ${renderable.c.x.toFixed(2)} ${renderable.c.y.toFixed(2)}
          `;
        },
        fontSize: 12, color: 0xffff00, debuggable: false
      });

      // debug bounds
      const debugBounds = new DebugBounds({ debugRenderable: renderable });

      game.addEntity({
        id: `${entity.id}-debug`,
        components: {
          position: position,
          renderable: new Renderable({
            children: async () => [textBox, debugBounds]
          })
        }
      });

      // add to the map
      debuggedEntities.set(entity, [textBox, debugBounds]);
    }
  }

  return {
    componentTypeQuery: ["renderable"],
    onTick
  }
}
