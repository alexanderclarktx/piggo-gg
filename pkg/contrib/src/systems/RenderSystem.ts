import { Entity, EntityProps, Renderer, System, SystemProps } from '@piggo-legends/core';

export type RenderSystemProps = SystemProps & {
  renderer: Renderer
}

export class RenderSystem extends System<RenderSystemProps> {

  renderedEntities: Set<Entity<EntityProps>> = new Set();

  override onTick = (entities: Entity<any>[]) => {

    // add entities to renderer that haven't been added yet
    for (const entity of entities ?? []) {
      if (!this.renderedEntities.has(entity)) {
        if (entity.props.components.renderable) {
          this.props.renderer.addWorld(entity.props.components.renderable);
          this.renderedEntities.add(entity);
          console.log("rendering entity", entity);
        }
      }
    }
  }
}
