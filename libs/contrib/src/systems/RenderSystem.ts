import { Entity, Renderer, System } from '@piggo-legends/core';
import { Controlled, Position, Renderable } from "@piggo-legends/contrib";

export var centeredEntity: Entity | undefined = undefined;
export let centeredXY: { x: number, y: number } = { x: 0, y: 0 };

export type RenderSystemProps = {
  renderer: Renderer,
  mode?: "cartesian" | "isometric"
}

// RenderSystem handles rendering entities in isometric or cartesian space
export const RenderSystem = ({ renderer, mode }: RenderSystemProps): System => {
  let renderedEntities: Set<Entity> = new Set();
  let cachedEntityPositions: Record<string, Position> = {};

  const onTick = (entities: Entity[]) => {
    // update centeredXY
    if (centeredEntity) {
      const { position } = centeredEntity.components as { position: Position };
      centeredXY = position.toScreenXY();
    }

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

      // run the dynamic callback
      if (renderable.props.dynamic) renderable.props.dynamic(renderable.c, renderable);

      // run dynamic on children
      if (renderable.props.children) {
        renderable.props.children.forEach((child) => {
          if (child.props.dynamic) child.props.dynamic(child.c, child);
        });
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
    componentTypeQuery: ["renderable"],
    onTick
  }
}
