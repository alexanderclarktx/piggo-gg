import { Entity, Position, Renderable, Renderer } from "@piggo-gg/core";
import { Graphics } from "pixi.js";
import { Joystick } from "./Joystick";

export const currentJoystickPosition = { angle: 0, power: 0 }

export const Joystickz = (): Entity => {
  const joystick = Entity<Renderable | Position>({
    id: "joystick",
    components: {
      position: new Position({ x: 100, y: window.innerHeight - 100, screenFixed: true }),
      renderable: new Renderable({
        zIndex: 10,
        interactiveChildren: true,
        container: async (r: Renderer) => {
          return new Joystick({
            onChange: (data) => {
              currentJoystickPosition.angle = data.angle;
              currentJoystickPosition.power = data.power;
            },
            onEnd: () => {
              currentJoystickPosition.power = 0;
              currentJoystickPosition.angle = 0;
            }
          })
        }
      })
    }
  });
  return joystick;
}

export const Cursor = (): Entity => {

  const cursor = Entity<Renderable | Position>({
    id: "cursor",
    persists: true,
    components: {
      position: new Position({ x: 2000, y: 2000, screenFixed: true }),
      renderable: new Renderable({
        container: async (r: Renderer) => {
          r.props.canvas.addEventListener("mousemove", (event) => {
            const rect = r.props.canvas.getBoundingClientRect();

            cursor.components.position.data.x = Math.round(event.clientX - rect.left - 2);
            cursor.components.position.data.y = Math.round(event.clientY - rect.top - 2);
          });

          const circle = new Graphics();
          circle.circle(0, 0, 4);
          circle.fill({ color: 0x00FFFF });

          return circle;
        },
        zIndex: 10
      })
    }
  });

  return cursor;
}
