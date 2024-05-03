import { Actions, Clickable, ClientSystemBuilder, Entity, Position, boundsCheck, mouse } from "@piggo-gg/core";
import { FederatedPointerEvent } from "pixi.js";

export type Click = { x: number, y: number };

// ClickableSystem handles clicks for clickable entities
export const ClickableSystem = ClientSystemBuilder({
  id: "ClickableSystem",
  init: ({ world, renderer }) => {
    if (!renderer) return undefined;

    let bufferClick: Click[] = [];
    const hovered: Set<string> = new Set();

    const onTick = (entities: Entity<Clickable | Actions | Position>[]) => {

      entities.forEach((entity) => {
        const { clickable, position } = entity.components;

        if (hovered.has(entity.id)) {
          const hovering = boundsCheck(renderer, position, clickable, mouse, mouse);
          if (!hovering) {
            if (clickable.hoverOut) clickable.hoverOut();
            hovered.delete(entity.id);
          }
        }

        if (clickable.active && clickable.hoverOver && !hovered.has(entity.id)) {
          const hovering = boundsCheck(renderer, position, clickable, mouse, mouse);
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

          const clicked = boundsCheck(renderer, position, clickable, click, clickWorld);
          if (clicked) {
            const invocation = clickable.click();

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

    renderer.props.canvas.addEventListener("mousedown", (event: FederatedPointerEvent) => {
      bufferClick.push({ x: event.offsetX, y: event.offsetY });
    });

    return {
      id: "ClickableSystem",
      query: ["clickable", "position"],
      onTick,
      skipOnRollback: true
    }
  }
})
