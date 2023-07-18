import { Entity, EntityProps, Game, GameProps, Renderer, System, SystemProps } from '@piggo-legends/core';
import { Position, Renderable, RenderableProps } from "@piggo-legends/contrib";

export type RenderSystemProps = SystemProps & {
  renderer: Renderer
}

export class RenderSystem extends System<RenderSystemProps> {
  componentTypeQuery = ["renderable"];

  renderedEntities: Set<Entity<EntityProps>> = new Set();

  onTick = (entities: Entity<EntityProps>[], _: Game<GameProps>) => {
    for (const entity of entities) {
      // add new entities to the renderer
      if (!this.renderedEntities.has(entity)) {
        const renderable = entity.props.components.renderable as Renderable<RenderableProps>;
        const position = entity.props.components.position as Position | undefined;

        if (position) {
          renderable.c.position.set(position.x, position.y);
        } else {
          renderable.c.position.set(0, 0);
        }

        this.props.renderer.addWorld(renderable);
        this.renderedEntities.add(entity);
      }

      // update renderable if position changed
      if (entity.props.components.position) {
        const renderable = entity.props.components.renderable as Renderable<RenderableProps>;
        const position = entity.props.components.position as Position | undefined;

        if (position) {
          renderable.c.position.set(position.x, position.y);
        }
      }
    }
  }
}
