import { Entity, EntityProps, Game, GameProps, System, SystemProps } from "@piggo-legends/core";
import { Actions, Interactive, Position } from "@piggo-legends/contrib";

export type Click = {
  x: number;
  y: number;
}

export type InteractiveSystemProps = SystemProps & {
  player: string;
}

export class InteractiveSystem extends System<InteractiveSystemProps> {
  componentTypeQuery = ["interactive", "actions", "position"];

  bufferClick: Click[] = [];

  constructor(props: InteractiveSystemProps) {
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

  onTick = (entities: Entity<EntityProps>[], game: Game<GameProps>) => {
    for (const entity of entities) {
      const interactive = entity.components.interactive as Interactive;
      const position = entity.components.position as Position;

      if (interactive.active) {
        const bounds = {
          x: position.x - interactive.width / 2,
          y: position.y - interactive.height / 2,
          w: interactive.width, h: interactive.height
        };
        for (const click of this.bufferClick) {
          // console.log(click, bounds);
          if (
            click.x >= bounds.x && click.x <= bounds.x + bounds.w &&
            click.y >= bounds.y && click.y <= bounds.y + bounds.h
          ) {
            if (interactive.onPress) {
              console.log("ONPRESS", interactive.onPress);
              const actions = entity.components.actions as Actions;
              const callback = actions.map[interactive.onPress];
              if (callback) callback(entity, game, this.props.player);
            }
          }
        }
      }
    }
    this.bufferClick = [];
  }
}
