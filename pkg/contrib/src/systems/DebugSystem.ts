import { Text } from 'pixi.js';
import { Entity, EntityProps, Renderable, RenderableProps, Renderer, System, SystemProps } from "@piggo-legends/core";
import { TextBox, DebugBounds } from "@piggo-legends/contrib";

export type DebugSystemProps = SystemProps & {
  renderer: Renderer
}

export class DebugSystem extends System<DebugSystemProps> {

  debuggedEntities: Map<Entity<EntityProps>, Renderable<RenderableProps>[]> = new Map();

  constructor(props: DebugSystemProps) {
    super(props);
  }

  onTick = (entities: Entity<EntityProps>[]) => {
    if (this.props.renderer.debug) {
      entities.forEach((entity) => {
        if (entity.renderable && entity.renderable.props.debuggable && !this.debuggedEntities.has(entity)) {
          this.addEntity(entity);
        }
      });
    } else {
      this.debuggedEntities.forEach((renderables, entity) => {
        renderables.forEach((renderable) => renderable.cleanup());
        this.debuggedEntities.delete(entity);
      });
    }
  }

  addEntity = (entity: Entity<EntityProps>) => {
    if (entity.renderable) {
      const child = entity.renderable;

      // text box
      const textBox = new TextBox({
        renderer: this.props.renderer,
        dynamic: (c: Text) => {
          const bounds = child.c.getBounds(false);
          textBox.c.position.set(child.c.x - 15, bounds.y - this.props.renderer.app.stage.y - 15);
          c.text = `${child.c.x.toFixed(2)} ${child.c.y.toFixed(2)}`;
        },
        fontSize: 12, color: 0xffff00, debuggable: false
      });

      // debug bounds
      const debugBounds = new DebugBounds({ renderable: child, renderer: this.props.renderer });

      // add to the renderer
      this.props.renderer.addWorld(textBox);
      this.props.renderer.addWorld(debugBounds);

      // add to the map
      this.debuggedEntities.set(entity, [textBox, debugBounds]);
    }
  }
}
