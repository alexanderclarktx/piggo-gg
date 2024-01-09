import { Entity, SystemBuilder } from '@piggo-legends/core';
import { Controlled, Position, Renderable } from "@piggo-legends/contrib";

// RenderSystem handles rendering entities in isometric or cartesian space
export const RenderSystem: SystemBuilder = ({ renderer, mode, game }) => {
  if (!renderer) throw new Error("RendererSystem requires a renderer");

  let renderedEntities: Set<Entity<Renderable | Position>> = new Set();
  let cachedEntityPositions: Record<string, Position> = {};
  let centeredEntity: Entity<Renderable | Position> | undefined = undefined;

  renderer.app.ticker.add(() => {
    if (centeredEntity) {
      const p = centeredEntity.components.position;
      if (p) renderer.camera.moveTo(p.toScreenXY());
    }

    // update screenFixed entities
    renderedEntities.forEach((entity) => updateScreenFixed(entity));
  });

  const onTick = (entities: Entity<Renderable | Position>[]) => {
    entities.forEach(async (entity) => {
      const { position, renderable, controlled } = entity.components;

      // add new entities to the renderer
      if (!renderedEntities.has(entity)) {
        renderedEntities.add(entity);
        await renderNewEntity(entity);
      }

      // track entity if controlled by player
      if (controlled && position && centeredEntity !== entity) {
        centeredEntity = entity;
      }

      // update renderable if position changed
      if (position && cachedEntityPositions[entity.id].serialize() !== position.serialize() && !position.screenFixed) {
        if (renderable?.props.rotates) {
          renderable.c.rotation = position.rotation.rads;
        }

        if (mode === "isometric") {
          const screenXY = position.toScreenXY();
          renderable?.c.position.set(screenXY.x, screenXY.y);
        } else {
          renderable?.c.position.set(position.x, position.y);
        }
      }

      // run the dynamic callback
      if (renderable?.props.dynamic) renderable.props.dynamic(renderable.c, renderable, game);

      // run dynamic on children
      if (renderable?.children) {
        renderable.children.forEach((child) => {
          if (child.props.dynamic) child.props.dynamic(child.c, child, game);
        });
      }
    });
  }

  const renderNewEntity = async (entity: Entity<Renderable | Position>) => {
    const { renderable, position } = entity.components;

    if (position) {
      renderable.c.position.set(position.x, position.y);
      cachedEntityPositions[entity.id] = position;
    } else {
      renderable.c.position.set(0, 0);
    }

    await renderable._init(renderer);

    renderer.addWorld(renderable!);
  }

  // updates the position of screenFixed entities
  const updateScreenFixed = (entity: Entity<Renderable | Position>) => {
    const { position, renderable } = entity.components;
    if (position.screenFixed) {

      if (position.x < 0) {
        renderable.c.x = renderer.app.screen.width + position.x - renderer.camera.c.x;
      } else {
        renderable.c.x = position.x - renderer.camera.c.x;
      }

      if (position.y < 0) {
        renderable.c.y = renderer.app.screen.height + position.y - renderer.camera.c.y;
      } else {
        renderable.c.y = position.y - renderer.camera.c.y;
      }
    }
  }

  return {
    componentTypeQuery: ["renderable", "position"],
    onTick
  }
}
