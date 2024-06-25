import { Actions, Clickable, ClientSystemBuilder, Entity, Position, XY, checkBounds, mouse } from "@piggo-gg/core";
import { FederatedPointerEvent } from "pixi.js";

export const clickableClickedThisFrame = {
  value: 0,
  set: (value: number) => {
    clickableClickedThisFrame.value = value
  },
  reset: () => {
    clickableClickedThisFrame.value = 0
  }
} 

// ClickableSystem handles clicks for clickable entities
export const ClickableSystem = ClientSystemBuilder({
  id: "ClickableSystem",
  init: (world) => {
    if (!world.renderer) return undefined;

    const renderer = world.renderer;

    let bufferClick: XY[] = [];
    const hovered: Set<string> = new Set();

    renderer.props.canvas.addEventListener("mousedown", (event: FederatedPointerEvent) => {
      bufferClick.push({ x: event.offsetX, y: event.offsetY });
    });

    return {
      id: "ClickableSystem",
      query: ["clickable", "position"],
      skipOnRollback: true,
      onTick: (entities: Entity<Clickable | Actions | Position>[]) => {

        if (clickableClickedThisFrame.value !== world.tick) {
          clickableClickedThisFrame.reset();
        }

        entities.forEach((entity) => {
          const { clickable, position } = entity.components;

          if (hovered.has(entity.id)) {
            const hovering = checkBounds(renderer, position, clickable, mouse, mouse);
            if (!hovering) {
              if (clickable.hoverOut) clickable.hoverOut();
              hovered.delete(entity.id);
            }
          }

          if (clickable.active && clickable.hoverOver && !hovered.has(entity.id)) {
            const hovering = checkBounds(renderer, position, clickable, mouse, mouse);
            if (hovering) {
              clickable.hoverOver();
              hovered.add(entity.id);
            }
          }
        })

        bufferClick.forEach((click) => {
          const clickWorld = renderer.camera.toWorldCoords(click);

          entities.forEach((entity) => {
            const { clickable, position, networked } = entity.components;
            if (!clickable.active || !clickable.click) return;

            const clicked = checkBounds(renderer, position, clickable, click, clickWorld);
            if (clicked) {
              clickableClickedThisFrame.set(world.tick);
              const invocation = clickable.click({ world });

              if (networked && networked.isNetworked) {
                world.actionBuffer.push(world.tick + 1, entity.id, invocation);
              } else {
                world.actionBuffer.push(world.tick, entity.id, invocation);
              }
            }
          });
        });
        bufferClick = [];
      }
    }
  }
})
