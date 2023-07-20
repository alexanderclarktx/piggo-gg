import { Text } from 'pixi.js';
import { Entity, EntityProps, Game, GameProps, Renderer, System, SystemProps } from "@piggo-legends/core";
import { TextBox, DebugBounds, Renderable, RenderableProps } from "@piggo-legends/contrib";

export type DebugSystemProps = SystemProps & {
  renderer: Renderer
}

export class DebugSystem extends System<DebugSystemProps> {
  componentTypeQuery = ["renderable"];

  debuggedEntities: Map<Entity<EntityProps>, Renderable<RenderableProps>[]> = new Map();

  constructor(props: DebugSystemProps) {
    super(props);
  }

  onTick = (entities: Entity<EntityProps>[], _: Game<GameProps>) => {
    if (this.props.renderer.debug) {
      for (const entity of entities) {
        if (entity.components.renderable) {
          const renderable = entity.components.renderable as Renderable<RenderableProps>;
          if (renderable && renderable.props.debuggable && !this.debuggedEntities.has(entity)) {
            this.addEntity(entity);
          }
        }
      }
    } else {
      this.debuggedEntities.forEach((renderables, entity) => {
        renderables.forEach((renderable) => renderable.cleanup());
        this.debuggedEntities.delete(entity);
      });
    }
  }

  addEntity = (entity: Entity<EntityProps>) => {
    if (entity.components.renderable) {
      const renderable = entity.components.renderable as Renderable<RenderableProps>;

      // text box
      const textBox = new TextBox({
        renderer: this.props.renderer,
        dynamic: (c: Text) => {
          const bounds = renderable.c.getLocalBounds();
          c.position.set(renderable.c.x - 15, renderable.c.y - bounds.height / 2 - 15);
          c.text = `${renderable.c.x.toFixed(2)} ${renderable.c.y.toFixed(2)}`;
        },
        fontSize: 12, color: 0xffff00, debuggable: false
      });

      // debug bounds
      const debugBounds = new DebugBounds({ renderable: renderable, renderer: this.props.renderer });

      // add to the renderer
      this.props.renderer.addWorld(textBox);
      this.props.renderer.addWorld(debugBounds);

      // add to the map
      this.debuggedEntities.set(entity, [textBox, debugBounds]);
    }
  }
}
