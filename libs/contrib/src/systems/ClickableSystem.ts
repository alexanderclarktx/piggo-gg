import { Entity, Game, GameProps, Renderer, System } from "@piggo-legends/core";
import { Actions, Clickable, Position } from "@piggo-legends/contrib";

export type Click = {
  x: number;
  y: number;
}

export const ClickableSystem = (renderer: Renderer, thisPlayerId: string): System => {
  let bufferClick: Click[] = [];

  const onTick = (entities: Entity[], game: Game<GameProps>) => {
    for (const entity of entities) {
      const clickable = entity.components.clickable as Clickable;
      const position = entity.components.position as Position;

      if (clickable.active) {
        const bounds = {
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
              // console.log("ONPRESS", clickable.onPress);
              const callback = (entity.components.actions as Actions).actionMap[clickable.onPress];
              if (callback) callback(entity, game, thisPlayerId);
            }
          }
        }
      }
    }
    bufferClick = [];
  }

  const init = () => {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    const camera = renderer.camera;

    canvas.addEventListener("pointerdown", (event) => {
      const rect = canvas.getBoundingClientRect()
      const x = Math.round(event.clientX - rect.left - 2);
      const y = Math.round(event.clientY - rect.top - 2);
      bufferClick.push(camera.toWorldCoords({ x, y }));
    });
  }

  init();

  return {
    renderer,
    componentTypeQuery: ["clickable", "actions", "position"],
    onTick
  }
}
