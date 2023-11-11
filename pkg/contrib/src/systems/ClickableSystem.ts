import { Entity, Game, GameProps, System, SystemProps } from "@piggo-legends/core";
import { Actions, Clickable, Position } from "@piggo-legends/contrib";

export type Click = {
  x: number;
  y: number;
}

export type ClickableSystemProps = SystemProps & {
  player: string;
}

export class ClickableSystem extends System<ClickableSystemProps> {
  componentTypeQuery = ["clickable", "actions", "position"];

  bufferClick: Click[] = [];

  constructor(props: ClickableSystemProps) {
    super(props);
    this.init();
  }

  init = () => {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    const camera = this.props.renderer.camera;

    canvas.addEventListener("pointerdown", (event) => {
      const rect = canvas.getBoundingClientRect()
      const x = Math.round(event.clientX - rect.left - 2);
      const y = Math.round(event.clientY - rect.top - 2);
      this.bufferClick.push(camera.toWorldCoords({ x, y }));
    });
  }

  onTick = (entities: Entity[], game: Game<GameProps>) => {
    for (const entity of entities) {
      const clickable = entity.components.clickable as Clickable;
      const position = entity.components.position as Position;

      if (clickable.active) {
        const bounds = {
          x: position.x - clickable.width / 2,
          y: position.y - clickable.height / 2,
          w: clickable.width, h: clickable.height
        };
        for (const click of this.bufferClick) {
          // console.log(click, bounds);
          if (
            click.x >= bounds.x && click.x <= bounds.x + bounds.w &&
            click.y >= bounds.y && click.y <= bounds.y + bounds.h
          ) {
            if (clickable.onPress) {
              console.log("ONPRESS", clickable.onPress);
              const actions = entity.components.actions as Actions;
              const callback = actions.map[clickable.onPress];
              if (callback) callback(entity, game, this.props.player);
            }
          }
        }
      }
    }
    this.bufferClick = [];
  }
}
