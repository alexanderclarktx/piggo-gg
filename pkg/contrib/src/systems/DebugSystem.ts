import { Text } from 'pixi.js';
import { Graphics } from 'pixi.js';
import { Entity, EntityProps, Renderable, RenderableProps, Renderer, System, SystemProps } from "@piggo-legends/core";
import { TextBox } from "@piggo-legends/contrib";

export type DebugSystemProps = SystemProps & {
  renderer: Renderer
}

export class DebugSystem extends System<DebugSystemProps> {

  debuggedEntities: Map<Entity<EntityProps>, Renderable<RenderableProps>> = new Map();

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
      this.debuggedEntities.forEach((child, entity) => {
        child.cleanup();
        this.debuggedEntities.delete(entity);
      });
    }
  }

  addEntity = (entity: Entity<EntityProps>) => {
    if (entity.renderable) {
      const child = entity.renderable;

      // create a new text box
      const textBox = new TextBox({
        renderer: this.props.renderer,
        dynamic: (c: Text) => {
          const bounds = child.c.getBounds(false);
          textBox.c.position.set(child.c.x - 15, bounds.y - this.props.renderer.app.stage.y - 15);
          c.text = `${child.c.x.toFixed(2)} ${child.c.y.toFixed(2)}`;
        },
        fontSize: 12, color: 0xffff00, debuggable: false
      });

      // create a rectangle around the bounds
      const outline = new Graphics();
      outline.lineStyle(1, 0xff0000);
      outline.drawRect(0, 0, child.c.width, child.c.height);

      // add to the renderer
      this.props.renderer.addWorld(textBox);

      // add to the map
      this.debuggedEntities.set(entity, textBox);
    }
  }
}

//   updateDebugGraphics = () => {
//     if (this.debugGraphics) {
//       this.debugGraphics.visible = this.props.renderer.debug;

//       // update alpha for all sprites in this container
//       for (const child of this.children) {
//         if (child instanceof Sprite) {
//           child.alpha = this.props.renderer.debug ? 0.5 : 1;
//         }
//       }

//       // draw a rectangle around the container
//       const bounds = this.getLocalBounds();
//       this.debugGraphics.clear();
//       this.debugGraphics.lineStyle(1, 0xFF0000);
//       this.debugGraphics.drawRect(bounds.x + 1, bounds.y + 1, bounds.width - 2, bounds.height - 2);

//       // draw a circle at origin
//       this.debugGraphics.lineStyle(1, 0x00FF00, 0.9);
//       this.debugGraphics.drawCircle(0, 0, 2);

//       // draw a circle at pivot
//       this.debugGraphics.lineStyle(1, 0xFF00FF, 0.9);
//       this.debugGraphics.drawCircle(this.pivot.x, this.pivot.y, 2);

//       // add text of position
//       const t = new Text("ABC", { fill: 0xFFFF00, fontSize: 12, dropShadow: false });
//       t.position.set(bounds.x - 15, bounds.y - 5);
//       this.debugGraphics.addChild(t);
//     }
//   }
// }
