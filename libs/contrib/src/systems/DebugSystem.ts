import { Text } from 'pixi.js';
import { Entity, Renderer, System } from "@piggo-legends/core";
import { TextBox, DebugBounds, Renderable, Position } from "@piggo-legends/contrib";

// DebugSystem adds visual debug information to renderered entities
export const DebugSystem = (renderer: Renderer): System => {
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
        renderables.forEach((renderable) => renderable.cleanup());
        debuggedEntities.delete(entity);
      });
    }
  }

  const addEntity = (entity: Entity) => {
    if (entity.components.renderable) {
      const {renderable, position} = entity.components as {renderable: Renderable, position: Position};

      // text box
      const textBox = new TextBox({
        renderer: renderer,
        dynamic: (c: Text) => {
          const bounds = renderable.c.getLocalBounds();
          c.position.set(renderable.c.x - 15, renderable.c.y - bounds.height / 2 - 15);
          c.text = `
            world: ${position.x} ${position.y} ${position.rotation.rads}\n
            screen: ${renderable.c.x} ${renderable.c.y}\n
          `;
        },
        fontSize: 12, color: 0xffff00, debuggable: false
      });

      // debug bounds
      const debugBounds = new DebugBounds({ renderable: renderable, renderer: renderer });

      // add to the renderer
      renderer.addWorld(textBox);
      renderer.addWorld(debugBounds);

      // add to the map
      debuggedEntities.set(entity, [textBox, debugBounds]);
    }
  }

  return {
    renderer,
    componentTypeQuery: ["renderable"],
    onTick
  }
}
