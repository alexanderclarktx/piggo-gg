import { Entity, EntityProps, Renderable, RenderableProps, Renderer, System, SystemProps } from '@piggo-legends/core';

export type RenderSystemProps = SystemProps & {
  renderer: Renderer
}

export class RenderSystem extends System<RenderSystemProps> {
  componentTypeQuery = ["renderable"];

  renderedEntities: Set<Entity<EntityProps>> = new Set();

  onTick = (entities: Entity<EntityProps>[]) => {
    for (const entity of entities) {
      if (!this.renderedEntities.has(entity)) {
        const renderable = entity.props.components.renderable as Renderable<RenderableProps>;

        this.props.renderer.addWorld(renderable);
        this.renderedEntities.add(entity);

        console.log("rendering entity", entity);
      }
    }
  }
}
