import { Entity, Renderer, System } from '@piggo-legends/core';
import { Controlled, Position, Renderable } from "@piggo-legends/contrib";

export type RenderSystemMode = "isometric" | "cartesian";

// RenderSystem handles rendering entities in isometric or cartesian space
export const RenderSystem = (renderer: Renderer, mode: RenderSystemMode = "cartesian"): System => {
  let renderedEntities: Set<Entity> = new Set();
  let cachedEntityPositions: Record<string, Position> = {};
  let centeredEntity: Entity | undefined;

  const onTick = (entities: Entity[]) => {
    for (const entity of entities) {
      const { position, renderable, controlled } = entity.components as { renderable: Renderable, controlled?: Controlled, position?: Position };

      // add new entities to the renderer
      if (!renderedEntities.has(entity)) {
        renderNewEntity(entity);
      }

      // track entity if controlled by player
      if (controlled && position) {
        if (centeredEntity !== entity) {
          renderer.trackCamera(() => position.toScreenXY());
          centeredEntity = entity;
        }
      }

      // update renderable if position changed
      if (position && cachedEntityPositions[entity.id].serialize() !== position.serialize()) {
        if (mode === "isometric") {
          const screenXY = position.toScreenXY();
          renderable.c.position.set(screenXY.x, screenXY.y);
          renderable.c.rotation = position.rotation.rads;
        } else {
          renderable.c.position.set(position.x, position.y);
          renderable.c.rotation = position.rotation.rads;
        }
      }
    }
  }

  const renderNewEntity = (entity: Entity) => {
    const { renderable, position } = entity.components as { renderable: Renderable, position: Position | undefined };

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
