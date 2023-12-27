import { Entity, Game, Renderer, System } from '@piggo-legends/core';
import { Controlled, Position, Renderable } from "@piggo-legends/contrib";

export type RenderSystemProps = {
  renderer: Renderer
  game: Game
  mode?: "cartesian" | "isometric"
}

// RenderSystem handles rendering entities in isometric or cartesian space
export const RenderSystem = ({ renderer, mode, game }: RenderSystemProps): System => {
  let renderedEntities: Set<Entity> = new Set();
  let cachedEntityPositions: Record<string, Position> = {};
  let centeredEntity: Entity | undefined = undefined;

  renderer.app.ticker.add(() => {
    if (centeredEntity) {
      const { position } = centeredEntity.components as { position: Position };
      renderer.camera.moveTo(position.toScreenXY());
    }

    // update screenFixed entities
    renderedEntities.forEach((entity) => updateScreenFixed(entity));
  });

  const onTick = (entities: Entity[]) => {
    entities.forEach(async (entity) => {
      const { position, renderable, controlled } = entity.components as { renderable: Renderable, controlled?: Controlled, position?: Position };

      // add new entities to the renderer
      if (!renderedEntities.has(entity)) {
        await renderNewEntity(entity);
      }

      // track entity if controlled by player
      if (controlled && position && centeredEntity !== entity) {
        centeredEntity = entity;
      }

      // update renderable if position changed
      if (position && cachedEntityPositions[entity.id].serialize() !== position.serialize() && !position.screenFixed) {
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
      if (renderable.props.dynamic) renderable.props.dynamic(renderable.c, renderable, game);

      // run dynamic on children
      if (renderable.children) {
        renderable.children.forEach((child) => {
          if (child.props.dynamic) child.props.dynamic(child.c, child, game);
        });
      }
    });
  }

  const renderNewEntity = async (entity: Entity) => {
    const { renderable, position } = entity.components as { renderable: Renderable, position: Position | undefined };

    await renderable._init(renderer);

    if (position) {
      renderable.c.position.set(position.x, position.y);
      cachedEntityPositions[entity.id] = position;
    } else {
      renderable.c.position.set(0, 0);
    }

    renderer.addWorld(renderable);
    renderedEntities.add(entity);
  }

  // updates the position of screenFixed entities
  const updateScreenFixed = (entity: Entity) => {
    const { position, renderable } = entity.components as { position: Position, renderable: Renderable };
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
    componentTypeQuery: ["renderable"],
    onTick
  }
}
