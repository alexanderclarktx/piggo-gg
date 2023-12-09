import { Entity, Renderer } from "@piggo-legends/core";
import { Position, Renderable } from "@piggo-legends/contrib";
import { Text, Graphics } from "pixi.js";

export const Cursor = (renderer: Renderer, id: string = "cursor"): Entity => {

  let x = 0;
  let y = 0;

  const circle = new Graphics();
  circle.beginFill(0x00FFFF);
  circle.drawCircle(0, 0, 4);
  circle.endFill();

  renderer.props.canvas.addEventListener("mousemove", (event) => {
    const rect = renderer.props.canvas.getBoundingClientRect()
    x = Math.round(event.clientX - rect.left - 2);
    y = Math.round(event.clientY - rect.top - 2);
  });

  const cursor = {
    id: id,
    components: {
      position: new Position({}),
      renderable: new Renderable({
        renderer: renderer,
        debuggable: false, // TODO when in spaceship, the bounds is wrong
        zIndex: 10,
        dynamic: (_: Text) => {
          const renderable = cursor.components.renderable as Renderable;
          renderable.props.cameraPos = { x: x, y: y };
        }
      })
    }
  }

  cursor.components.renderable.c.addChild(circle);

  return cursor;
}
