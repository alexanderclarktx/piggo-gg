import { Entity, Renderer, System } from '@piggo-legends/core';
import { Position, Renderable } from "@piggo-legends/contrib";

export const RenderSystem = (renderer: Renderer): System => {
  let renderedEntities: Set<Entity> = new Set();
  let cachedEntityPositions: Record<string, Position> = {};

  const onTick = (entities: Entity[]) => {
    for (const entity of entities) {

      // add new entities to the renderer
      if (!renderedEntities.has(entity)) {
        handleNewEnitity(entity);
      }

      // update renderable if position changed
      const position = entity.components.position as Position;
      if (position && cachedEntityPositions[entity.id].serialize() !== position.serialize()) {
        const renderable = entity.components.renderable as Renderable;
        renderable.c.position.set(position.x, position.y);
        renderable.c.rotation = position.rotation.rads;
      }
    }
  }

  const handleNewEnitity = (entity: Entity) => {
    const renderable = entity.components.renderable as Renderable;
    const position = entity.components.position as Position | undefined;

    if (position) {
      renderable.c.position.set(position.x, position.y);
      cachedEntityPositions[entity.id] = position;
    } else {
      renderable.c.position.set(0, 0);
    }

    renderer.addWorld(renderable);
    renderedEntities.add(entity);
  }

  return {
    renderer,
    componentTypeQuery: ["renderable"],
    onTick
  }
}
