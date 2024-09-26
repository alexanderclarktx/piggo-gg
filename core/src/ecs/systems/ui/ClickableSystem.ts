import { Actions, Clickable, ClientSystemBuilder, Entity, Position, XY, checkBounds, mouse } from "@piggo-gg/core";
import { FederatedPointerEvent } from "pixi.js";

export const clickableClickedThisFrame = {
  value: 0,
  set: (value: number) => clickableClickedThisFrame.value = value,
  reset: () => clickableClickedThisFrame.value = 0
} 

// TODO merge this into InputSystem
// ClickableSystem handles clicks for clickable entities
export const ClickableSystem = ClientSystemBuilder({
  id: "ClickableSystem",
  init: (world) => {
    if (!world.renderer) return undefined;

    let clickables: Entity<Clickable | Actions | Position>[] = [];

    const renderer = world.renderer;

    let bufferClick: XY[] = [];
    const hovered: Set<string> = new Set();

    renderer.app.canvas.addEventListener("pointerdown", (event: FederatedPointerEvent) => {
      const click = { x: event.offsetX, y: event.offsetY };
      bufferClick.push(click);

      const clickWorld = renderer.camera.toWorldCoords(click);

      clickables.forEach((entity) => {
        const { clickable, position } = entity.components;
        if (!clickable.active || !clickable.click) return;

        const clicked = checkBounds(renderer, position, clickable, click, clickWorld);
        if (clicked) {
          clickableClickedThisFrame.set(world.tick);
          return;
        }
      });
    });

    return {
      id: "ClickableSystem",
      query: ["clickable", "position"],
      skipOnRollback: true,
      onTick: (entities: Entity<Clickable | Actions | Position>[]) => {

        clickables = entities;

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
