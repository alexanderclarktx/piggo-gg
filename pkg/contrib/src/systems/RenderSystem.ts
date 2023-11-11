import { Entity,  Game, GameProps, Renderer, System, SystemProps } from '@piggo-legends/core';
import { Position, Renderable, RenderableProps } from "@piggo-legends/contrib";

export type RenderSystemProps = SystemProps & {
  renderer: Renderer
}

export class RenderSystem extends System<RenderSystemProps> {
  componentTypeQuery = ["renderable", "position"];

  renderedEntities: Set<Entity> = new Set();

  cachedEntityPositions: Record<string, Position> = {};

  onTick = (entities: Entity[], _: Game<GameProps>) => {
    for (const entity of entities) {

      // add new entities to the renderer
      if (!this.renderedEntities.has(entity)) {
        this.handleNewEnitity(entity);
      }

      // update renderable if position changed
      const position = entity.components.position as Position;
      if (position && this.cachedEntityPositions[entity.id].serialize() !== position.serialize()) {
        const renderable = entity.components.renderable as Renderable<RenderableProps>;
        renderable.c.position.set(position.x, position.y);
        renderable.c.rotation = position.rotation.rads;
      }
    }
  }

  handleNewEnitity = (entity: Entity) => {
    const renderable = entity.components.renderable as Renderable<RenderableProps>;
    const position = entity.components.position as Position | undefined;

    if (position) {
      renderable.c.position.set(position.x, position.y);
      this.cachedEntityPositions[entity.id] = position;
    } else {
      renderable.c.position.set(0, 0);
    }

    this.props.renderer.addWorld(renderable);
    this.renderedEntities.add(entity);
  }
}
