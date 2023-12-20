import { Entity, Game, GameProps, Renderer, System } from "@piggo-legends/core";
import { Actions, Clickable, Position } from "@piggo-legends/contrib";
import { FederatedPointerEvent } from "pixi.js";

export type Click = { x: number, y: number };

// ClickableSystem handles clicks for clickable entities
export const ClickableSystem = (renderer: Renderer, thisPlayerId: string, mode: "cartesian" | "isometric" = "cartesian"): System => {
  let bufferClick: Click[] = [];

  const onTick = (entities: Entity[], game: Game<GameProps>) => {
    for (const entity of entities) {
      const clickable = entity.components.clickable as Clickable;
      const position = entity.components.position as Position;
      const screenXY = position.toScreenXY();

      if (clickable.active) {
        const bounds = (mode === "isometric") ? {
          x: screenXY.x - clickable.width / 2,
          y: screenXY.y - clickable.height / 2,
          w: clickable.width, h: clickable.height
        } : {
          x: position.x - clickable.width / 2,
          y: position.y - clickable.height / 2,
          w: clickable.width, h: clickable.height
        };

        for (const click of bufferClick) {
          if (
            click.x >= bounds.x && click.x <= bounds.x + bounds.w &&
            click.y >= bounds.y && click.y <= bounds.y + bounds.h
          ) {
            if (clickable.onPress) {
              const callback = (entity.components.actions as Actions).actionMap[clickable.onPress];
              if (callback) callback(entity, game, thisPlayerId);
            }
          }
        }
      }
    }
    bufferClick = [];
  }

  renderer.app.stage.onmousedown = (event: FederatedPointerEvent) => {
    bufferClick.push(renderer.camera.toWorldCoords({ x: event.screenX, y: event.screenY }));
  }

  return {
    componentTypeQuery: ["clickable", "actions", "position"],
    onTick
  }
}
