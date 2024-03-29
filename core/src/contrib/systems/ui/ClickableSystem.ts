import { Actions, Clickable, ClientSystemBuilder, Entity, Position } from "@piggo-gg/core";
import { FederatedPointerEvent } from "pixi.js";

export type Click = { x: number, y: number };

// ClickableSystem handles clicks for clickable entities
export const ClickableSystem = ClientSystemBuilder({
  id: "ClickableSystem",
  init: ({ world, renderer, mode }) => {
    if (!renderer) throw new Error("ClickableSystem requires a renderer");

    let bufferClick: Click[] = [];

    const onTick = (entities: Entity<Clickable | Actions | Position>[]) => {
      bufferClick.forEach((click) => {
        const clickWorld = renderer.camera.toWorldCoords(click);

        entities.forEach((entity) => {
          const { clickable, position } = entity.components;

          if (!clickable.active) return;

          // set bounds
          let bounds = { x: position.data.x, y: position.data.y, w: clickable.width, h: clickable.height };

          if (position.data.x < 0) {
            bounds.x = renderer.props.canvas.width + position.data.x;
          }
          if (position.data.y < 0) {
            bounds.y = renderer.props.canvas.height + position.data.y;
          }

          if (mode === "isometric" && !position.screenFixed) {
            const screenXY = position.toScreenXY();
            bounds = {
              // TODO clickable should define offset
              x: screenXY.x - clickable.width / 2,
              y: screenXY.y - clickable.height / 2,
              w: clickable.width, h: clickable.height
            }
          }

          // check bounds
          let clicked = false;
          position.screenFixed ? clicked = (
            click.x >= bounds.x && click.x <= bounds.x + bounds.w &&
            click.y >= bounds.y && click.y <= bounds.y + bounds.h
          ) : clicked = (
            clickWorld.x >= bounds.x && clickWorld.x <= bounds.x + bounds.w &&
            clickWorld.y >= bounds.y && clickWorld.y <= bounds.y + bounds.h
          )

          if (clicked) clickable.click.apply({ params: {}, entity, world, player: world.clientPlayerId });
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
