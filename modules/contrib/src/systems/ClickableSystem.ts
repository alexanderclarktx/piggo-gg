import { Entity, SystemBuilder } from "@piggo-legends/core";
import { Actions, Clickable, Position } from "@piggo-legends/contrib";
import { FederatedPointerEvent } from "pixi.js";

export type Click = { x: number, y: number };

// ClickableSystem handles clicks for clickable entities
export const ClickableSystem: SystemBuilder = ({ game, renderer, thisPlayerId, mode }) => {
  if (!renderer) throw new Error("ClickableSystem requires a renderer");

  let bufferClick: Click[] = [];

  const onTick = (entities: Entity[]) => {
    bufferClick.forEach((click) => {
      const clickWorld = renderer.camera.toWorldCoords(click);

      entities.forEach((entity) => {
        const { clickable, position } = entity.components as { clickable: Clickable, position: Position };

        if (!clickable.active) return;

        // set bounds
        let bounds = { x: position.x, y: position.y, w: clickable.width, h: clickable.height };
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

        if (clicked) {
          const callback = (entity.components.actions as Actions).actionMap[clickable.onPress];
          if (callback) callback(entity, game, thisPlayerId);
        }
      });
    });
    bufferClick = [];
  }

  renderer.props.canvas.addEventListener("mousedown", (event: FederatedPointerEvent) => {
    bufferClick.push({ x: event.offsetX, y: event.offsetY });
  });

  return {
    componentTypeQuery: ["clickable", "actions", "position"],
    onTick
  }
}
