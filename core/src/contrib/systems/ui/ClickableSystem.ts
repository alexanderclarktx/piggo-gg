import { Actions, Clickable, ClientSystemBuilder, Entity, Position, Renderer, mouse } from "@piggo-gg/core";
import { FederatedPointerEvent } from "pixi.js";

export type Click = { x: number, y: number };

const boundsCheck = (renderer: Renderer, position: Position, clickable: Clickable, click: Click, clickWorld: Click): boolean => {

  let bounds = { x: position.data.x, y: position.data.y, w: clickable.width, h: clickable.height };

  if (position.screenFixed && position.data.x < 0) {
    bounds.x = position.data.x + renderer.props.canvas.width;
  }
  if (position.screenFixed && position.data.y < 0) {
    bounds.y = position.data.y + renderer.props.canvas.height;
  }

  let clicked = false;
  position.screenFixed ? clicked = (
    click.x >= bounds.x && click.x <= bounds.x + bounds.w &&
    click.y >= bounds.y && click.y <= bounds.y + bounds.h
  ) : clicked = (
    clickWorld.x >= bounds.x && clickWorld.x <= bounds.x + bounds.w &&
    clickWorld.y >= bounds.y && clickWorld.y <= bounds.y + bounds.h
  )

  return clicked;
}

// ClickableSystem handles clicks for clickable entities
export const ClickableSystem = ClientSystemBuilder({
  id: "ClickableSystem",
  init: ({ world, renderer }) => {
    if (!renderer) throw new Error("ClickableSystem requires a renderer");

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
          const { clickable, position } = entity.components;
          if (!clickable.active || !clickable.click) return;

          const clicked = boundsCheck(renderer, position, clickable, click, clickWorld);
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
